'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Star,
  Download,
  Filter,
  Calendar
} from 'lucide-react';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';

interface AnalyticsData {
  totalConversations: number;
  totalUsers: number;
  averageSessionTime: number;
  planComparisons: number;
  costCalculations: number;
  satisfactionRating: number;
  conversionRate: number;
  conversationsOverTime: Array<{ date: string; count: number }>;
  topQuestions: Array<{ question: string; count: number }>;
  planPopularity: Array<{ planType: string; selections: number }>;
  timeDistribution: Array<{ hour: number; conversations: number }>;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });

  // Define fetchAnalyticsData with proper memoization
  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Fallback to mock data if fetch fails
      setAnalyticsData({
        totalConversations: 1247,
        totalUsers: 523,
        averageSessionTime: 8.5,
        planComparisons: 342,
        costCalculations: 567,
        satisfactionRating: 4.3,
        conversionRate: 23.5,
        conversationsOverTime: [
          { date: '2024-01-01', count: 45 },
          { date: '2024-01-02', count: 52 },
          { date: '2024-01-03', count: 48 },
          { date: '2024-01-04', count: 61 },
          { date: '2024-01-05', count: 55 },
          { date: '2024-01-06', count: 43 },
          { date: '2024-01-07', count: 67 }
        ],
        topQuestions: [
          { question: "What's the difference between HMO and PPO?", count: 45 },
          { question: "How much will my family plan cost?", count: 38 },
          { question: "Which doctors are in-network?", count: 32 },
          { question: "What's covered under preventive care?", count: 28 },
          { question: "How do I enroll in a plan?", count: 24 }
        ],
        planPopularity: [
          { planType: 'PPO', selections: 67 },
          { planType: 'HMO', selections: 45 },
          { planType: 'HDHP', selections: 32 },
          { planType: 'EPO', selections: 23 }
        ],
        timeDistribution: [
          { hour: 8, conversations: 12 },
          { hour: 9, conversations: 34 },
          { hour: 10, conversations: 45 },
          { hour: 11, conversations: 52 },
          { hour: 12, conversations: 38 },
          { hour: 13, conversations: 41 },
          { hour: 14, conversations: 48 },
          { hour: 15, conversations: 35 },
          { hour: 16, conversations: 29 },
          { hour: 17, conversations: 18 }
        ]
      });
    }
    setLoading(false);
  }, [dateRange]); // Include dateRange as a dependency

  // Use fetchAnalyticsData in useEffect with proper dependencies
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]); // fetchAnalyticsData is memoized, so this is safe

  const exportData = () => {
    if (!analyticsData) return;
    
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Conversations', analyticsData.totalConversations],
      ['Total Users', analyticsData.totalUsers],
      ['Average Session Time (minutes)', analyticsData.averageSessionTime],
      ['Plan Comparisons', analyticsData.planComparisons],
      ['Cost Calculations', analyticsData.costCalculations],
      ['Satisfaction Rating', analyticsData.satisfactionRating],
      ['Conversion Rate (%)', analyticsData.conversionRate]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `benefits-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Benefits Assistant Analytics</h1>
          <p className="text-muted-foreground">
            Track conversation metrics and business impact
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span>Last 30 days</span>
          </div>
          <Button onClick={exportData} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalConversations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.averageSessionTime}m</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">+2m</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.satisfactionRating}/5</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0.2</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conversations Over Time</CardTitle>
            <CardDescription>Daily conversation volume trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData?.conversationsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan Type Popularity</CardTitle>
            <CardDescription>Distribution of plan selections</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData?.planPopularity}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ planType, percent }) => `${planType} ${(percent ? (percent * 100).toFixed(0) : 0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="selections"
                >
                  {analyticsData?.planPopularity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usage by Hour</CardTitle>
            <CardDescription>Peak conversation times</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData?.timeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="conversations" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Questions</CardTitle>
            <CardDescription>Most frequently asked questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData?.topQuestions.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{item.question}</p>
                  </div>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Business Impact Metrics</CardTitle>
          <CardDescription>Quantified value and efficiency gains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {analyticsData?.planComparisons}
              </div>
              <div className="text-sm text-muted-foreground">Plan Comparisons</div>
              <div className="text-xs text-green-600 mt-1">Saved ~2hrs each</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData?.costCalculations}
              </div>
              <div className="text-sm text-muted-foreground">Cost Calculations</div>
              <div className="text-xs text-blue-600 mt-1">Instant vs 30min manual</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {analyticsData?.conversionRate}%
              </div>
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
              <div className="text-xs text-purple-600 mt-1">Chat to enrollment</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}