import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [formData, setFormData] = useState({
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
      // const res = await fetch('https://inventopredict-diversion.onrender.com/login', {
      const res = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user);

        setShowSuccessPopup(true);
        
        setTimeout(() => {
          setShowSuccessPopup(false);
          navigate('/');
        }, 1500);
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      alert('Server error');
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-black flex items-center justify-center px-4">

      <div className="w-full max-w-5xl bg-zinc-900 border border-yellow-400/10 shadow-xl rounded-2xl flex flex-col md:flex-row overflow-hidden">

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 p-8 md:p-12 space-y-6 text-gray-200">

          <h2 className="text-3xl font-bold text-white">
            Welcome Back
          </h2>

          <p className="text-gray-400 text-sm">
            Login to access your dashboard
          </p>

          {/* Inputs */}
          <input
            type="text"
            name="warehouse_code"
            placeholder="Warehouse Code"
            value={formData.warehouse_code}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-black border border-yellow-400/20 focus:border-yellow-400 outline-none transition"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-black border border-yellow-400/20 focus:border-yellow-400 outline-none transition"
            required
          />

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-300 transition shadow-md hover:shadow-[0_0_10px_#facc15]"
          >
            Login Now
          </button>

          {/* Link */}
          <p className="text-center text-sm text-gray-400">
            Don’t have an account?{' '}
            <Link to="/register" className="text-yellow-400 hover:underline">
              Sign up
            </Link>
          </p>
        </form>

        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-zinc-900 border border-yellow-400/20 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fadeIn">
              <span className="text-yellow-400 text-xl">✔</span>
              <p className="text-white font-semibold">Login Successful</p>
            </div>
          </div>
        )}

        {/* Right Illustration */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-black relative">
          
          {/* Glow Background */}
          <div className="absolute w-72 h-72 bg-yellow-400/10 blur-3xl rounded-full"></div>

          <img
            src="/assets/home.png"
            alt="home"
            className="relative z-10 max-h-[300px]"
          />
        </div>

      </div>
    </div>
  );
};

export default Login;