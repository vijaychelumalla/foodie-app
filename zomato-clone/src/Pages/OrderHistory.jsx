import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OrderHistory = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyOrders = async () => {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: '/history' } });
        return;
      }

      try {
        const { data } = await apiClient.get('/api/orders/myorders');
        setOrders(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching orders');
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [navigate, isAuthenticated]);

  return (
    <div className="bg-[#fafafa] min-h-screen py-10 animate-fade-in-up">
      <div className="max-w-[1000px] mx-auto px-6">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-10">Order History</h1>

        {loading ? (
          <div className="text-center text-gray-500 py-10 font-bold">Loading your orders...</div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium text-sm text-center">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Orders Yet!</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't placed any orders.</p>
            <button 
              onClick={() => navigate('/our_menu')}
              className="bg-primary-600 text-white px-8 py-3 rounded-full font-bold hover:bg-primary-700 transition shadow-md hover:shadow-lg"
            >
              Start Ordering
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-4 mb-4 gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 tracking-wider uppercase mb-1">
                      Order ID <span className="font-mono text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md text-xs">{order._id.substring(order._id.length - 8)}</span>
                    </h3>
                    <p className="text-gray-400 text-sm">Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border ${
                      order.orderStatus === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' : 
                      order.orderStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {order.orderStatus}
                    </span>
                    <span className="text-xl font-black text-gray-900">₹{order.totalAmount}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      {item.img && (
                        <div className="w-12 h-12 rounded-lg bg-gray-50 flex-shrink-0 border border-gray-100 overflow-hidden relative">
                           <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                         <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                         <p className="text-gray-500 text-xs">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                      <div className="font-bold text-gray-800 text-sm">
                         ₹{item.quantity * item.price}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col md:flex-row justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-bold text-gray-800 uppercase tracking-wider text-xs block mb-1">Delivering To</span>
                    {order.deliveryInfo.fullName} • {order.deliveryInfo.phone} <br/>
                    {order.deliveryInfo.address}, {order.deliveryInfo.city} - {order.deliveryInfo.pinCode}
                  </div>
                  <div className="text-sm text-gray-600 flex flex-col justify-center">
                    <span className="font-bold text-gray-800 uppercase tracking-wider text-xs block mb-1">Payment Method</span>
                    {order.paymentMethod}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
