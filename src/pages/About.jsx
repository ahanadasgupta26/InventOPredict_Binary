import React from "react";

const About = () => {
  return (
    <div className="pt-24 min-h-screen bg-black text-white px-6 py-16 flex justify-center">

      <div className="max-w-5xl w-full space-y-10">

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-yellow-400">
          About Us
        </h1>

        {/* Content Card */}
        <div className="bg-zinc-900 border border-yellow-400/20 rounded-2xl p-10 space-y-8 shadow-lg">

          <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
            Welcome to <span className="text-yellow-400 font-semibold">SmartStock Predictor</span>, 
            your intelligent assistant for anticipating stock depletion. Our platform allows businesses 
            to upload inventory data files (CSV/XLSX), which are analyzed using a trained 
            <span className="text-yellow-400 font-semibold"> machine learning model</span>.
          </p>

          <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
            Once uploaded, our system predicts the estimated 
            <span className="text-yellow-400 font-semibold"> stock-out date</span>, helping you make 
            smarter decisions, optimize inventory, and avoid unexpected shortages.
          </p>

          <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
            Our mission is to empower businesses with simple yet powerful AI tools — 
            no complex setup, just results.
          </p>

          {/* Highlight Box */}
          <div className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 px-6 py-5 rounded-xl">
            <strong>⚠️ Disclaimer:</strong> Predictions are approximate and may vary based on 
            real-world conditions. Always validate critical decisions with your team.
          </div>

          <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
            We are continuously improving our models to deliver better accuracy. 
            Your feedback helps us grow 
          </p>

        </div>

      </div>
    </div>
  );
};

export default About;