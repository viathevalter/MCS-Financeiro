import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { TitleDetail } from './pages/TitleDetail';
import { Analises } from './pages/Analises';
import { Titulos } from './pages/Titulos';

// Placeholders
const Cobranca = () => <div className="text-2xl font-bold text-gray-400 p-10 text-center">Cobrança Pro (Em breve)</div>;

const App = () => {
  return (
    <DataProvider>
      <HashRouter>
        <Layout>
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analises" element={<Analises />} />
                <Route path="/titulos" element={<Titulos />} />
                <Route path="/titulos/:id" element={<TitleDetail />} />
                <Route path="/cobranca" element={<Cobranca />} />
            </Routes>
        </Layout>
      </HashRouter>
    </DataProvider>
  );
};

export default App;
