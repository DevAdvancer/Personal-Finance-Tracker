import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TransactionList from './components/transactions/TransactionList';
import AddTransaction from './components/transactions/AddTransaction';
import EditTransaction from './components/transactions/EditTransaction';
import Charts from './components/Charts';
import Budget from './components/Budget';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/auth/Profile';
import Preferences from './components/auth/Preferences';
import NotFound from './components/NotFound';
import './App.css';

// Private route component
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      {currentUser ? (
        <div className="flex h-screen bg-gray-100">
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Navbar toggleSidebar={toggleSidebar} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
              <div className="container mx-auto px-4 py-2">
                <Routes>
                  <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                  <Route path="/transactions" element={<PrivateRoute><TransactionList /></PrivateRoute>} />
                  <Route path="/transactions/add" element={<PrivateRoute><AddTransaction /></PrivateRoute>} />
                  <Route path="/transactions/edit/:id" element={<PrivateRoute><EditTransaction /></PrivateRoute>} />
                  <Route path="/charts" element={<PrivateRoute><Charts /></PrivateRoute>} />
                  <Route path="/budget" element={<PrivateRoute><Budget /></PrivateRoute>} />
                  <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                  <Route path="/preferences" element={<PrivateRoute><Preferences /></PrivateRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
