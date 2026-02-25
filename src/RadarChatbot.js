// RadarChatbot.js
// Chatbot IA flottant pour M&A Radar Maroc
// Connaît toutes tes opportunités + génère mémos + emails d'approche
// À importer dans App.js : import RadarChatbot from './RadarChatbot'
// Et ajouter en bas du JSX : <RadarChatbot opportunites={opps} signaux={signaux} />

import { useState, useRef, useEffect } from 'react'

const C = {
  bg:      '#080b0f',
  surface: '#0f1318',
  surface2:'#161c24',
  border:  '#1a2030',
  gold:    '#c9a84c',
  red:     '#e05252',
  green:   '#4caf82',
  blue:    '#4c8faf',
  text:    '#e8e4dc',
  dim:     '#5a6475',
}

// Suggestions rapides selon le contexte
const SUGGESTIONS = [
  "Quelles sont mes opportunités critiques ?",
  "Génère un mémo pour l'opportunité la mieux scorée",
  "Rédige un email d'approche pour un fondateur en transmission",
  "Compare les deux meilleures opportunités",
  "Quels signaux ai-je reçus cette semaine ?",
  "Quel secteur est le plus chaud en ce moment ?",
]

// Construire le contexte complet pour Claude
function buildSystemPrompt(opportunites, signaux) {
  const topOpps = (opportunites || [])
    .sort((a, b) => b.score_final - a.score_final)
    .slice(0, 15)
    .map(o => `- ${o.entreprise} (${o.secteur}) | Score: ${o.score_final}/100 | Deal: ${o.type_deal} | Niveau: ${o.niveau_alerte} | Source: ${o.source} | Signaux: ${(o.signaux||[]).join(', ')} | Recommandation: ${o.recommandation||'N/A'}`)
    .join('\n')

  const recentSignaux = (signaux || [])
    .slice(0, 10)
    .map(s => `- [${s.source}] ${s.titre} (score IA: ${s.score_ia||0})`)
    .join('\n')

  return `Tu es un assistant M&A senior spécialisé sur le marché marocain. 
Tu travailles pour une boutique M&A locale spécialisée dans les PME et family businesses.
Tu as accès en temps réel aux données du M&A Radar Maroc.

═══ OPPORTUNITÉS ACTIVES (top 15 par score) ═══
${topOpps || 'Aucune opportunité disponible'}

═══ SIGNAUX RÉCENTS ═══
${recentSignaux || 'Aucun signal récent'}

═══ TA THÈSE D'ORIGINATION ═══
- Cibles : PME et family businesses marocaines
- Opérations : Pre-IPO, ouverture capital, partenaire stratégique, acquisition majoritaire
- Secteurs prioritaires : Distribution, Industrie, BTP (opportuniste sur tous secteurs)
- Signaux urgents : transmission/succession, acquéreur actif dans le secteur, désengagement activité
- Géographie : tout le Maroc

═══ TES CAPACITÉS ═══
1. Analyser et prioriser les opportunités selon la thèse
2. Générer des mémos d'origination professionnels
3. Rédiger des emails d'approche personnalisés pour les fondateurs
4. Comparer des entreprises et recommander des actions
5. Identifier des patterns dans les signaux récents

Réponds toujours en français. Sois direct, actionnable, et pense comme un banquier d'affaires senior.
Pour les mémos et emails, utilise un format professionnel et structuré.
Quand tu génères un email, propose plusieurs approches (directe, via réseau, par événement).`
}

async function askClaude(messages, opportunites, signaux) {
  const systemPrompt = buildSystemPrompt(opportunites, signaux)
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content }))
    })
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 'Erreur API Claude')
  }

  const data = await response.json()
  return data.content[0]?.text || ''
}

// Composant message individuel
function Message({ msg }) {
  const isUser = msg.role === 'user'
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 12,
      animation: 'fadeIn 0.2s ease',
    }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: `linear-gradient(135deg, ${C.gold}30, ${C.gold}10)`,
          border: `1px solid ${C.gold}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, flexShrink: 0, marginRight: 8, marginTop: 2,
        }}>⚡</div>
      )}
      <div style={{
        maxWidth: '80%',
        padding: '10px 14px',
        borderRadius: isUser ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
        background: isUser ? `linear-gradient(135deg, ${C.gold}20, ${C.gold}10)` : C.surface2,
        border: `1px solid ${isUser ? C.gold+'30' : C.border}`,
        fontSize: 12,
        color: C.text,
        lineHeight: 1.65,
        whiteSpace: 'pre-wrap',
        fontFamily: 'DM Sans, sans-serif',
      }}>
        {msg.loading ? (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '2px 0' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: C.gold, opacity: 0.7,
                animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite`,
              }} />
            ))}
          </div>
        ) : msg.content}
      </div>
    </div>
  )
}

// Composant principal chatbot
export default function RadarChatbot({ opportunites = [], signaux = [] }) {
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Bonjour ! Je suis ton assistant M&A.\n\nJ'ai accès à ${opportunites.length} opportunités et ${signaux.length} signaux récents dans ton radar.\n\nJe peux générer des mémos, rédiger des emails d'approche, analyser tes cibles, ou répondre à toutes tes questions sur ton pipeline. Comment puis-je t'aider ?`,
    }
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [pulse, setPulse]     = useState(false)
  const messagesEnd           = useRef(null)
  const inputRef              = useRef(null)

  // Scroll automatique
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input quand ouvert
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  // Pulse quand nouvelles données
  useEffect(() => {
    if (opportunites.length > 0) {
      setPulse(true)
      setTimeout(() => setPulse(false), 2000)
    }
  }, [opportunites.length])

  async function send(text) {
    const content = text || input.trim()
    if (!content || loading) return

    setInput('')
    const userMsg = { role: 'user', content }
    const loadingMsg = { role: 'assistant', content: '', loading: true }

    setMessages(prev => [...prev, userMsg, loadingMsg])
    setLoading(true)

    try {
      const history = [...messages, userMsg]
        .filter(m => !m.loading)
        .slice(-10) // Garder les 10 derniers messages pour le contexte

      const reply = await askClaude(history, opportunites, signaux)

      setMessages(prev => [
        ...prev.filter(m => !m.loading),
        { role: 'assistant', content: reply }
      ])
    } catch (err) {
      setMessages(prev => [
        ...prev.filter(m => !m.loading),
        {
          role: 'assistant',
          content: `❌ Erreur : ${err.message}\n\nVérifie que ta clé Anthropic est configurée dans les variables d'environnement.`
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const critiques = opportunites.filter(o => o.niveau_alerte === 'CRITIQUE').length

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes bounce { 0%,80%,100% { transform:translateY(0) } 40% { transform:translateY(-6px) } }
        @keyframes pulseRing { 0% { transform:scale(1); opacity:1 } 100% { transform:scale(1.6); opacity:0 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px) scale(0.95) } to { opacity:1; transform:translateY(0) scale(1) } }
        .chat-btn:hover { transform: scale(1.05) !important; }
        .suggestion-btn:hover { background: rgba(201,168,76,0.12) !important; border-color: rgba(201,168,76,0.35) !important; color: #c9a84c !important; }
        .send-btn:hover { background: #b8922a !important; }
      `}</style>

      {/* FENÊTRE CHAT */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 90, right: 24, zIndex: 1000,
          width: 400, height: 580,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          display: 'flex', flexDirection: 'column',
          boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px ${C.gold}15`,
          animation: 'slideUp 0.25s ease',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            borderBottom: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: `linear-gradient(135deg, ${C.surface2}, ${C.surface})`,
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: `linear-gradient(135deg, ${C.gold}30, ${C.gold}15)`,
                border: `1.5px solid ${C.gold}50`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>⚡</div>
              <div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, fontWeight: 600 }}>Assistant M&A</div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: C.green, letterSpacing: '0.08em' }}>
                  ● {opportunites.length} opportunités · {signaux.length} signaux
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                onClick={() => setMessages([{ role:'assistant', content:`Conversation réinitialisée. J'ai accès à ${opportunites.length} opportunités. Comment puis-je t'aider ?` }])}
                style={{ background:'transparent', border:`1px solid ${C.border}`, color:C.dim, padding:'4px 8px', borderRadius:6, fontSize:10, cursor:'pointer', fontFamily:'DM Mono,monospace' }}
              >
                Effacer
              </button>
              <button onClick={() => setOpen(false)} style={{ background:'transparent', border:'none', color:C.dim, cursor:'pointer', fontSize:20, lineHeight:1, padding:'0 4px' }}>×</button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'16px 14px', display:'flex', flexDirection:'column' }}>
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            <div ref={messagesEnd} />
          </div>

          {/* Suggestions rapides */}
          {messages.length <= 2 && (
            <div style={{ padding:'0 14px 10px', display:'flex', flexWrap:'wrap', gap:6, flexShrink:0 }}>
              {SUGGESTIONS.slice(0, 4).map((s, i) => (
                <button
                  key={i}
                  className="suggestion-btn"
                  onClick={() => send(s)}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${C.border}`,
                    color: C.dim,
                    padding: '5px 10px',
                    borderRadius: 20,
                    fontSize: 10,
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: '12px 14px',
            borderTop: `1px solid ${C.border}`,
            display: 'flex', gap: 8, alignItems: 'flex-end',
            flexShrink: 0,
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Pose une question ou demande un mémo..."
              rows={1}
              style={{
                flex: 1,
                background: C.surface2,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                color: C.text,
                fontSize: 12,
                fontFamily: 'DM Sans, sans-serif',
                padding: '9px 12px',
                resize: 'none',
                outline: 'none',
                lineHeight: 1.5,
                maxHeight: 80,
                overflowY: 'auto',
              }}
              onInput={e => {
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px'
              }}
            />
            <button
              className="send-btn"
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{
                background: loading || !input.trim() ? C.surface2 : C.gold,
                color: loading || !input.trim() ? C.dim : '#080b0f',
                border: 'none',
                borderRadius: 10,
                width: 38, height: 38,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                fontSize: 16,
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              {loading ? '⋯' : '↑'}
            </button>
          </div>
        </div>
      )}

      {/* BOUTON FLOTTANT */}
      <div
        className="chat-btn"
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 56, height: 56,
          background: open
            ? C.surface2
            : `linear-gradient(135deg, ${C.gold}, #a87830)`,
          border: `1.5px solid ${open ? C.border : C.gold}`,
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: open ? 'none' : `0 8px 32px ${C.gold}40`,
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          fontSize: 22,
        }}
      >
        {open ? '×' : '⚡'}

        {/* Badge critiques */}
        {!open && critiques > 0 && (
          <div style={{
            position: 'absolute', top: -2, right: -2,
            width: 20, height: 20, borderRadius: '50%',
            background: C.red,
            border: `2px solid ${C.bg}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'DM Mono, monospace', fontSize: 9, fontWeight: 600, color: '#fff',
          }}>
            {critiques}
          </div>
        )}

        {/* Anneau pulse */}
        {!open && pulse && (
          <div style={{
            position: 'absolute', inset: -4,
            borderRadius: '50%',
            border: `2px solid ${C.gold}`,
            animation: 'pulseRing 1s ease-out',
          }} />
        )}
      </div>
    </>
  )
}
