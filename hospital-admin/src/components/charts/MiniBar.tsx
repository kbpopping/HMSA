import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface MiniBarProps {
  data: Array<{ name: string; value: number }>;
  height?: number;
  color?: string;
}

/**
 * MiniBar - Small bar chart component
 */
const MiniBar = ({ data, height = 200, color = '#607afb' }: MiniBarProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-20" />
        <XAxis
          dataKey="name"
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
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MiniBar;

