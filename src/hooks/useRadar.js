// src/hooks/useRadar.js
// Hooks React pour récupérer les données en temps réel depuis Supabase

import { useState, useEffect, useCallback } from 'react'
import { supabase, getOpportunites, getSignauxRecents, getKPIs, getScoresSecteurs } from '../lib/supabase'

/**
 * Hook principal — charge toutes les données du radar.
 * Se met à jour automatiquement en temps réel via Supabase Realtime.
 */
export function useRadar() {
  const [opportunites, setOpportunites] = useState([])
  const [signaux,      setSignaux]      = useState([])
  const [kpis,         setKpis]         = useState({ total: 0, critiques: 0, vigilances: 0, signaux: 0 })
  const [secteurs,     setSecteurs]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [erreur,       setErreur]       = useState(null)
  const [lastUpdate,   setLastUpdate]   = useState(null)

  const chargerDonnees = useCallback(async () => {
    try {
      setLoading(true)
      const [opps, sigs, kpisData, secteursData] = await Promise.all([
        getOpportunites(),
        getSignauxRecents(),
        getKPIs(),
        getScoresSecteurs(),
      ])
      setOpportunites(opps)
      setSignaux(sigs)
      setKpis(kpisData)
      setSecteurs(secteursData)
      setLastUpdate(new Date())
      setErreur(null)
    } catch (err) {
      console.error('Erreur chargement données:', err)
      setErreur(err.message)
      // En cas d'erreur Supabase, charger des données de démo
      chargerDemoData()
    } finally {
      setLoading(false)
    }
  }, [])

  // Chargement initial
  useEffect(() => {
    chargerDonnees()
  }, [chargerDonnees])

  // Abonnement temps réel Supabase
  useEffect(() => {
    const channel = supabase
      .channel('radar-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'opportunites' }, () => {
        chargerDonnees()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'signaux' }, (payload) => {
        setSignaux(prev => [payload.new, ...prev].slice(0, 20))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [chargerDonnees])

  function chargerDemoData() {
    // Données de démo si Supabase non configuré
    setOpportunites(DEMO_OPPORTUNITES)
    setSignaux(DEMO_SIGNAUX)
    setKpis({ total: 247, critiques: 7, vigilances: 12, signaux: 24 })
    setSecteurs(DEMO_SECTEURS)
  }

  return { opportunites, signaux, kpis, secteurs, loading, erreur, lastUpdate, refresh: chargerDonnees }
}

/**
 * Hook pour une opportunité spécifique avec son mémo complet.
 */
export function useOpportunite(id) {
  const [opportunite, setOpportunite] = useState(null)
  const [loading,     setLoading]     = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    supabase
      .from('opportunites')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (!error) setOpportunite(data)
        setLoading(false)
      })
  }, [id])

  return { opportunite, loading }
}

// ─── DONNÉES DE DÉMO ──────────────────────────────────────────────────────
// Affichées quand Supabase n'est pas encore configuré

const DEMO_OPPORTUNITES = [
  { id: '1', entreprise: "Label'Vie Group", secteur: "Distribution", score_final: 91, niveau_alerte: "CRITIQUE", type_deal: "acquisition", source: "AMMC", recommandation: "Contact CA dans les 3 semaines", statut: "nouveau", created_at: new Date().toISOString(), signaux: ["transmission_succession", "changement_direction", "acquereur_actif_secteur"] },
  { id: '2', entreprise: "Saham Finances", secteur: "Assurance", score_final: 87, niveau_alerte: "CRITIQUE", type_deal: "cession", source: "OMPIC", recommandation: "Approche via réseau CGEM", statut: "nouveau", created_at: new Date().toISOString(), signaux: ["besoin_cash_bfr", "desinvestissement_activite"] },
  { id: '3', entreprise: "Dislog Group", secteur: "Logistique", score_final: 82, niveau_alerte: "CRITIQUE", type_deal: "levee_fonds", source: "LinkedIn", recommandation: "Contact DG direct", statut: "contacte", created_at: new Date().toISOString(), signaux: ["recrutement_profil_ma", "expansion_geographique"] },
  { id: '4', entreprise: "Akdital", secteur: "Santé", score_final: 74, niveau_alerte: "VIGILANCE", type_deal: "levee_fonds", source: "Médias24", recommandation: "Surveiller 2 semaines", statut: "nouveau", created_at: new Date().toISOString(), signaux: ["expansion_geographique", "investissements_recents"] },
  { id: '5', entreprise: "M2M Group", secteur: "Fintech", score_final: 68, niveau_alerte: "VIGILANCE", type_deal: "acquisition", source: "Presse", recommandation: "Analyser concurrence", statut: "nouveau", created_at: new Date().toISOString(), signaux: ["acquereur_actif_secteur"] },
  { id: '6', entreprise: "Bricoma", secteur: "BTP", score_final: 54, niveau_alerte: "RADAR", type_deal: "restructuring", source: "OMPIC", recommandation: "Surveillance passive", statut: "nouveau", created_at: new Date().toISOString(), signaux: ["gearing_eleve"] },
  { id: '7', entreprise: "Sotherma", secteur: "Agroalimentaire", score_final: 48, niveau_alerte: "RADAR", type_deal: "transmission", source: "OMPIC", recommandation: "Identifier successeur", statut: "nouveau", created_at: new Date().toISOString(), signaux: ["transmission_succession"] },
]

const DEMO_SIGNAUX = [
  { id: '1', source: "AMMC", titre: "Label'Vie : Démission du DG après 8 ans de mandat", signal_type: "changement_direction", score_ia: 88, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: '2', source: "OMPIC", titre: "Saham Finances : Modification de répartition du capital social", signal_type: "besoin_cash_bfr", score_ia: 82, created_at: new Date(Date.now() - 14400000).toISOString() },
  { id: '3', source: "LinkedIn", titre: "Dislog Group : Recrutement CFO expérimenté profil M&A", signal_type: "recrutement_profil_ma", score_ia: 76, created_at: new Date(Date.now() - 21600000).toISOString() },
  { id: '4', source: "Médias24", titre: "Akdital annonce l'ouverture de 3 nouvelles cliniques", signal_type: "expansion_geographique", score_ia: 65, created_at: new Date(Date.now() - 28800000).toISOString() },
  { id: '5', source: "L'Économiste", titre: "Secteur fintech marocain : consolidation attendue selon BAM", signal_type: "consolidation_sectorielle", score_ia: 58, created_at: new Date(Date.now() - 43200000).toISOString() },
]

const DEMO_SECTEURS = [
  { secteur: "Santé", score_moyen: 92, nb_cibles: 9 },
  { secteur: "Distribution", score_moyen: 88, nb_cibles: 14 },
  { secteur: "Fintech", score_moyen: 75, nb_cibles: 11 },
  { secteur: "Logistique", score_moyen: 71, nb_cibles: 8 },
  { secteur: "Éducation", score_moyen: 58, nb_cibles: 6 },
  { secteur: "Industrie", score_moyen: 52, nb_cibles: 22 },
  { secteur: "Agroalimentaire", score_moyen: 44, nb_cibles: 18 },
  { secteur: "BTP", score_moyen: 38, nb_cibles: 31 },
]
