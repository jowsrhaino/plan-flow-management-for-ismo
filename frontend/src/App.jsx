import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Chatbot from './pages/Chatbot';
import Team from './pages/Team';
import Integrations from './pages/Integrations';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Routes>
            {/* Public Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Pages (Navbar உடன் இணைந்தது) */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/tasks" element={<Tasks />} />
                      <Route path="/chatbot" element={<Chatbot />} />
                      <Route path="/team" element={<Team />} />
                      <Route path="/integrations" element={<Integrations />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
