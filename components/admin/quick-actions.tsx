'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Upload, RefreshCw, Download } from 'lucide-react';

export function QuickActions() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          <Button asChild>
            <Link href="/admin/tenants/new">
              <Plus className="mr-2 size-4" />
              New Tenant
            </Link>
          </Button>

          <Button variant="outline">
            <Upload className="mr-2 size-4" />
            Import Data
          </Button>

          <Button variant="outline">
            <Download className="mr-2 size-4" />
            Export Report
          </Button>

          <Button variant="outline">
            <RefreshCw className="mr-2 size-4" />
            Refresh Cache
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
