import React from 'react';

// O restante do aplicativo foi temporariamente suspenso.

const App = () => {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center', padding: '2.5rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', maxWidth: '28rem', width: '90%' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>Acesso Suspenso</h1>
        <p style={{ color: '#64748b', lineHeight: '1.5' }}>
          Este aplicativo foi desativado temporariamente ou não está mais disponível para acesso.
        </p>
      </div>
    </div>
  );
};

export default App;
