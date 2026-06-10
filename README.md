# LinkedIn Outreach Tracker

A web application that helps B2B marketers track LinkedIn outreach campaigns and manage leads through a centralized dashboard.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Firebase** (structure prepared, not yet implemented)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18.18 or later
- npm

### Install & Run

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other Commands

```bash
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Run ESLint
```

## Project Structure

```
src/
├── app/
│   ├── dashboard/page.tsx    # Dashboard with outreach metrics
│   ├── leads/
│   │   ├── page.tsx          # Leads list with search & filter
│   │   └── add/page.tsx      # Add new lead form
│   ├── login/page.tsx        # Google sign-in (mock)
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Redirects to /login
│   └── globals.css           # Global styles
├── components/
│   ├── dashboard/
│   │   └── DashboardCard.tsx
│   ├── layout/
│   │   ├── DashboardLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── TopNav.tsx
│   └── leads/
│       ├── LeadForm.tsx
│       ├── LeadTable.tsx
│       └── StatusBadge.tsx
├── lib/
│   ├── firebase/             # Firebase stubs (auth, firestore, config)
│   ├── dashboard-metrics.ts  # Metric calculation helpers
│   ├── mock-data.ts          # Sample lead data
│   └── utils.ts              # Formatting & status helpers
└── types/
    └── lead.ts               # Lead & status TypeScript types
```

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Sign in with Google (mock — redirects to dashboard) |
| `/dashboard` | Outreach metrics and performance overview |
| `/leads` | Searchable, filterable leads table |
| `/leads/add` | Form to add a new lead |

## Firebase Setup (Future)

1. Copy `.env.example` to `.env.local`
2. Add your Firebase project credentials
3. Install Firebase: `npm install firebase`
4. Uncomment the initialization code in `src/lib/firebase/`

## License

Private — All rights reserved.
