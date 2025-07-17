import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables d\'environnement Supabase manquantes. Vérifiez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans votre fichier .env');
}

// Client Supabase avec clé service_role pour les opérations côté serveur
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Fonctions utilitaires pour maintenir la compatibilité avec l'ancien code
export async function getQuery(table, filters = {}, select = '*') {
  let query = supabase.from(table).select(select);
  
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });
  
  const { data, error } = await query.single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw error;
  }
  
  return data;
}

export async function allQuery(table, filters = {}, select = '*', orderBy = null) {
  let query = supabase.from(table).select(select);
  
  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      query = query.in(key, value);
    } else {
      query = query.eq(key, value);
    }
  });
  
  if (orderBy) {
    query = query.order(orderBy.column, { ascending: orderBy.ascending !== false });
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw error;
  }
  
  return data || [];
}

export async function runQuery(table, data, operation = 'insert') {
  let query;
  
  switch (operation) {
    case 'insert':
      query = supabase.from(table).insert(data).select();
      break;
    case 'update':
      const { id, ...updateData } = data;
      query = supabase.from(table).update(updateData).eq('id', id).select();
      break;
    case 'delete':
      query = supabase.from(table).delete().eq('id', data.id);
      break;
    default:
      throw new Error(`Opération non supportée: ${operation}`);
  }
  
  const { data: result, error } = await query;
  
  if (error) {
    throw error;
  }
  
  return {
    id: result?.[0]?.id || data.id,
    changes: result?.length || 1,
    data: result?.[0] || null
  };
}

// Fonction pour exécuter des requêtes SQL brutes si nécessaire
export async function rawQuery(sql, params = []) {
  const { data, error } = await supabase.rpc('execute_sql', {
    query: sql,
    params: params
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

export default supabase;