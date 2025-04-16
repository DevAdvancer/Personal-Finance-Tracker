import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, Bell, User, LogOut, Settings, UserCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const { currentUser, logout, formatCurrency } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuRef]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 focus:outline-none lg:hidden"
            >
              <Menu size={24} />
            </button>
            <div className="ml-4 lg:ml-0">
              <Link to="/" className="text-xl font-bold text-indigo-600">FinTrack</Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search..."
                className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <Search size={18} />
              </div>
            </div>

            <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </button>

            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600 focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                  <User size={16} />
                </div>
                <span className="ml-2 hidden md:block">{currentUser?.name}</span>
              </button>

              {showProfileMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <UserCircle size={16} className="mr-2" />
                    Profile
                  </Link>
                  <Link
                    to="/preferences"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Settings size={16} className="mr-2" />
                    Preferences
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
