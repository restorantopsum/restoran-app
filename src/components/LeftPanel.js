import React from 'react';

function LeftPanel({ table, invoice, selectedItemIndex, onSelectItem, onIncrease, onDecrease, onDelete, readOnly }) {
  const activeItems = invoice.filter(item => !item.deleted);
  const total = activeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="left-panel">
      <div className="left-top">
        <h2>{table ? table.name : 'Masa seçilməyib'}</h2>
      </div>

      <div className="left-middle">
        <div className="receipt">
          <div className="receipt-header">
            <div className="receipt-title">FAKTURA</div>
            {table && <div className="receipt-table">{table.name}</div>}
            <div className="receipt-date">{new Date().toLocaleDateString()}</div>
            <div className="receipt-divider">- - - - - - - - - - - - - - - - -</div>
          </div>

          <div className="receipt-items">
            {invoice.length === 0 ? (
              <p className="empty-invoice">Faktura boşdur</p>
            ) : (
              invoice.map((item, index) => (
                <div
                  key={index}
                  className={`receipt-item ${item.deleted ? 'deleted' : ''} ${selectedItemIndex === index ? 'selected' : ''} ${!item.deleted ? (item.ordered !== false ? 'item-ordered' : 'item-pending') : ''}`}
                  onClick={() => onSelectItem(index)}
                >
                  <span className="receipt-item-qty">{item.quantity}x</span>
                  <span className="receipt-item-name">{item.name}</span>
                  <span className="receipt-item-price">{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>

          <div className="receipt-footer">
            <div className="receipt-divider">- - - - - - - - - - - - - - - - -</div>
            <div className="receipt-total">
              <span>TOTAL</span>
              <span>{total.toFixed(2)} ₼</span>
            </div>
            <div className="receipt-divider">= = = = = = = = = = = = = = = = =</div>
          </div>
        </div>
      </div>

      <div className="left-bottom">
        <button className="btn-action btn-plus" onClick={onIncrease} disabled={readOnly}>+</button>
        <button className="btn-action btn-delete" onClick={onDelete} disabled={readOnly}>✕</button>
        <button className="btn-action btn-minus" onClick={onDecrease} disabled={readOnly}>−</button>
      </div>
    </div>
  );
}

export default LeftPanel;
