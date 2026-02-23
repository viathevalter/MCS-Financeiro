import React from 'react';

// O restante do aplicativo foi temporariamente suspenso.

const App = () => {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '72px', fontWeight: 'bold', color: '#111827', margin: '0' }}>404</h1>
        <p style={{ fontSize: '24px', fontWeight: '500', color: '#374151', marginTop: '1rem', marginBottom: '0.5rem' }}>Página não encontrada</p>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          O link que você acessou pode estar quebrado, ou a página pode ter sido removida.
        </p>
      </div>
    </div>
  );
};

export default App;
