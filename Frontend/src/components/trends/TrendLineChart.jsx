import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export default function TrendLineChart({ data, series }) {
  return (
    <div
      className="chart-wrap"
      role="img"
      aria-label={`9-week relative sales index for ${series
        .map((item) => item.name)
        .join(", ")}`}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 16, right: 12, left: -16, bottom: 0 }}
        >
          <CartesianGrid stroke="#eee5e1" vertical={false} />
          <XAxis
            dataKey="period"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8d8087", fontSize: 11 }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8d8087", fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              borderColor: "#eadfda",
              fontSize: 12,
            }}
          />
          {series.map((item) => (
            <Line
              key={item.id}
              type="monotone"
              dataKey={item.id}
              name={item.name}
              stroke={item.color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: item.color }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}








