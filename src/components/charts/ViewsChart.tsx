import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/Card';

interface ViewsChartProps {
  data: Array<{ date: string; views: number }>;
  isLoading: boolean;
  error: string | null;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function ViewsChart({ data, isLoading, error }: ViewsChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      date: formatDate(item.date),
      fullDate: item.date,
      views: item.views,
    }));
  }, [data]);

  const totalViews = data.reduce((sum, item) => sum + item.views, 0);
  const avgViews = data.length > 0 ? Math.round(totalViews / data.length) : 0;

  if (error) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">觀看趨勢</h3>
        <div className="h-64 flex items-center justify-center text-foreground-muted">
          {error}
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">觀看趨勢</h3>
        <div className="h-64 bg-bg-elevated animate-pulse rounded-lg" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">觀看趨勢</h3>
        <div className="text-sm">
          <span className="text-foreground-muted">總計：</span>
          <span className="ml-2 font-medium text-foreground">{formatNumber(totalViews)}</span>
          <span className="text-foreground-muted ml-4">日均：</span>
          <span className="ml-2 font-medium text-foreground">{formatNumber(avgViews)}</span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6872D9" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#5E6AD2" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#5C5F66"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#5C5F66"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatNumber}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0a0a0c',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#EDEDEF',
              }}
              labelStyle={{ color: '#8A8F98' }}
              formatter={(value) => [formatNumber(Number(value) || 0), '觀看數']}
            />
            <Bar
              dataKey="views"
              fill="url(#viewsGradient)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
