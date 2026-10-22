import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';

const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    pinCode: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Keep form in sync if user loads
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || user.name || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  // If cart is empty, redirect back to menu
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8">Please add items from the menu before checking out.</p>
        <button 
          onClick={() => navigate('/our_menu')}
          className="bg-primary-600 text-white px-8 py-3 rounded-full font-bold hover:bg-primary-700 transition cursor-pointer"
        >
          Go back to Menu
        </button>
      </div>
    );
  }

  const handleChange = (e) => {
    setError(null);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    try {
      const finalTotal = totalPrice + Math.floor(totalPrice * 0.05);

      await apiClient.post('/api/orders', {
        deliveryInfo: formData,
        orderItems: cartItems,
        totalAmount: finalTotal
      });

      setLoading(false);
      clearCart();
      navigate('/history');
    } catch (err) {
      setLoading(false);
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    }
  };

  const finalTotal = totalPrice + Math.floor(totalPrice * 0.05);

  return (
    <div className="bg-[#fafafa] min-h-screen py-10 animate-fade-in-up">
      <div className="max-w-[1000px] mx-auto px-6">
        
        <div className="mb-8 items-center cursor-pointer text-gray-600 hover:text-gray-900 inline-flex font-medium" onClick={() => navigate(-1)}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back
        </div>

        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-10">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Form Section */}
          <div className="flex-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Delivery Information</h2>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium text-sm border border-red-100 flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-800 text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-800 text-sm"
                    placeholder="10-digit number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Address</label>
                <textarea
                  name="address"
                  required
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-800 resize-none text-sm"
                  placeholder="Street, House No, Landmark"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City/Area</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-800 text-sm"
                    placeholder="E.g., Mumbai, Surat, Delhi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pin Code</label>
                  <input
                    type="text"
                    name="pinCode"
                    required
                    value={formData.pinCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-800 text-sm"
                    placeholder="E.g., 395007"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white hover:bg-gray-800 font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:bg-gray-400 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    'Confirm Order (Cash on Delivery)'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:w-[380px] shrink-0 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-fit sticky top-[100px]">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Order Summary</h2>
            
            <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-4 mb-6 custom-scrollbar">
              {cartItems.map((item, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="relative">
                    <img src={item.img} alt={item.name} className="w-14 h-14 rounded-lg object-cover bg-gray-50 border border-gray-100" />
                    <span className="absolute -top-2 -right-2 bg-gray-800 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-white">{item.quantity}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-800 line-clamp-1">{item.name}</h4>
                    <p className="text-gray-500 text-xs">₹{item.price} each</p>
                  </div>
                  <div className="font-bold text-gray-800 text-sm">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto border-t border-gray-100 pt-6">
              <div className="flex justify-between text-gray-500 mb-3 text-sm">
                <span>Subtotal</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between text-gray-500 mb-3 text-sm">
                <span>Taxes & Fees (5%)</span>
                <span>₹{Math.floor(totalPrice * 0.05)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 mt-4 pt-4 border-t border-gray-50">
                <span>To Pay</span>
                <span className="text-primary-600 font-extrabold">₹{finalTotal}</span>
              </div>
            </div>
            
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
