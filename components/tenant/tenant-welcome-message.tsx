"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type { Tenant } from "@/lib/db/schema";

interface TenantWelcomeMessageProps {
  tenant: Tenant;
}

export function TenantWelcomeMessage({ tenant }: TenantWelcomeMessageProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl px-4 pt-12 pb-8 md:pt-24"
      >
        <div className="rounded-lg border bg-background p-8">
          <div className="flex flex-col items-center text-center">
            {tenant.settings.branding.logo && (
                <Image
                  src={tenant.settings.branding.logo}
                  alt={tenant.settings.branding.companyName}
                  className="h-16 w-auto object-contain"
                  height={64}
                  width={256}
                  style={{ height: "4rem", width: "auto" }}
                  priority
                  unoptimized={false}
                />
            )}
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome to {tenant.settings.branding.companyName}
            </h1>
            <p className="mt-4 text-muted-foreground">
              {tenant.settings.branding.tagline ||
                "Ask me anything about your benefits. I'm here to help!"}
            </p>

            <div className="mt-6 grid gap-2 text-left text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 p-1">
                  <span className="block size-1.5 rounded-full bg-primary"></span>
                </span>
                Ask about your benefits coverage
              </p>
              <p className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 p-1">
                  <span className="block size-1.5 rounded-full bg-primary"></span>
                </span>
                Find in-network providers
              </p>
              <p className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 p-1">
                  <span className="block size-1.5 rounded-full bg-primary"></span>
                </span>
                Get help with claims and billing
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
