import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import type { GeographyData } from '@/services/youtubeAnalytics';

interface GeographyChartProps {
  data: GeographyData[];
  isLoading: boolean;
  error: string | null;
}

const COLORS = [
  '#5E6AD2',
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

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function GeographyChart({ data, isLoading, error }: GeographyChartProps) {
  const chartData = useMemo(() => {
    // Take top 10 countries
    const top10 = data.slice(0, 10);

    // Calculate "其他" if there are more than 10 countries
    if (data.length > 10) {
      const othersData = data.slice(10);
      const othersViews = othersData.reduce((sum, item) => sum + item.views, 0);
      const othersPercentage = othersData.reduce((sum, item) => sum + item.viewsPercentage, 0);

      return [
        ...top10,
        {
          country: 'OTHER',
          countryName: '其他',
          views: othersViews,
          viewsPercentage: othersPercentage,
        },
      ];
    }

    return top10;
  }, [data]);

  const totalViews = data.reduce((sum, item) => sum + item.views, 0);

  if (error) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">觀眾地理分布</h3>
        <div className="h-80 flex items-center justify-center text-foreground-muted">
          {error}
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">觀眾地理分布</h3>
        <div className="h-80 bg-bg-elevated animate-pulse rounded-lg" />
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">觀眾地理分布</h3>
        <div className="h-80 flex items-center justify-center text-foreground-muted">
          暫無數據
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">觀眾地理分布</h3>
        <p className="text-sm text-foreground-muted">前 10 個國家/地區</p>
        <div className="mt-2">
          <span className="text-sm text-foreground-muted">總觀看數：</span>
          <span className="ml-2 text-sm font-medium text-foreground">{formatNumber(totalViews)}</span>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData as any}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: any) => {
                const viewsPercentage = props.viewsPercentage || 0;
                const countryName = props.countryName || '';
                if (viewsPercentage < 3) return null; // Don't show label for small slices
                return `${countryName} ${viewsPercentage.toFixed(1)}%`;
              }}
              outerRadius={100}
              fill="#8884d8"
              dataKey="views"
            >
              {chartData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0a0a0c',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#EDEDEF',
              }}
              formatter={(_value: number | undefined, _name: any, props: any) => {
                const item = props.payload as GeographyData;
                return [
                  <div key="content" className="space-y-1">
                    <div>
                      <span className="text-foreground-muted">觀看次數：</span>
                      <span className="ml-2 font-medium">{formatNumber(item.views)}</span>
                    </div>
                    <div>
                      <span className="text-foreground-muted">佔比：</span>
                      <span className="ml-2 font-medium">{item.viewsPercentage.toFixed(1)}%</span>
                    </div>
                  </div>,
                  item.countryName,
                ];
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(_value: any, entry: any) => {
                const item = entry.payload as GeographyData;
                return (
                  <span className="text-xs text-foreground-muted">
                    {item.countryName} ({item.viewsPercentage.toFixed(1)}%)
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top countries list */}
      <div className="mt-4 space-y-2">
        {chartData.slice(0, 5).map((country, index) => (
          <div key={country.country} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-foreground">{country.countryName}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-foreground-muted">{formatNumber(country.views)}</span>
              <span className="text-foreground font-medium w-12 text-right">
                {country.viewsPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
