// ====================================================
//  Mock API — localStorage only, no backend needed
// ====================================================

const generateId = () =>
  Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

// ---------- Seed data (loaded once if localStorage is empty) ----------
const seedIfEmpty = () => {
  if (!localStorage.getItem('hotel_users')) {
    localStorage.setItem(
      'hotel_users',
      JSON.stringify([{ email: 'admin@hotel.com', password: 'admin123' }])
    );
  }

  if (!localStorage.getItem('hotel_clients')) {
    localStorage.setItem(
      'hotel_clients',
      JSON.stringify([
        { _id: 'c1', nom: 'Alami',   prenom: 'Mohammed', email: 'mohammed@example.com', telephone: '0612345678' },
        { _id: 'c2', nom: 'Benali',  prenom: 'Fatima',   email: 'fatima@example.com',   telephone: '0698765432' },
        { _id: 'c3', nom: 'Tazi',    prenom: 'Youssef',  email: 'youssef@example.com',  telephone: '0655443322' },
        { _id: 'c4', nom: 'El Amri', prenom: 'Sara',     email: 'sara@example.com',     telephone: '0677112233' },
      ])
    );
  }

  if (!localStorage.getItem('hotel_chambres')) {
    localStorage.setItem(
      'hotel_chambres',
      JSON.stringify([
        { _id: 'ch1', numero: 101, type: 'simple', prix: 50,  disponible: true  },
        { _id: 'ch2', numero: 102, type: 'double', prix: 80,  disponible: true  },
        { _id: 'ch3', numero: 201, type: 'suite',  prix: 150, disponible: false },
        { _id: 'ch4', numero: 202, type: 'double', prix: 90,  disponible: true  },
        { _id: 'ch5', numero: 301, type: 'suite',  prix: 200, disponible: true  },
        { _id: 'ch6', numero: 103, type: 'simple', prix: 55,  disponible: true  },
      ])
    );
  }

  if (!localStorage.getItem('hotel_reservations')) {
    const today = new Date();
    const fmt = (d) => d.toISOString().split('T')[0];
    const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };

    localStorage.setItem(
      'hotel_reservations',
      JSON.stringify([
        { _id: 'r1', clientId: 'c1', chambreId: 'ch3', dateDebut: fmt(addDays(-5)),  dateFin: fmt(addDays(2))  },
        { _id: 'r2', clientId: 'c2', chambreId: 'ch2', dateDebut: fmt(addDays(3)),   dateFin: fmt(addDays(7))  },
        { _id: 'r3', clientId: 'c3', chambreId: 'ch5', dateDebut: fmt(addDays(-10)), dateFin: fmt(addDays(-3)) },
      ])
    );
  }
};

seedIfEmpty();

// ---------- Helpers ----------
const delay = () => new Promise((r) => setTimeout(r, 250));

const KEY = {
  '/clients':      'hotel_clients',
  '/chambres':     'hotel_chambres',
  '/reservations': 'hotel_reservations',
};

const getKey = (url) => {
  for (const [route, key] of Object.entries(KEY)) {
    if (url.startsWith(route)) return key;
  }
  return null;
};

const getCollection = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const setCollection = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const makeError = (message) => {
  const err = new Error(message);
  err.response = { data: { message } };
  return err;
};

// ---------- Mock API object (same interface as axios) ----------
const api = {

  // GET /clients  |  GET /chambres  |  GET /reservations
  get: async (url) => {
    await delay();
    const key = getKey(url);
    if (!key) throw makeError('Route not found: ' + url);
    return { data: getCollection(key) };
  },

  // POST /auth/login  |  POST /clients  |  etc.
  post: async (url, data) => {
    await delay();

    // ── Auth ──
    if (url === '/auth/login') {
      const users = getCollection('hotel_users');
      const user = users.find(
        (u) => u.email.toLowerCase() === data.email.toLowerCase() && u.password === data.password
      );
      if (user) {
        return { data: { token: 'mock-token-' + Date.now() } };
      }
      throw makeError('Email ou mot de passe incorrect');
    }

    // ── Other collections ──
    const key = getKey(url);
    if (!key) throw makeError('Route not found: ' + url);
    const collection = getCollection(key);
    const newItem = { _id: generateId(), ...data };
    collection.push(newItem);
    setCollection(key, collection);
    return { data: newItem };
  },

  // PUT /clients/:id  |  PUT /chambres/:id  |  etc.
  put: async (url, data) => {
    await delay();
    const key = getKey(url);
    if (!key) throw makeError('Route not found: ' + url);
    const id = url.split('/').pop();
    const collection = getCollection(key);
    const index = collection.findIndex((i) => i._id === id);
    if (index === -1) throw makeError('Item not found');
    collection[index] = { ...collection[index], ...data };
    setCollection(key, collection);
    return { data: collection[index] };
  },

  // DELETE /clients/:id  |  etc.
  delete: async (url) => {
    await delay();
    const key = getKey(url);
    if (!key) throw makeError('Route not found: ' + url);
    const id = url.split('/').pop();
    const collection = getCollection(key);
    setCollection(key, collection.filter((i) => i._id !== id));
    return { data: { success: true } };
  },

  // Dummy interceptors so nothing breaks
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} },
  },
};

export default api;
