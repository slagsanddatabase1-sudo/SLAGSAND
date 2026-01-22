# Slag Sand Project

A modern web application for managing Slag Sand orders, inquiries, and customer testimonials.

## Project Structure

```text
slagsand/
├── backend/                # Node.js Express server
│   ├── index.js            # Server entry point & Razorpay API
│   ├── sql/                # Database scripts
│   │   ├── migrations/     # Historical fix scripts
│   │   ├── schema.sql      # Main database schema
│   │   └── seed_faqs.sql   # Initial data seeding
│   └── .env                # Server-side secrets (Razorpay)
├── src/                    # React frontend (Vite)
│   ├── components/         # Reusable UI components
│   ├── pages/              # Application pages
│   │   └── Admin/          # Secured Admin Panel pages
│   ├── lib/                # Shared utilities (Supabase Client)
│   └── App.jsx             # Main routing & app logic
├── public/                 # Static assets
└── .env                    # Frontend environment variables
```

## Setup & Running

1. **Backend**: `cd backend && npm install && npm run dev`
2. **Frontend**: `npm install && npm run dev` (from root)

## Key Features
- **Admin Panel**: "Admin-Only" access for all authenticated users.
- **Razorpay Integration**: Unified checkout for samples and bulk orders.
- **Supabase Backend**: Real-time database and secure authentication.
