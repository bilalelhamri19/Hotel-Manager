// ====================================================
//  Hybrid API — Supabase or localStorage fallback
// ====================================================

import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ---------- Auth (kept simple, hardcoded) ----------
const ADMIN_EMAIL = 'admin@hotel.com';
const ADMIN_PASSWORD = 'admin123';

// ---------- LocalStorage Mock Implementation ----------
const generateId = () =>
  Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

const seedIfEmpty = () => {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem('hotel_users')) {
    localStorage.setItem(
      'hotel_users',
      JSON.stringify([{ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }])
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
        { _id: 'r1', clientId: 'c1', chambreId: 'ch3', dateDebut: fmt(addDays(-5)),  dateFin: fmt(addDays(2)), statutPaiement: true  },
        { _id: 'r2', clientId: 'c2', chambreId: 'ch2', dateDebut: fmt(addDays(3)),   dateFin: fmt(addDays(7)), statutPaiement: false },
        { _id: 'r3', clientId: 'c3', chambreId: 'ch5', dateDebut: fmt(addDays(-10)), dateFin: fmt(addDays(-3)), statutPaiement: true },
      ])
    );
  }
};

if (!isSupabaseConfigured) {
  seedIfEmpty();
}

const delay = () => new Promise((r) => setTimeout(r, 200));

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

const localStorageApi = {
  get: async (url) => {
    await delay();
    if (url === '/users') {
      const users = getCollection('hotel_users');
      return { data: users.map(({password, ...u}) => u) };
    }
    const key = getKey(url);
    if (!key) throw makeError('Route not found: ' + url);
    return { data: getCollection(key) };
  },

  post: async (url, data) => {
    await delay();

    if (url === '/auth/login') {
      const users = getCollection('hotel_users');
      const user = users.find(
        (u) => u.email.toLowerCase() === data.email.toLowerCase() && u.password === data.password
      );
      if (user) {
        return { data: { token: 'mock-token-' + Date.now(), user: { email: user.email, prenom: user.prenom, nom: user.nom } } };
      }
      throw makeError('Email ou mot de passe incorrect');
    }

    if (url === '/auth/register') {
      const users = getCollection('hotel_users');
      const existing = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
      if (existing) throw makeError('Cet email est déjà utilisé');
      const newUser = { _id: generateId(), nom: data.nom, prenom: data.prenom, email: data.email, password: data.password, role: 'user' };
      users.push(newUser);
      setCollection('hotel_users', users);
      return { data: { message: 'Utilisateur créé', user: { email: newUser.email, prenom: newUser.prenom, nom: newUser.nom } } };
    }

    const key = getKey(url);
    if (!key) throw makeError('Route not found: ' + url);
    const collection = getCollection(key);
    const newItem = { _id: generateId(), ...data };
    collection.push(newItem);
    setCollection(key, collection);
    return { data: newItem };
  },

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

  delete: async (url) => {
    await delay();
    if (url.startsWith('/users/')) {
      const id = url.split('/').pop();
      const users = getCollection('hotel_users');
      setCollection('hotel_users', users.filter(u => u._id !== id));
      return { data: { success: true } };
    }
    const key = getKey(url);
    if (!key) throw makeError('Route not found: ' + url);
    const id = url.split('/').pop();
    const collection = getCollection(key);
    setCollection(key, collection.filter((i) => i._id !== id));
    return { data: { success: true } };
  },
};

// ---------- Supabase Cloud Database Implementation ----------
const supabaseApi = {
  get: async (url) => {
    if (url.startsWith('/clients')) {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw makeError(error.message);
      return { data: data.map(mapClient) };
    }

    if (url.startsWith('/chambres')) {
      const { data, error } = await supabase
        .from('chambres')
        .select('*')
        .order('numero', { ascending: true });
      if (error) throw makeError(error.message);
      return { data: data.map(mapChambre) };
    }

    if (url.startsWith('/reservations')) {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw makeError(error.message);
      return { data: data.map(mapReservation) };
    }

    if (url.startsWith('/users')) {
      // Very simplified user fetch for Supabase if there's a profiles table
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw makeError(error.message);
      return { data };
    }

    throw makeError('Route not found: ' + url);
  },

  post: async (url, data) => {
    if (url === '/auth/login') {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw makeError(error.message);
      return { data: { token: authData.session.access_token, user: authData.user } };
    }

    if (url === '/auth/register') {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { prenom: data.prenom, nom: data.nom } }
      });
      if (error) throw makeError(error.message);
      return { data: { message: 'Utilisateur créé', user: authData.user } };
    }

    if (url.startsWith('/clients')) {
      const { data: row, error } = await supabase
        .from('clients')
        .insert({
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          telephone: data.telephone,
        })
        .select()
        .single();
      if (error) throw makeError(error.message);
      return { data: mapClient(row) };
    }

    if (url.startsWith('/chambres')) {
      const { data: row, error } = await supabase
        .from('chambres')
        .insert({
          numero: data.numero,
          type: data.type,
          prix: data.prix,
          disponible: data.disponible,
        })
        .select()
        .single();
      if (error) throw makeError(error.message);
      return { data: mapChambre(row) };
    }

    if (url.startsWith('/reservations')) {
      const { data: row, error } = await supabase
        .from('reservations')
        .insert({
          client_id: data.clientId,
          chambre_id: data.chambreId,
          date_debut: data.dateDebut,
          date_fin: data.dateFin,
          statut_paiement: data.statutPaiement || false,
        })
        .select()
        .single();
      if (error) throw makeError(error.message);
      return { data: mapReservation(row) };
    }

    throw makeError('Route not found: ' + url);
  },

  put: async (url, data) => {
    const id = url.split('/').pop();

    if (url.startsWith('/clients')) {
      const { data: row, error } = await supabase
        .from('clients')
        .update({
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          telephone: data.telephone,
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw makeError(error.message);
      return { data: mapClient(row) };
    }

    if (url.startsWith('/chambres')) {
      const { data: row, error } = await supabase
        .from('chambres')
        .update({
          numero: data.numero,
          type: data.type,
          prix: data.prix,
          disponible: data.disponible,
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw makeError(error.message);
      return { data: mapChambre(row) };
    }

    if (url.startsWith('/reservations')) {
      const { data: row, error } = await supabase
        .from('reservations')
        .update({
          client_id: data.clientId,
          chambre_id: data.chambreId,
          date_debut: data.dateDebut,
          date_fin: data.dateFin,
          statut_paiement: data.statutPaiement,
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw makeError(error.message);
      return { data: mapReservation(row) };
    }

    throw makeError('Route not found: ' + url);
  },

  delete: async (url) => {
    const id = url.split('/').pop();

    if (url.startsWith('/clients')) {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw makeError(error.message);
      return { data: { success: true } };
    }

    if (url.startsWith('/chambres')) {
      const { error } = await supabase.from('chambres').delete().eq('id', id);
      if (error) throw makeError(error.message);
      return { data: { success: true } };
    }

    if (url.startsWith('/reservations')) {
      const { error } = await supabase.from('reservations').delete().eq('id', id);
      if (error) throw makeError(error.message);
      return { data: { success: true } };
    }

    throw makeError('Route not found: ' + url);
  },
};

// ---------- Unified API Exports ----------
const api = {
  get: async (url) => {
    if (isSupabaseConfigured) {
      return supabaseApi.get(url);
    } else {
      return localStorageApi.get(url);
    }
  },

  post: async (url, data) => {
    if (isSupabaseConfigured) {
      return supabaseApi.post(url, data);
    } else {
      return localStorageApi.post(url, data);
    }
  },

  put: async (url, data) => {
    if (isSupabaseConfigured) {
      return supabaseApi.put(url, data);
    } else {
      return localStorageApi.put(url, data);
    }
  },

  delete: async (url) => {
    if (isSupabaseConfigured) {
      return supabaseApi.delete(url);
    } else {
      return localStorageApi.delete(url);
    }
  },

  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} },
  },
};

// ---------- Helpers ----------
const makeError = (message) => {
  const err = new Error(message);
  err.response = { data: { message } };
  return err;
};

// Map Supabase row → app format (id → _id for compatibility)
const mapClient = (row) => ({
  _id: row.id,
  nom: row.nom,
  prenom: row.prenom,
  email: row.email,
  telephone: row.telephone,
});

const mapChambre = (row) => ({
  _id: row.id,
  numero: row.numero,
  type: row.type,
  prix: row.prix,
  disponible: row.disponible,
});

const mapReservation = (row) => ({
  _id: row.id,
  clientId: row.client_id,
  chambreId: row.chambre_id,
  dateDebut: row.date_debut,
  dateFin: row.date_fin,
  statutPaiement: row.statut_paiement || false,
});

export default api;
