// src/App.js
// M&A Radar Maroc — Dashboard React Principal
// Connecté à Supabase en temps réel

import { useState } from 'react'
import { useRadar } from './hooks/useRadar'
import { updateStatut } from './lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

// ─── COULEURS & HELPERS ───────────────────────────────────────────────────

const COLORS = {
  bg:       '#0a0c0f',
  surface:  '#111418',
  surface2: '#181c22',
  border:   '#1e2530',
  gold:     '#c9a84c',
  red:      '#e05252',
  green:    '#4caf82',
  blue:     '#4c8faf',
  text:     '#e8e4dc',
  dim:      '#6b7280',
}

function niveauColor(niveau) {
  if (niveau === 'CRITIQUE')  return COLORS.red
  if (niveau === 'VIGILANCE') return COLORS.gold
  if (niveau === 'RADAR')     return COLORS.blue
  return COLORS.dim
}

function dealLabel(type) {
  const labels = {
    acquisition:   { label: 'Acquisition',    bg: 'rgba(224,82,82,0.12)',   color: '#e05252' },
    cession:       { label: 'Cession',         bg: 'rgba(201,168,76,0.1)',   color: '#c9a84c' },
    levee_fonds:   { label: 'Levée de fonds',  bg: 'rgba(76,143,175,0.1)',   color: '#4c8faf' },
    pre_ipo:       { label: 'Pre-IPO',          bg: 'rgba(76,143,175,0.1)',   color: '#4c8faf' },
    transmission:  { label: 'Transmission',    bg: 'rgba(76,175,130,0.1)',   color: '#4caf82' },
    restructuring: { label: 'Restructuring',   bg: 'rgba(76,175,130,0.1)',   color: '#4caf82' },
  }
  return labels[type] || { label: type || 'N/A', bg: 'rgba(107,114,128,0.1)', color: '#6b7280' }
}

function signalEmoji(type) {
  const emojis = {
    transmission_succession: '👴',
    acquereur_actif_secteur: '🎯',
    desinvestissement_activite: '📤',
    besoin_cash_bfr: '💸',
    gearing_eleve: '📊',
    investissements_recents: '🏗️',
    changement_direction: '🔄',
    recrutement_profil_ma: '💼',
    expansion_geographique: '🗺️',
    consolidation_sectorielle: '🌍',
  }
  return emojis[type] || '📌'
}

function tempsEcoule(dateStr) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: fr })
  } catch {
    return 'récemment'
  }
}

// ─── COMPOSANTS ──────────────────────────────────────────────────────────

function KpiCard({ label, value, color, delta }) {
  return (
    <div style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 12,
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      flex: 1,
    }}>
      <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: COLORS.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>{label}</div>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      {delta && <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: COLORS.green, marginTop: 8 }}>{delta}</div>}
    </div>
  )
}

function ScoreBadge({ score }) {
  const color = score >= 80 ? COLORS.red : score >= 60 ? COLORS.gold : COLORS.green
  const bg    = score >= 80 ? 'rgba(224,82,82,0.15)' : score >= 60 ? 'rgba(201,168,76,0.1)' : 'rgba(76,175,130,0.1)'
  const border= score >= 80 ? 'rgba(224,82,82,0.3)' : score >= 60 ? 'rgba(201,168,76,0.3)' : 'rgba(76,175,130,0.2)'
  return (
    <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:40, height:28, borderRadius:6, background:bg, border:`1px solid ${border}`, fontFamily:'DM Mono,monospace', fontSize:12, fontWeight:600, color }}>
      {score}
    </div>
  )
}

function DealTag({ type }) {
  const { label, bg, color } = dealLabel(type)
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 8px', borderRadius:4, background:bg, color, fontFamily:'DM Mono,monospace', fontSize:10, border:`1px solid ${color}33` }}>
      {label}
    </span>
  )
}

function SignalTag({ type }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:COLORS.surface2, border:`1px solid ${COLORS.border}`, borderRadius:4, padding:'3px 8px', fontSize:10, color:COLORS.dim, fontFamily:'DM Mono,monospace' }}>
      {signalEmoji(type)} {type?.replace(/_/g,' ') || 'N/A'}
    </span>
  )
}

function MemoPanel({ opp, onClose }) {
  if (!opp) return null

  async function marquerContacte() {
    await updateStatut(opp.id, 'contacte')
    onClose()
  }

  return (
    <div style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:12, overflow:'hidden' }}>
      <div style={{ padding:'16px 20px', borderBottom:`1px solid ${COLORS.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontFamily:'Playfair Display,serif', fontSize:15, fontWeight:600 }}>Mémo d'Origination IA</div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <span style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:COLORS.gold, letterSpacing:'0.1em' }}>AUTO-GÉNÉRÉ</span>
          <button onClick={onClose} style={{ background:'transparent', border:'none', color:COLORS.dim, cursor:'pointer', fontSize:18, lineHeight:1 }}>×</button>
        </div>
      </div>

      <div style={{ padding:20 }}>
        {/* En-tête */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <div style={{ fontFamily:'Playfair Display,serif', fontSize:20, fontWeight:600 }}>{opp.entreprise}</div>
            <div style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:COLORS.dim, marginTop:3, letterSpacing:'0.05em' }}>{opp.secteur?.toUpperCase()} · MAROC</div>
          </div>
          <div style={{ width:52, height:52, borderRadius:'50%', border:`2px solid ${niveauColor(opp.niveau_alerte)}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:`${niveauColor(opp.niveau_alerte)}18` }}>
            <div style={{ fontFamily:'Playfair Display,serif', fontSize:18, fontWeight:700, color:niveauColor(opp.niveau_alerte), lineHeight:1 }}>{opp.score_final}</div>
            <div style={{ fontFamily:'DM Mono,monospace', fontSize:7, color:niveauColor(opp.niveau_alerte), letterSpacing:'0.05em' }}>SCORE</div>
          </div>
        </div>

        {/* Signaux */}
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
          {(opp.signaux || []).slice(0,3).map((sig, i) => (
            <div key={i} style={{ padding:'10px 12px', background:COLORS.surface2, borderRadius:8, borderLeft:`2px solid ${i===0?COLORS.red:i===1?COLORS.gold:COLORS.blue}` }}>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:COLORS.dim, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:3 }}>Signal {i===0?'Critique':i===1?'Fort':'Modéré'}</div>
              <div style={{ fontSize:11, color:COLORS.text }}>{signalEmoji(sig)} {sig?.replace(/_/g,' ')}</div>
            </div>
          ))}
        </div>

        {/* Recommandation */}
        {opp.recommandation && (
          <div style={{ background:'rgba(201,168,76,0.06)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:8, padding:14, marginBottom:14 }}>
            <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:COLORS.gold, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>💡 Recommandation IA</div>
            <div style={{ fontSize:12, color:COLORS.text, lineHeight:1.6 }}>{opp.recommandation}</div>
          </div>
        )}

        {/* Mémo complet */}
        {opp.memo_origination && (
          <div style={{ background:COLORS.surface2, borderRadius:8, padding:14, marginBottom:14, maxHeight:150, overflowY:'auto' }}>
            <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:COLORS.dim, letterSpacing:'0.1em', marginBottom:8 }}>MÉMO COMPLET</div>
            <div style={{ fontSize:11, color:COLORS.dim, lineHeight:1.7, whiteSpace:'pre-wrap' }}>{opp.memo_origination}</div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display:'flex', gap:8 }}>
          <button
            onClick={marquerContacte}
            style={{ flex:1, background:COLORS.gold, color:'#0a0c0f', border:'none', padding:'10px', borderRadius:8, fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}
          >
            📞 Marquer contacté
          </button>
          <button
            onClick={() => window.print()}
            style={{ flex:1, background:'transparent', color:COLORS.dim, border:`1px solid ${COLORS.border}`, padding:'10px', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}
          >
            📤 Exporter
          </button>
        </div>
      </div>
    </div>
  )
}

function SectorHeatmap({ secteurs }) {
  const max = Math.max(...secteurs.map(s => s.score_moyen), 1)
  const getColor = (score) => {
    if (score >= 80) return { tile: 'rgba(224,82,82,0.12)', fill: COLORS.red }
    if (score >= 60) return { tile: 'rgba(201,168,76,0.08)', fill: COLORS.gold }
    if (score >= 40) return { tile: 'rgba(76,143,175,0.08)', fill: COLORS.blue }
    return { tile: 'rgba(107,114,128,0.08)', fill: COLORS.dim }
  }

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, padding:16 }}>
      {secteurs.map((s, i) => {
        const { tile, fill } = getColor(s.score_moyen)
        return (
          <div key={i} style={{ background:tile, borderRadius:8, padding:12, cursor:'pointer', border:'1px solid transparent', transition:'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
          >
            <div style={{ fontSize:11, fontWeight:500, marginBottom:6, color:COLORS.text }}>{s.secteur}</div>
            <div style={{ height:3, borderRadius:2, background:COLORS.border, marginBottom:6, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${(s.score_moyen/max)*100}%`, background:fill, borderRadius:2, transition:'width 1s ease' }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'DM Mono,monospace', fontSize:9, color:COLORS.dim }}>
              <span>{s.nb_cibles} cibles</span>
              <span style={{ color:fill, fontWeight:600 }}>{s.score_moyen}/100</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── APP PRINCIPALE ───────────────────────────────────────────────────────

export default function App() {
  const { opportunites, signaux, kpis, secteurs, loading, lastUpdate, refresh } = useRadar()
  const [selectedOpp,  setSelectedOpp]  = useState(null)
  const [activeFilter, setActiveFilter] = useState('Tous')
  const [activeTab,    setActiveTab]    = useState('Score élevé')

  const filters = ['Tous', 'CRITIQUE', 'VIGILANCE', 'RADAR']

  const oppsFiltrees = opportunites.filter(o => {
    if (activeFilter === 'Tous') return true
    return o.niveau_alerte === activeFilter
  })

  const styles = {
    app: { background: COLORS.bg, color: COLORS.text, minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', fontWeight: 300 },
    topbar: { background: 'rgba(17,20,24,0.95)', borderBottom: `1px solid ${COLORS.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', height:60, position:'sticky', top:0, zIndex:100, backdropFilter:'blur(12px)' },
    layout: { display:'grid', gridTemplateColumns:'220px 1fr', minHeight:'calc(100vh - 60px)' },
    sidebar: { background: COLORS.surface, borderRight:`1px solid ${COLORS.border}`, padding:'24px 0', display:'flex', flexDirection:'column', gap:4 },
    main: { overflowY:'auto', padding:28, display:'flex', flexDirection:'column', gap:24 },
  }

  return (
    <div style={styles.app}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* TOPBAR */}
      <header style={styles.topbar}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:32, height:32, border:`1.5px solid ${COLORS.gold}`, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Playfair Display,serif', fontSize:16, color:COLORS.gold }}>M</div>
          <div style={{ fontFamily:'Playfair Display,serif', fontSize:17, letterSpacing:'0.02em' }}>M&A <span style={{ color:COLORS.gold }}>Radar</span> Maroc</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          {loading
            ? <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:COLORS.dim }}>Chargement...</span>
            : <div style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'DM Mono,monospace', fontSize:10, color:COLORS.green }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:COLORS.green, animation:'pulse 2s infinite' }} />
                SYSTÈME ACTIF
              </div>
          }
          {lastUpdate && (
            <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:COLORS.dim }}>
              {lastUpdate.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })}
            </span>
          )}
          <button onClick={refresh} style={{ background:'transparent', border:`1px solid ${COLORS.border}`, color:COLORS.dim, padding:'5px 12px', borderRadius:6, fontSize:11, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
            ↻ Rafraîchir
          </button>
        </div>
      </header>

      <div style={styles.layout}>
        {/* SIDEBAR */}
        <aside style={styles.sidebar}>
          {[['◎','Radar','7'], ['⬡','Signaux','24'], ['◷','Pipeline',''], ['⊞','Secteurs',''], ['⊡','Entreprises','']].map(([icon, label, badge]) => (
            <div key={label} style={{ margin:'0 16px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, cursor:'pointer', fontSize:13, color: label==='Radar' ? COLORS.gold : COLORS.dim, background: label==='Radar' ? 'rgba(201,168,76,0.15)' : 'transparent', border: label==='Radar' ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent' }}>
                <span>{icon}</span> {label}
                {badge && <span style={{ marginLeft:'auto', background:COLORS.red, color:'white', fontFamily:'DM Mono,monospace', fontSize:9, padding:'2px 6px', borderRadius:10 }}>{badge}</span>}
              </div>
            </div>
          ))}
          <div style={{ height:1, background:COLORS.border, margin:'12px 16px' }} />
          {[['◈','OMPIC'], ['◈','AMMC'], ['◈','Bulletin Off.'], ['◈','Presse Éco'], ['◈','LinkedIn']].map(([icon, label]) => (
            <div key={label} style={{ margin:'0 16px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, cursor:'pointer', fontSize:13, color:COLORS.dim }}>
                <span style={{ color:COLORS.green, fontSize:10 }}>●</span> {label}
              </div>
            </div>
          ))}
        </aside>

        {/* MAIN */}
        <main style={styles.main}>
          {/* HEADER */}
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontFamily:'Playfair Display,serif', fontSize:26, fontWeight:600 }}>Radar d'Origination</div>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:12, color:COLORS.dim, marginTop:4 }}>
                {kpis.total} entreprises surveillées — {lastUpdate ? `Dernière analyse ${tempsEcoule(lastUpdate)}` : 'Chargement...'}
              </div>
            </div>
            <button style={{ background:COLORS.gold, color:'#0a0c0f', border:'none', padding:'10px 20px', borderRadius:8, fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:500, cursor:'pointer' }}>
              + Ajouter une cible
            </button>
          </div>

          {/* KPIs */}
          <div style={{ display:'flex', gap:16 }}>
            <KpiCard label="Score Critique (≥80)" value={kpis.critiques} color={COLORS.gold} delta={`↑ ${kpis.critiques} cette semaine`} />
            <KpiCard label="Nouveaux Signaux" value={kpis.signaux} color={COLORS.red} delta="↑ depuis hier" />
            <KpiCard label="En Vigilance" value={kpis.vigilances} color={COLORS.green} delta="À surveiller" />
            <KpiCard label="Entreprises" value={kpis.total} color={COLORS.blue} delta="Couverture nationale" />
          </div>

          {/* GRILLE PRINCIPALE */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:20 }}>

            {/* COLONNE GAUCHE */}
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

              {/* TABLE OPPORTUNITÉS */}
              <div style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:12, overflow:'hidden' }}>
                <div style={{ padding:'18px 20px', borderBottom:`1px solid ${COLORS.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ fontFamily:'Playfair Display,serif', fontSize:15, fontWeight:600 }}>Opportunités Prioritaires</div>
                  <div style={{ display:'flex', gap:8 }}>
                    {filters.map(f => (
                      <button key={f} onClick={() => setActiveFilter(f)} style={{ background: activeFilter===f ? 'rgba(201,168,76,0.15)' : COLORS.surface2, border: `1px solid ${activeFilter===f ? 'rgba(201,168,76,0.3)' : COLORS.border}`, color: activeFilter===f ? COLORS.gold : COLORS.dim, padding:'5px 12px', borderRadius:6, fontSize:11, cursor:'pointer', fontFamily:'DM Sans,sans-serif', transition:'all 0.2s' }}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Onglets */}
                <div style={{ display:'flex', gap:0, borderBottom:`1px solid ${COLORS.border}`, padding:'0 20px' }}>
                  {['Score élevé', 'Récents', 'Contactés'].map(tab => (
                    <div key={tab} onClick={() => setActiveTab(tab)} style={{ padding:'12px 16px', fontSize:12, color: activeTab===tab ? COLORS.gold : COLORS.dim, cursor:'pointer', borderBottom: activeTab===tab ? `2px solid ${COLORS.gold}` : '2px solid transparent', marginBottom:-1, transition:'all 0.2s' }}>
                      {tab}
                    </div>
                  ))}
                </div>

                {/* Tableau */}
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr>
                      {['Entreprise','Score','Type Deal','Signal Principal','Signaux',''].map(h => (
                        <th key={h} style={{ padding:'10px 20px', textAlign:'left', fontFamily:'DM Mono,monospace', fontSize:9, color:'#3d4450', letterSpacing:'0.12em', textTransform:'uppercase', borderBottom:`1px solid ${COLORS.border}`, background:'rgba(255,255,255,0.01)', fontWeight:400 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {oppsFiltrees.map((opp, i) => (
                      <tr key={opp.id} onClick={() => setSelectedOpp(opp)} style={{ borderBottom:`1px solid rgba(30,37,48,0.6)`, cursor:'pointer', transition:'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = COLORS.surface2}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding:'14px 20px' }}>
                          <div style={{ fontWeight:500, fontSize:13 }}>{opp.entreprise}</div>
                          <div style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:COLORS.dim, marginTop:2 }}>{opp.secteur}</div>
                        </td>
                        <td style={{ padding:'14px 20px' }}><ScoreBadge score={opp.score_final} /></td>
                        <td style={{ padding:'14px 20px' }}><DealTag type={opp.type_deal} /></td>
                        <td style={{ padding:'14px 20px' }}><SignalTag type={(opp.signaux||[])[0]} /></td>
                        <td style={{ padding:'14px 20px', fontFamily:'DM Mono,monospace', fontSize:11, color:COLORS.dim }}>{(opp.signaux||[]).length} signaux</td>
                        <td style={{ padding:'14px 20px' }}>
                          <button style={{ background:'transparent', border:`1px solid ${COLORS.border}`, color:COLORS.dim, padding:'5px 10px', borderRadius:6, fontSize:11, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
                            Mémo →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* FLUX SIGNAUX */}
              <div style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:12, overflow:'hidden' }}>
                <div style={{ padding:'18px 20px', borderBottom:`1px solid ${COLORS.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ fontFamily:'Playfair Display,serif', fontSize:15, fontWeight:600 }}>Flux de Signaux Temps Réel</div>
                  <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:COLORS.dim }}>Supabase Realtime</span>
                </div>
                <div style={{ maxHeight:280, overflowY:'auto' }}>
                  {signaux.map((sig, i) => (
                    <div key={sig.id || i} style={{ padding:'14px 20px', borderBottom:`1px solid rgba(30,37,48,0.6)`, display:'flex', gap:12, cursor:'pointer', transition:'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = COLORS.surface2}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ width:32, height:32, borderRadius:8, background:'rgba(201,168,76,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0, marginTop:2 }}>
                        {signalEmoji(sig.signal_type)}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, color:COLORS.text, fontWeight:500, lineHeight:1.4, marginBottom:4 }}>{sig.titre}</div>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'#3d4450' }}>{sig.source}</span>
                          <span style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'#3d4450' }}>{tempsEcoule(sig.created_at)}</span>
                          {sig.score_ia && <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:COLORS.gold, marginLeft:'auto' }}>+{sig.score_ia} pts</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* COLONNE DROITE */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

              {/* MÉMO ou PLACEHOLDER */}
              {selectedOpp
                ? <MemoPanel opp={selectedOpp} onClose={() => setSelectedOpp(null)} />
                : (
                  <div style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:12, padding:40, textAlign:'center' }}>
                    <div style={{ fontSize:32, marginBottom:12 }}>📋</div>
                    <div style={{ fontFamily:'Playfair Display,serif', fontSize:15, marginBottom:8 }}>Mémo d'Origination</div>
                    <div style={{ fontSize:12, color:COLORS.dim, lineHeight:1.6 }}>Clique sur une entreprise dans le tableau pour voir son mémo généré automatiquement par l'IA</div>
                  </div>
                )
              }

              {/* HEATMAP SECTEURS */}
              <div style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:12, overflow:'hidden' }}>
                <div style={{ padding:'18px 20px', borderBottom:`1px solid ${COLORS.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ fontFamily:'Playfair Display,serif', fontSize:15, fontWeight:600 }}>Chaleur Sectorielle</div>
                  <span style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:COLORS.dim }}>{kpis.total} cibles</span>
                </div>
                <SectorHeatmap secteurs={secteurs} />
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(76,175,130,0.4); }
          50% { opacity: 0.8; box-shadow: 0 0 0 4px rgba(76,175,130,0); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e2530; border-radius: 2px; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  )
}
