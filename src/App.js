import React, { useState, useEffect } from 'react';
import LeftPanel from './components/LeftPanel';
import CenterPanel from './components/CenterPanel';
import RightPanel from './components/RightPanel';
import { initializeData, getData, setData, STORAGE_KEYS } from './utils/storage';
import './App.css';

function App() {
  const [view, setView] = useState('open-tables');
  const [tables, setTables] = useState([]);
  const [menuData, setMenuData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [currentTable, setCurrentTable] = useState(null);
  const [invoice, setInvoice] = useState([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    initializeData();
    setTables(getData(STORAGE_KEYS.TABLES));
    setMenuData(getData(STORAGE_KEYS.MENU));
    setOrders(getData(STORAGE_KEYS.ORDERS) || []);
  }, []);

  const saveTables = (updated) => {
    setTables(updated);
    setData(STORAGE_KEYS.TABLES, updated);
  };

  const saveOrders = (updated) => {
    setOrders(updated);
    setData(STORAGE_KEYS.ORDERS, updated);
  };

  const saveMenu = (updated) => {
    setMenuData(updated);
    setData(STORAGE_KEYS.MENU, updated);
  };

  // Kateqoriya əməliyyatları
  const handleAddCategory = (name) => {
    const maxId = menuData.reduce((max, c) => Math.max(max, c.id), 0);
    saveMenu([...menuData, { id: maxId + 1, name, items: [] }]);
  };

  const handleRenameCategory = (catId, newName) => {
    if (!newName.trim()) return;
    saveMenu(menuData.map(c => c.id === catId ? { ...c, name: newName.trim() } : c));
  };

  const handleDeleteCategory = (catId) => {
    saveMenu(menuData.filter(c => c.id !== catId));
  };

  // Məhsul əməliyyatları
  const handleAddProduct = (catId, name, price) => {
    const cat = menuData.find(c => c.id === catId);
    const maxId = cat.items.reduce((max, i) => Math.max(max, i.id), 0);
    const newItem = { id: maxId + 1, name, price: parseFloat(price) };
    saveMenu(menuData.map(c => c.id === catId ? { ...c, items: [...c.items, newItem] } : c));
  };

  const handleEditProduct = (catId, itemId, name, price) => {
    if (!name.trim()) return;
    saveMenu(menuData.map(c => c.id === catId ? {
      ...c,
      items: c.items.map(i => i.id === itemId ? { ...i, name: name.trim(), price: parseFloat(price) } : i)
    } : c));
  };

  const handleDeleteProduct = (catId, itemId) => {
    saveMenu(menuData.map(c => c.id === catId ? {
      ...c,
      items: c.items.filter(i => i.id !== itemId)
    } : c));
  };

  const handleSelectTable = (table) => {
    setCurrentTable(table);
    setInvoice(table.orders || []);
    setSelectedItemIndex(null);
    if (table.status === 'closed') {
      const updated = tables.map(t =>
        t.id === table.id ? { ...t, status: 'open' } : t
      );
      saveTables(updated);
    }
    setView('menu');
  };

  const handleAddToInvoice = (item) => {
    if (!currentTable) return;

    const existingIndex = invoice.findIndex(i => i.id === item.id && !i.deleted);
    let newInvoice;
    if (existingIndex >= 0) {
      newInvoice = invoice.map((inv, idx) =>
        idx === existingIndex ? { ...inv, quantity: inv.quantity + 1 } : inv
      );
    } else {
      newInvoice = [...invoice, { ...item, quantity: 1, deleted: false }];
    }
    setInvoice(newInvoice);
    updateTableOrders(newInvoice);
  };

  const updateTableOrders = (newInvoice) => {
    if (!currentTable) return;
    const updated = tables.map(t =>
      t.id === currentTable.id ? { ...t, orders: newInvoice } : t
    );
    saveTables(updated);
  };

  const handleIncrease = () => {
    if (selectedItemIndex === null || invoice[selectedItemIndex]?.deleted) return;
    const newInvoice = invoice.map((item, idx) =>
      idx === selectedItemIndex ? { ...item, quantity: item.quantity + 1 } : item
    );
    setInvoice(newInvoice);
    updateTableOrders(newInvoice);
  };

  const handleDecrease = () => {
    if (selectedItemIndex === null || invoice[selectedItemIndex]?.deleted) return;
    const item = invoice[selectedItemIndex];
    let newInvoice;
    if (item.quantity <= 1) {
      newInvoice = invoice.map((inv, idx) =>
        idx === selectedItemIndex ? { ...inv, deleted: true, quantity: 0 } : inv
      );
    } else {
      newInvoice = invoice.map((inv, idx) =>
        idx === selectedItemIndex ? { ...inv, quantity: inv.quantity - 1 } : inv
      );
    }
    setInvoice(newInvoice);
    updateTableOrders(newInvoice);
  };

  const handleDelete = () => {
    if (selectedItemIndex === null || invoice[selectedItemIndex]?.deleted) return;
    const newInvoice = invoice.map((inv, idx) =>
      idx === selectedItemIndex ? { ...inv, deleted: true, quantity: 0 } : inv
    );
    setInvoice(newInvoice);
    updateTableOrders(newInvoice);
    setSelectedItemIndex(null);
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handlePlaceOrder = () => {
    if (!currentTable || invoice.length === 0) return;
    const activeItems = invoice.filter(item => !item.deleted);
    if (activeItems.length === 0) return;
    updateTableOrders(invoice);
    showToast(`✓ ${currentTable.name} — Sifariş göndərildi!`);
  };

  const handleCloseTable = () => {
    if (!currentTable) return;
    const activeItems = invoice.filter(item => !item.deleted);
    if (activeItems.length === 0) return;
    setView('checkout');
  };

  const handleConfirmCheckout = () => {
    if (!currentTable) return;
    const activeItems = invoice.filter(item => !item.deleted);
    const total = activeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deletedCount = invoice.filter(item => item.deleted).length;

    const order = {
      id: Date.now(),
      tableId: currentTable.id,
      tableName: currentTable.name,
      items: [...invoice],
      total,
      deletedCount,
      closedAt: new Date().toISOString(),
    };

    const newOrders = [...orders, order];
    saveOrders(newOrders);

    const updated = tables.map(t =>
      t.id === currentTable.id ? { ...t, status: 'closed', orders: [] } : t
    );
    saveTables(updated);

    showToast(`✓ ${currentTable.name} — Hesab bağlandı! ${total.toFixed(2)} ₼`);
    setCurrentTable(null);
    setInvoice([]);
    setSelectedItemIndex(null);
    setView('open-tables');
  };

  const handleReopenOrder = (order) => {
    const table = tables.find(t => t.id === order.tableId);
    if (!table) return;

    // Sifarişi ordersdən sil
    const newOrders = orders.filter(o => o.id !== order.id);
    saveOrders(newOrders);

    // Masanı açıq et, sifarişi geri yüklə
    const updated = tables.map(t =>
      t.id === order.tableId ? { ...t, status: 'open', orders: order.items } : t
    );
    saveTables(updated);

    setCurrentTable({ ...table, status: 'open', orders: order.items });
    setInvoice(order.items);
    setSelectedItemIndex(null);
    setView('menu');
  };

  const handleAddTable = () => {
    const maxId = tables.reduce((max, t) => Math.max(max, t.id), 0);
    const newTable = {
      id: maxId + 1,
      name: `Masa ${maxId + 1}`,
      status: 'closed',
      orders: [],
    };
    saveTables([...tables, newTable]);
  };

  const handleDeleteTable = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    if (table && table.status === 'open') return;
    saveTables(tables.filter(t => t.id !== tableId));
  };

  const handleRenameTable = (tableId, newName) => {
    if (!newName.trim()) return;
    const updated = tables.map(t =>
      t.id === tableId ? { ...t, name: newName.trim() } : t
    );
    saveTables(updated);
  };

  const handleChangeView = (newView) => {
    setView(newView);
  };

  return (
    <div className="app-container">
      {toast && <div className="toast">{toast}</div>}
      <LeftPanel
        table={currentTable}
        invoice={invoice}
        selectedItemIndex={selectedItemIndex}
        onSelectItem={setSelectedItemIndex}
        onIncrease={handleIncrease}
        onDecrease={handleDecrease}
        onDelete={handleDelete}
      />
      <CenterPanel
        view={view}
        menuData={menuData}
        onAddToInvoice={handleAddToInvoice}
        tables={tables}
        onSelectTable={handleSelectTable}
        currentTable={currentTable}
        orders={orders}
        onReopenOrder={handleReopenOrder}
        onAddTable={handleAddTable}
        onDeleteTable={handleDeleteTable}
        onRenameTable={handleRenameTable}
        onAddCategory={handleAddCategory}
        onRenameCategory={handleRenameCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddProduct={handleAddProduct}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
        invoice={invoice}
        onConfirmCheckout={handleConfirmCheckout}
        onCancelCheckout={() => setView('menu')}
      />
      <RightPanel
        activeView={view}
        onChangeView={handleChangeView}
        onPlaceOrder={handlePlaceOrder}
        onCloseTable={handleCloseTable}
        currentTable={currentTable}
      />
    </div>
  );
}

export default App;
