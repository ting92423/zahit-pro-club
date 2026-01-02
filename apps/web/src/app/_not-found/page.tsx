export const runtime = 'edge';

// next-on-pages expects the internal /_not-found route to be explicitly configured
// for the Edge runtime. We delegate to the app-level not-found UI.
export { default } from '../not-found';

