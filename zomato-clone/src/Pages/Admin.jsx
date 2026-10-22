import React, { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

const Admin = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      setError("403 FORBIDDEN: You do not have active Administrator privileges to view this area.");
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await apiClient.get("/api/auth/users");
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to fetch users from server.");
        setLoading(false);
      }
    };
    fetchUsers();
  }, [isAuthenticated, isAdmin]);

  return (
    <div className="bg-[#fafafa] min-h-screen p-8 animate-fade-in-up">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Header Widget */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              Registered Users
            </h1>
            <p className="text-gray-500 mt-2 text-lg font-medium">Administrator Dashboard Control Panel</p>
          </div>
          
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
             <div className="text-right">
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Active</p>
                <p className="text-2xl font-black text-gray-900 leading-none">{users.length}</p>
             </div>
             <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
             </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-32">
                <svg className="animate-spin h-10 w-10 text-primary-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="text-gray-500 font-medium">Synchronizing with secure database...</p>
             </div>
          ) : error ? (
            <div className="py-20 text-center">
              <div className="bg-red-50 text-red-600 p-6 rounded-2xl inline-block max-w-lg border border-red-100">
                <h3 className="text-lg font-bold mb-1">Connection Error</h3>
                <p>{error}</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="py-32 text-center text-gray-500">
               <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
               <h3 className="text-xl font-bold text-gray-800">No users found.</h3>
               <p>Your database is currently completely empty.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider font-bold">
                    <th className="py-5 px-6">Account Profile</th>
                    <th className="py-5 px-6">Email Address</th>
                    <th className="py-5 px-6">Phone Number</th>
                    <th className="py-5 px-6">Join Date</th>
                    <th className="py-5 px-6 text-right">Database ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-500 to-orange-400 text-white flex items-center justify-center font-black text-lg shadow-sm">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-base">{user.fullName}</p>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-green-100 text-green-700 uppercase tracking-wide">Active</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600 font-medium">
                        {user.email}
                      </td>
                      <td className="py-4 px-6 text-gray-600 font-medium">
                        {user.phone}
                      </td>
                      <td className="py-4 px-6 text-gray-500 text-sm">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <code className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          {user._id.slice(-6)}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
