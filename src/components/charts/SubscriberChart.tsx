import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/Card';

interface SubscriberChartProps {
  data: Array<{ date: string; net: number; gained: number; lost: number }>;
  isLoading: boolean;
  error: string | null;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function SubscriberChart({ data, isLoading, error }: SubscriberChartProps) {
  const chartData = useMemo(() => {
    let cumulative = 0;
    return data.map((item) => {
      cumulative += item.net;
      return {
        date: formatDate(item.date),
        fullDate: item.date,
        subscribers: cumulative,
        gained: item.gained,
        lost: item.lost,
        net: item.net,
      };
    });
  }, [data]);

  const totalNet = data.reduce((sum, item) => sum + item.net, 0);

  if (error) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">訂閱趨勢</h3>
        <div className="h-64 flex items-center justify-center text-foreground-muted">
          {error}
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">訂閱趨勢</h3>
        <div className="h-64 bg-bg-elevated animate-pulse rounded-lg" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">訂閱趨勢</h3>
        <div className="text-sm">
          <span className="text-foreground-muted">過去 30 天：</span>
          <span className={`ml-2 font-medium ${totalNet >= 0 ? 'text-success' : 'text-error'}`}>
            {totalNet >= 0 ? '+' : ''}{totalNet}
          </span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="subscriberGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5E6AD2" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#5E6AD2" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
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
              tickFormatter={(value) => `${value >= 0 ? '+' : ''}${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0a0a0c',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#EDEDEF',
              }}
              labelStyle={{ color: '#8A8F98' }}
              formatter={(value, name) => {
                const numValue = Number(value) || 0;
                if (name === 'subscribers') return [`${numValue >= 0 ? '+' : ''}${numValue}`, '累計變化'];
                return [numValue, String(name)];
              }}
            />
            <Area
              type="monotone"
              dataKey="subscribers"
              stroke="#5E6AD2"
              strokeWidth={2}
              fill="url(#subscriberGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
