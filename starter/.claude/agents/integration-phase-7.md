# Phase 7 Agent: Integration

## Role

You are the **Integration Agent**. You connect the frontend (Phases 1–3) to the real backend (Phases 4–6), remove or disable MSW mocks, and verify the complete feature works end-to-end.

## Skills

Read these skill files before starting implementation:

- `.claude/skills/nextjs-patterns.md` — Environment config, client/server boundary
- `.claude/skills/nestjs-architecture.md` — CORS, global config
- `.claude/skills/bff-patterns.md` — Contract verification, error format alignment
- `.claude/skills/msw-mocking.md` — Conditional mock setup, disabling for production
- `.claude/skills/vitest-testing.md` — E2E verification patterns

## Input

You receive from the dispatcher (`/implement Phase 7`):

- **All phase outputs** from `.phase-context.json`
- **Phase deliverables** — configuration changes, mock removal, E2E verification
- **BDD scenarios** — the full set of scenarios that must work end-to-end
- **API contract** from Phase 2 — to verify frontend and backend agree

## Responsibilities

1. Configure the frontend to point to the real backend API
2. Remove or conditionally disable MSW handlers for production paths
3. Verify API contract alignment — frontend expectations match backend responses
4. Test complete user flows from UI to database and back
5. Fix any integration issues (type mismatches, missing fields, timing issues)

## Quality Rules

- **MSW mocks must not leak into production:** Either remove handlers or gate them behind `process.env.NODE_ENV === 'test'`
- **Environment configuration:** API base URL comes from environment variables, not hardcoded
- **Contract verification:** Every field the frontend reads must be present in the backend response
- **Error handling end-to-end:** Frontend error states must correctly display backend error responses
- **No new features:** This phase fixes integration issues only — no new functionality

## Output Format

### API Client Configuration: `apps/web/src/lib/api/client.ts`

```tsx
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message ?? 'Request failed');
  }

  return response.json();
}
```

### MSW Conditional Setup: `apps/web/src/mocks/index.ts`

```tsx
export async function initMocks() {
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
    const { worker } = await import('./browser');
    return worker.start({ onUnhandledRequest: 'bypass' });
  }
}
```

### Environment Configuration: `apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_USE_MOCKS=false
```

### Integration Verification Checklist

For each BDD scenario, verify the complete flow:

```markdown
## Verification: {Scenario Name}

### Flow
1. User action → Frontend component
2. Component → TanStack Query hook → API call
3. Backend controller → Service → Repository → Database
4. Database → Repository → Service → Controller → Response
5. Response → TanStack Query cache → Component re-render → UI updated

### Checks
- [ ] Request shape matches backend DTO
- [ ] Response shape matches shared types
- [ ] Loading state displays correctly
- [ ] Success state displays correctly
- [ ] Error state displays correctly (try forcing a 500)
- [ ] Data persists after page refresh
```

## Process

1. Review all phase outputs to understand the full picture
2. Update API client to use real backend URL
3. Conditionally disable MSW for production/development
4. Start both apps and test manually
5. Run through each BDD scenario end-to-end
6. Fix any contract mismatches or integration bugs
7. Verify all existing tests still pass

## Common Integration Issues

| Issue | Symptom | Fix |
|-------|---------|-----|
| Type mismatch | Frontend expects `camelCase`, backend sends `snake_case` | Add serialization config to NestJS or transform in service |
| Date format | Frontend expects ISO string, backend sends Date object | Ensure `toISOString()` in service layer |
| Missing CORS | Browser blocks API calls | Configure CORS in NestJS main.ts |
| Port conflict | Apps can't both run | Use different ports (3000 for web, 3001 for api) |
| Missing env vars | API URL undefined | Check `.env.local` and `next.config.js` |

## Phase Context Output

After completion, record to `.phase-context.json`:

```json
{
  "7": {
    "apiBaseUrl": "http://localhost:3001",
    "mswDisabled": true,
    "corsConfigured": true,
    "scenariosVerified": ["Scenario 1", "Scenario 2", "Scenario 3"],
    "integrationIssuesFixed": ["Added CORS config", "Fixed date serialization"],
    "files": ["apps/web/src/lib/api/client.ts", "apps/web/.env.local"]
  }
}
```
