# MediCare Companion

A comprehensive medication management application built with React, TypeScript, and Supabase. Features dual user roles for patients and caretakers with real-time medication tracking and adherence monitoring.

## 🚀 Quick Start

## 📦 Installation

### Prerequisites
Install Bun: https://bun.sh
```bash
curl -fsSL https://bun.sh/install | bash
# Or for Windows, use PowerShell:
powershell -c "iwr bun.sh/install.ps1|iex"
```
- Supabase account

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-name>
   ```

2. **Install dependencies**
   ```bash
    bun install
   ```
3. **Start development server**
   ```bash
   bun run dev
   ```

## 📜 Commands

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build

## 🛠️ Troubleshooting

If the server won't start:
```bash
rm -rf node_modules
bun install
```


The app will be available at `http://localhost:8080`

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure login/signup with Supabase Auth
- **Dual User Roles**: Patient and Caretaker dashboards with role-specific features
- **Medication Management**: Add, edit, and delete medications with dosage and frequency
- **Daily Tracking**: Mark medications as taken with optional photo proof
- **Adherence Monitoring**: Real-time adherence statistics and streak tracking
- **Calendar View**: Visual medication history with taken/missed indicators

### Technical Features
- **Optimistic Updates**: Instant UI feedback using React Query
- **Real-time Data**: Live updates across user sessions
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Form Validation**: Robust validation using Zod and React Hook Form
- **Error Handling**: Comprehensive error boundaries and user feedback

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI components
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form with Zod validation
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Testing**: Vitest, React Testing Library
- **Deployment**: Vercel/Netlify ready


## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Radix/ui components
│   ├── MedicationForm.tsx
│   ├── MedicationList.tsx
│   └── AdherenceStats.tsx
├── services/           # API services and React Query hooks
├── types/              # TypeScript type definitions
├── context/            # React context providers
├── features/           # Feature-specific components
├── pages/              # Page components
├── test/               # Test files
└── lib/                # Utility functions
```





Built with ❤️ using React, TypeScript, and Supabase