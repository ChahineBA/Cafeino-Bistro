# Cafeino Bistro POS - Frontend

Modern, responsive frontend for the Cafeino Bistro Point of Sale system built with Next.js 14.

## Features

- 🎨 Beautiful, animated UI with warm coffee shop aesthetics
- 🔐 JWT-based authentication with role-based access
- 📱 Fully responsive design (mobile, tablet, desktop)
- ⚡ Fast performance with Next.js 14 App Router
- 🎭 Smooth animations with Framer Motion
- 📊 Interactive charts and analytics with Recharts
- 🎯 Type-safe with TypeScript
- 🔄 Efficient data fetching with TanStack Query

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui patterns
- **State Management**: React Context API
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Date Handling**: date-fns

## Prerequisites

- Node.js 18+ and npm
- Backend API running (see backend README)

## Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. **Run the development server:**

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Project Structure

```
frontend/
├── app/                      # Next.js 14 App Router pages
│   ├── page.tsx             # Landing page
│   ├── login/               # Login page
│   ├── waiter/              # Waiter dashboard & features
│   │   ├── page.tsx         # Waiter dashboard
│   │   └── orders/          # Order management
│   │       ├── page.tsx     # Orders list
│   │       └── new/         # Create new order
│   └── admin/               # Admin dashboard & features
│       ├── page.tsx         # Admin dashboard with analytics
│       ├── products/        # Product management
│       ├── reports/         # Reports & analytics
│       └── waiters/         # Waiter records
├── src/
│   ├── components/          # Reusable components
│   │   ├── ui/             # UI components
│   │   ├── Providers.tsx   # App providers
│   │   └── ProtectedRoute.tsx
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx # Authentication context
│   ├── hooks/               # Custom React hooks
│   │   ├── useProducts.ts  # Product operations
│   │   ├── useOrders.ts    # Order operations
│   │   ├── useServices.ts  # Service tracking
│   │   └── useReports.ts   # Analytics & reports
│   ├── lib/                 # Utilities
│   │   ├── api.ts          # Axios instance & interceptors
│   │   ├── queryClient.ts  # TanStack Query config
│   │   └── utils.ts        # Helper functions
│   └── types/               # TypeScript types
│       ├── user.ts
│       ├── product.ts
│       ├── order.ts
│       ├── service.ts
│       └── report.ts
└── public/                  # Static assets
    └── logo.png            # Cafeino Bistro logo
```

## Features by Role

### Landing Page
- Hero section with Cafeino branding
- Feature highlights
- Smooth scroll animations
- Call-to-action to access POS

### Waiter Portal (`/waiter`)
- **Dashboard**: Quick stats, active orders, recent activity
- **Clock In/Out**: Service time tracking with live timer
- **Create Order**: Product selection, cart management, order placement
- **Order Management**: View, update, and complete orders
- **Order Status**: Pending, completed, cancelled states

### Admin Portal (`/admin`)
- **Dashboard**: Revenue analytics, order statistics, performance metrics
- **Product Management**: CRUD operations for menu items
- **Reports & Analytics**:
  - Revenue trends with interactive charts
  - Waiter performance metrics
  - Top selling products
  - Date range filtering
- **Waiter Records**: View service times and attendance by date

## Color Palette

The app uses a warm coffee shop aesthetic:

- Primary: `#8B4513` (Saddle Brown)
- Secondary: `#D2691E` (Chocolate)
- Accent: `#FF8C42` (Warm Orange)
- Background: `#FFF8DC` (Cornsilk)
- Text: `#3E2723` (Dark Brown)

## Key Components

### Authentication
- `AuthContext`: Manages user state and authentication
- `ProtectedRoute`: Wrapper for protected pages
- JWT token storage in localStorage
- Automatic token refresh on API calls

### Data Fetching
- TanStack Query for server state management
- Automatic caching and refetching
- Optimistic updates for better UX
- Error handling and retry logic

### Animations
- Page transitions with Framer Motion
- Smooth hover effects
- Loading states with spinners
- Stagger animations for lists

## Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

## API Integration

The frontend communicates with the backend API using Axios with the following features:

- Automatic JWT token injection
- Request/response interceptors
- Error handling with automatic logout on 401
- Type-safe API calls with TypeScript

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Docker

```bash
# Build image
docker build -t cafeino-frontend .

# Run container
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://your-api-url cafeino-frontend
```

### Manual

```bash
# Build
npm run build

# Start
npm start
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Optimized images with Next.js Image
- Code splitting with dynamic imports
- Lazy loading for better initial load
- Efficient re-renders with React Query

## Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance

## Troubleshooting

**API Connection Issues:**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check if backend is running
- Ensure CORS is configured in backend

**Authentication Issues:**
- Clear localStorage and try again
- Check JWT token expiration
- Verify credentials with backend

**Build Errors:**
- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall
- Check Node.js version (18+)

## License

Proprietary - Cafeino Bistro
