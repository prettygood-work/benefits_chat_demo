import { Card, CardContent } from '@/components/ui/card';

export function LoadingCard() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="h-4 w-1/3 rounded-md bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
            <div className="loading-shimmer absolute inset-0" />
          </div>
          <div className="h-20 rounded-md bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
            <div className="loading-shimmer absolute inset-0" />
          </div>
          <div className="h-4 w-1/2 rounded-md bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
            <div className="loading-shimmer absolute inset-0" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
