import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [formData, setFormData] = useState({
    company_name: '',
    company_code: '',
    warehouse_name: '',
    warehouse_location: '',
    warehouse_code: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // const res = await fetch('https://inventopredict-diversion.onrender.com/register', {
        const res = await fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setShowSuccessPopup(true);

        setTimeout(() => {
          setShowSuccessPopup(false);
          navigate('/login');
        }, 1500);
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      alert('Server error');
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-black flex items-center justify-center px-4">

      <div className="w-full max-w-5xl bg-zinc-900 border border-yellow-400/10 rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden">

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex-1 p-8 md:p-12 space-y-5">

          <h2 className="text-2xl font-bold text-white mb-2">
            Create Account
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Start managing your inventory smarter 🚀
          </p>

          {/* Inputs */}
          {[
            { name: "company_name", placeholder: "Company Name" },
            { name: "company_code", placeholder: "Company Code" },
            { name: "warehouse_name", placeholder: "Warehouse Name" },
            { name: "warehouse_location", placeholder: "Warehouse Location" },
            { name: "warehouse_code", placeholder: "Warehouse Code" },
          ].map((field, i) => (
            <input
              key={i}
              type="text"
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-400/10 text-white placeholder-gray-500 
              focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition"
            />
          ))}

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-400/10 text-white placeholder-gray-500 
            focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition"
          />

          {/* Button */}
          <button className="w-full bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-300 transition shadow-md hover:shadow-yellow-400/40">
            Create Account
          </button>

          {/* Link */}
          <p className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-yellow-400 hover:underline">
              Login
            </Link>
          </p>
        </form>

        {/* RIGHT SIDE */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-black to-zinc-900 p-6">
          <img src="/assets/home.png" alt="home" className="max-h-[350px] opacity-90" />
        </div>
      </div>

      {/* SUCCESS POPUP */}
      {showSuccessPopup && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
          <div className="bg-black border border-yellow-400 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 text-yellow-400">
            <span className="text-xl">✅</span>
            <p className="font-semibold">Registration Successful</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;