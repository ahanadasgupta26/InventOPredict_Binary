import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

const Analysis = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // 📂 Handle File Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("📁 File selected:", file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      setTableData(XLSX.utils.sheet_to_json(sheet, { header: 1 }));
      setSelectedFile(file);
    };
    reader.readAsArrayBuffer(file);
  };

  // ❌ Remove file
  const removeFile = () => {
    setSelectedFile(null);
    setTableData([]);
    setShowPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 🚀 Analyze File
  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert("Please upload a file first");
      return;
    }

    console.log("🚀 Analyze button clicked");

    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      console.log("📡 Sending request to backend...");

      // const response = await fetch("https://inventopredict-diversion.onrender.com/predict", {
        const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      console.log("📡 Response received:", response);

      const data = await response.json();

      console.log("📦 Backend Response:", data);

      if (response.ok) {
        console.log("✅ Navigation to dashboard");

        navigate("/all-products-dashboard", {
          state: data, // 🔥 sending ML result
        });

      } else {
        alert("Error: " + data.error);
      }

    } catch (err) {
      console.error("❌ API Error:", err);
      alert("Failed to analyze file");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-black text-white flex justify-center px-6">

      <div className="w-full max-w-4xl bg-zinc-900 border border-yellow-400/20 rounded-2xl shadow-xl p-10">

        {/* Title */}
        <h1 className="text-4xl font-extrabold text-center text-yellow-400 mb-10">
           Stockout Analysis
        </h1>

        {/* Upload Area */}
        <div
          className="relative bg-black border-2 border-dashed border-yellow-400/40 rounded-2xl p-12 text-center 
          transition hover:border-yellow-400 hover:shadow-[0_0_25px_#facc15]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) {
              handleFileChange({ target: { files: [file] } });
            }
          }}
        >

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            className="hidden"
            id="fileUpload"
          />

          <p className="text-lg text-gray-300 font-medium mb-2">
            Drag & Drop Files Here
          </p>
          <p className="text-gray-500 mb-5">or</p>

          <label
            htmlFor="fileUpload"
            className="inline-block bg-yellow-400 text-black px-8 py-3 rounded-lg 
            cursor-pointer transition font-semibold text-lg hover:bg-yellow-300 shadow-lg"
          >
            Browse File
          </label>

          <p className="text-sm text-gray-500 mt-4">
            Supported format: .xlsx
          </p>
        </div>

        {/* File Info */}
        {selectedFile && (
          <div className="mt-8 flex items-center justify-between bg-black border border-yellow-400/20 px-5 py-4 rounded-xl">

            <span
              onClick={() => setShowPreview(true)}
              className="text-yellow-400 font-medium cursor-pointer hover:underline text-lg"
            >
              {selectedFile.name}
            </span>

            <button
              onClick={removeFile}
              className="text-red-400 font-bold text-2xl hover:scale-110 transition"
            >
              ✕
            </button>
          </div>
        )}

        {/* Analyze Button */}
        {selectedFile && (
          <div className="mt-10 text-center">
            <button
              onClick={handleAnalyze}
              className="bg-yellow-400 text-black px-12 py-4 rounded-xl text-xl font-semibold 
              hover:bg-yellow-300 transition shadow-lg hover:shadow-yellow-400/50"
            >
               Analyze
            </button>
          </div>
        )}
      </div>

      {/* 🔄 Loader */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
          <div className="w-20 h-20 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-yellow-400 mt-6 text-xl">
            Analyzing your data...
          </p>
        </div>
      )}

      {/* 📊 Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">

          <div className="bg-zinc-900 w-11/12 max-w-5xl rounded-2xl shadow-xl p-6 border border-yellow-400/20">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-yellow-400">
                File Preview
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-red-400 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto border border-yellow-400/20 rounded">
              <table className="min-w-full text-sm">
                <tbody>
                  {tableData.map((row, i) => (
                    <tr key={i} className="border-b border-yellow-400/10">
                      {row.map((cell, j) => (
                        <td key={j} className="px-4 py-2 border-r border-yellow-400/10 text-gray-300">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;