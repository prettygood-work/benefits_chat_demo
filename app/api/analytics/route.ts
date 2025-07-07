import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsEventsByClientId } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/errors';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = new Date(searchParams.get('from') || Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = new Date(searchParams.get('to') || Date.now());
  
  // Get client ID from request headers or authentication context
  const clientId = request.headers.get('x-client-id') || 
                   searchParams.get('clientId') || 
                   process.env.DEFAULT_CLIENT_ID || 
                   'default';

  if (!clientId) {
    return NextResponse.json(
      { error: 'Client ID is required' }, 
      { status: 400 }
    );
  }

  try {
    const events = await getAnalyticsEventsByClientId(clientId, from, to);
    
    // Calculate real analytics data from events
    const analyticsData = {
      totalConversations: events.filter(e => e.eventType === 'conversation_start').length,
      totalUsers: new Set(events.map(e => e.sessionId)).size,
      averageSessionTime: calculateAverageSessionTime(events),
      planComparisons: events.filter(e => e.eventType === 'plan_compared').length,
      costCalculations: events.filter(e => e.eventType === 'cost_calculated').length,
      satisfactionRating: calculateAverageSatisfaction(events),
      conversionRate: calculateConversionRate(events),
      
      conversationsOverTime: generateTimeSeriesData(events, from, to),
      topQuestions: extractTopQuestions(events),
      planPopularity: calculatePlanPopularity(events),
      timeDistribution: generateHourlyDistribution(events)
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Analytics API error:', error);
    if (error instanceof ChatSDKError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

function generateTimeSeriesData(events: any[], from: Date, to: Date) {
  const days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  const data = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(from.getTime() + i * 24 * 60 * 60 * 1000);
    const dayEvents = events.filter(e => {
      const eventDate = new Date(e.timestamp);
      return eventDate.toDateString() === date.toDateString();
    });
    
    data.push({
      date: date.toISOString().split('T')[0],
      count: dayEvents.filter(e => e.eventType === 'conversation_start').length
    });
  }
  
  return data;
}

function calculateAverageSessionTime(events: any[]): number {
  const sessions = new Map<string, { start: Date; end: Date }>();
  
  events.forEach(event => {
    const sessionId = event.sessionId;
    const timestamp = new Date(event.timestamp);
    
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, { start: timestamp, end: timestamp });
    } else {
      const session = sessions.get(sessionId)!;
      if (timestamp < session.start) session.start = timestamp;
      if (timestamp > session.end) session.end = timestamp;
    }
  });

  if (sessions.size === 0) return 0;

  const totalMinutes = Array.from(sessions.values())
    .reduce((sum, session) => {
      return sum + (session.end.getTime() - session.start.getTime()) / (1000 * 60);
    }, 0);

  return Math.round((totalMinutes / sessions.size) * 10) / 10;
}

function calculateAverageSatisfaction(events: any[]): number {
  const satisfactionEvents = events.filter(e => 
    e.eventType === 'satisfaction_rated' && 
    e.metadata?.rating
  );
  
  if (satisfactionEvents.length === 0) return 0;
  
  const totalRating = satisfactionEvents.reduce((sum, event) => 
    sum + (event.metadata.rating || 0), 0
  );
  
  return Math.round((totalRating / satisfactionEvents.length) * 10) / 10;
}

function calculateConversionRate(events: any[]): number {
  const conversationStarts = events.filter(e => e.eventType === 'conversation_start').length;
  const planSelections = events.filter(e => 
    e.eventType === 'recommendation_viewed' && 
    e.metadata?.planSelected
  ).length;
  
  if (conversationStarts === 0) return 0;
  
  return Math.round((planSelections / conversationStarts) * 1000) / 10; // Percentage with 1 decimal
}

function extractTopQuestions(events: any[]): { question: string; count: number }[] {
  const questionMap = new Map<string, number>();
  
  events.forEach(event => {
    if (event.metadata?.question) {
      const question = event.metadata.question;
      questionMap.set(question, (questionMap.get(question) || 0) + 1);
    }
  });
  
  return Array.from(questionMap.entries())
    .map(([question, count]) => ({ question, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function calculatePlanPopularity(events: any[]): { planType: string; selections: number }[] {
  const planCounts = new Map<string, number>();
  
  events
    .filter(e => e.eventType === 'plan_compared' && e.metadata?.plansCompared)
    .forEach(event => {
      const plans = event.metadata.plansCompared || [];
      plans.forEach((planType: string) => {
        planCounts.set(planType, (planCounts.get(planType) || 0) + 1);
      });
    });
  
  return Array.from(planCounts.entries())
    .map(([planType, selections]) => ({ planType, selections }))
    .sort((a, b) => b.selections - a.selections);
}

function generateHourlyDistribution(events: any[]) {
  const hourCounts = new Array(24).fill(0);
  
  events.forEach(event => {
    const hour = new Date(event.timestamp).getHours();
    hourCounts[hour]++;
  });
  
  return hourCounts.map((conversations, hour) => ({
    hour,
    conversations
  })).filter(item => item.conversations > 0); // Only show active hours
}