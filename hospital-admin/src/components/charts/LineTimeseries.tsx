import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface LineTimeseriesProps {
  data: Array<Record<string, string | number>>;
  dataKey: string;
  height?: number;
  color?: string;
  showLegend?: boolean;
}

/**
 * LineTimeseries - Time series line chart component
 */
const LineTimeseries = ({
  data,
  dataKey,
  height = 300,
  color = '#607afb',
  showLegend = false,
}: LineTimeseriesProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-20" />
        <XAxis
          dataKey={dataKey}
          tick={{ fill: 'currentColor', fontSize: 12 }}
          className="text-subtle-light dark:text-subtle-dark"
        />
        <YAxis
          tick={{ fill: 'currentColor', fontSize: 12 }}
          className="text-subtle-light dark:text-subtle-dark"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card-light)',
            border: '1px solid var(--border-light)',
            borderRadius: '0.5rem',
          }}
          labelStyle={{ color: 'var(--foreground-light)' }}
        />
        {showLegend && <Legend />}
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineTimeseries;

