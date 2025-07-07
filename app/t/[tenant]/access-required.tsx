import Link from 'next/link';
import { getTenantBySlug } from '@/lib/db/queries/tenants';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LockKeyhole } from 'lucide-react';

interface AccessRequiredProps {
  params: {
    tenant: string;
  };
}

export default async function AccessRequired({ params }: AccessRequiredProps) {
  const tenant = await getTenantBySlug(params.tenant);

  if (!tenant) {
    notFound();
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto bg-muted rounded-full p-3 size-12 flex items-center justify-center mb-4">
            <LockKeyhole className="size-6" />
          </div>
          <CardTitle className="text-2xl">Access Required</CardTitle>
          <CardDescription>
            You need to sign in to access {tenant.settings.branding.companyName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            This benefits assistant requires authentication. Please sign in with
            your account to continue.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href={`/login?tenant=${params.tenant}`}>Sign In</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href={`/register?tenant=${params.tenant}`}>
              Create Account
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
