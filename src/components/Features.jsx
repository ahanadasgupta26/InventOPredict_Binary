import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const features = [
  {
    title: "Stock-out Date Prediction",
    description: "Predict exactly when inventory will run out.",
  },
  {
    title: "ML-powered Forecasting Engine",
    description: "Forecast future stock using ML models.",
  },
  {
    title: "Interactive Data Visualizations",
    description: "View trends with dynamic charts.",
  },
  {
    title: "Low Stock Alerts",
    description: "Instant alerts when stock is low.",
  },
  {
    title: "Secure Data Handling",
    description: "End-to-end encrypted data security.",
  },
  {
    title: "Downloadable Reports",
    description: "Export reports in multiple formats.",
  },
];

const Features = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 3) % features.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const visibleFeatures = [
    features[index],
    features[(index + 1) % features.length],
    features[(index + 2) % features.length],
  ];

  return (
    <section className="space-y-14">

      <h2 className="text-4xl font-extrabold text-center text-yellow-400">
         Our Features
      </h2>

      <div className="flex justify-center gap-10 flex-wrap">
        <AnimatePresence mode="wait">
          {visibleFeatures.map((feature) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ duration: 0.6 }}
              className="w-[320px] min-h-[220px] bg-zinc-900 p-8 rounded-2xl 
                         border border-yellow-400/20 text-center
                         hover:scale-105 hover:shadow-[0_0_30px_#facc15] transition"
            >
              <h3 className="text-2xl font-semibold text-yellow-300 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-base leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </section>
  );
};

export default Features;