import { compare } from 'bcrypt-ts';
import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { createGuestUser, getUser, userCanAccessTenant } from '@/lib/db/queries';
import { authConfig } from './auth.config';
import { DUMMY_PASSWORD } from '@/lib/constants';
import type { DefaultJWT } from 'next-auth/jwt';
import { db } from '@/lib/db';
import { and, eq } from 'drizzle-orm';
import { tenantUser, type TenantUser as TenantUserSchema } from '@/lib/db/schema';

export type UserType = 'guest' | 'regular';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession['user'];
    tenant?: {
      id: string;
      role: TenantUserSchema['role'];
      permissions: string[];
    };
  }

  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
    tenant?: {
      id: string;
      role: TenantUserSchema['role'];
      permissions: string[];
    };
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        const users = await getUser(email);

        if (users.length === 0) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const [user] = users;

        if (!user.password) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const passwordsMatch = await compare(password, user.password);

        if (!passwordsMatch) return null;

        return { ...user, type: 'regular' };
      },
    }),
    Credentials({
      id: 'guest',
      credentials: {},
      async authorize() {
        const [guestUser] = await createGuestUser();
        return { ...guestUser, type: 'guest' };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.type = user.type;
      }

      if (trigger === 'update' && session?.tenant) {
        token.tenant = session.tenant;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
      }
      if (token.tenant) {
        session.tenant = token.tenant;
      }

      return session;
    },
  },
});

// Fix the tenant authentication helper
export async function getTenantAuth(tenantId?: string) {
  const session = await auth();

  // If no tenant ID or no user, just return standard session
  if (!tenantId || !session?.user) {
    return { session, hasAccess: false };
  }

  // Check if user has access to this tenant
  const hasAccess = await userCanAccessTenant(session.user.id, tenantId);

  if (!hasAccess) {
    return { session, hasAccess: false };
  }

  // Get user's role in this tenant
  const [tenantUserRecord] = await db
    .select()
    .from(tenantUser)
    .where(
      and(
        eq(tenantUser.tenantId, tenantId),
        eq(tenantUser.userId, session.user.id)
      )
    )
    .limit(1);

  // Return enhanced session with tenant info
  const tenantContext = {
    id: tenantId,
    role: tenantUserRecord?.role || 'member',
    permissions: tenantUserRecord?.permissions || [],
  };

  return {
    session: {
      ...session,
      tenant: tenantContext,
    },
    hasAccess: true,
    tenant: tenantContext,
  };
}
