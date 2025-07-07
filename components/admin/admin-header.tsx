'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { User } from 'next-auth';
import { LogOut, Settings, Bell } from 'lucide-react';

interface AdminHeaderProps {
  user: User;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <h1 className="hidden text-lg font-semibold md:block">
          Admin Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <span className="hidden text-sm md:block">
            {user.name || user.email}
          </span>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || ''} alt={user.name || ''} />
            <AvatarFallback>
              {user.name?.charAt(0).toUpperCase() ||
                user.email?.charAt(0).toUpperCase() ||
                'U'}
            </AvatarFallback>
          </Avatar>
        </div>

        <Button variant="ghost" size="icon" asChild>
          <Link href="/api/auth/signout">
            <LogOut className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
