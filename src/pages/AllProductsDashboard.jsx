import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import * as XLSX from "xlsx";

const ITEMS_PER_PAGE = 8;

const AllProductsDashboard = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 🔥 NEW STATES (ONLY ADDITION)
  const [downloading, setDownloading] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [email, setEmail] = useState("");
  const [savingReminder, setSavingReminder] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // ✅ GET REAL DATA FROM BACKEND
  useEffect(() => {
    if (location.state && location.state.data) {
      setProducts(location.state.data);
    }
  }, [location.state]);

  // 🔍 SEARCH (ADDED PRODUCT ID SUPPORT)
  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();

    return products.filter(
      (p) =>
        p.product_name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q) ||
        p.stock.toString().includes(q) ||
        p.product_id.toString().includes(q),
    );
  }, [search, products]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // 🔥 DOWNLOAD (EXCEL)
  const handleDownload = () => {
    setDownloading(true);

    setTimeout(() => {
      const worksheet = XLSX.utils.json_to_sheet(products);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
      XLSX.writeFile(workbook, "products.xlsx");

      setDownloading(false);
    }, 500);
  };

  // 🔔 REMINDER (SAME AS YOUR OTHER PAGE)
  const handleCreateReminder = async () => {
    if (!email) return alert("Enter email");

    setSavingReminder(true);

    try {
      const today = new Date();

      const formattedResults = products.map((p) => {
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + Number(p.stock));

        const formattedDate = futureDate.toISOString().split("T")[0];

        return {
          product_name: p.product_name,
          stockout_date: formattedDate,
        };
      });

      await fetch("https://inventopredict-binary.onrender.com/create-stockout-reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          results: formattedResults,
        }),
      });

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
    <div className="min-h-screen bg-black text-white p-8 mt-16">
      {/* 🔥 HEADER (ONLY ADDITIONS HERE) */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* ✅ BACK BUTTON */}
        <button
          onClick={() => navigate("/analysis")}
          className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-extrabold text-yellow-400">
          🟡 Product Dashboard
        </h1>

        {/* 🔍 SEARCH */}
        <div className="flex items-center bg-zinc-900 border border-yellow-400 px-3 py-2 rounded-lg">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent ml-2 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* 🔥 ACTION BUTTONS */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowReminderModal(true)}
            className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-300"
          >
            🔔 Remind
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-300"
          >
            {downloading ? "Downloading..." : "Download"}
          </button>
        </div>
      </div>

      {/* GRID (UNCHANGED) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedData.map((product) => (
          <div
            key={product.product_id}
            onClick={() =>
              navigate("/dashboard", {
                state: { product_id: product.product_id },
              })
            }
            className="bg-zinc-900 border border-yellow-400 p-5 rounded-xl cursor-pointer hover:scale-105 transition"
          >
            <h2 className="text-yellow-300 font-bold">
              {product.product_name}
            </h2>

            <p className="text-gray-400 text-sm">{product.category}</p>

            <div className="mt-3 flex justify-between">
              <span>Stock Left:</span>
              <span>{product.stock}</span>
            </div>

            <div className="mt-3">
              <span
                className={`px-2 py-1 rounded text-xs
                ${
                  product.status === "Understock"
                    ? "bg-red-500 text-white"
                    : product.status === "Overstock"
                      ? "bg-yellow-400 text-black"
                      : "bg-green-500 text-white"
                }`}
              >
                {product.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION (UNCHANGED) */}
      <div className="flex justify-center items-center mt-10 gap-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          className="px-5 py-2 rounded-lg bg-yellow-400 text-black font-semibold 
               hover:bg-yellow-300 hover:scale-105 active:scale-95 
               transition-all duration-200 shadow-md"
        >
          ← Prev
        </button>

        <span className="px-4 py-2 rounded-md bg-zinc-900 border border-yellow-400 text-yellow-400 font-semibold">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          className="px-5 py-2 rounded-lg bg-yellow-400 text-black font-semibold 
               hover:bg-yellow-300 hover:scale-105 active:scale-95 
               transition-all duration-200 shadow-md"
        >
          Next →
        </button>
      </div>

      {/* SUCCESS POPUP */}
      {showSuccessPopup && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-zinc-900 border border-yellow-400/30 px-6 py-3 rounded-xl shadow-lg text-yellow-400">
            ✅ Reminder Activated
          </div>
        </div>
      )}

      {/* 🔔 MODAL */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
          <div className="bg-zinc-900 p-6 rounded-xl w-96">
            <h3 className="text-yellow-400 mb-4">Set Reminder</h3>

            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mb-4 bg-black border rounded"
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReminderModal(false)}>
                Cancel
              </button>

              <button
                onClick={handleCreateReminder}
                className="bg-yellow-400 px-4 py-2 rounded"
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

export default AllProductsDashboard;
