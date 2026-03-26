const STORAGE_KEYS = {
  TABLES: 'restoran_tables',
  MENU: 'restoran_menu',
  ORDERS: 'restoran_orders',
};

export function getData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

export function setData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function initializeData() {
  if (!getData(STORAGE_KEYS.MENU)) {
    const defaultMenu = [
      {
        id: 1,
        name: 'Şorbalar',
        items: [
          { id: 101, name: 'Mercimek Şorbası', price: 45 },
          { id: 102, name: 'Toyuq Şorbası', price: 50 },
          { id: 103, name: 'Ezogelin Şorbası', price: 40 },
        ],
      },
      {
        id: 2,
        name: 'Salatlar',
        items: [
          { id: 201, name: 'Çoban Salatı', price: 35 },
          { id: 202, name: 'Sezar Salatı', price: 55 },
          { id: 203, name: 'Mevsim Salatı', price: 30 },
        ],
      },
      {
        id: 3,
        name: 'Əsas Yeməklər',
        items: [
          { id: 301, name: 'Adana Kebab', price: 120 },
          { id: 302, name: 'İskəndər', price: 110 },
          { id: 303, name: 'Qarışıq Izgara', price: 150 },
          { id: 304, name: 'Toyuq Şiş', price: 90 },
        ],
      },
      {
        id: 4,
        name: 'İçkilər',
        items: [
          { id: 401, name: 'Çay', price: 10 },
          { id: 402, name: 'Kola', price: 25 },
          { id: 403, name: 'Ayran', price: 15 },
          { id: 404, name: 'Su', price: 5 },
        ],
      },
      {
        id: 5,
        name: 'Desertlər',
        items: [
          { id: 501, name: 'Kunefe', price: 70 },
          { id: 502, name: 'Baklava', price: 60 },
          { id: 503, name: 'Sütlaç', price: 45 },
        ],
      },
    ];
    setData(STORAGE_KEYS.MENU, defaultMenu);
  }

  if (!getData(STORAGE_KEYS.TABLES)) {
    const defaultTables = [];
    for (let i = 1; i <= 20; i++) {
      defaultTables.push({
        id: i,
        name: `Masa ${i}`,
        status: 'closed',
        orders: [],
      });
    }
    setData(STORAGE_KEYS.TABLES, defaultTables);
  }

  if (!getData(STORAGE_KEYS.ORDERS)) {
    setData(STORAGE_KEYS.ORDERS, []);
  }
}

export { STORAGE_KEYS };
