import React, { useState } from 'react';

function CenterPanel({ view, menuData, onAddToInvoice, tables, onSelectTable, orders, onReopenOrder }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [reportTab, setReportTab] = useState('table');
  const [selectedReportTable, setSelectedReportTable] = useState(null);

  if (view === 'menu') {
    if (!selectedCategory) {
      return (
        <div className="center-panel">
          <div className="grid-container">
            {menuData.map(cat => (
              <button
                key={cat.id}
                className="grid-btn category-btn"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="center-panel">
        <button className="back-btn" onClick={() => setSelectedCategory(null)}>
          ← Geri
        </button>
        <div className="grid-container">
          {selectedCategory.items.map(item => (
            <button
              key={item.id}
              className="grid-btn product-btn"
              onClick={() => onAddToInvoice(item)}
            >
              <span className="product-name">{item.name}</span>
              <span className="product-price">{item.price} ₼</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'open-tables') {
    const openTables = tables.filter(t => t.status === 'open');
    return (
      <div className="center-panel">
        <h3>Açıq Masalar</h3>
        <div className="grid-container">
          {openTables.length === 0 ? (
            <p>Açıq masa yoxdur</p>
          ) : (
            openTables.map(t => (
              <button
                key={t.id}
                className="grid-btn table-btn table-open"
                onClick={() => onSelectTable(t)}
              >
                {t.name}
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  if (view === 'closed-tables') {
    const closedTables = tables.filter(t => t.status === 'closed');
    return (
      <div className="center-panel">
        <h3>Bağlı Masalar</h3>
        <div className="grid-container">
          {closedTables.length === 0 ? (
            <p>Bağlı masa yoxdur</p>
          ) : (
            closedTables.map(t => (
              <button
                key={t.id}
                className="grid-btn table-btn table-closed"
                onClick={() => onSelectTable(t)}
              >
                {t.name}
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  if (view === 'report') {
    const allOrders = orders || [];
    const todayStr = new Date().toLocaleDateString();
    const todayOrders = allOrders.filter(o => new Date(o.closedAt).toLocaleDateString() === todayStr);
    const totalRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const totalDeleted = todayOrders.reduce((sum, o) => sum + (o.deletedCount || 0), 0);

    // Masa bazinda hesabat
    const tableReport = {};
    todayOrders.forEach(order => {
      if (!tableReport[order.tableName]) {
        tableReport[order.tableName] = { count: 0, total: 0, deleted: 0 };
      }
      tableReport[order.tableName].count += 1;
      tableReport[order.tableName].total += order.total;
      tableReport[order.tableName].deleted += (order.deletedCount || 0);
    });
    const tableRows = Object.entries(tableReport).sort((a, b) => b[1].total - a[1].total);

    // Mehsul bazinda hesabat
    const productReport = {};
    todayOrders.forEach(order => {
      order.items.forEach(item => {
        if (!item.deleted) {
          if (!productReport[item.name]) {
            productReport[item.name] = { quantity: 0, revenue: 0 };
          }
          productReport[item.name].quantity += item.quantity;
          productReport[item.name].revenue += item.price * item.quantity;
        }
      });
    });
    const productRows = Object.entries(productReport).sort((a, b) => b[1].revenue - a[1].revenue);

    return (
      <div className="center-panel">
        <h3>Hesabat — {todayStr}</h3>
        <div className="report-grid">
          <div className="report-card">
            <div className="report-label">Günlük Satış</div>
            <div className="report-value">{totalRevenue.toFixed(2)} ₼</div>
          </div>
          <div className="report-card">
            <div className="report-label">Bağlanmış Masa</div>
            <div className="report-value">{todayOrders.length}</div>
          </div>
          <div className="report-card">
            <div className="report-label">Silinmiş Məhsul</div>
            <div className="report-value">{totalDeleted}</div>
          </div>
        </div>

        <div className="report-tabs">
          <button
            className={`report-tab ${reportTab === 'table' ? 'active' : ''}`}
            onClick={() => setReportTab('table')}
          >
            Masa Bazında
          </button>
          <button
            className={`report-tab ${reportTab === 'product' ? 'active' : ''}`}
            onClick={() => setReportTab('product')}
          >
            Məhsul Bazında
          </button>
        </div>

        {reportTab === 'table' && !selectedReportTable && (
          <div className="report-table">
            <div className="report-table-header">
              <span>Masa</span>
              <span>Sifariş</span>
              <span>Silinən</span>
              <span>Cəmi</span>
            </div>
            {tableRows.length === 0 ? (
              <p className="report-empty">Məlumat yoxdur</p>
            ) : (
              tableRows.map(([name, data], i) => (
                <div key={i} className="report-table-row clickable" onClick={() => setSelectedReportTable(name)}>
                  <span>{name}</span>
                  <span>{data.count}</span>
                  <span>{data.deleted}</span>
                  <span>{data.total.toFixed(2)} ₼</span>
                </div>
              ))
            )}
            <div className="report-table-footer">
              <span>TOTAL</span>
              <span>{todayOrders.length}</span>
              <span>{totalDeleted}</span>
              <span>{totalRevenue.toFixed(2)} ₼</span>
            </div>
          </div>
        )}

        {reportTab === 'table' && selectedReportTable && (() => {
          const tableTransactions = todayOrders.filter(o => o.tableName === selectedReportTable);
          const tableTotal = tableTransactions.reduce((sum, o) => sum + o.total, 0);
          return (
            <div>
              <button className="back-btn" onClick={() => setSelectedReportTable(null)}>
                ← Geri
              </button>
              <h4 className="report-subtitle">{selectedReportTable} — Tranzaksiyalar</h4>
              {tableTransactions.map((order, oi) => (
                <div key={oi} className="transaction-card">
                  <div className="transaction-header">
                    <span>#{oi + 1}</span>
                    <span>{new Date(order.closedAt).toLocaleTimeString()}</span>
                    <span className="transaction-total">{order.total.toFixed(2)} ₼</span>
                  </div>
                  <div className="transaction-items">
                    {order.items.map((item, ii) => (
                      <div key={ii} className={`transaction-item ${item.deleted ? 'deleted' : ''}`}>
                        <span>{item.quantity}x {item.name}</span>
                        <span>{(item.price * item.quantity).toFixed(2)} ₼</span>
                      </div>
                    ))}
                  </div>
                  <div className="transaction-actions">
                    <button className="btn-reopen" onClick={() => onReopenOrder(order)}>
                      Yenidən Aç
                    </button>
                  </div>
                </div>
              ))}
              <div className="transaction-grand-total">
                Masa Cəmi: {tableTotal.toFixed(2)} ₼
              </div>
            </div>
          );
        })()}

        {reportTab === 'product' && (
          <div className="report-table">
            <div className="report-table-header">
              <span>Məhsul</span>
              <span>Miqdar</span>
              <span>Gəlir</span>
            </div>
            {productRows.length === 0 ? (
              <p className="report-empty">Məlumat yoxdur</p>
            ) : (
              productRows.map(([name, data], i) => (
                <div key={i} className="report-table-row">
                  <span>{name}</span>
                  <span>{data.quantity} ədəd</span>
                  <span>{data.revenue.toFixed(2)} ₼</span>
                </div>
              ))
            )}
            <div className="report-table-footer">
              <span>TOTAL</span>
              <span>{productRows.reduce((s, [, d]) => s + d.quantity, 0)} ədəd</span>
              <span>{totalRevenue.toFixed(2)} ₼</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="center-panel">
      <p>Sağ paneldən əməliyyat seçin</p>
    </div>
  );
}

export default CenterPanel;
