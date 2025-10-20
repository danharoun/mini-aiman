import { headers } from 'next/headers';
import { getAppConfig } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  // Removed header with LiveKit branding - clean UI focused on Chef Aiman
  return <>{children}</>;
}
