'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Users, Building, MessageSquare } from 'lucide-react';

interface TenantStatsProps {
  totalTenants: number;
  userTenants: number;
  activeTenants?: number;
  totalChats?: number;
}

export function TenantStats({
  totalTenants,
  userTenants,
  activeTenants = 0,
  totalChats = 0,
}: TenantStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
          <Building className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTenants}</div>
          <p className="text-xs text-muted-foreground">
            {activeTenants > 0
              ? `${activeTenants} active tenants`
              : `Across the platform`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Your Tenants</CardTitle>
          <Users className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userTenants}</div>
          <p className="text-xs text-muted-foreground">Tenants you manage</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Chats</CardTitle>
          <MessageSquare className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalChats}</div>
          <p className="text-xs text-muted-foreground">Across all tenants</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Analytics</CardTitle>
          <LineChart className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">View</div>
          <p className="text-xs text-muted-foreground">
            <a
              href="/admin/analytics"
              className="text-blue-500 hover:underline"
            >
              See detailed analytics
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
