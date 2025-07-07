'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { Tenant } from '@/lib/db/schema';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, ExternalLink, Settings, Users } from 'lucide-react';

interface TenantWithRole extends Tenant {
  userRole?: string;
}

interface TenantListProps {
  tenants: TenantWithRole[];
  showOwner?: boolean;
}

export function TenantList({ tenants, showOwner = false }: TenantListProps) {
  if (tenants.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <p className="text-muted-foreground mb-4">No tenants found</p>
          <Button asChild>
            <Link href="/admin/tenants/new">Create your first tenant</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tenants.map((tenant) => (
        <Card key={tenant.id} className="overflow-hidden tenant-card">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl">{tenant.name}</CardTitle>
                <CardDescription>
                  {tenant.slug}.
                  {process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'example.com'}
                </CardDescription>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/tenants/${tenant.id}`}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/tenants/${tenant.id}/users`}>
                      <Users className="mr-2 h-4 w-4" />
                      Users
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href={`${window.location.protocol}//${tenant.slug}.${window.location.host.replace(/^[^.]+\./, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Visit Site
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge
                variant={tenant.status === 'active' ? 'default' : 'secondary'}
              >
                {tenant.status}
              </Badge>
            </div>

            {tenant.userRole && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Your Role</span>
                <Badge variant="outline">{tenant.userRole}</Badge>
              </div>
            )}

            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Created</span>
              <span>{format(new Date(tenant.createdAt), 'MMM d, yyyy')}</span>
            </div>

            {tenant.settings.branding.tagline && (
              <p className="text-sm text-muted-foreground mt-3 italic">
                &quot;{tenant.settings.branding.tagline}&quot;
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
