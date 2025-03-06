import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingCart, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
        </div>
        <nav className="mt-8">
          <Link
            to="/products"
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
              isActive('/products') ? 'bg-gray-100 border-l-4 border-blue-500' : ''
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Products
          </Link>
          <Link
            to="/customers"
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
              isActive('/customers') ? 'bg-gray-100 border-l-4 border-blue-500' : ''
            }`}
          >
            <Users className="w-5 h-5 mr-3" />
            Customers
          </Link>
          <Link
            to="/orders"
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
              isActive('/orders') ? 'bg-gray-100 border-l-4 border-blue-500' : ''
            }`}
          >
            <ShoppingCart className="w-5 h-5 mr-3" />
            Orders
          </Link>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 w-full"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}