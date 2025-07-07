'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Tenant, User } from '@/lib/db/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, } from 'lucide-react';

interface TenantChatHeaderProps {
  tenant: Tenant;
  user?: User;
}

export function TenantChatHeader({ tenant, user }: TenantChatHeaderProps) {
  const initials = tenant.settings.branding.companyName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <div className="mr-2">
          {tenant.settings.branding.logo ? (
            <Image
              src={tenant.settings.branding.logo}
              alt={tenant.settings.branding.companyName}
              width={40}
              height={40}
              className="object-contain"
            />
          ) : (
            <Avatar className="size-10">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          )}
        </div>
        <div>
          <h1 className="text-lg font-semibold">
            {tenant.settings.branding.companyName}
          </h1>
          {tenant.settings.branding.tagline && (
            <p className="text-xs text-muted-foreground">
              {tenant.settings.branding.tagline}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm hidden md:block">{user.name}</span>
            <Avatar className="size-8">
              <AvatarImage src={user.image || ''} alt={user.name || ''} />
              <AvatarFallback>
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/api/auth/signout">
                <LogOut className="size-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <Button asChild size="sm">
            <Link href={`/t/${tenant.slug}/login`}>Login</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
