import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { allMenuItems } from '../data/menuData';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { cartItems, addToCart, updateQuantity, removeFromCart, totalPrice } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to place your order!");
      navigate("/login", { state: { from: "/search?q=" + query } });
    } else {
      navigate("/checkout");
    }
  };

  // Filter items matching the query (checks name and description)
  const filteredItems = query 
    ? allMenuItems.filter((item) => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.desc.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="bg-[#fafafa] min-h-screen relative animate-fade-in-up">
      <div className={`max-w-[1200px] mx-auto py-12 px-6 transition-all duration-300 ${cartItems.length > 0 ? 'pr-[380px]' : ''}`}>
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Search Results</h1>
          <p className="text-gray-500 mt-2 text-lg">
            {query ? `Showing results for "${query}"` : 'Please enter a search term'}
          </p>
        </div>

        {/* Results Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 group flex flex-col"
              >
                <div className="h-56 overflow-hidden relative border-b border-gray-100">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                    ₹{item.price}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                  <p className="text-gray-500 text-sm mt-1 mb-4 line-clamp-2">{item.desc}</p>
                  <div className="mt-auto">
                    <button
                      onClick={() => addToCart(item)}
                      className="w-full bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <svg className="w-20 h-20 text-gray-300 mb-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No results found</h2>
            <p className="text-gray-500 text-center max-w-md">We couldn't find anything matching your search. Try looking for "Burger", "Pizza", or "Chicken".</p>
          </div>
        )}
      </div>

      {/* Floating Cart Sidebar */}
      {cartItems.length > 0 && (
        <div className="fixed top-[80px] right-0 h-[calc(100vh-80px)] w-[360px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.05)] border-l border-gray-100 p-6 flex flex-col z-40 animate-fade-in-up">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-primary-100 text-primary-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">{cartItems.length}</span>
            Your Order
          </h2>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {cartItems.map((item, i) => (
              <div key={i} className="flex gap-4 items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                <img src={item.img} alt={item.name} className="w-16 h-16 rounded-lg object-cover shadow-sm" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-800 line-clamp-1">{item.name}</h4>
                  <p className="text-primary-600 font-bold text-sm">₹{item.price}</p>
                </div>
                <div className="flex flex-col items-center bg-white rounded-lg shadow-sm border border-gray-200">
                  <button onClick={() => updateQuantity(item.name, 1)} className="px-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-t-lg transition">+</button>
                  <span className="text-xs font-bold py-1">{item.quantity}</span>
                  <button 
                    onClick={() => {
                       if(item.quantity === 1) removeFromCart(item.name);
                       else updateQuantity(item.name, -1);
                    }} 
                    className="px-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-b-lg transition">-</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between text-gray-500 mb-2">
              <span>Subtotal</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="flex justify-between text-gray-500 mb-4">
              <span>Taxes & Fees</span>
              <span>₹{Math.floor(totalPrice * 0.05)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
              <span>Total</span>
              <span>₹{totalPrice + Math.floor(totalPrice * 0.05)}</span>
            </div>
            <button onClick={handleCheckout} className="w-full bg-black text-white hover:bg-gray-800 font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
