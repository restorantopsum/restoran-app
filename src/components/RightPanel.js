import React from 'react';

function RightPanel({ activeView, onChangeView, onPlaceOrder, onCloseTable, currentTable }) {
  const buttons = [
    { id: 'open-tables', label: 'Açıq Masalar' },
    { id: 'closed-tables', label: 'Bağlı Masalar' },
    { id: 'menu', label: 'Menyu' },
    { id: 'report', label: 'Hesabat' },
  ];

  return (
    <div className="right-panel">
      {buttons.map(btn => (
        <button
          key={btn.id}
          className={`nav-btn ${activeView === btn.id ? 'active' : ''}`}
          onClick={() => onChangeView(btn.id)}
        >
          {btn.label}
        </button>
      ))}
      <button
        className="nav-btn btn-order"
        onClick={onPlaceOrder}
        disabled={!currentTable}
      >
        Sifariş Et
      </button>
      <button
        className="nav-btn btn-close-table"
        onClick={onCloseTable}
        disabled={!currentTable}
      >
        Hesab Çıxar
      </button>
    </div>
  );
}

export default RightPanel;
