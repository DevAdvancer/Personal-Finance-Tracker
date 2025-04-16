import { Link, useLocation } from 'react-router-dom';
import { Home, CreditCard, BarChart2, PieChart, Settings, X } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', icon: Home, path: '/' },
    { name: 'Transactions', icon: CreditCard, path: '/transactions' },
    { name: 'Charts', icon: BarChart2, path: '/charts' },
    { name: 'Budget', icon: PieChart, path: '/budget' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-indigo-700 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-indigo-800">
          <div className="flex items-center">
            <span className="text-xl font-bold">FinTrack</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-indigo-200 hover:text-white focus:outline-none lg:hidden"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-2 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.path)
                    ? 'bg-indigo-800 text-white'
                    : 'text-indigo-100 hover:bg-indigo-600'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full">
          <div className="px-6 py-4">
            <div className="bg-indigo-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-white">Need help?</h3>
              <p className="mt-1 text-xs text-indigo-200">
                Check out our documentation or contact support.
              </p>
              <button className="mt-3 w-full px-3 py-2 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
