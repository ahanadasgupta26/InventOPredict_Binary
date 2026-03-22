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

const Dashboard = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const productId = state?.product_id;

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    if (!productId) return;

    fetch(`http://127.0.0.1:5000/product-dashboard/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setDashboardData(data);

        const years = [
          ...new Set(
            data.historical_data.map((d) =>
              new Date(d.date).getFullYear()
            )
          ),
        ];
        setSelectedYear(Math.max(...years));

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  // 📅 GET ALL DATA FROM SELECTED YEAR
  const yearFilteredData = useMemo(() => {
    if (!dashboardData?.historical_data) return [];
    
    // ✅ FILTER BY SELECTED YEAR - GET ALL DATA FROM YEAR BEGINNING
    const yearData = dashboardData.historical_data.filter(item => {
      const itemYear = new Date(item.date).getFullYear();
      return itemYear === selectedYear;
    });
    
    // Sort by date (from Jan 1 onwards)
    const sorted = [...yearData].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    
    console.log("🔍 DEBUG - Year filter:", selectedYear);
    console.log("🔍 DEBUG - Total year data count:", sorted.length);
    console.log("🔍 DEBUG - First date:", sorted[0]?.date);
    console.log("🔍 DEBUG - Last date:", sorted[sorted.length - 1]?.date);
    return sorted;
  }, [dashboardData, selectedYear]);

  // 📊 MOVING AVG + PRODUCT-SPECIFIC GROWTH PREDICTION
  const enrichedDataWithPredictions = useMemo(() => {
    if (!yearFilteredData || yearFilteredData.length === 0) return [];

    // ✅ SORT BY DATE ASCENDING (oldest → newest, Feb 20 → Mar 21)
    const ordered = [...yearFilteredData].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Add moving average to historical data
    const historicalEnriched = ordered.map((item, index, arr) => {
      const slice = arr.slice(Math.max(0, index - 6), index + 1);
      const avg =
        slice.reduce((sum, d) => sum + d.quantity, 0) / slice.length;
      return {
        ...item,
        movingAvg: Number(avg.toFixed(2)),
        isHistorical: true,
      };
    }); // ✅ NO REVERSE: Display in chronological order

    // Compute average daily growth rate using last 14 days of percentage change
    const dailyChanges = [];
    for (let i = 1; i < ordered.length; i++) {
      const prev = ordered[i - 1].quantity;
      const current = ordered[i].quantity;
      if (prev > 0) {
        dailyChanges.push((current - prev) / prev);
      }
    }

    const recentChanges = dailyChanges.slice(-14);
    const avgDailyGrowth =
      recentChanges.length > 0
        ? recentChanges.reduce((acc, v) => acc + v, 0) / recentChanges.length
        : 0;

    // Prevent wild huge jumps
    const cappedGrowth = Math.max(-0.2, Math.min(avgDailyGrowth, 0.2));

    // 🔮 FORECAST FOR NEXT 30 DAYS BASED ON PRODUCT GROWTH
    const lastDate = new Date(ordered[ordered.length - 1].date);
    let nextValue = ordered[ordered.length - 1].quantity;
    const predictions = [];

    for (let i = 1; i <= 30; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setDate(futureDate.getDate() + i);

      nextValue = Math.max(0.1, nextValue * (1 + cappedGrowth));

      predictions.push({
        date: futureDate.toISOString().split("T")[0],
        quantity: null,
        predictedQuantity: Number(nextValue.toFixed(2)),
        movingAvg: null,
        isHistorical: false,
        isPrediction: true,
      });
    }

    return [...historicalEnriched, ...predictions];
  }, [yearFilteredData]);

  const enrichedData = useMemo(() => {
    return enrichedDataWithPredictions.map(item => ({
      ...item,
      // For chart display, show historical quantity or predicted quantity
      displayQuantity: item.isHistorical ? item.quantity : item.predictedQuantity
    }));
  }, [enrichedDataWithPredictions]);

  // 📊 SALES
  const yearSales = useMemo(() => {
    return yearFilteredData.reduce((sum, d) => sum + d.quantity, 0);
  }, [yearFilteredData]);

  const totalSales = useMemo(() => {
    if (!dashboardData?.historical_data) return 0;
    return dashboardData.historical_data.reduce(
      (sum, d) => sum + d.quantity,
      0
    );
  }, [dashboardData]);

  // 🧠 AI INSIGHTS
  const ai = useMemo(() => {
    if (!dashboardData?.historical_data) return {};

    const data = dashboardData.historical_data;
    const last7 = data.slice(-7);
    const prev7 = data.slice(-14, -7);

    const avgLast =
      last7.reduce((s, d) => s + d.quantity, 0) / (last7.length || 1);
    const avgPrev =
      prev7.reduce((s, d) => s + d.quantity, 0) / (prev7.length || 1);

    const growth = (
      ((avgLast - avgPrev) / avgPrev) * 100 || 0
    ).toFixed(1);

    const days = dashboardData.days_left;

    let risk = "Low Risk";
    if (days < 5) risk = "High Risk";
    else if (days < 15) risk = "Medium Risk";

    return { growth, risk };
  }, [dashboardData]);

  // 💸 BUSINESS STRATEGY (WITH NORMAL PRODUCT FIX)
  const business = useMemo(() => {
    if (!dashboardData?.historical_data) return {};

    const data = dashboardData.historical_data;
    const days = dashboardData.days_left;
    const category = dashboardData.category?.toLowerCase() || "";

    const last7 = data.slice(-7);
    const prev7 = data.slice(-14, -7);

    const avgLast =
      last7.reduce((s, d) => s + d.quantity, 0) / (last7.length || 1);
    const avgPrev =
      prev7.reduce((s, d) => s + d.quantity, 0) / (prev7.length || 1);

    let growth = ((avgLast - avgPrev) / (avgPrev || 1)) * 100;

    const totalSales = data.reduce((s, d) => s + d.quantity, 0);
    const avgSales = totalSales / (data.length || 1);

    let pressure = avgSales < 5 ? 1.4 : avgSales < 10 ? 1.2 : 1;

    let categoryWeight = 1;
    if (category.includes("fashion")) categoryWeight = 1.3;
    else if (category.includes("electronics")) categoryWeight = 1.1;
    else if (category.includes("grocery")) categoryWeight = 1.5;

    const randomFactor =
      ((dashboardData.product_id % 13) + 5) / 10;

    let baseDiscount = 0;
    if (days < 5) baseDiscount = 40;
    else if (days < 15) baseDiscount = 25;
    else if (days < 30) baseDiscount = 12;
    else baseDiscount = 5;

    let discount =
      baseDiscount *
      categoryWeight *
      pressure *
      randomFactor *
      (growth < 0 ? 1.2 : 0.85);

    // ✅ NORMAL PRODUCT CONDITION (NEW FIX)
    const isNormal =
      days > 30 && growth >= 0 && avgSales >= 8;

    let label = "";
    let strategy = "";

    if (isNormal) {
      discount = 5 + (dashboardData.product_id % 5); // 5–9%
      label = "✅ Stable Pricing";
      strategy = "Product performing well. Keep low discount to maximize profit.";
    } else {
      discount = Math.min(75, Math.max(5, discount));

      if (discount > 40) {
        label = "🔥 Clearance Sale";
        strategy = "Immediate liquidation needed.";
      } else if (discount > 25) {
        label = "⚡ Limited Offer";
        strategy = "Boost conversions.";
      } else if (discount > 12) {
        label = "🏷️ Smart Deal";
        strategy = "Balanced pricing.";
      } else {
        label = "✅ Stable Pricing";
        strategy = "Maximize profit.";
      }
    }

    return {
      discount: Math.round(discount),
      label,
      strategy,
    };
  }, [dashboardData]);

  const predictedStockout =
    dashboardData?.predicted_stockout_date || "-";
  const daysLeft = dashboardData?.days_left || 0;

  // 🔄 LOADER
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-yellow-400/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 blur-2xl bg-yellow-400/20 rounded-full"></div>
        </div>

        <div className="text-center">
          <p className="text-yellow-400 text-lg font-semibold animate-pulse">
            Generating AI Insights...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Analyzing demand • Predicting stockout • Optimizing pricing
          </p>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="bg-black min-h-screen pt-24 px-6 md:px-12 text-gray-200">

      {/* HERO */}
      <div className="max-w-7xl mx-auto mb-10">
        <h1 className="text-3xl font-bold">
          {dashboardData.product_name}
        </h1>
        <p className="text-gray-400">
          Category:{" "}
          <span className="text-yellow-400">
            {dashboardData.category}
          </span>
        </p>
      </div>

      {/* AI INSIGHT */}
      <div className="max-w-7xl mx-auto mb-6 bg-zinc-900 border border-yellow-400/20 rounded-xl p-6">
        <h3 className="text-yellow-400 mb-2">🧠 AI Insight</h3>
        <p>⚠️ {ai.risk} — stock ends in {daysLeft} days</p>
        <p>📈 Growth: {ai.growth}%</p>
        <p>📅 Stockout: {predictedStockout}</p>
      </div>

      {/* 💸 BUSINESS STRATEGY */}
      <div className="max-w-7xl mx-auto mb-8 bg-zinc-900 border border-green-400/20 rounded-xl p-6">
        <h3 className="text-green-400 mb-3">💸 Business Strategy</h3>

        <p>
          🏷️ Offer:{" "}
          <span className="text-yellow-400 font-semibold">
            {business.label}
          </span>
        </p>

        <p>
          💸 Suggested Discount:{" "}
          <span className="text-green-400 font-bold">
            {business.discount}%
          </span>
        </p>

        <p className="text-gray-400 mt-2">
          📊 {business.strategy}
        </p>
      </div>

      {/* SALES */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 gap-6 mb-10">
        <Stat title="Year Sales" value={yearSales} />
        <Stat title="Total Sales" value={totalSales} />
      </div>

      {/* YEAR NAV */}
      <div className="max-w-7xl mx-auto flex justify-end gap-3 mb-4">
        <button onClick={() => setSelectedYear(p => p - 1)} className="px-4 py-2 bg-zinc-800 rounded">←</button>
        <span className="px-4 py-2 text-yellow-400">{selectedYear}</span>
        <button onClick={() => setSelectedYear(p => p + 1)} className="px-4 py-2 bg-zinc-800 rounded">→</button>
      </div>

      {/* TWO GRAPHS SIDE BY SIDE */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* LEFT: HISTORICAL ANALYSIS - CURRENT YEAR */}
        <div className="bg-zinc-900 p-6 rounded-xl">
          <h3 className="text-yellow-400 font-bold mb-4"> {selectedYear}- Previous Sales Analysis</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={enrichedData.filter(d => d.isHistorical)}>
              <CartesianGrid stroke="#333" />
              <XAxis dataKey="date" stroke="#aaa" angle={-45} height={80} />
              <YAxis stroke="#aaa" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #facc15'
                }}
                formatter={(value, name) => {
                  if (name === 'quantity') return [value, '📊 Sales'];
                  if (name === 'movingAvg') return [value, '📈 Trend'];
                  return value;
                }}
              />

              {/* Historical Data */}
              <Line 
                dataKey="quantity" 
                stroke="#facc15" 
                strokeWidth={3} 
                dot={false}
                name="Daily Sales"
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="mt-4 flex gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-1 w-4 bg-yellow-400"></div>
              <span>Daily Sales</span>
            </div>
          </div>
        </div>

        {/* RIGHT: NEXT 30 DAYS FORECAST (PURELY PREDICTIONS) */}
        <div className="bg-zinc-900 p-6 rounded-xl">
          <h3 className="text-blue-400 font-bold mb-4"> Coming 30 Days Trend Analysis</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={enrichedData.filter(d => d.isPrediction)} margin={{ top: 10, right: 20, bottom: 45, left: 20 }}>
              <CartesianGrid stroke="#333" />
              <XAxis
                dataKey="date"
                tick={false}
                axisLine={true}
                tickLine={false}
                label={{ value: 'Date', position: 'bottom', offset: 15, fill: '#aaa' }}
              />
              <YAxis
                tick={false}
                axisLine={true}
                tickLine={false}
                label={{ value: 'Forecasted Sales', angle: -90, position: 'insideLeft', fill: '#aaa', dx: -10 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #3b82f6'
                }}
                formatter={(value, name) => {
                  if (name === 'predictedQuantity') return [value, '🔮 Predicted'];
                  return value;
                }}
              />

              {/* Predictions ONLY */}
              <Line 
                dataKey="predictedQuantity" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={false}
                name="AI Forecast"
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="mt-4 flex gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-1 w-4 bg-blue-500"></div>
              <span>30-Day AI Forecast</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const Stat = ({ title, value }) => (
  <div className="bg-zinc-900 p-6 rounded-xl">
    <p className="text-gray-400">{title}</p>
    <h2 className="text-2xl text-white">{value}</h2>
  </div>
);

export default Dashboard;