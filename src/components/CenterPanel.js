import React, { useState, useEffect } from 'react';

function CenterPanel({ view, menuData, onAddToInvoice, tables, onSelectTable, orders, onReopenOrder, onAddTable, onDeleteTable, onRenameTable, onAddCategory, onRenameCategory, onDeleteCategory, onAddProduct, onEditProduct, onDeleteProduct, currentTable, invoice, onConfirmCheckout, onCancelCheckout }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [reportTab, setReportTab] = useState('table');
  const [selectedReportTable, setSelectedReportTable] = useState(null);
  const [editingTableId, setEditingTableId] = useState(null);
  const [editingTableName, setEditingTableName] = useState('');
  const [settingsCategory, setSettingsCategory] = useState(null);

  // settingsCategory-ni menuData ilə sync et
  useEffect(() => {
    if (settingsCategory) {
      const updated = menuData.find(c => c.id === settingsCategory.id);
      setSettingsCategory(updated || null);
    }
  }, [menuData]);

  // Kateqoriya edit state
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  // Məhsul edit state
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemName, setEditingItemName] = useState('');
  const [editingItemPrice, setEditingItemPrice] = useState('');
  const [addingProduct, setAddingProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');

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
        <h3>Açıq Masalar ({openTables.length})</h3>
        <div className="open-tables-list">
          {openTables.length === 0 ? (
            <p className="settings-placeholder">Açıq masa yoxdur</p>
          ) : (
            openTables.map(t => {
              const items = (t.orders || []).filter(i => !i.deleted);
              const itemCount = items.reduce((s, i) => s + i.quantity, 0);
              const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
              const isSelected = currentTable?.id === t.id;
              const isEven = openTables.indexOf(t) % 2 === 0;
              return (
                <div
                  key={t.id}
                  className={`open-table-row ${isSelected ? 'selected' : ''} ${isEven ? 'row-even' : 'row-odd'}`}
                  onClick={() => onSelectTable(t)}
                >
                  <span className="open-table-name">{t.name}</span>
                  <span className="open-table-waiter">Ofisiant</span>
                  <span className="open-table-info">{itemCount} məhsul</span>
                  <span className="open-table-total">{total.toFixed(2)} ₼</span>
                </div>
              );
            })
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

  if (view === 'checkout') {
    const activeItems = (invoice || []).filter(i => !i.deleted);
    const deletedItems = (invoice || []).filter(i => i.deleted);
    const total = activeItems.reduce((s, i) => s + i.price * i.quantity, 0);

    return (
      <div className="center-panel checkout-view">
        <div className="checkout-receipt">
          <div className="receipt-header">
            <div className="receipt-title">HESAB</div>
            <div className="receipt-table">{currentTable?.name}</div>
            <div className="receipt-date">{new Date().toLocaleString()}</div>
            <div className="receipt-divider">{'─'.repeat(40)}</div>
          </div>

          <div className="receipt-items">
            {activeItems.map((item, i) => (
              <div key={i} className="receipt-line">
                <span className="receipt-item-name">{item.quantity}x {item.name}</span>
                <span className="receipt-item-dots">{'·'.repeat(20)}</span>
                <span className="receipt-item-price">{(item.price * item.quantity).toFixed(2)} ₼</span>
              </div>
            ))}
            {deletedItems.length > 0 && (
              <>
                <div className="receipt-divider-light">{'─'.repeat(40)}</div>
                {deletedItems.map((item, i) => (
                  <div key={i} className="receipt-line deleted">
                    <span className="receipt-item-name">{item.name}</span>
                    <span className="receipt-item-price">SİLİNDİ</span>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="receipt-divider">{'─'.repeat(40)}</div>
          <div className="receipt-total">
            <span>CƏMİ</span>
            <span>{total.toFixed(2)} ₼</span>
          </div>
          <div className="receipt-divider">{'─'.repeat(40)}</div>
        </div>

        <div className="checkout-actions">
          <button className="checkout-btn checkout-confirm" onClick={onConfirmCheckout}>
            Təsdiq Et
          </button>
          <button className="checkout-btn checkout-cancel" onClick={onCancelCheckout}>
            Geri
          </button>
        </div>
      </div>
    );
  }

  if (view === 'settings') {
    return (
      <div className="center-panel">
        <h3>⚙ Ayarlar</h3>

        <div className="settings-section">
          <h4>Masa Ayarları</h4>
          <div className="settings-table-list">
            {tables.map(t => (
              <div key={t.id} className="settings-table-row">
                {editingTableId === t.id ? (
                  <>
                    <input
                      className="settings-table-input"
                      value={editingTableName}
                      onChange={e => setEditingTableName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          onRenameTable(t.id, editingTableName);
                          setEditingTableId(null);
                        }
                        if (e.key === 'Escape') setEditingTableId(null);
                      }}
                      autoFocus
                    />
                    <button
                      className="settings-btn settings-btn-save"
                      onClick={() => {
                        onRenameTable(t.id, editingTableName);
                        setEditingTableId(null);
                      }}
                    >
                      ✓
                    </button>
                    <button
                      className="settings-btn settings-btn-cancel"
                      onClick={() => setEditingTableId(null)}
                    >
                      ✗
                    </button>
                  </>
                ) : (
                  <>
                    <span className="settings-table-name">{t.name}</span>
                    <span className={`settings-table-status ${t.status}`}>
                      {t.status === 'open' ? 'Açıq' : 'Bağlı'}
                    </span>
                    <button
                      className="settings-btn settings-btn-edit"
                      onClick={() => {
                        setEditingTableId(t.id);
                        setEditingTableName(t.name);
                      }}
                    >
                      Dəyiş
                    </button>
                    <button
                      className="settings-btn settings-btn-delete"
                      disabled={t.status === 'open'}
                      onClick={() => onDeleteTable(t.id)}
                    >
                      Sil
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
          <button className="settings-btn settings-btn-add" onClick={onAddTable}>
            + Yeni Masa
          </button>
        </div>

        <div className="settings-section">
          <h4>Menyu Ayarları</h4>
          <div className="settings-menu-layout">
            <div className="settings-menu-categories">
              {menuData.map(cat => (
                <div
                  key={cat.id}
                  className={`settings-category-row ${settingsCategory?.id === cat.id ? 'active' : ''}`}
                  onClick={() => setSettingsCategory(cat)}
                >
                  {editingCatId === cat.id ? (
                    <>
                      <input
                        className="settings-table-input"
                        value={editingCatName}
                        onChange={e => setEditingCatName(e.target.value)}
                        onClick={e => e.stopPropagation()}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            onRenameCategory(cat.id, editingCatName);
                            setEditingCatId(null);
                          }
                          if (e.key === 'Escape') setEditingCatId(null);
                        }}
                        autoFocus
                      />
                      <button className="settings-btn settings-btn-save" onClick={e => { e.stopPropagation(); onRenameCategory(cat.id, editingCatName); setEditingCatId(null); }}>✓</button>
                      <button className="settings-btn settings-btn-cancel" onClick={e => { e.stopPropagation(); setEditingCatId(null); }}>✗</button>
                    </>
                  ) : (
                    <>
                      <span className="settings-category-name">{cat.name}</span>
                      <span className="settings-category-count">{cat.items.length} məhsul</span>
                      <button className="settings-btn settings-btn-edit" onClick={e => { e.stopPropagation(); setEditingCatId(cat.id); setEditingCatName(cat.name); }}>Dəyiş</button>
                      <button className="settings-btn settings-btn-delete" onClick={e => { e.stopPropagation(); onDeleteCategory(cat.id); if (settingsCategory?.id === cat.id) setSettingsCategory(null); }}>Sil</button>
                    </>
                  )}
                </div>
              ))}
              {addingCategory ? (
                <div className="settings-category-row">
                  <input
                    className="settings-table-input"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder="Kateqoriya adı"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newCatName.trim()) {
                        onAddCategory(newCatName.trim());
                        setNewCatName('');
                        setAddingCategory(false);
                      }
                      if (e.key === 'Escape') { setAddingCategory(false); setNewCatName(''); }
                    }}
                    autoFocus
                  />
                  <button className="settings-btn settings-btn-save" onClick={() => { if (newCatName.trim()) { onAddCategory(newCatName.trim()); setNewCatName(''); setAddingCategory(false); } }}>✓</button>
                  <button className="settings-btn settings-btn-cancel" onClick={() => { setAddingCategory(false); setNewCatName(''); }}>✗</button>
                </div>
              ) : (
                <button className="settings-btn settings-btn-add" onClick={() => setAddingCategory(true)}>
                  + Yeni Kateqoriya
                </button>
              )}
            </div>

            <div className="settings-menu-items">
              {settingsCategory ? (
                <>
                  <h5 className="settings-items-title">{settingsCategory.name}</h5>
                  {settingsCategory.items.map(item => (
                    <div key={item.id} className="settings-item-row">
                      {editingItemId === item.id ? (
                        <>
                          <input
                            className="settings-table-input"
                            value={editingItemName}
                            onChange={e => setEditingItemName(e.target.value)}
                            placeholder="Ad"
                            autoFocus
                          />
                          <input
                            className="settings-table-input settings-price-input"
                            type="number"
                            value={editingItemPrice}
                            onChange={e => setEditingItemPrice(e.target.value)}
                            placeholder="Qiymət"
                          />
                          <button className="settings-btn settings-btn-save" onClick={() => {
                            onEditProduct(settingsCategory.id, item.id, editingItemName, editingItemPrice);
                            setSettingsCategory(menuData.find(c => c.id === settingsCategory.id));
                            setEditingItemId(null);
                          }}>✓</button>
                          <button className="settings-btn settings-btn-cancel" onClick={() => setEditingItemId(null)}>✗</button>
                        </>
                      ) : (
                        <>
                          <span className="settings-item-name">{item.name}</span>
                          <span className="settings-item-price">{item.price} ₼</span>
                          <button className="settings-btn settings-btn-edit" onClick={() => { setEditingItemId(item.id); setEditingItemName(item.name); setEditingItemPrice(item.price); }}>Dəyiş</button>
                          <button className="settings-btn settings-btn-delete" onClick={() => {
                            onDeleteProduct(settingsCategory.id, item.id);
                          }}>Sil</button>
                        </>
                      )}
                    </div>
                  ))}
                  {addingProduct ? (
                    <div className="settings-item-row">
                      <input
                        className="settings-table-input"
                        value={newProductName}
                        onChange={e => setNewProductName(e.target.value)}
                        placeholder="Məhsul adı"
                        autoFocus
                      />
                      <input
                        className="settings-table-input settings-price-input"
                        type="number"
                        value={newProductPrice}
                        onChange={e => setNewProductPrice(e.target.value)}
                        placeholder="Qiymət"
                      />
                      <button className="settings-btn settings-btn-save" onClick={() => {
                        if (newProductName.trim() && newProductPrice) {
                          onAddProduct(settingsCategory.id, newProductName.trim(), newProductPrice);
                          setNewProductName('');
                          setNewProductPrice('');
                          setAddingProduct(false);
                        }
                      }}>✓</button>
                      <button className="settings-btn settings-btn-cancel" onClick={() => { setAddingProduct(false); setNewProductName(''); setNewProductPrice(''); }}>✗</button>
                    </div>
                  ) : (
                    <button className="settings-btn settings-btn-add" onClick={() => setAddingProduct(true)}>
                      + Yeni Məhsul
                    </button>
                  )}
                </>
              ) : (
                <p className="settings-placeholder">Kateqoriya seçin</p>
              )}
            </div>
          </div>
        </div>
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
