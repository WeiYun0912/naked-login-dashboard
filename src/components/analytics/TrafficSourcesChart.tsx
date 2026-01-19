import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import type { TrafficSource } from '@/services/youtubeAnalytics';

interface TrafficSourcesChartProps {
  data: TrafficSource[];
  isLoading: boolean;
  error: string | null;
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

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    return (minutes / 60).toFixed(1) + ' 小時';
  }
  return minutes.toFixed(0) + ' 分鐘';
}

// Color palette for different traffic sources
const COLORS = [
  '#5E6AD2', // Accent blue
  '#6872D9',
  '#7C87E2',
  '#8F9BEC',
  '#A3AEF5',
  '#B6C2FF',
  '#4A5AB8',
  '#3D4A9E',
  '#303A84',
  '#232A6A',
];

export function TrafficSourcesChart({ data, isLoading, error }: TrafficSourcesChartProps) {
  const chartData = useMemo(() => {
    // Sort by views descending and take top sources
    return [...data].sort((a, b) => b.views - a.views).slice(0, 10);
  }, [data]);

  const totalViews = data.reduce((sum, item) => sum + item.views, 0);

  if (error) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">流量來源分析</h3>
        <div className="h-96 flex items-center justify-center text-foreground-muted">
          {error}
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">流量來源分析</h3>
        <div className="h-96 bg-bg-elevated animate-pulse rounded-lg" />
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">流量來源分析</h3>
        <div className="h-96 flex items-center justify-center text-foreground-muted">
          暫無數據
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">流量來源分析</h3>
        <p className="text-sm text-foreground-muted">觀眾如何找到你的影片</p>
        <div className="mt-2">
          <span className="text-sm text-foreground-muted">總觀看數：</span>
          <span className="ml-2 text-sm font-medium text-foreground">{formatNumber(totalViews)}</span>
        </div>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
            <XAxis
              type="number"
              stroke="#5C5F66"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatNumber}
            />
            <YAxis
              type="category"
              dataKey="sourceTypeName"
              stroke="#5C5F66"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={110}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0a0a0c',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#EDEDEF',
              }}
              labelStyle={{ color: '#EDEDEF', fontWeight: 600, marginBottom: '8px' }}
              formatter={(_value: any, _name: any, props: any) => {
                const item = props.payload as TrafficSource;
                return [
                  <div key="content" className="space-y-1">
                    <div>
                      <span className="text-foreground-muted">觀看次數：</span>
                      <span className="ml-2 font-medium">{formatNumber(item.views)}</span>
                    </div>
                    <div>
                      <span className="text-foreground-muted">觀看時長：</span>
                      <span className="ml-2 font-medium">{formatDuration(item.estimatedMinutesWatched)}</span>
                    </div>
                    <div>
                      <span className="text-foreground-muted">佔比：</span>
                      <span className="ml-2 font-medium">{item.percentage.toFixed(1)}%</span>
                    </div>
                  </div>,
                  ''
                ];
              }}
            />
            <Bar dataKey="views" radius={[0, 4, 4, 0]}>
              {chartData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend showing percentage breakdown */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {chartData.slice(0, 6).map((source, index) => (
          <div key={source.sourceType} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-foreground-muted truncate">{source.sourceTypeName}</span>
            <span className="text-foreground font-medium ml-auto">{source.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
