import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "../utils/format";

function formatPeriodLabel(period) {
  if (!period) return "—";
  const [y, m, d] = String(period).split("-");
  if (d) return `${d}/${m}`;
  if (m) return `${m}/${y}`;
  return period;
}

export default function DashboardChart({ dados }) {
  if (!dados?.length) {
    return (
      <div className="bg-[#ececec] rounded-[32px] md:rounded-[40px] p-8 shadow-lg h-[280px] flex items-center justify-center text-gray-500">
        Sem dados de vendas no período.
      </div>
    );
  }

  const chartData = [...dados]
    .sort((a, b) =>
      String(a.period ?? a.date ?? "").localeCompare(String(b.period ?? b.date ?? ""))
    )
    .map((item) => ({
      label: formatPeriodLabel(item.period ?? item.date ?? item.label),
      total: item.total_revenue ?? item.total ?? item.revenue ?? item.amount ?? 0,
      orders: item.orders_count ?? item.orders ?? 0,
    }));

  return (
    <div className="bg-[#ececec] rounded-[32px] md:rounded-[40px] p-4 md:p-8 shadow-lg h-[320px] md:h-[400px]">
      <h3 className="text-xl font-bold text-gray-600 mb-4">Vendas por período</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
          <Tooltip
            formatter={(value, name) => {
              if (name === "total") return [formatCurrency(value), "Faturamento"];
              return [value, name];
            }}
            labelFormatter={(label) => `Período: ${label}`}
            contentStyle={{ borderRadius: 12 }}
          />
          <Bar dataKey="total" name="total" fill="#9333ea" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
