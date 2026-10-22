import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { totalItems, clearCart } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    clearCart();
    logout();
    navigate('/login');
  };

  const displayName = user?.fullName?.split(' ')[0] || user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <div className='sticky top-0 z-50 glass-panel shadow-sm'>
      <div className='max-w-[1200px] mx-auto flex justify-between items-center h-[80px] px-6'>
        {/* Logo */}
        <div className='flex items-center cursor-pointer' onClick={() => navigate('/')}>
          <h1 className='text-3xl font-extrabold tracking-tighter text-primary-600 drop-shadow-sm'>Zomato</h1>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className='hidden md:flex items-center bg-white shadow-inner rounded-full px-4 py-2 border border-gray-100 w-[400px] transition-all focus-within:shadow-md focus-within:border-primary-100'>
          <svg className="w-5 h-5 text-gray-400 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" /></svg>
          <input
            className="font-medium text-sm w-full outline-none bg-transparent placeholder-gray-400"
            type="text"
            placeholder='Search for cuisine or a dish...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="hidden">Search</button>
        </form>

        {/* Navigation */}
        <div>
          <ul className='flex items-center space-x-6 text-gray-600 font-medium text-[15px]'>
            <li>
              <NavLink to='/' className={({ isActive }) => isActive ? 'text-primary-600 font-bold transition' : 'hover:text-primary-500 transition cursor-pointer'}>Home</NavLink>
            </li>
            
            {isAuthenticated && isAdmin && (
              <li>
                <NavLink to='/admin' className={({ isActive }) => isActive ? 'text-primary-600 font-bold transition flex items-center gap-1.5' : 'hover:text-primary-500 transition cursor-pointer flex items-center gap-1.5'}>
                  <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  Admin <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider ml-1">Admin</span>
                </NavLink>
              </li>
            )}
            
            <li>
              <NavLink to='/our_menu' className={({ isActive }) => isActive ? 'text-primary-600 font-bold transition' : 'hover:text-primary-500 transition cursor-pointer'}>Menu</NavLink>
            </li>
            {isAuthenticated && (
              <li>
                <NavLink to='/history' className={({ isActive }) => isActive ? 'text-primary-600 font-bold transition' : 'hover:text-primary-500 transition cursor-pointer'}>History</NavLink>
              </li>
            )}
            <li className='relative cursor-pointer hover:text-primary-500 transition'>
              <NavLink to='/our_menu' className='flex items-center'>
                <span className='mr-1'>Cart</span>
                {totalItems > 0 && (
                  <span className='bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center absolute -top-3 -right-4 shadow-md'>{totalItems}</span>
                )}
              </NavLink>
            </li>

            {!isAuthenticated ? (
              <>
                <li>
                  <NavLink to='/login' className={({ isActive }) => isActive ? 'text-primary-600 font-bold transition' : 'hover:text-primary-500 transition cursor-pointer'}>Login</NavLink>
                </li>
                <li>
                  <NavLink to='/Sign_Up' className='bg-black text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors shadow-md hover:shadow-lg text-sm'>Sign Up</NavLink>
                </li>
              </>
            ) : (
               <li className="flex items-center gap-4 border-l border-gray-200 pl-6 ml-2">
                  <span className="text-gray-900 font-bold text-sm">Hi, {displayName}</span>
                  <button 
                     onClick={handleLogout} 
                     className='bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors shadow-sm text-sm font-semibold cursor-pointer'
                  >
                     Logout
                  </button>
               </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Navbar