// Conditional instrumentation to prevent client-side conflicts
export function register() {
  // Only register on server side and in production
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    try {
      const { registerOTel } = require('@vercel/otel');
      registerOTel({ serviceName: 'ai-chatbot' });
    } catch (error) {
      console.warn('Failed to register OpenTelemetry:', error);
    }
  }
}
