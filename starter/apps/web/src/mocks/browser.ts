import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

/**
 * Initialize MSW in the browser.
 * Only activates when NEXT_PUBLIC_USE_MOCKS=true.
 */
export async function initMocks() {
  if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
    await worker.start({ onUnhandledRequest: 'bypass' });
    console.log('[MSW] Mock service worker started');
  }
}
