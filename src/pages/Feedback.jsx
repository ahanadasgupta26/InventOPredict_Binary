import React, { useState } from "react";
import FeedbackSide from "../components/FeedbackSide";

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:5000/Feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      alert(data.message);
      setFormData({ name: "", email: "", phone: "", experience: "" });
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Failed to send feedback");
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-black flex justify-center items-center p-6">
      
      <div className="max-w-6xl w-full bg-zinc-900 border border-yellow-400/20 
                      rounded-xl shadow-md flex flex-col md:flex-row overflow-hidden">

        {/* Form Section */}
        <div className="md:w-1/2 p-8 md:p-10">

          <h2 className="text-3xl font-bold mb-3 text-white">
            Feedback <span className="text-yellow-400">Us</span>
          </h2>

          <p className="text-gray-400 mb-6 text-sm">
            Your feedback helps us grow and serve you better.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>

            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name *"
              className="w-full bg-black border border-yellow-400/20 p-3 rounded 
              text-white placeholder-gray-500
              focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />

            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email *"
              className="w-full bg-black border border-yellow-400/20 p-3 rounded 
              text-white placeholder-gray-500
              focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />

            <input
              required
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone number *"
              className="w-full bg-black border border-yellow-400/20 p-3 rounded 
              text-white placeholder-gray-500
              focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />

            <textarea
              required
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="About your experience *"
              className="w-full bg-black border border-yellow-400/20 p-3 rounded h-32 resize-none 
              text-white placeholder-gray-500
              focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />

            <button
              type="submit"
              className="w-full bg-yellow-400 text-black font-semibold py-3 rounded 
              hover:bg-yellow-300 transition"
            >
              SEND
            </button>
          </form>
        </div>

        {/* Right Section */}
        <div className="md:w-1/2 bg-black border-l border-yellow-400/10 
                        flex justify-center items-center p-4">
          <FeedbackSide />
        </div>

      </div>
    </div>
  );
};

export default Feedback;