'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Tenant } from '@/lib/db/schema';
import type { User } from 'next-auth';
import { TenantChatHeader } from './tenant-chat-header';
import { TenantWelcomeMessage } from './tenant-welcome-message';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface TenantChatProps {
  tenant: Tenant;
  user?: User;
}

// Uses useChat with tenant headers and AI settings
// Wraps Chat component with tenant-specific features
export function TenantChat({ tenant, user }: TenantChatProps) {
  const router = useRouter();
  const [chatId, setChatId] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  // Custom chat configuration for tenant
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    error,
    reload,
    stop,
  } = useChat({
    api: '/api/chat',
    headers: {
      'X-Tenant-ID': tenant.id,
    },
    body: {
      tenantId: tenant.id,
      model: tenant.settings.ai.model,
      temperature: tenant.settings.ai.temperature,
      maxTokens: tenant.settings.ai.maxTokens,
      systemPrompt: tenant.settings.ai.systemPrompt,
    },
    initialMessages: [],
    onResponse: (response) => {
      if (!chatId && response.headers.get('X-Chat-ID')) {
        setChatId(response.headers.get('X-Chat-ID'));
        setShowWelcome(false);
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  // Hide welcome message when chat starts
  useEffect(() => {
    if (messages.length > 0) {
      setShowWelcome(false);
    }
  }, [messages]);

  // Wrap submit to add tenant context
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!user && tenant.settings.features.requireAuth) {
        router.push(`/t/${tenant.slug}/login`);
        return;
      }

      setShowWelcome(false);
      originalHandleSubmit(e);
    },
    [originalHandleSubmit, user, tenant, router],
  );

  return (
    <div className="flex h-screen flex-col">
      <TenantChatHeader tenant={tenant} user={user} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {showWelcome ? (
          <TenantWelcomeMessage tenant={tenant} />
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg max-w-3xl ${
                  message.role === 'assistant'
                    ? 'bg-muted ml-0 mr-auto'
                    : 'bg-primary text-primary-foreground ml-auto mr-0'
                }`}
              >
                <p>{message.content}</p>
              </div>
            ))}
            {isLoading && (
              <div className="p-4 rounded-lg max-w-3xl bg-muted">
                <p>Thinking...</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder={`Ask about your benefits...`}
            className="flex-1 min-h-10 max-h-32"
            disabled={isLoading}
            rows={1}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
