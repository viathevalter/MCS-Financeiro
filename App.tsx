import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { TitleDetail } from './pages/TitleDetail';
import { Analises } from './pages/Analises';
import { Titulos } from './pages/Titulos';
import { Settings } from './pages/Settings';
import { UpdatePassword } from './pages/UpdatePassword';

import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Loader2 } from 'lucide-react';

// Placeholders
const Cobranca = () => <div className="text-2xl font-bold text-gray-400 p-10 text-center">Cobrança Pro (Em breve)</div>;

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-brand-dark" size={32} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/analises" element={<Analises />} />
                      <Route path="/titulos" element={<Titulos />} />
                      <Route path="/titulos/:id" element={<TitleDetail />} />
                      <Route path="/cobranca" element={<Cobranca />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/update-password" element={<UpdatePassword />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </HashRouter>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
