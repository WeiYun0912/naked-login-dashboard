import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import type { DemographicData } from '@/services/youtubeAnalytics';

interface DemographicsChartProps {
  data: DemographicData[];
  isLoading: boolean;
  error: string | null;
}

const GENDER_COLORS: Record<string, string> = {
  男性: '#5E6AD2',
  女性: '#E26AD2',
  其他: '#8A8F98',
};

export function DemographicsChart({ data, isLoading, error }: DemographicsChartProps) {
  const chartData = useMemo(() => {
    // Group by age group and aggregate by gender
    const grouped = data.reduce((acc, item) => {
      if (!acc[item.ageGroup]) {
        acc[item.ageGroup] = {
          ageGroup: item.ageGroup,
          男性: 0,
          女性: 0,
          其他: 0,
        };
      }
      const genderKey = item.gender as '男性' | '女性' | '其他';
      acc[item.ageGroup][genderKey] = item.viewsPercentage;
      return acc;
    }, {} as Record<string, { ageGroup: string; 男性: number; 女性: number; 其他: number }>);

    // Convert to array and sort by age group
    const ageOrder = ['13-17歲', '18-24歲', '25-34歲', '35-44歲', '45-54歲', '55-64歲', '65歲以上'];
    return Object.values(grouped).sort((a, b) => {
      return ageOrder.indexOf(a.ageGroup) - ageOrder.indexOf(b.ageGroup);
    });
  }, [data]);

  if (error) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">觀眾年齡與性別分布</h3>
        <div className="h-80 flex items-center justify-center text-foreground-muted">
          {error}
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">觀眾年齡與性別分布</h3>
        <div className="h-80 bg-bg-elevated animate-pulse rounded-lg" />
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">觀眾年齡與性別分布</h3>
        <div className="h-80 flex items-center justify-center text-foreground-muted">
          暫無數據
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">觀眾年齡與性別分布</h3>
        <p className="text-sm text-foreground-muted">不同年齡層與性別的觀看佔比</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
            <XAxis
              type="number"
              stroke="#5C5F66"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
            />
            <YAxis
              type="category"
              dataKey="ageGroup"
              stroke="#5C5F66"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={55}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0a0a0c',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#EDEDEF',
              }}
              labelStyle={{ color: '#EDEDEF', fontWeight: 600, marginBottom: '8px' }}
              formatter={(value: number | undefined, name: string | undefined) => [
                `${(value || 0).toFixed(1)}%`,
                name || '',
              ]}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="square"
              formatter={(value) => (
                <span className="text-sm text-foreground-muted">{value}</span>
              )}
            />
            <Bar
              dataKey="男性"
              stackId="demographics"
              fill={GENDER_COLORS['男性']}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="女性"
              stackId="demographics"
              fill={GENDER_COLORS['女性']}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="其他"
              stackId="demographics"
              fill={GENDER_COLORS['其他']}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
