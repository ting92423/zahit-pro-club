export const runtime = 'edge';

// next-on-pages expects the internal /_not-found route to be explicitly configured
// for the Edge runtime. We delegate to the app-level not-found UI.
import NotFound from '../not-found';

export default function NotFoundPage() {
  return <NotFound />;
}

