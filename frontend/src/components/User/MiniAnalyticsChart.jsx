import React from 'react';
import { LineChart, Line, ResponsiveContainer } from "recharts";

const MiniAnalyticsChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  
  return (
    <div className="h-16 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="views"
            stroke="#10B981"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MiniAnalyticsChart;
