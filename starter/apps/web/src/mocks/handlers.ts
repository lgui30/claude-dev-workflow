import type { RequestHandler } from 'msw';
import { todoHandlers } from './handlers/todos';

export const handlers: RequestHandler[] = [
  ...todoHandlers,
];
