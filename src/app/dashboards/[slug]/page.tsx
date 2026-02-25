'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { getDashboardBySlug } from '@/lib/dashboards/config';
import { DashboardDetail } from '@/components/dashboards';

export default function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const dashboard = getDashboardBySlug(slug);

  if (!dashboard) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardDetail dashboard={dashboard} />
      </main>
    </div>
  );
}
