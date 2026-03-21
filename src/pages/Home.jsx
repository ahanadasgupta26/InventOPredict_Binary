import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Chart from "../components/Chart";
import Features from "../components/Features";
import { Link } from "react-router-dom";

const words = ["Predict", "Prepare", "Perform"];

const Home = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pt-24 bg-black text-white">

      {/* HERO */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 flex flex-col lg:flex-row items-center gap-16">

          {/* LEFT */}
          <div className="flex-1 space-y-8">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              Built to{" "}
              <span className="text-yellow-400">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={words[index]}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                  >
                    {words[index]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            <p className="text-gray-300 text-xl max-w-xl leading-relaxed">
              Predict stock-outs before they happen. Our ML-powered tool analyzes past data
              to forecast demand and help your business avoid costly inventory gaps.
            </p>

            <Link to="/analysis">
              <button className="px-8 py-4 bg-yellow-400 text-black text-lg font-semibold rounded-xl 
              hover:bg-yellow-300 transition shadow-lg hover:shadow-yellow-400/50">
                 Try Now
              </button>
            </Link>
          </div>

          {/* RIGHT */}
          <div className="flex-1">
            <Chart />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 border-t border-yellow-400/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <Features />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 border-t border-yellow-400/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">

          <h2 className="text-4xl font-extrabold text-yellow-400 text-center mb-16">
             How It Works
          </h2>

          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Upload Box */}
            <div className="bg-zinc-900 border border-yellow-400/20 p-10 rounded-2xl 
                            hover:shadow-[0_0_30px_#facc15] transition">

              <div className="h-56 flex flex-col items-center justify-center border-2 border-dashed border-yellow-400/40 rounded-xl">
                <p className="text-gray-300 text-lg text-center">
                  Drag & Drop Files Here <br /> or
                </p>

                <button className="mt-5 px-6 py-2 bg-yellow-400 text-black rounded-full text-lg font-semibold hover:bg-yellow-300">
                  Browse File
                </button>
              </div>
            </div>

            {/* Text */}
            <div className="text-gray-300 text-xl leading-relaxed">
              Our AI analyzes your inventory data to predict demand trends,
              helping you avoid stock-outs and make smarter decisions effortlessly.
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;