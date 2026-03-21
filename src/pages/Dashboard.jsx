import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { AlertTriangle, CalendarDays, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const productId = state?.product_id;

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    if (!productId) return;

    // fetch(`https://inventopredict-diversion.onrender.com/product-dashboard/${productId}`)
       fetch(`http://127.0.0.1:5000/product-dashboard/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setDashboardData(data);

        // auto select latest year
        const years = [...new Set(data.historical_data.map(d => new Date(d.date).getFullYear()))];
        setSelectedYear(Math.max(...years));

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  // 📅 FILTER BY YEAR
  const yearFilteredData = useMemo(() => {
    if (!dashboardData?.historical_data || !selectedYear) return [];

    return dashboardData.historical_data.filter(
      (d) => new Date(d.date).getFullYear() === selectedYear
    );
  }, [dashboardData, selectedYear]);

  // 📊 MOVING AVG
  const enrichedData = useMemo(() => {
    return yearFilteredData.map((item, index, arr) => {
      const slice = arr.slice(Math.max(0, index - 6), index + 1);
      const avg = slice.reduce((sum, d) => sum + d.quantity, 0) / slice.length;
      return { ...item, movingAvg: Number(avg.toFixed(2)) };
    });
  }, [yearFilteredData]);

  // 📊 SALES CALCULATION (FRONTEND)
  const yearSales = useMemo(() => {
    return yearFilteredData.reduce((sum, d) => sum + d.quantity, 0);
  }, [yearFilteredData]);

  const totalSales = useMemo(() => {
    if (!dashboardData?.historical_data) return 0;
    return dashboardData.historical_data.reduce((sum, d) => sum + d.quantity, 0);
  }, [dashboardData]);

  // 🧠 AI INSIGHTS
  const ai = useMemo(() => {
    if (!dashboardData?.historical_data) return {};

    const data = dashboardData.historical_data;
    const last7 = data.slice(-7);
    const prev7 = data.slice(-14, -7);

    const avgLast = last7.reduce((s, d) => s + d.quantity, 0) / (last7.length || 1);
    const avgPrev = prev7.reduce((s, d) => s + d.quantity, 0) / (prev7.length || 1);

    const growth = (((avgLast - avgPrev) / avgPrev) * 100 || 0).toFixed(1);

    const days = dashboardData.days_left;

    let risk = "Low Risk";
    if (days < 5) risk = "High Risk";
    else if (days < 15) risk = "Medium Risk";

    return { growth, risk };
  }, [dashboardData]);

  const predictedStockout = dashboardData?.predicted_stockout_date || "-";
  const daysLeft = dashboardData?.days_left || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-yellow-400/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 blur-2xl bg-yellow-400/20 rounded-full"></div>
        </div>
        <p className="text-yellow-400 animate-pulse">Generating AI Insights...</p>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="bg-black min-h-screen pt-24 px-6 md:px-12 text-gray-200">

      {/* 🔥 HERO */}
      <div className="max-w-7xl mx-auto mb-10">
        <h1 className="text-3xl font-bold">{dashboardData.product_name}</h1>
        <p className="text-gray-400">
          Category: <span className="text-yellow-400">{dashboardData.category}</span>
        </p>
      </div>

      {/* 🧠 AI INSIGHT */}
      <div className="max-w-7xl mx-auto mb-8 bg-zinc-900 border border-yellow-400/20 rounded-xl p-6">
        <h3 className="text-yellow-400 font-semibold mb-3">🧠 AI Insight</h3>

        <p>⚠️ <span className="text-yellow-400">{ai.risk}</span> — stock ends in <b>{daysLeft} days</b></p>
        <p>📈 Demand trend: <span className="text-blue-400">{ai.growth}%</span></p>
        <p>📅 Expected stockout: <span className="text-yellow-400">{predictedStockout}</span></p>
      </div>

      {/* 📊 SALES STATS */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <Stat title="Year Sales" value={yearSales} />
        <Stat title="Total Sales" value={totalSales} />
      </div>

      {/* 📅 YEAR NAV */}
      <div className="max-w-7xl mx-auto flex justify-end gap-3 mb-4">
        <button
          onClick={() => setSelectedYear(prev => prev - 1)}
          className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700"
        >
          ← Prev
        </button>

        <span className="px-4 py-2 text-yellow-400 font-bold">
          {selectedYear}
        </span>

        <button
          onClick={() => setSelectedYear(prev => prev + 1)}
          className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700"
        >
          Next →
        </button>
      </div>

      {/* 📈 CHART */}
      <div className="max-w-7xl mx-auto bg-zinc-900 border border-yellow-400/10 rounded-xl p-6">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={enrichedData}>
            <CartesianGrid stroke="#333" />
            <XAxis dataKey="date" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip />

            <ReferenceLine x={predictedStockout} stroke="#facc15" />

            <Line
              type="monotone"
              dataKey="quantity"
              stroke="#facc15"
              strokeWidth={3}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="movingAvg"
              stroke="#22c55e"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* STAT CARD */
const Stat = ({ title, value }) => (
  <div className="bg-zinc-900 border border-yellow-400/10 rounded-xl p-6">
    <p className="text-gray-400 text-sm">{title}</p>
    <h2 className="text-2xl font-bold text-white">{value}</h2>
  </div>
);

export default Dashboard;