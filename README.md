# MediCare Companion

A comprehensive medication management application built with React, TypeScript, and Supabase. Features dual user roles for patients and caretakers with real-time medication tracking and adherence monitoring.

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

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medicare-companion
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Database Setup**
   
   Run the migration in your Supabase SQL editor:
   ```sql
   -- Copy and paste the contents of supabase/migrations/20250619143746_pink_dream.sql
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:8080`

## 🧪 Testing

Run the test suite:
```bash
npm run test
```

Run tests with UI:
```bash
npm run test:ui
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
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

## 🔐 Database Schema

### Tables

**medications**
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `name` (text, required)
- `dosage` (text, optional)
- `frequency` (text, required)
- `time_to_take` (time, optional)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**medication_logs**
- `id` (uuid, primary key)
- `medication_id` (uuid, foreign key to medications)
- `user_id` (uuid, foreign key to auth.users)
- `taken_at` (timestamptz)
- `date_taken` (date, required)
- `photo_url` (text, optional)
- `created_at` (timestamptz)

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Proper indexes for performance optimization

## 🎯 Key Features Implementation

### Optimistic Updates
The app uses React Query's optimistic updates for instant UI feedback:

```typescript
const markMedicationTakenMutation = useMutation({
  mutationFn: async (logData) => {
    // API call
  },
  onMutate: async (newLog) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["medication-logs", user?.id] });
    
    // Optimistically update the cache
    queryClient.setQueryData(["medication-logs", user?.id], (old) => [...old, optimisticLog]);
  },
  onError: (err, newLog, context) => {
    // Rollback on error
    queryClient.setQueryData(["medication-logs", user?.id], context.previousLogs);
  },
});
```

### TypeScript Generics
Proper generic usage for type safety:

```typescript
interface MedicationService<T extends Medication = Medication> {
  medications: T[];
  addMedication: (data: CreateMedicationData) => Promise<T>;
  updateMedication: (id: string, data: Partial<T>) => Promise<T>;
}
```

### Error Handling
Comprehensive error handling with user-friendly messages:

```typescript
try {
  await addMedicationMutation.mutateAsync(data);
  toast({ title: "Success", description: "Medication added successfully!" });
} catch (error) {
  toast({ 
    title: "Error", 
    description: "Failed to add medication. Please try again.",
    variant: "destructive" 
  });
}
```

## 🚀 Deployment

### Vercel
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

## 🧪 Testing Strategy

- **Unit Tests**: Component logic and utility functions
- **Integration Tests**: API services and React Query hooks
- **User Interaction Tests**: Form submissions and user flows
- **Error Boundary Tests**: Error handling scenarios

## 🔒 Security Considerations

- **Input Sanitization**: All user inputs validated with Zod schemas
- **SQL Injection Prevention**: Supabase handles parameterized queries
- **Authentication**: Secure JWT tokens with automatic refresh
- **Authorization**: Row-level security ensures data isolation
- **HTTPS**: All API calls encrypted in transit

## 📈 Performance Optimizations

- **React Query Caching**: Intelligent data caching and background updates
- **Optimistic Updates**: Instant UI feedback
- **Code Splitting**: Lazy loading of route components
- **Image Optimization**: Proper image handling for photo uploads
- **Bundle Analysis**: Optimized bundle size with tree shaking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@medicare-companion.com or create an issue in the GitHub repository.

---

Built with ❤️ using React, TypeScript, and Supabase