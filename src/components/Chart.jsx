import React from "react";
import { Upload, Brain, CheckCircle } from "lucide-react";

const Chart = () => {
  const steps = [
    {
      title: "Upload Inventory Data",
      desc: "",
      icon: <Upload className="text-yellow-400" />
    },
    {
      title: "AI Analyzes Demand",
      desc: "",
      icon: <Brain className="text-yellow-400" />
    },
    {
      title: "Act Before Losses",
      desc: "",
      icon: <CheckCircle className="text-yellow-400" />
    }
  ];

  return (
    <div className="w-full space-y-10">

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((s, i) => (
          <div
            key={i}
            className="bg-zinc-900 p-8 rounded-2xl shadow-lg text-center
            border border-yellow-400/20
            transform transition duration-300 hover:-translate-y-3 hover:shadow-[0_0_25px_#facc15]"
          >
            <div className="text-5xl mb-5 flex justify-center">{s.icon}</div>
            <h3 className="font-semibold text-xl text-yellow-300">{s.title}</h3>
            <p className="text-base text-gray-400 mt-3">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Sample Output */}
      <div className="bg-zinc-900 border border-yellow-400/20 rounded-2xl p-8 hover:shadow-[0_0_25px_#facc15] transition">
        <h4 className="font-semibold text-yellow-400 text-lg mb-3">
          ⚡ Example AI Insight
        </h4>
        <p className="text-gray-300 text-lg">
          ⚠️ Item “LED Bulb 9W” likely to run out in 
          <span className="text-red-400 font-semibold"> 6 days</span>.
          Suggested reorder date: <b className="text-yellow-400"> 22 Feb</b>.
        </p>
      </div>

    </div>
  );
};

export default Chart;