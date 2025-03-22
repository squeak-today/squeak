import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Auth from './pages/Auth';
import Org from './pages/Org';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <h1>dashboard</h1>
              </ProtectedRoute>
            } />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/:org_id" element={<Auth />} />
            <Route path="/org" element={<Org />} />
            <Route path="/org/:org_id" element={<Org />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;