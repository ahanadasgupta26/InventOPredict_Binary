import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { ArrowUp, ArrowDown } from "lucide-react";

const AnalysisResult = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const data = state?.fields || [];

  const [downloading, setDownloading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState(null);

  const [showReminderModal, setShowReminderModal] = useState(false);
  const [email, setEmail] = useState("");
  const [savingReminder, setSavingReminder] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="pt-24 text-center text-gray-400 text-lg">
        No analysis found
      </div>
    );
  }

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter(
      (row) =>
        row.product_id?.toString().toLowerCase().includes(q) ||
        row.product_name?.toLowerCase().includes(q) ||
        row.category?.toLowerCase().includes(q)
    );
  }, [search, data]);

  const sortedData = useMemo(() => {
    if (!sortOrder) return filteredData;
    return [...filteredData].sort((a, b) =>
      sortOrder === "asc"
        ? a.days_left - b.days_left
        : b.days_left - a.days_left
    );
  }, [filteredData, sortOrder]);

  const toggleSort = () => {
    setSortOrder((prev) =>
      prev === "asc" ? "desc" : prev === "desc" ? null : "asc"
    );
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      const worksheet = XLSX.utils.json_to_sheet(sortedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Analysis Result");
      XLSX.writeFile(workbook, "analysis-result.xlsx");
      setDownloading(false);
    }, 800);
  };

  const handleCreateReminder = async () => {
    if (!email) return alert("Enter email");

    setSavingReminder(true);

    try {
      await fetch(
        // "https://inventopredict-diversion.onrender.com/create-stockout-reminders",
        "http://127.0.0.1:5000/create-stockout-reminders",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, results: sortedData }),
        }
      );

      setShowReminderModal(false);
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 2500);
    } catch {
      alert("Error");
    } finally {
      setSavingReminder(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-black text-white px-6 py-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">

          <button
            onClick={() => navigate("/analysis")}
            className="px-5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition"
          >
            ← Analyse Again
          </button>

          <h2 className="text-2xl font-semibold tracking-wide">
            Stockout Prediction
          </h2>

          <div className="flex gap-3">
            <button
              onClick={() => setShowReminderModal(true)}
              className="px-5 py-2 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition shadow-md"
            >
              🔔 Remind
            </button>

            <button
              onClick={handleDownload}
              className="px-5 py-2 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition shadow-md"
            >
              {downloading ? "Downloading..." : "Download"}
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-5">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 px-4 py-3 rounded-lg focus:outline-none focus:border-yellow-400"
          />
        </div>

        {/* TABLE */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">

          <div className="max-h-[65vh] overflow-auto">
            <table className="min-w-full text-sm">

              <thead className="bg-zinc-800 sticky top-0">
                <tr className="text-gray-300">
                  <th className="px-4 py-3 text-center">ID</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>

                  <th
                    onClick={toggleSort}
                    className="px-4 py-3 text-center cursor-pointer hover:text-yellow-400"
                  >
                    Days Left
                    {sortOrder === "asc" && <ArrowUp size={14} />}
                    {sortOrder === "desc" && <ArrowDown size={14} />}
                  </th>

                  <th className="px-4 py-3">Stockout</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {sortedData.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-zinc-800 hover:bg-zinc-800/50 transition"
                  >
                    <td className="px-4 py-3 text-center text-gray-400">
                      {row.product_id}
                    </td>

                    <td className="px-4 py-3">{row.product_name}</td>

                    <td className="px-4 py-3 text-gray-400">
                      {row.category}
                    </td>

                    <td className="px-4 py-3 text-center font-bold text-red-400">
                      {row.days_left}
                    </td>

                    <td className="px-4 py-3 text-gray-300">
                      {row.stockout_date}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() =>
                          navigate("/dashboard", { state: row })
                        }
                        className="px-4 py-1.5 rounded-md bg-yellow-400 text-black text-xs font-semibold hover:bg-yellow-300 transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      </div>

      {/* SUCCESS POPUP */}
      {showSuccessPopup && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-zinc-900 border border-yellow-400/30 px-6 py-3 rounded-xl shadow-lg text-yellow-400">
            ✅ Reminder Activated
          </div>
        </div>
      )}

      {/* MODAL */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">

          <div className="bg-zinc-900 border border-yellow-400/20 p-6 rounded-2xl w-96 shadow-xl">

            <h3 className="text-lg font-semibold mb-4 text-yellow-400">
              Set Reminder
            </h3>

            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-zinc-700 px-4 py-2 rounded-lg mb-4 focus:border-yellow-400 outline-none"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReminderModal(false)}
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateReminder}
                className="bg-yellow-400 text-black px-5 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition"
              >
                {savingReminder ? "Saving..." : "Confirm"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResult;