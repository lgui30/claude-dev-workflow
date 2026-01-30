# Skill: Next.js App Router Patterns

## Overview

This skill covers Next.js 14+ with the App Router. All frontend code lives in `apps/web/` inside a Turborepo monorepo. We use the App Router exclusively — no Pages Router.

## File Structure Conventions

```
apps/web/src/
├── app/                          # App Router routes
│   ├── layout.tsx                # Root layout (providers, global styles)
│   ├── page.tsx                  # Home page
│   ├── loading.tsx               # Root loading UI
│   ├── error.tsx                 # Root error boundary
│   ├── not-found.tsx             # 404 page
│   └── {feature}/
│       ├── page.tsx              # Feature page (smart component)
│       ├── layout.tsx            # Feature layout (optional)
│       ├── loading.tsx           # Feature loading state
│       └── error.tsx             # Feature error boundary
├── components/                   # Shared presentational components
│   ├── {ComponentName}.tsx
│   └── __tests__/
│       └── {ComponentName}.test.tsx
├── lib/                          # Utilities and API layer
│   └── api/                      # TanStack Query hooks
├── stores/                       # Zustand stores
└── mocks/                        # MSW handlers
    └── handlers/
```

## Server vs Client Components

### Default: Server Components

Files in `app/` are Server Components by default. They can:
- Fetch data directly (no hooks needed)
- Access backend resources
- Keep secrets server-side
- Reduce client JS bundle

### Client Components: `'use client'`

Add the directive when the component needs:
- Event handlers (`onClick`, `onChange`)
- React hooks (`useState`, `useEffect`, `useQuery`)
- Browser APIs (`window`, `localStorage`)
- Interactivity of any kind

```tsx
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### Rule: Push `'use client'` as deep as possible

```
// GOOD — only the interactive part is a Client Component
app/dashboard/page.tsx        (Server Component — fetches data)
  └── components/DashboardStats.tsx  (Server Component — renders static)
  └── components/FilterBar.tsx       (Client Component — has dropdowns)

// BAD — entire page is client-side
'use client'
app/dashboard/page.tsx        (Client Component — everything client-side)
```

## Layouts

Layouts wrap pages and persist across navigation. They don't re-render when child routes change.

```tsx
// app/layout.tsx — Root layout
import { Providers } from '@/components/Providers';
import '@/styles/globals.css';

export const metadata = {
  title: 'App Name',
  description: 'App description',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

The `<Providers>` component is a Client Component that wraps `QueryClientProvider`, theme providers, etc.

```tsx
// components/Providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000 },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

## Loading & Error States

Use file-based conventions for automatic loading/error handling:

```tsx
// app/tasks/loading.tsx
export default function TasksLoading() {
  return <div className="animate-pulse">Loading tasks...</div>;
}

// app/tasks/error.tsx
'use client';

export default function TasksError({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## Route Patterns

```tsx
// Dynamic route: app/tasks/[id]/page.tsx
export default function TaskPage({ params }: { params: { id: string } }) {
  return <TaskDetail id={params.id} />;
}

// Route groups: app/(dashboard)/layout.tsx
// Groups routes under a shared layout without affecting the URL

// Parallel routes: app/@modal/page.tsx
// Render multiple pages simultaneously (modals, sidebars)
```

## Image Optimization

```tsx
import Image from 'next/image';

// Always use next/image for optimization
<Image
  src="/hero.png"
  alt="Hero image"
  width={800}
  height={400}
  priority  // for above-the-fold images
/>
```

## Common Pitfalls

1. **Importing client code in server components** — If a component uses hooks, it must have `'use client'`. Import it into a Server Component, don't add the directive to the server component.

2. **Passing functions as props across the boundary** — You can't pass functions from Server to Client components. Pass serializable data, handle events in Client Components.

3. **Using `useEffect` for data fetching** — Use TanStack Query hooks instead. `useEffect` for fetching leads to waterfalls and missing cache.

4. **Forgetting loading/error files** — Every route group should have `loading.tsx` and `error.tsx` for a polished UX.

5. **Not using `metadata` export** — Every page should export metadata for SEO.

## Testing Notes

- Use `@testing-library/react` for component tests
- Test Client Components in isolation — they're just React components
- Server Components need different testing strategies (integration tests or E2E)
- MSW handles API mocking in tests — see `msw-mocking` skill
