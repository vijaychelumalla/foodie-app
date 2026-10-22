import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import BurgerImage from "../Image/zomato3.avif";
import apiClient from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to destination
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

    if (!formData.email.trim() || !formData.password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post("/api/auth/login", {
        email: formData.email.trim(),
        password: formData.password
      });

      // Update reactive AuthContext and localStorage
      login(response.data);
      
      // Navigate to destination or homepage
      const from = location.state?.from || "/";
      navigate(from, { replace: true });
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
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-6 animate-fade-in-up">
      <div className="w-full max-w-[1000px] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Form Section */}
        <div className="w-full md:w-1/2 p-10 lg:p-16 flex flex-col justify-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-gray-500 mb-6 font-medium">Please enter your details to sign in.</p>

           {error && (
            <div className="bg-red-50 text-red-600 p-3.5 rounded-xl mb-4 text-sm font-semibold border border-red-100 flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email" 
                name="email" 
                required
                autoComplete="email"
                value={formData.email} 
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password" 
                name="password" 
                required
                autoComplete="current-password"
                value={formData.password} 
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50 text-sm"
              />
            </div>

            <div className="flex items-center justify-between text-sm font-medium">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900 transition">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 accent-primary-600" />
                Remember me
              </label>
              <span className="text-primary-600 hover:text-primary-700 transition cursor-pointer text-xs">
                Forgot password?
              </span>
            </div>

            <button
              type="submit" 
              disabled={loading}
              className={`w-full py-3.5 px-4 text-white rounded-xl font-bold transition-all duration-300 mt-2 flex items-center justify-center cursor-pointer ${loading ? 'bg-primary-500 opacity-70 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 hover:shadow-lg'}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Signing In...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8 font-medium">
            Don’t have an account?{" "}
            <NavLink to="/Sign_Up" state={{ from: location.state?.from }} className="text-primary-600 hover:text-primary-700 font-bold transition">
              Sign up
            </NavLink>
          </p>
        </div>

        {/* Image Section */}
        <div className="hidden md:block w-1/2 relative bg-gray-900">
           <img className="absolute inset-0 w-full h-full object-cover opacity-80" src={BurgerImage} alt="Delicious Burger" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
           <div className="absolute bottom-12 left-12 right-12 text-white">
              <h2 className="text-4xl font-black mb-3">Craving Something Delicious?</h2>
              <p className="text-gray-300 font-medium text-lg text-balance">Join millions of food lovers and get the best meals delivered to your doorstep.</p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
