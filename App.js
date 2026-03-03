// M&A Radar Maroc — Dashboard React v3
// ✅ Chatbot IA intégré (bouton flottant ⚡)
// ✅ Liens sources cliquables sur tous les signaux
// ✅ 4 vues : Radar, Signaux, Pipeline, Secteurs

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY || ''
const sb = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null


const GEMINI_KEY = 'AIzaSyBo_yPXD082ztpFpshDjPJHm98hMroUG4w'
// ─────────────────────────────────────────────────────────────────────────

const C = {
  bg:'#080b0f', surface:'#0f1318', surface2:'#161c24', border:'#1a2030',
  gold:'#c9a84c', red:'#e05252', green:'#4caf82', blue:'#4c8faf',
  purple:'#8b6faf', text:'#e8e4dc', dim:'#5a6475', dim2:'#3d4555',
}

const DEMO_OPPS = [
  { id:'1', entreprise:"Label'Vie Group", secteur:"Distribution", score_final:91, niveau_alerte:"CRITIQUE", type_deal:"acquisition", source:"AMMC", recommandation:"Contacter le CA dans les 3 semaines avant nomination du nouveau PDG.", statut:"nouveau", created_at:new Date().toISOString(), signaux:["transmission_succession","changement_direction","acquereur_actif_secteur"] },
  { id:'2', entreprise:"Akdital", secteur:"Santé", score_final:85, niveau_alerte:"CRITIQUE", type_deal:"levee_fonds", source:"Médias24", recommandation:"Approche directe DG — levée en cours, fenêtre 4 semaines.", statut:"nouveau", created_at:new Date().toISOString(), signaux:["besoin_cash_bfr","expansion_geographique"] },
  { id:'3', entreprise:"Dislog Group", secteur:"Logistique", score_final:78, niveau_alerte:"VIGILANCE", type_deal:"cession", source:"Challenge", recommandation:"Surveiller la cession de la division produits ménagers.", statut:"contacte", created_at:new Date().toISOString(), signaux:["desinvestissement_activite","recrutement_profil_ma"] },
  { id:'4', entreprise:"Marjane Holding", secteur:"Distribution", score_final:72, niveau_alerte:"VIGILANCE", type_deal:"acquisition", source:"Conseil Concurrence", recommandation:"Identifier les cibles régionales avant Marjane.", statut:"nouveau", created_at:new Date().toISOString(), signaux:["acquereur_actif_secteur","consolidation_sectorielle"] },
  { id:'5', entreprise:"Atlas BTP", secteur:"BTP", score_final:61, niveau_alerte:"VIGILANCE", type_deal:"transmission", source:"Bulletin Officiel", recommandation:"Fondateur 68 ans, pas de successeur identifié.", statut:"nouveau", created_at:new Date().toISOString(), signaux:["transmission_succession","gearing_eleve"] },
  { id:'6', entreprise:"Industrie Maghreb", secteur:"Industrie", score_final:54, niveau_alerte:"RADAR", type_deal:"levee_fonds", source:"OMPIC", recommandation:"Surveillance passive — capex récent important.", statut:"nouveau", created_at:new Date().toISOString(), signaux:["investissements_recents"] },
]

const DEMO_SIGNAUX = [
  { id:'1', source:"Conseil Concurrence", titre:"Autorisation concentration — Marjane acquiert réseau régional distribution", signal_type:"acquereur_actif_secteur", score_ia:82, url:"https://www.conseil-concurrence.ma", created_at:new Date(Date.now()-3600000).toISOString() },
  { id:'2', source:"Bulletin Officiel", titre:"Cession de parts — Atlas Distribution SA — 60% du capital", signal_type:"transmission_succession", score_ia:76, url:"https://www.bulletinofficiel.ma", created_at:new Date(Date.now()-7200000).toISOString() },
  { id:'3', source:"Médias24 RSS", titre:"Akdital lève 500 MDH pour expansion dans 6 nouvelles villes", signal_type:"besoin_cash_bfr", score_ia:71, url:"https://www.medias24.com", created_at:new Date(Date.now()-10800000).toISOString() },
  { id:'4', source:"L'Économiste RSS", titre:"Label'Vie : CA cherche successeur au PDG démissionnaire", signal_type:"changement_direction", score_ia:88, url:"https://www.leconomiste.com", created_at:new Date(Date.now()-14400000).toISOString() },
  { id:'5', source:"OMPIC", titre:"Industrie Maghreb SA — Augmentation de capital 30M MAD", signal_type:"besoin_cash_bfr", score_ia:58, url:"https://www.ompic.ma", created_at:new Date(Date.now()-18000000).toISOString() },
]

const DEMO_SECTEURS = [
  { secteur:"Santé", score_moyen:88, nb_cibles:9 },
  { secteur:"Distribution", score_moyen:82, nb_cibles:14 },
  { secteur:"Fintech", score_moyen:71, nb_cibles:7 },
  { secteur:"Logistique", score_moyen:65, nb_cibles:11 },
  { secteur:"Industrie", score_moyen:54, nb_cibles:22 },
  { secteur:"BTP", score_moyen:48, nb_cibles:31 },
  { secteur:"Agroalimentaire", score_moyen:42, nb_cibles:18 },
  { secteur:"Éducation", score_moyen:38, nb_cibles:6 },
]

function niveauColor(n){if(n==='CRITIQUE')return C.red;if(n==='VIGILANCE')return C.gold;if(n==='RADAR')return C.blue;return C.dim}
function scoreColor(s){if(s>=80)return C.red;if(s>=60)return C.gold;if(s>=40)return C.blue;return C.dim}
function dealInfo(t){const map={acquisition:{label:'Acquisition',color:C.red},cession:{label:'Cession',color:C.gold},levee_fonds:{label:'Levée de fonds',color:C.blue},pre_ipo:{label:'Pre-IPO',color:C.blue},transmission:{label:'Transmission',color:C.green},restructuring:{label:'Restructuring',color:C.purple}};return map[t]||{label:t||'N/A',color:C.dim}}
function signalEmoji(t){const map={transmission_succession:'👴',acquereur_actif_secteur:'🎯',desinvestissement_activite:'📤',besoin_cash_bfr:'💸',gearing_eleve:'📊',investissements_recents:'🏗️',changement_direction:'🔄',recrutement_profil_ma:'💼',expansion_geographique:'🗺️',consolidation_sectorielle:'🌍'};return map[t]||'📌'}
function ago(d){try{const h=Math.floor((Date.now()-new Date(d).getTime())/3600000);if(h<1)return"il y a moins d'1h";if(h<24)return`il y a ${h}h`;return`il y a ${Math.floor(h/24)}j`}catch{return''}}

function Pill({label,color,small}){return <span style={{display:'inline-flex',alignItems:'center',padding:small?'2px 7px':'3px 10px',borderRadius:4,background:`${color}18`,border:`1px solid ${color}40`,color,fontSize:small?10:11,fontFamily:'DM Mono,monospace',fontWeight:500,whiteSpace:'nowrap'}}>{label}</span>}

function Score({value,size=36}){const color=scoreColor(value);return(<div style={{width:size+16,height:size+16,borderRadius:'50%',border:`2px solid ${color}50`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:`${color}10`,flexShrink:0}}><div style={{fontFamily:'Playfair Display,serif',fontSize:size*0.6,fontWeight:700,color,lineHeight:1}}>{value}</div><div style={{fontFamily:'DM Mono,monospace',fontSize:7,color:`${color}90`,letterSpacing:'0.05em'}}>/100</div></div>)}

function Card({children,style={},onClick,hover=false}){const[hov,setHov]=useState(false);return(<div onClick={onClick} onMouseEnter={()=>hover&&setHov(true)} onMouseLeave={()=>hover&&setHov(false)} style={{background:hov?C.surface2:C.surface,border:`1px solid ${hov?C.gold+'40':C.border}`,borderRadius:12,transition:'all 0.2s',cursor:onClick?'pointer':'default',...style}}>{children}</div>)}

function SectionHeader({title,badge,action,onAction}){return(<div style={{padding:'16px 20px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}><div style={{display:'flex',alignItems:'center',gap:10}}><div style={{fontFamily:'Playfair Display,serif',fontSize:15,fontWeight:600}}>{title}</div>{badge&&<span style={{background:C.red,color:'#fff',fontFamily:'DM Mono,monospace',fontSize:9,padding:'2px 7px',borderRadius:10}}>{badge}</span>}</div>{action&&<button onClick={onAction} style={{background:'transparent',border:`1px solid ${C.border}`,color:C.dim,padding:'5px 12px',borderRadius:6,fontSize:11,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>{action}</button>}</div>)}

function SourceLink({url,titre,style={}}){
  const[hov,setHov]=useState(false)
  if(!url||url==='#')return <div style={{fontSize:12,color:C.text,lineHeight:1.4,...style}}>{titre}</div>
  return(
    <a href={url} target="_blank" rel="noopener noreferrer"
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{fontSize:12,color:hov?C.gold:C.text,lineHeight:1.4,textDecoration:'none',display:'block',transition:'color 0.15s',...style}}>
      {titre} <span style={{fontSize:10,opacity:0.6}}>↗</span>
    </a>
  )
}

// ─── CHATBOT ──────────────────────────────────────────────────────────────
const SUGGESTIONS=['Quelles sont mes opportunités critiques ?','Génère un mémo pour l\'opportunité la mieux scorée','Rédige un email d\'approche pour un fondateur en transmission','Compare les deux meilleures opportunités']

function buildSystem(opps,sigs){
  const top=(opps||[]).sort((a,b)=>b.score_final-a.score_final).slice(0,15).map(o=>`- ${o.entreprise} (${o.secteur}) | Score:${o.score_final} | Deal:${o.type_deal} | ${o.niveau_alerte} | Signaux:${(o.signaux||[]).join(',')} | ${o.recommandation||''}`).join('\n')
  const s2=(sigs||[]).slice(0,10).map(s=>`- [${s.source}] ${s.titre}`).join('\n')
  return `Tu es un assistant M&A senior spécialisé sur le marché marocain. Tu travailles pour une boutique M&A locale.
Tu as accès en temps réel aux données du M&A Radar Maroc.

OPPORTUNITÉS ACTIVES (top 15):
${top||'Aucune'}

SIGNAUX RÉCENTS:
${s2||'Aucun'}

THÈSE: PME et family businesses marocaines. Opérations: Pre-IPO, ouverture capital, partenaire stratégique, acquisition. Secteurs prioritaires: Distribution, Industrie, BTP.

Réponds en français. Sois direct et actionnable comme un banquier d'affaires senior. Pour les mémos et emails, utilise un format professionnel.`
}

async function askGemini(messages,opps,sigs){
  const system=buildSystem(opps,sigs)
  const contents=[
    {role:'user',parts:[{text:system+'\n\nBien compris.'}]},
    {role:'model',parts:[{text:'Compris, je suis prêt.'}]},
    ...messages.filter(m=>!m.loading).slice(-8).map(m=>({role:m.role==='user'?'user':'model',parts:[{text:m.content}]}))
  ]
  const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents,generationConfig:{maxOutputTokens:1500,temperature:0.7}})})
  if(!res.ok){const e=await res.json();throw new Error(e.error?.message||`Erreur Gemini ${res.status}`)}
  const data=await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text||''
}

function ChatMsg({msg}){
  const isUser=msg.role==='user'
  return(
    <div style={{display:'flex',justifyContent:isUser?'flex-end':'flex-start',marginBottom:12}}>
      {!isUser&&<div style={{width:28,height:28,borderRadius:'50%',background:`${C.gold}20`,border:`1px solid ${C.gold}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0,marginRight:8,marginTop:2}}>⚡</div>}
      <div style={{maxWidth:'80%',padding:'10px 14px',borderRadius:isUser?'14px 14px 4px 14px':'4px 14px 14px 14px',background:isUser?`${C.gold}18`:C.surface2,border:`1px solid ${isUser?C.gold+'30':C.border}`,fontSize:12,color:C.text,lineHeight:1.65,whiteSpace:'pre-wrap',fontFamily:'DM Sans,sans-serif'}}>
        {msg.loading?<div style={{display:'flex',gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:'50%',background:C.gold,animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}</div>:msg.content}
      </div>
    </div>
  )
}

function Chatbot({opps,sigs}){
  const[open,setOpen]=useState(false)
  const[msgs,setMsgs]=useState([{role:'assistant',content:`Bonjour ! J'ai accès à ${opps.length} opportunités et ${sigs.length} signaux.\n\nJe peux générer des mémos, rédiger des emails d'approche, analyser tes cibles ou comparer des opportunités. Comment puis-je t'aider ?`}])
  const[input,setInput]=useState('')
  const[loading,setLoading]=useState(false)
  const endRef=useRef(null)
  const inputRef=useRef(null)
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'})},[msgs])
  useEffect(()=>{if(open)setTimeout(()=>inputRef.current?.focus(),100)},[open])
  async function send(text){
    const content=text||input.trim()
    if(!content||loading)return
    setInput('')
    const userMsg={role:'user',content}
    setMsgs(prev=>[...prev,userMsg,{role:'assistant',content:'',loading:true}])
    setLoading(true)
    try{const reply=await askGemini([...msgs,userMsg],opps,sigs);setMsgs(prev=>[...prev.filter(m=>!m.loading),{role:'assistant',content:reply}])}
    catch(e){setMsgs(prev=>[...prev.filter(m=>!m.loading),{role:'assistant',content:`❌ ${e.message}\n\nVérifie ta clé Anthropic — ligne 13 de App.js.`}])}
    setLoading(false)
  }
  const critiques=opps.filter(o=>o.niveau_alerte==='CRITIQUE').length
  return(
    <>
      {open&&(
        <div style={{position:'fixed',bottom:90,right:24,zIndex:1000,width:400,height:580,background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,display:'flex',flexDirection:'column',boxShadow:`0 24px 80px rgba(0,0,0,0.6)`,overflow:'hidden'}}>
          <div style={{padding:'14px 18px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',background:C.surface2,flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:34,height:34,borderRadius:'50%',background:`${C.gold}20`,border:`1.5px solid ${C.gold}50`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>⚡</div>
              <div>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:14,fontWeight:600}}>Assistant M&A</div>
                <div style={{fontFamily:'DM Mono,monospace',fontSize:9,color:C.green,letterSpacing:'0.08em'}}>● {opps.length} opportunités · {sigs.length} signaux</div>
              </div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setMsgs([{role:'assistant',content:`Conversation réinitialisée. J'ai accès à ${opps.length} opportunités.`}])} style={{background:'transparent',border:`1px solid ${C.border}`,color:C.dim,padding:'4px 8px',borderRadius:6,fontSize:10,cursor:'pointer',fontFamily:'DM Mono,monospace'}}>Effacer</button>
              <button onClick={()=>setOpen(false)} style={{background:'transparent',border:'none',color:C.dim,cursor:'pointer',fontSize:20,lineHeight:1}}>×</button>
            </div>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'16px 14px',display:'flex',flexDirection:'column'}}>
            {msgs.map((m,i)=><ChatMsg key={i} msg={m}/>)}
            <div ref={endRef}/>
          </div>
          {msgs.length<=2&&(
            <div style={{padding:'0 14px 10px',display:'flex',flexWrap:'wrap',gap:6,flexShrink:0}}>
              {SUGGESTIONS.map((s,i)=><button key={i} onClick={()=>send(s)} style={{background:'transparent',border:`1px solid ${C.border}`,color:C.dim,padding:'5px 10px',borderRadius:20,fontSize:10,cursor:'pointer',fontFamily:'DM Sans,sans-serif',whiteSpace:'nowrap'}}>{s}</button>)}
            </div>
          )}
          <div style={{padding:'12px 14px',borderTop:`1px solid ${C.border}`,display:'flex',gap:8,alignItems:'flex-end',flexShrink:0}}>
            <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} placeholder="Pose une question ou demande un mémo..." rows={1} style={{flex:1,background:C.surface2,border:`1px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:12,fontFamily:'DM Sans,sans-serif',padding:'9px 12px',resize:'none',outline:'none',lineHeight:1.5,maxHeight:80,overflowY:'auto'}} onInput={e=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,80)+'px'}}/>
            <button onClick={()=>send()} disabled={loading||!input.trim()} style={{background:loading||!input.trim()?C.surface2:C.gold,color:loading||!input.trim()?C.dim:'#080b0f',border:'none',borderRadius:10,width:38,height:38,display:'flex',alignItems:'center',justifyContent:'center',cursor:loading||!input.trim()?'not-allowed':'pointer',fontSize:16,transition:'all 0.2s',flexShrink:0}}>
              {loading?'⋯':'↑'}
            </button>
          </div>
        </div>
      )}
      <div onClick={()=>setOpen(o=>!o)} style={{position:'fixed',bottom:24,right:24,zIndex:1000,width:56,height:56,background:open?C.surface2:`linear-gradient(135deg,${C.gold},#a87830)`,border:`1.5px solid ${open?C.border:C.gold}`,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:open?'none':`0 8px 32px ${C.gold}40`,transition:'all 0.3s',fontSize:22}}>
        {open?'×':'⚡'}
        {!open&&critiques>0&&<div style={{position:'absolute',top:-2,right:-2,width:20,height:20,borderRadius:'50%',background:C.red,border:`2px solid ${C.bg}`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'DM Mono,monospace',fontSize:9,fontWeight:600,color:'#fff'}}>{critiques}</div>}
      </div>
    </>
  )
}

// ─── VUES ─────────────────────────────────────────────────────────────────
function VueRadar({opps,signaux,kpis,secteurs,onSelectOpp,selectedOpp}){
  const[filtre,setFiltre]=useState('Tous')
  const[onglet,setOnglet]=useState('Score élevé')
  let oppsFiltrees=opps.filter(o=>filtre==='Tous'||o.niveau_alerte===filtre)
  if(onglet==='Contactés')oppsFiltrees=oppsFiltrees.filter(o=>o.statut==='contacte')
  return(
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
        {[{label:'Score Critique (≥80)',value:kpis.critiques,color:C.red,sub:'Action requise'},{label:'Nouveaux Signaux',value:kpis.signaux,color:C.gold,sub:'Depuis hier'},{label:'En Vigilance',value:kpis.vigilances,color:C.green,sub:'À surveiller'},{label:'Entreprises',value:kpis.total,color:C.blue,sub:'Couverture nationale'}].map(k=>(
          <Card key={k.label} style={{padding:20,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:0,left:'15%',right:'15%',height:2,background:`linear-gradient(90deg,transparent,${k.color},transparent)`}}/>
            <div style={{fontFamily:'DM Mono,monospace',fontSize:9,color:C.dim,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:10}}>{k.label}</div>
            <div style={{fontFamily:'Playfair Display,serif',fontSize:38,fontWeight:700,color:k.color,lineHeight:1}}>{k.value}</div>
            <div style={{fontFamily:'DM Mono,monospace',fontSize:10,color:C.dim,marginTop:6}}>{k.sub}</div>
          </Card>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:18}}>
        <div style={{display:'flex',flexDirection:'column',gap:18}}>
          <Card>
            <SectionHeader title="Opportunités Prioritaires" badge={kpis.critiques>0?kpis.critiques:null}/>
            <div style={{padding:'12px 20px',borderBottom:`1px solid ${C.border}`,display:'flex',gap:8}}>
              {['Tous','CRITIQUE','VIGILANCE','RADAR'].map(f=><button key={f} onClick={()=>setFiltre(f)} style={{background:filtre===f?`${C.gold}15`:'transparent',border:`1px solid ${filtre===f?C.gold+'50':C.border}`,color:filtre===f?C.gold:C.dim,padding:'5px 14px',borderRadius:6,fontSize:11,cursor:'pointer',fontFamily:'DM Sans,sans-serif',transition:'all 0.2s'}}>{f}</button>)}
            </div>
            <div style={{display:'flex',padding:'0 20px',borderBottom:`1px solid ${C.border}`}}>
              {['Score élevé','Récents','Contactés'].map(t=><div key={t} onClick={()=>setOnglet(t)} style={{padding:'11px 16px',fontSize:12,color:onglet===t?C.gold:C.dim,cursor:'pointer',borderBottom:onglet===t?`2px solid ${C.gold}`:'2px solid transparent',marginBottom:-1,transition:'all 0.2s'}}>{t}</div>)}
            </div>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['Entreprise','Score','Deal','Signal','Action'].map(h=><th key={h} style={{padding:'10px 20px',textAlign:'left',fontFamily:'DM Mono,monospace',fontSize:9,color:C.dim2,letterSpacing:'0.1em',textTransform:'uppercase',fontWeight:400}}>{h}</th>)}</tr></thead>
              <tbody>
                {oppsFiltrees.map(opp=>{
                  const deal=dealInfo(opp.type_deal);const isSel=selectedOpp?.id===opp.id
                  return(
                    <tr key={opp.id} onClick={()=>onSelectOpp(opp)} style={{borderTop:`1px solid ${C.border}`,cursor:'pointer',background:isSel?`${C.gold}08`:'transparent',transition:'background 0.15s'}} onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background=C.surface2}} onMouseLeave={e=>{if(!isSel)e.currentTarget.style.background='transparent'}}>
                      <td style={{padding:'14px 20px'}}><div style={{fontWeight:500,fontSize:13}}>{opp.entreprise}</div><div style={{fontFamily:'DM Mono,monospace',fontSize:10,color:C.dim,marginTop:2}}>{opp.secteur}</div></td>
                      <td style={{padding:'14px 20px'}}><div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:40,height:26,borderRadius:6,background:`${scoreColor(opp.score_final)}15`,border:`1px solid ${scoreColor(opp.score_final)}40`,fontFamily:'DM Mono,monospace',fontSize:12,fontWeight:600,color:scoreColor(opp.score_final)}}>{opp.score_final}</div></td>
                      <td style={{padding:'14px 20px'}}><Pill label={deal.label} color={deal.color} small/></td>
                      <td style={{padding:'14px 20px',fontFamily:'DM Mono,monospace',fontSize:10,color:C.dim}}>{signalEmoji((opp.signaux||[])[0])} {((opp.signaux||[])[0]||'').replace(/_/g,' ')}</td>
                      <td style={{padding:'14px 20px'}}><button style={{background:`${C.gold}12`,border:`1px solid ${C.gold}40`,color:C.gold,padding:'5px 12px',borderRadius:6,fontSize:11,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Mémo →</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>
          <Card>
            <SectionHeader title="Flux de Signaux Temps Réel"/>
            <div style={{maxHeight:260,overflowY:'auto'}}>
              {signaux.map((sig,i)=>(
                <div key={sig.id||i} style={{padding:'13px 20px',borderTop:`1px solid ${C.border}`,display:'flex',gap:12}}>
                  <div style={{width:34,height:34,borderRadius:8,background:`${C.gold}12`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{signalEmoji(sig.signal_type)}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <SourceLink url={sig.url} titre={sig.titre} style={{marginBottom:5,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}/>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <Pill label={sig.source} color={C.dim} small/>
                      <span style={{fontFamily:'DM Mono,monospace',fontSize:10,color:C.dim2}}>{ago(sig.created_at)}</span>
                      {sig.score_ia>0&&<span style={{fontFamily:'DM Mono,monospace',fontSize:10,color:C.gold,marginLeft:'auto'}}>+{sig.score_ia} pts</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {selectedOpp?(
            <Card>
              <SectionHeader title="Mémo d'Origination IA" action="✕ Fermer" onAction={()=>onSelectOpp(null)}/>
              <div style={{padding:20}}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:16}}>
                  <div><div style={{fontFamily:'Playfair Display,serif',fontSize:18,fontWeight:600}}>{selectedOpp.entreprise}</div><div style={{fontFamily:'DM Mono,monospace',fontSize:10,color:C.dim,marginTop:3}}>{selectedOpp.secteur?.toUpperCase()} · {selectedOpp.source}</div></div>
                  <Score value={selectedOpp.score_final} size={32}/>
                </div>
                <div style={{marginBottom:14}}><Pill label={selectedOpp.niveau_alerte} color={niveauColor(selectedOpp.niveau_alerte)}/></div>
                <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:16}}>
                  {(selectedOpp.signaux||[]).map((sig,i)=>(
                    <div key={i} style={{padding:'9px 12px',background:C.surface2,borderRadius:8,borderLeft:`2px solid ${i===0?C.red:i===1?C.gold:C.blue}`,display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:14}}>{signalEmoji(sig)}</span>
                      <div><div style={{fontFamily:'DM Mono,monospace',fontSize:8,color:C.dim,textTransform:'uppercase',letterSpacing:'0.08em'}}>Signal {i===0?'Critique':i===1?'Fort':'Modéré'}</div><div style={{fontSize:11,color:C.text,marginTop:2}}>{sig.replace(/_/g,' ')}</div></div>
                    </div>
                  ))}
                </div>
                {selectedOpp.recommandation&&<div style={{background:`${C.gold}08`,border:`1px solid ${C.gold}25`,borderRadius:8,padding:14,marginBottom:14}}><div style={{fontFamily:'DM Mono,monospace',fontSize:9,color:C.gold,letterSpacing:'0.1em',marginBottom:7}}>💡 RECOMMANDATION IA</div><div style={{fontSize:12,color:C.text,lineHeight:1.7}}>{selectedOpp.recommandation}</div></div>}
                <div style={{display:'flex',gap:8}}>
                  <button style={{flex:1,background:C.gold,color:'#080b0f',border:'none',padding:'10px',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>📞 Marquer contacté</button>
                  <button style={{flex:1,background:'transparent',color:C.dim,border:`1px solid ${C.border}`,padding:'10px',borderRadius:8,fontSize:12,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>📤 Exporter</button>
                </div>
              </div>
            </Card>
          ):(
            <Card style={{padding:40,textAlign:'center'}}>
              <div style={{fontSize:36,marginBottom:12}}>📋</div>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:15,marginBottom:8}}>Mémo d'Origination</div>
              <div style={{fontSize:12,color:C.dim,lineHeight:1.6}}>Clique sur une entreprise pour voir son mémo IA</div>
            </Card>
          )}
          <Card>
            <SectionHeader title="Chaleur Sectorielle"/>
            <div style={{padding:16,display:'flex',flexDirection:'column',gap:8}}>
              {secteurs.map((s,i)=>{const color=s.score_moyen>=80?C.red:s.score_moyen>=60?C.gold:s.score_moyen>=40?C.blue:C.dim;return(
                <div key={i} style={{background:`${color}08`,borderRadius:8,padding:'10px 12px',border:'1px solid transparent',transition:'border-color 0.2s',cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.borderColor=`${color}40`} onMouseLeave={e=>e.currentTarget.style.borderColor='transparent'}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{fontSize:12,fontWeight:500}}>{s.secteur}</span><div style={{display:'flex',gap:8,alignItems:'center'}}><span style={{fontFamily:'DM Mono,monospace',fontSize:10,color:C.dim}}>{s.nb_cibles} cibles</span><span style={{fontFamily:'DM Mono,monospace',fontSize:11,color,fontWeight:600}}>{s.score_moyen}</span></div></div>
                  <div style={{height:3,borderRadius:2,background:C.border,overflow:'hidden'}}><div style={{height:'100%',width:`${s.score_moyen}%`,background:color,borderRadius:2}}/></div>
                </div>
              )})}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function VueSignaux({signaux}){return(
  <div style={{display:'flex',flexDirection:'column',gap:16}}>
    <div style={{fontFamily:'Playfair Display,serif',fontSize:22,fontWeight:600}}>Flux de Signaux</div>
    <Card>
      {signaux.map((sig,i)=>(
        <div key={sig.id||i} style={{padding:'16px 20px',borderTop:i>0?`1px solid ${C.border}`:'none',display:'flex',gap:14}}>
          <div style={{width:40,height:40,borderRadius:10,background:`${C.gold}12`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{signalEmoji(sig.signal_type)}</div>
          <div style={{flex:1}}>
            <SourceLink url={sig.url} titre={sig.titre} style={{fontWeight:500,marginBottom:6,fontSize:13}}/>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <Pill label={sig.source} color={C.blue} small/>
              <Pill label={(sig.signal_type||'').replace(/_/g,' ')} color={C.dim} small/>
              <span style={{fontFamily:'DM Mono,monospace',fontSize:10,color:C.dim2}}>{ago(sig.created_at)}</span>
              {sig.score_ia>0&&<span style={{fontFamily:'DM Mono,monospace',fontSize:11,color:C.gold,marginLeft:'auto',fontWeight:600}}>+{sig.score_ia} pts</span>}
            </div>
          </div>
        </div>
      ))}
    </Card>
  </div>
)}

function VuePipeline({opps}){
  const colonnes=[{id:'nouveau',label:'🎯 Nouveau',color:C.blue},{id:'contacte',label:'📞 Contacté',color:C.gold},{id:'en_cours',label:'🤝 En cours',color:C.green},{id:'signe',label:'✅ Signé',color:C.green},{id:'perdu',label:'❌ Perdu',color:C.dim}]
  return(
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <div style={{fontFamily:'Playfair Display,serif',fontSize:22,fontWeight:600}}>Pipeline M&A</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12}}>
        {colonnes.map(col=>{const items=opps.filter(o=>(o.statut||'nouveau')===col.id);return(
          <div key={col.id}>
            <div style={{fontFamily:'DM Mono,monospace',fontSize:10,color:col.color,letterSpacing:'0.1em',marginBottom:10,display:'flex',justifyContent:'space-between'}}><span>{col.label}</span><span style={{background:`${col.color}20`,padding:'1px 6px',borderRadius:10}}>{items.length}</span></div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {items.map(opp=><Card key={opp.id} hover style={{padding:12}}><div style={{fontSize:12,fontWeight:500,marginBottom:6}}>{opp.entreprise}</div><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><Pill label={opp.secteur||'N/A'} color={C.dim} small/><span style={{fontFamily:'DM Mono,monospace',fontSize:11,color:scoreColor(opp.score_final),fontWeight:600}}>{opp.score_final}</span></div></Card>)}
              {items.length===0&&<div style={{border:`1px dashed ${C.border}`,borderRadius:8,padding:'20px 12px',textAlign:'center',color:C.dim2,fontSize:11,fontFamily:'DM Mono,monospace'}}>—</div>}
            </div>
          </div>
        )})}
      </div>
    </div>
  )
}

function VueSecteurs({secteurs,opps}){
  const[selected,setSelected]=useState(null)
  const oppsF=selected?opps.filter(o=>o.secteur===selected):[]
  return(
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <div style={{fontFamily:'Playfair Display,serif',fontSize:22,fontWeight:600}}>Analyse Sectorielle</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        {secteurs.map((s,i)=>{const color=s.score_moyen>=80?C.red:s.score_moyen>=60?C.gold:s.score_moyen>=40?C.blue:C.dim;const isSel=selected===s.secteur;return(
          <Card key={i} hover onClick={()=>setSelected(isSel?null:s.secteur)} style={{padding:16,border:`1px solid ${isSel?color+'60':C.border}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}><div style={{fontFamily:'Playfair Display,serif',fontSize:15,fontWeight:600}}>{s.secteur}</div><div style={{fontFamily:'Playfair Display,serif',fontSize:24,fontWeight:700,color}}>{s.score_moyen}</div></div>
            <div style={{height:4,borderRadius:2,background:C.border,marginBottom:10}}><div style={{height:'100%',width:`${s.score_moyen}%`,background:color,borderRadius:2}}/></div>
            <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontFamily:'DM Mono,monospace',fontSize:10,color:C.dim}}>{s.nb_cibles} cibles</span><Pill label={s.score_moyen>=80?'CHAUD':s.score_moyen>=60?'ACTIF':'CALME'} color={color} small/></div>
          </Card>
        )})}
      </div>
      {selected&&oppsF.length>0&&<Card><SectionHeader title={`Opportunités — ${selected}`}/>{oppsF.map((opp,i)=><div key={opp.id} style={{padding:'14px 20px',borderTop:i>0?`1px solid ${C.border}`:'none',display:'flex',alignItems:'center',gap:14}}><Score value={opp.score_final} size={28}/><div style={{flex:1}}><div style={{fontWeight:500,fontSize:13}}>{opp.entreprise}</div><div style={{fontFamily:'DM Mono,monospace',fontSize:10,color:C.dim,marginTop:2}}>{opp.source} · {ago(opp.created_at)}</div></div><Pill label={dealInfo(opp.type_deal).label} color={dealInfo(opp.type_deal).color}/><Pill label={opp.niveau_alerte} color={niveauColor(opp.niveau_alerte)}/></div>)}</Card>}
    </div>
  )
}

export default function App(){
  const[vue,setVue]=useState('radar')
  const[opps,setOpps]=useState(DEMO_OPPS)
  const[signaux,setSignaux]=useState(DEMO_SIGNAUX)
  const[secteurs]=useState(DEMO_SECTEURS)
  const[selectedOpp,setSelectedOpp]=useState(null)
  const[loading,setLoading]=useState(false)
  const[lastUpdate,setLastUpdate]=useState(new Date())
  const kpis={total:opps.length,critiques:opps.filter(o=>o.niveau_alerte==='CRITIQUE').length,vigilances:opps.filter(o=>o.niveau_alerte==='VIGILANCE').length,signaux:signaux.length}
  const charger=useCallback(async()=>{if(!sb)return;setLoading(true);try{const[r1,r2]=await Promise.all([sb.from('opportunites').select('*').order('score_final',{ascending:false}).limit(50),sb.from('signaux').select('*').order('created_at',{ascending:false}).limit(20)]);if(r1.data?.length)setOpps(r1.data);if(r2.data?.length)setSignaux(r2.data);setLastUpdate(new Date())}catch(e){console.error(e)};setLoading(false)},[])
  useEffect(()=>{charger()},[charger])
  useEffect(()=>{if(!sb)return;const ch=sb.channel('rt').on('postgres_changes',{event:'*',schema:'public',table:'opportunites'},charger).subscribe();return()=>sb.removeChannel(ch)},[charger])
  const navItems=[{id:'radar',icon:'◎',label:'Radar',badge:kpis.critiques>0?kpis.critiques:null},{id:'signaux',icon:'⬡',label:'Signaux',badge:kpis.signaux},{id:'pipeline',icon:'◷',label:'Pipeline',badge:null},{id:'secteurs',icon:'⊞',label:'Secteurs',badge:null}]
  const sources=[{label:'OMPIC',active:true},{label:'AMMC',active:true},{label:'Bulletin Officiel',active:true},{label:'Conseil Concurrence',active:true},{label:'Presse RSS',active:true},{label:'LinkedIn',active:false}]
  return(
    <div style={{background:C.bg,color:C.text,minHeight:'100vh',fontFamily:'DM Sans, sans-serif',fontWeight:300}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
      <header style={{background:'rgba(15,19,24,0.95)',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 28px',height:58,position:'sticky',top:0,zIndex:100,backdropFilter:'blur(12px)'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:30,height:30,border:`1.5px solid ${C.gold}`,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Playfair Display,serif',fontSize:14,color:C.gold}}>M</div>
          <div style={{fontFamily:'Playfair Display,serif',fontSize:16,letterSpacing:'0.02em'}}>M&A <span style={{color:C.gold}}>Radar</span> Maroc</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{display:'flex',alignItems:'center',gap:6,fontFamily:'DM Mono,monospace',fontSize:10,color:C.green}}><div style={{width:6,height:6,borderRadius:'50%',background:C.green}}/>SYSTÈME ACTIF</div>
          <span style={{fontFamily:'DM Mono,monospace',fontSize:10,color:C.dim}}>{lastUpdate.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</span>
          <button onClick={charger} disabled={loading} style={{background:'transparent',border:`1px solid ${C.border}`,color:C.dim,padding:'5px 12px',borderRadius:6,fontSize:11,cursor:'pointer'}}>{loading?'...':'↻ Rafraîchir'}</button>
        </div>
      </header>
      <div style={{display:'grid',gridTemplateColumns:'210px 1fr',minHeight:'calc(100vh - 58px)'}}>
        <aside style={{background:C.surface,borderRight:`1px solid ${C.border}`,padding:'20px 0',display:'flex',flexDirection:'column'}}>
          <div style={{padding:'0 12px',marginBottom:4}}>
            {navItems.map(item=><div key={item.id} onClick={()=>setVue(item.id)} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:8,cursor:'pointer',marginBottom:2,fontSize:13,color:vue===item.id?C.gold:C.dim,background:vue===item.id?`${C.gold}12`:'transparent',border:vue===item.id?`1px solid ${C.gold}25`:'1px solid transparent',transition:'all 0.2s'}}><span style={{fontSize:14}}>{item.icon}</span><span>{item.label}</span>{item.badge&&<span style={{marginLeft:'auto',background:C.red,color:'#fff',fontFamily:'DM Mono,monospace',fontSize:9,padding:'2px 6px',borderRadius:10}}>{item.badge}</span>}</div>)}
          </div>
          <div style={{height:1,background:C.border,margin:'12px 12px'}}/>
          <div style={{padding:'0 12px'}}>
            <div style={{fontFamily:'DM Mono,monospace',fontSize:9,color:C.dim2,letterSpacing:'0.1em',padding:'4px 12px',marginBottom:4}}>SOURCES</div>
            {sources.map(s=><div key={s.label} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 12px',fontSize:12,color:s.active?C.dim:C.dim2}}><div style={{width:6,height:6,borderRadius:'50%',background:s.active?C.green:C.dim2,flexShrink:0}}/>{s.label}{!s.active&&<span style={{marginLeft:'auto',fontFamily:'DM Mono,monospace',fontSize:8,color:C.dim2}}>bientôt</span>}</div>)}
          </div>
        </aside>
        <main style={{padding:28,overflowY:'auto',background:C.bg}}>
          <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:24}}>
            <div>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:26,fontWeight:600}}>{vue==='radar'&&"Radar d'Origination"}{vue==='signaux'&&'Flux de Signaux'}{vue==='pipeline'&&'Pipeline M&A'}{vue==='secteurs'&&'Analyse Sectorielle'}</div>
              <div style={{fontFamily:'DM Mono,monospace',fontSize:11,color:C.dim,marginTop:4}}>{opps.length} entreprises surveillées · Dernière analyse {ago(lastUpdate)}</div>
            </div>
            <button style={{background:C.gold,color:'#080b0f',border:'none',padding:'10px 20px',borderRadius:8,fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:600,cursor:'pointer'}}>+ Ajouter une cible</button>
          </div>
          {vue==='radar'&&<VueRadar opps={opps} signaux={signaux} kpis={kpis} secteurs={secteurs} onSelectOpp={setSelectedOpp} selectedOpp={selectedOpp}/>}
          {vue==='signaux'&&<VueSignaux signaux={signaux}/>}
          {vue==='pipeline'&&<VuePipeline opps={opps}/>}
          {vue==='secteurs'&&<VueSecteurs secteurs={secteurs} opps={opps}/>}
        </main>
      </div>
      <Chatbot opps={opps} sigs={signaux}/>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px;}@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  )
}
