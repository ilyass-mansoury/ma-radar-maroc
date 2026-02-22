// src/lib/supabase.js
// Connexion à ta base de données Supabase
// Remplace les valeurs par tes vraies clés depuis supabase.com

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://TON-PROJECT.supabase.co'
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY || 'TON-ANON-KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ─── REQUÊTES BASE DE DONNÉES ──────────────────────────────────────────────

/**
 * Récupère toutes les opportunités scorées, triées par score décroissant.
 * Filtre optionnel par niveau d'alerte et secteur.
 */
export async function getOpportunites({ niveau, secteur, limit = 50 } = {}) {
  let query = supabase
    .from('opportunites')
    .select('*')
    .order('score_final', { ascending: false })
    .limit(limit)

  if (niveau) query = query.eq('niveau_alerte', niveau)
  if (secteur) query = query.eq('secteur', secteur)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

/**
 * Récupère le flux de signaux récents (toutes sources confondues).
 */
export async function getSignauxRecents({ limit = 20 } = {}) {
  const { data, error } = await supabase
    .from('signaux')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

/**
 * Récupère les KPIs globaux du radar.
 */
export async function getKPIs() {
  const { data, error } = await supabase
    .from('opportunites')
    .select('niveau_alerte, score_final')

  if (error) throw error

  const total      = data?.length || 0
  const critiques  = data?.filter(d => d.niveau_alerte === 'CRITIQUE').length || 0
  const vigilances = data?.filter(d => d.niveau_alerte === 'VIGILANCE').length || 0
  const signaux    = data?.length || 0

  return { total, critiques, vigilances, signaux }
}

/**
 * Récupère les scores par secteur pour la heatmap.
 */
export async function getScoresSecteurs() {
  const { data, error } = await supabase
    .from('opportunites')
    .select('secteur, score_final')

  if (error) throw error

  // Agréger par secteur
  const secteurs = {}
  data?.forEach(d => {
    if (!d.secteur) return
    if (!secteurs[d.secteur]) secteurs[d.secteur] = { total: 0, count: 0 }
    secteurs[d.secteur].total += d.score_final
    secteurs[d.secteur].count += 1
  })

  return Object.entries(secteurs).map(([secteur, vals]) => ({
    secteur,
    score_moyen: Math.round(vals.total / vals.count),
    nb_cibles: vals.count
  })).sort((a, b) => b.score_moyen - a.score_moyen)
}

/**
 * Récupère le mémo d'une opportunité spécifique.
 */
export async function getMemo(id) {
  const { data, error } = await supabase
    .from('opportunites')
    .select('*, memo_origination')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Marque une opportunité comme contactée / en pipeline.
 */
export async function updateStatut(id, statut) {
  const { error } = await supabase
    .from('opportunites')
    .update({ statut, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// ─── SCHÉMA SQL À CRÉER DANS SUPABASE ────────────────────────────────────
// Copie ce SQL dans l'éditeur SQL de Supabase pour créer les tables :
//
// CREATE TABLE opportunites (
//   id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   entreprise      text,
//   secteur         text,
//   score_final     integer DEFAULT 0,
//   niveau_alerte   text,
//   type_deal       text,
//   source          text,
//   signaux         jsonb,
//   recommandation  text,
//   memo_origination text,
//   statut          text DEFAULT 'nouveau',
//   created_at      timestamptz DEFAULT now(),
//   updated_at      timestamptz DEFAULT now()
// );
//
// CREATE TABLE signaux (
//   id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   source      text,
//   titre       text,
//   entreprise  text,
//   signal_type text,
//   score_ia    integer,
//   url         text,
//   raw_text    text,
//   created_at  timestamptz DEFAULT now()
// );
//
// -- Activer les mises à jour temps réel
// ALTER PUBLICATION supabase_realtime ADD TABLE opportunites;
// ALTER PUBLICATION supabase_realtime ADD TABLE signaux;
