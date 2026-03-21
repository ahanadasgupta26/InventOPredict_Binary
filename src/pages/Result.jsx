import React, { useRef, useEffect, useState } from 'react';
import { ArrowUp, ArrowDown } from "lucide-react";

const Result = ({ data }) => {
  const resultRef = useRef(null);

  // 🔹 NEW: sort state
  const [sortOrder, setSortOrder] = useState(null); // 'asc' | 'desc'
  const toggleSort = () => {
  setSortOrder((prev) => {
    if (prev === "asc") return "desc";
    if (prev === "desc") return null;
    return "asc";
  });
};


  // Scroll into view whenever data changes and has fields
  useEffect(() => {
    if (data && data.fields && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data]);

  if (!data || !data.fields) {
    return (
      <div
        ref={resultRef}
        className="text-center text-gray-500 p-6 border border-dashed border-gray-300 rounded-lg bg-gray-50"
      >
        <p className="text-lg font-semibold">Upload xlsx to get data</p>
      </div>
    );
  }

  // 🔹 NEW: sort logic (ascending / descending)
  const sortedFields = [...data.fields].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.Days_left_to_stockout - b.Days_left_to_stockout;
    }
    if (sortOrder === 'desc') {
      return b.Days_left_to_stockout - a.Days_left_to_stockout;
    }
    return 0; // no sorting
  });

  return (
    <div
      ref={resultRef}
      className="bg-white shadow-lg rounded-xl p-6 border overflow-x-auto"
    >
      <h2 className="text-xl font-bold mb-4 text-center text-blue-700">
        📊 Analysis Result
      </h2>
      <p className="text-gray-700 text-center mb-6">
        {data.summary || 'Predicted stockout details'}
      </p>

      {/* 🔹 SORT OPTION (ONLY ADDITION) */}
      <div className="flex justify-end mb-4">
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border border-gray-400 px-4 py-2 rounded-md text-sm bg-white"
        >
          <option value="">Sort by Days Left</option>
          <option value="asc">Ascending (Low → High)</option>
          <option value="desc">Descending (High → Low)</option>
        </select>
      </div>

      <table className="min-w-full border border-gray-300 rounded-lg shadow-sm">
        <thead className="bg-blue-100">
          <tr>
            <th className="px-4 py-2 border text-sm font-semibold text-left">
              Product ID
            </th>
            <th className="px-4 py-2 border text-sm font-semibold text-left">
              Product Name
            </th>
            <th className="px-4 py-2 border text-sm font-semibold text-left">
              Category
            </th>
            <th
  onClick={toggleSort}
  className="px-4 py-2 border text-sm font-semibold text-left cursor-pointer select-none"
>
  <div className="flex items-center gap-2">
    Days Left to Stockout
    {sortOrder === "asc" && <ArrowUp size={16} />}
    {sortOrder === "desc" && <ArrowDown size={16} />}
  </div>
</th>

            <th className="px-4 py-2 border text-sm font-semibold text-left">
              Predicted Stockout Date
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedFields.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center text-gray-500 py-6">
                No data available
              </td>
            </tr>
          ) : (
            sortedFields.map((row, index) => (
              <tr
                key={index}
                className="bg-white even:bg-gray-50 hover:bg-blue-50 transition"
              >
                <td className="px-4 py-2 border text-sm">
                  {row.Product_id}
                </td>
                <td className="px-4 py-2 border text-sm">
                  {row.Product_name}
                </td>
                <td className="px-4 py-2 border text-sm">
                  {row.Category}
                </td>
                <td className="px-4 py-2 border text-sm text-red-600 font-semibold">
                  {row.Days_left_to_stockout}
                </td>
                <td className="px-4 py-2 border text-sm">
                  {row.Predicted_stockout_date}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Result;
