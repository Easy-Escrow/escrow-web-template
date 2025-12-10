import { useQuery } from '@tanstack/react-query';

import { fetchHealth } from '@/lib/http';

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
  });

  return (
    <section>
      <h2>Welcome back</h2>
      <p>Use this starter to build escrow workflows quickly.</p>
      <div>
        <h3>API health</h3>
        {isLoading && <p>Checking backend...</p>}
        {error && <p role="alert">Backend unavailable</p>}
        {data && <p role="status">{data.status ?? 'ok'}</p>}
      </div>
    </section>
  );
}
