/**
 * Creates the default accounts (the same ones as the login page's quick-fill buttons).
 *
 *   npm run seed
 *
 * Safe to run more than once: an account whose email already exists is left
 * untouched, and nothing is ever deleted. Products/menu are NOT seeded here.
 */
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/User');
const { getPasswordHash } = require('./utils/auth');

dotenv.config();

const ACCOUNTS = [
  { email: 'admin@cafeino.com', full_name: 'Admin User', password: 'admin123', role: 'admin' },
  { email: 'waiter1@cafeino.com', full_name: 'John Doe', password: 'waiter123', role: 'waiter' },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URL, {
    dbName: process.env.DATABASE_NAME,
    serverSelectionTimeoutMS: 15000,
  });
  console.log(`✅ Connected to database "${mongoose.connection.db.databaseName}"`);

  for (const { password, ...account } of ACCOUNTS) {
    const existing = await User.findOne({ email: account.email });
    if (existing) {
      console.log(`⏭️  ${account.email} already exists (${existing.role}), left unchanged`);
      continue;
    }
    await User.create({
      ...account,
      hashed_password: await getPasswordHash(password),
      is_active: true,
    });
    console.log(`👤 Created ${account.role}: ${account.email}`);
  }
};

seed()
  .catch((err) => {
    console.error(`❌ Seeding failed: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
