/**
 * Imports the menu scraped from cafeinobistro.com (data/menu.json) into the products collection.
 *
 *   npm run import-menu
 *
 * Safe to run more than once: products are matched by category + name.
 * Missing products are created, existing ones get their price updated if it changed,
 * and nothing is ever deleted.
 */
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Product = require('./models/Product');

dotenv.config();

// Website category title -> category name used by the POS.
// The POS frontend matches categories case-insensitively against these names
// (see categoryConfig in frontend/app/waiter/orders/new/page.tsx), so they must not
// contain "&" or accents.
const CATEGORY_MAP = {
  'COFFEE & SOFT DRINK': 'Coffee Soft Drink',
  'Tea & Matcha': 'Tea Matcha',
  'MILK SHAKES & FRAPPUCCINO': 'Milk Shakes Frappuccino',
  'JUS NATURELS & COCKTAILS': 'Jus Naturels Cocktails',
  proteino: 'Proteino',
  'Petit Dejeuner': 'Petit Dejeuner',
  'CROISSANTS & DELICES LAYERS': 'Croissants Delices Layers',
  'CRÊPES': 'Crepes',
  GAUFRES: 'Gaufres',
  'SALADES & OMLETTES': 'Salades Omlettes',
  SUPPLEMENTS: 'Supplements',
};

const importMenu = async () => {
  const menu = require(path.join(__dirname, '..', 'data', 'menu.json'));

  const unmapped = menu.map((c) => c.category).filter((c) => !CATEGORY_MAP[c]);
  if (unmapped.length) throw new Error(`No POS category mapping for: ${unmapped.join(', ')}`);

  await mongoose.connect(process.env.MONGODB_URL, {
    dbName: process.env.DATABASE_NAME,
    serverSelectionTimeoutMS: 15000,
  });
  console.log(`✅ Connected to database "${mongoose.connection.db.databaseName}"`);

  const totals = { created: 0, updated: 0, unchanged: 0 };
  for (const { category: siteCategory, products } of menu) {
    const category = CATEGORY_MAP[siteCategory];
    const counts = { created: 0, updated: 0, unchanged: 0 };

    for (const { name, price } of products) {
      if (!name || typeof price !== 'number' || Number.isNaN(price)) {
        throw new Error(`Invalid product in "${siteCategory}": ${JSON.stringify({ name, price })}`);
      }
      const existing = await Product.findOne({ category, name });
      if (!existing) {
        await Product.create({ name, category, price, is_available: true });
        counts.created++;
      } else if (existing.price !== price) {
        console.log(`   💲 ${category} / ${name}: ${existing.price} -> ${price} DT`);
        existing.price = price;
        await existing.save();
        counts.updated++;
      } else {
        counts.unchanged++;
      }
    }

    console.log(`📦 ${category.padEnd(26)} created ${counts.created}, updated ${counts.updated}, unchanged ${counts.unchanged}`);
    for (const k of Object.keys(totals)) totals[k] += counts[k];
  }

  const inDb = await Product.countDocuments();
  console.log(`\n✅ Done: created ${totals.created}, updated ${totals.updated}, unchanged ${totals.unchanged}. Products in DB: ${inDb}`);
};

importMenu()
  .catch((err) => {
    console.error(`❌ Menu import failed: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
