// ====================================================
//  Real API — Supabase (PostgreSQL cloud database)
//  Data is shared across all devices in real time!
// ====================================================

import { supabase } from '../lib/supabase';

// ---------- Auth (kept simple, hardcoded) ----------
const ADMIN_EMAIL = 'admin@hotel.com';
const ADMIN_PASSWORD = 'admin123';

// ---------- Mock API object (same interface as before) ----------
const api = {

  // GET /clients  |  GET /chambres  |  GET /reservations
  get: async (url) => {
    if (url.startsWith('/clients')) {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw makeError(error.message);
      // Map Supabase row → app format (_id for compatibility)
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

    throw makeError('Route not found: ' + url);
  },

  // POST /auth/login  |  POST /clients  |  etc.
  post: async (url, data) => {

    // ── Auth (hardcoded, no Supabase Auth needed) ──
    if (url === '/auth/login') {
      if (
        data.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
        data.password === ADMIN_PASSWORD
      ) {
        return { data: { token: 'hotel-token-' + Date.now() } };
      }
      throw makeError('Email ou mot de passe incorrect');
    }

    // ── Clients ──
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

    // ── Chambres ──
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

    // ── Reservations ──
    if (url.startsWith('/reservations')) {
      const { data: row, error } = await supabase
        .from('reservations')
        .insert({
          client_id: data.clientId,
          chambre_id: data.chambreId,
          date_debut: data.dateDebut,
          date_fin: data.dateFin,
        })
        .select()
        .single();
      if (error) throw makeError(error.message);
      return { data: mapReservation(row) };
    }

    throw makeError('Route not found: ' + url);
  },

  // PUT /clients/:id  |  PUT /chambres/:id  |  etc.
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
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw makeError(error.message);
      return { data: mapReservation(row) };
    }

    throw makeError('Route not found: ' + url);
  },

  // DELETE /clients/:id  |  etc.
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

  // Dummy interceptors so nothing breaks
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

// Map Supabase row → app format (id → _id for compatibility with existing pages)
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
});

export default api;
