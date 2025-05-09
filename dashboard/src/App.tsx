import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { DashboardProvider } from './context/DashboardContext';
import ProtectedRoute from './components/ProtectedRoute';
import Auth from './pages/Auth';
import Org from './pages/Org';
import Home from './pages/Home';
import Moderate from './pages/Moderate';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    // <div className="bg-background h-screen w-screen">
    <AuthProvider>
      <NotificationProvider>
        <DashboardProvider>
          <Router>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/:org_id" element={<Auth />} />
              <Route path="/org" element={<Org />} />
              <Route path="/org/:org_id" element={<Org />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="/moderate" element={
                <ProtectedRoute>
                  <Moderate />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
        </DashboardProvider>
      </NotificationProvider>
    </AuthProvider>
    // </div>
  );
}

export default App;