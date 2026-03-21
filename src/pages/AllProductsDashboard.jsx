import { useEffect, useState, useMemo } from "react"; 
import { useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import * as XLSX from "xlsx";

const ITEMS_PER_PAGE = 12;

const AllProductsDashboard = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [downloading, setDownloading] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [email, setEmail] = useState("");
  const [savingReminder, setSavingReminder] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && location.state.data) {
      setProducts(location.state.data);
    }
  }, [location.state]);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();

    return products.filter((p) =>
      p.product_name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q) ||
      p.stock.toString().includes(q) ||
      p.product_id?.toString().includes(q)
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

  // 🔥 FIXED FUNCTION
  const handleCreateReminder = async () => {
    if (!email) return alert("Enter email");

    setSavingReminder(true);

    try {
      // ✅ Convert stock (days) → stockout_date
      const formattedProducts = products.map((p) => {
        const today = new Date();

        const stockoutDate = new Date(today);
        stockoutDate.setDate(today.getDate() + (p.stock || 0));

        return {
          product_name: p.product_name,
          stockout_date: stockoutDate.toISOString().split("T")[0]
        };
      });

      console.log("📤 Sending to backend:", formattedProducts);

      const res = await fetch(
        "http://127.0.0.1:5000/create-stockout-reminders",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            results: formattedProducts
          }),
        }
      );

      const data = await res.json();
      console.log("✅ Backend response:", data);

      setShowReminderModal(false);
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 2500);

    } catch (err) {
      console.error("❌ Error:", err);
      alert("Error");
    } finally {
      setSavingReminder(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 mt-16">

      <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">

        <button
          onClick={() => navigate("/analysis")}
          className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-extrabold text-yellow-400">
          🟡 Product Dashboard
        </h1>

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

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {paginatedData.map((product) => (
          <div
            key={product.product_id}
            onClick={() =>
              navigate("/dashboard", {
                state: { product_id: product.product_id }
              })
            }
            className="bg-zinc-900 border border-yellow-400 p-5 rounded-xl cursor-pointer hover:scale-105 transition"
          >

            <h2 className="text-yellow-300 font-bold">
              {product.product_name}
            </h2>

            <p className="text-gray-400 text-sm">
              {product.category}
            </p>

            <div className="mt-3 flex justify-between">
              <span>Stock:</span>
              <span>{product.stock}</span>
            </div>

            <div className="mt-3">
              <span className={`px-2 py-1 rounded text-xs
                ${product.status === "Understock" ? "bg-red-500 text-white" :
                  product.status === "Overstock" ? "bg-yellow-400 text-black" :
                  "bg-green-500 text-white"}`}>
                {product.status}
              </span>
            </div>

          </div>
        ))}

      </div>

      <div className="flex justify-center mt-10 gap-2">
        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>
          Prev
        </button>

        <span>{currentPage} / {totalPages}</span>

        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>
          Next
        </button>
      </div>

      {showSuccessPopup && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2">
          <div className="bg-zinc-900 px-6 py-3 rounded text-yellow-400">
            ✅ Reminder Activated
          </div>
        </div>
      )}

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