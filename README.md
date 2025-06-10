# FinSight - Personal Finance Tracker

A responsive, full-stack web application that helps users track their personal finances through an intuitive, modern interface.

## Project Overview

FinSight is a comprehensive personal finance management tool built with Next.js, Tailwind CSS, and shadcn/ui components. The application provides users with a dashboard to visualize their financial status, manage transactions, and set budgets. The interface is fully responsive and works seamlessly across desktop, tablet, and mobile devices.

## Features Implemented

### Stage 1: Core Functionality
- ✅ Dashboard with financial overview cards and visualizations
- ✅ Transaction management (add, edit, delete, filter)
- ✅ Budget tracking and management
- ✅ Data visualization with interactive charts (bar chart, pie chart)
- ✅ Mock API implementation for handling data

### Stage 2: Enhanced Features
- ✅ Currency selector to switch between USD and INR with proper symbols
- ✅ Date range picker for filtering data
- ✅ Expense breakdown by categories
- ✅ Budget alerts for overspending
- ✅ Recent transactions list
- ✅ Export transactions to CSV

### Stage 3: Mobile Optimization
- ✅ Responsive header with mobile menu
- ✅ Adaptive grid layouts for different screen sizes
- ✅ Optimized tables with column visibility based on screen size
- ✅ Mobile-friendly input controls and date pickers
- ✅ Touch-friendly navigation and interactive elements

## Tech Stack

### Frontend
- Next.js (App Router)
- Tailwind CSS
- shadcn/ui (for reusable UI components)
- Recharts (for charts and data visualization)

### Backend
- Next.js API routes
- Mock Prisma client for data handling
- Database fallback with local storage

## Setup Instructions

### Prerequisites
- Node.js (v18 or later)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd finsight
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
# For Windows PowerShell
cd finsight; npm run dev

# For Command Prompt or other shells
cd finsight && npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Setup

The application uses a mock data implementation, so no actual database setup is required. If you want to extend the project with a real database:

1. Set up environment variables by creating a `.env` file in the root directory:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finsight"
```

2. Set up the database (if using PostgreSQL via Docker):
```bash
docker-compose up -d
```

3. Run database migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

## Project Structure

- `/src/app` - Next.js App Router pages and layouts
- `/src/components` - React components (UI elements and page components)
- `/src/components/ui` - shadcn/ui components
- `/src/lib` - Utility functions, context providers, and mock data
- `/src/hooks` - Custom React hooks

## Browser Compatibility

The application has been tested and works on:
- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Android Chrome)
