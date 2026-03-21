import React, { useState } from "react";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        // "https://inventopredict-diversion.onrender.com/Contact",
        "http://127.0.0.1:5000/Contact",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const result = await response.json();
      alert(result.message);
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      alert("Error sending message!");
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-black text-white flex justify-center px-6 py-16">

      <div className="w-full max-w-3xl space-y-10">

        {/* Heading */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-yellow-400">
            Get in Touch
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            We'd love to hear from you — whether it's a question, suggestion, or feedback.
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-yellow-400/20 p-10 rounded-2xl space-y-6 
          shadow-lg hover:shadow-[0_0_25px_#facc15] transition"
        >

          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Your Name *"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full px-5 py-4 bg-black border border-yellow-400/20 rounded-lg 
            text-white placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email *"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full px-5 py-4 bg-black border border-yellow-400/20 rounded-lg 
            text-white placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
          />

          {/* Message */}
          <textarea
            name="message"
            rows="5"
            placeholder="Your Message *"
            required
            value={form.message}
            onChange={handleChange}
            className="w-full px-5 py-4 bg-black border border-yellow-400/20 rounded-lg 
            text-white placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
          ></textarea>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-yellow-400 text-black py-4 rounded-xl text-lg font-semibold 
            hover:bg-yellow-300 transition shadow-lg hover:shadow-yellow-400/50"
          >
            🚀 Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;