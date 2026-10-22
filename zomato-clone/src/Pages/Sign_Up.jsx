import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import DessertImage from "../Image/zomato2.avif";
import apiClient from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      return setError("Please complete all required fields.");
    }

    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/api/auth/signup", {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password
      });

      // Update reactive AuthContext and localStorage
      login(response.data);

      // Redirect immediately to the intended page or home
      const destination = location.state?.from || "/";
      navigate(destination, { replace: true });
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === "ECONNABORTED" || err.message?.includes("Network Error")) {
        const isLive = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        if (isLive) {
          setError("The live frontend cannot reach the backend: No live backend API URL (VITE_API_URL) is configured for production, or the cloud server is asleep.");
        } else {
          setError("Backend server is not running on port 5001. Please make sure the backend is started.");
        }
      } else {
        setError("An error occurred during signup. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-6 animate-fade-in-up">
      <div className="w-full max-w-[1000px] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse">
        
        {/* Form Section */}
        <div className="w-full md:w-1/2 p-10 lg:p-14 flex flex-col justify-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Create an Account
          </h2>
          <p className="text-gray-500 mb-6 font-medium">Join Zomato and start ordering your favorites.</p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3.5 rounded-xl mb-4 text-sm font-semibold border border-red-100 flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text" 
                name="fullName" 
                required
                autoComplete="name"
                value={formData.fullName} 
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email" 
                name="email" 
                required
                autoComplete="email"
                value={formData.email} 
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
              <input
                type="tel" 
                name="phone" 
                required
                autoComplete="tel"
                value={formData.phone} 
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <input
                  type="password" 
                  name="password" 
                  required 
                  minLength="6"
                  autoComplete="new-password"
                  value={formData.password} 
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                <input
                  type="password" 
                  name="confirmPassword" 
                  required 
                  minLength="6"
                  autoComplete="new-password"
                  value={formData.confirmPassword} 
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit" 
              disabled={loading}
              className={`w-full py-3.5 px-4 text-white rounded-xl font-bold transition-all duration-300 mt-6 flex items-center justify-center cursor-pointer ${loading ? 'bg-primary-500 opacity-70 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 hover:shadow-lg'}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Creating Account...</span>
                </>
              ) : (
                'Sign Up Now'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6 font-medium">
            Already have an account?{" "}
            <NavLink to="/login" state={{ from: location.state?.from }} className="text-primary-600 hover:text-primary-700 font-bold transition">
              Login here
            </NavLink>
          </p>
        </div>

        {/* Image Section */}
        <div className="hidden md:block w-1/2 relative bg-gray-900 border-r border-gray-100">
           <img className="absolute inset-0 w-full h-full object-cover opacity-85" src={DessertImage} alt="Delicious Pizza" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
           <div className="absolute bottom-12 left-12 right-12 text-white">
              <h2 className="text-4xl font-black mb-3">Your Next Meal Awaits</h2>
              <p className="text-gray-300 font-medium text-lg text-balance">Sign up today and get exclusive discounts on your first 3 orders.</p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default SignUp;
