import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import {
  createTenant,
  getTenantBySlug,
  getUserTenants,
} from '@/lib/db/queries/tenants';
import { z } from 'zod';
import { ChatSDKError } from '@/lib/errors';

// Validation schema for creating tenants
const createTenantSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(3)
    .max(63)
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens',
    ),
  settings: z
    .object({
      theme: z
        .object({
          colors: z
            .object({
              primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
              secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
            })
            .partial(),
        })
        .optional(),
      branding: z
        .object({
          companyName: z.string().optional(),
          tagline: z.string().optional(),
          logo: z.string().url().optional(),
        })
        .optional(),
      ai: z
        .object({
          tone: z
            .enum(['professional', 'friendly', 'casual', 'technical'])
            .optional(),
          personality: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createTenantSchema.parse(body);

    // Check if slug is already taken
    const existing = await getTenantBySlug(validatedData.slug);
    if (existing) {
      return NextResponse.json(
        { error: 'A tenant with this slug already exists' },
        { status: 400 },
      );
    }

    // Create tenant with current user as owner
    const tenant = await createTenant({
      name: validatedData.name,
      slug: validatedData.slug,
      ownerId: session.user.id,
      settings: validatedData.settings,
    });

    return NextResponse.json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        url: `${process.env.NEXT_PUBLIC_APP_URL?.replace('://', `://${tenant.slug}.`)}`,
      },
    });
  } catch (error) {
    console.error('Failed to create tenant:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    if (error instanceof ChatSDKError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to create tenant' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    // Get user's tenants
    const tenants = await getUserTenants(session.user.id);

    return NextResponse.json({
      tenants: tenants.map((t) => ({
        id: t.tenant.id,
        name: t.tenant.name,
        slug: t.tenant.slug,
        role: t.role,
        url: `${process.env.NEXT_PUBLIC_APP_URL?.replace('://', `://${t.tenant.slug}.`)}`,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch tenants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenants' },
      { status: 500 },
    );
  }
}
