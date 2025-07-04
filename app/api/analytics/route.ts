import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsEventsByClientId } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = new Date(searchParams.get('from') || Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = new Date(searchParams.get('to') || Date.now());
  const clientId = 'default-client'; // Get from auth/context

  try {
    const events = await getAnalyticsEventsByClientId(clientId, from, to);
    
    // Process events into analytics data
    const analyticsData = {
      totalConversations: events.filter(e => e.eventType === 'conversation_start').length,
      totalUsers: new Set(events.map(e => e.sessionId)).size,
      averageSessionTime: 8.5, // Calculate from actual session data
      planComparisons: events.filter(e => e.eventType === 'plan_compared').length,
      costCalculations: events.filter(e => e.eventType === 'cost_calculated').length,
      satisfactionRating: 4.3, // Calculate from satisfaction events
      conversionRate: 23.5, // Calculate from conversion events
      
      conversationsOverTime: generateTimeSeriesData(events, from, to),
      topQuestions: generateTopQuestions(events),
      planPopularity: generatePlanPopularity(events),
      timeDistribution: generateHourlyDistribution(events)
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Analytics API error:', error);
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

function generateTopQuestions(events: any[]) {
  // Mock data - in real implementation, extract from conversation metadata
  return [
    { question: "What's the difference between HMO and PPO?", count: 45 },
    { question: "How much will my family plan cost?", count: 38 },
    { question: "Which doctors are in-network?", count: 32 },
    { question: "What's covered under preventive care?", count: 28 },
    { question: "How do I enroll in a plan?", count: 24 }
  ];
}

function generatePlanPopularity(events: any[]) {
  const planEvents = events.filter(e => e.eventType === 'plan_compared');
  const planCounts = { HMO: 45, PPO: 67, HDHP: 32, EPO: 23 };
  
  return Object.entries(planCounts).map(([planType, selections]) => ({
    planType,
    selections
  }));
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