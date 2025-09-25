import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Search, Moon, Sun, GitBranch, Cpu, LayoutDashboard, Plus, Upload, Link2,
  SlidersHorizontal, ChevronDown, Headphones, HeartPulse, Ticket, ListCheck, Sparkles, FileCog,
  FileText, TrendingUp, ArrowLeft, X,
  Bug, Activity, Webhook as WebhookIcon 
} from 'lucide-react'

import logo from './assets/logo-misalabs.png'

// logos
import openaiLogo from './assets/openai-logo.png'
import deepseekLogo from './assets/deepseek-logo.png'
import anthropicLogo from './assets/anthropic-logo.png'
import ollamaLogo from './assets/ollama-logo.png'
import metaLogo from './assets/meta-logo.png'
import mistralLogo from './assets/mistral-logo.png'
import agentLogo from './assets/agent-logo.png'
import ibmGraniteLogo from './assets/IBM-granite-logo.png'
import qwen3Logo from './assets/qwen3-logo.png'
import hfLogo from './assets/hf-logo.png'

// flow diagrams (PNG)
import webcrawlerFlowImg from './assets/webcrawler-flow.png'
import customerServiceFlowImg from './assets/customerservice-flow.png'

type Tab = 'flows' | 'cores' | 'deploy'
type SortKey = 'az' | 'za' | 'recent'

type Block = {
  id: string
  name: string
  Icon: React.ComponentType<{ size?: number }>
  mockDiagram: string[]
  tags: string[]
  addedAt: number
}

type Core = { name: string; logo: string; invertOnDark?: boolean; large?: boolean }

/* =========================
   External demo URLs
========================= */
const DEPLOY_DEMO_URL = 'http://107.21.91.141/index.html'
const BASE_WIDTH  = 1440
const BASE_HEIGHT = 1800

const LIVE_DEMOS: Record<string,string> = {
  'cust-support': 'http://ec2-98-88-50-46.compute-1.amazonaws.com:3001',
  'grant-generator': '/demos/openscholar-scientify-demo.html',
}

/* =========================
   Data
========================= */
const flowBlocks: Block[] = [
  { id:'grant-generator', name:'Grant Generator', Icon:Sparkles, mockDiagram:['Crawler','Parser','Vector DB','Reranker','API'], tags:['ingestion','retrieval'], addedAt:10 },
  { id:'cust-support', name:'AI Customer Service Assistant', Icon:Headphones, mockDiagram:['User UI','Agent','Retriever','Vector DB','LLM'], tags:['assistant','retrieval','nlp'], addedAt:9 },
  { id:'grant-recommender', name:'Grant Recommender', Icon:ListCheck, mockDiagram:['Intake','Scoring','Rerank','Report'], tags:['recsys','analytics'], addedAt:7 },
  { id:'ticketing', name:'Ticketing System', Icon:Ticket, mockDiagram:['Webhook','Classifier','Router','Knowledge Base'], tags:['workflow','assistant'], addedAt:6 },
  { id:'doc-parser', name:'Document Parser', Icon:FileCog,mockDiagram:['Upload','OCR','Chunker','Embedder','Index'],tags:['ingestion','nlp'], addedAt:14 },
  { id:'webcrawler', name:'WebCrawler', Icon:Bug,mockDiagram:['Crawler','Parser','Vector DB','Reranker','API'],tags:['ingestion','retrieval'], addedAt:15 },
  { id:'webhook', name:'Webhook', Icon:WebhookIcon,mockDiagram:['Source','Validator','Transformer','Sink'],tags:['ingestion','workflow'], addedAt:16 },
  { id:'sentiment', name:'Sentiment Analysis', Icon:Activity,mockDiagram:['Stream','Language ID','Sentiment','Dashboard'],tags:['nlp','analytics'], addedAt:17 },
  { id:'lead-scoring', name:'Lead Scoring', Icon:TrendingUp, mockDiagram:['Events','Features','Model','Score','CRM'],tags:['recsys','analytics'], addedAt:18 },
  // New flows
  { id:'financial-advisor', name:'Financial Advisor', Icon:TrendingUp, mockDiagram:['User Input','Advisor Agent','LLM','Recommendations'], tags:['assistant','finance'], addedAt:11 },
  { id:'financial-summarizer', name:'Financial Data Summarizer', Icon:FileText, mockDiagram:['Data Import','Summarizer','LLM','Summary Report'], tags:['analytics','finance'], addedAt:12 },
  { id:'fitness-advisor', name:'Fitness Advisor', Icon:HeartPulse, mockDiagram:['User Input','Plan Generator','Nutrition','Workout'], tags:['health','assistant'], addedAt:13 },
]

// ---- Cores split into two sections ----
const runnerCores: Core[] = [
  { name: 'Meta Llama 3 8B Instruct', logo: metaLogo },
  { name: 'Mistral 7B Instruct V0.2', logo: mistralLogo },
  { name: 'GPT-OSS 20B', logo: openaiLogo },
  { name: 'DeepSeek V3.1', logo: deepseekLogo },

  { name: 'IBM Granite', logo: ibmGraniteLogo },
  { name: 'Qwen3-Omni', logo: qwen3Logo },
  { name: 'HF Transformers', logo: hfLogo },
  { name: 'Whisper-large-v3', logo: openaiLogo }, // swap to Whisper logo if you add one
  { name: 'Mistral Small', logo: mistralLogo },

  { name: 'OpenAI GPT-5', logo: openaiLogo },
  { name: 'Llama 4 chat', logo: ollamaLogo },
  { name: 'Llama 3 instruct', logo: ollamaLogo },
  { name: 'Anthropic', logo: anthropicLogo, invertOnDark:true, large:true },
]

const agentCores: Core[] = [
  { name: 'WebCrawl Agent',        logo: agentLogo },
  { name: 'Customer Service Agent',logo: agentLogo },
]

// mock spec/bench (unchanged)
const BENCH = {
  specs: [
    { theme:'nvidia', badge:'NVIDIA A10',  label:'MisaLabs Optimized',
      kv:{'GPU Memory':'24 GB','Instance Type':'VM.GPU.A10.1','vCPUs':'15','RAM':'240 GB','FP16 TFLOPS':'31.2','Cost/hour':'$1.28'} },
    { theme:'amd',    badge:'AMD MI300X',  label:'MisaLabs Optimized',
      kv:{'GPU Memory':'192 GB','Instance Type':'BM.GPU.MI300X.8','vCPUs':'96','RAM':'2048 GB','FP16 TFLOPS':'1307.4','Cost/hour':'$8.50'} },
    { theme:'nvidia', badge:'NVIDIA A100', label:'MisaLabs Optimized',
      kv:{'GPU Memory':'40 GB','Instance Type':'BM.GPU.A100.4','vCPUs':'64','RAM':'1024 GB','FP16 TFLOPS':'312','Cost/hour':'$4.00'} },
  ],
  metrics: [
    { tint:'green', title:'NVIDIA A10 Performance',
      rows:{'First Token Latency':'245ms','Average Throughput':'42 tok/s','P99 Latency':'320ms','Concurrent Users':'8','Memory Bandwidth':'600 GB/s','Cost per 1M tokens':'$0.24'} },
    { tint:'red',   title:'AMD MI300X Performance',
      rows:{'First Token Latency':'52ms','Average Throughput':'284 tok/s','P99 Latency':'78ms','Concurrent Users':'64','Memory Bandwidth':'5.3 TB/s','Cost per 1M tokens':'$0.15'} },
    { tint:'blue',  title:'NVIDIA A100 Performance',
      rows:{'First Token Latency':'98ms','Average Throughput':'127 tok/s','P99 Latency':'145ms','Concurrent Users':'32','Memory Bandwidth':'1.6 TB/s','Cost per 1M tokens':'$0.18'} },
  ],
}

export default function App() {
  const [tab, setTab] = useState<Tab>('flows')
  const [q, setQ] = useState('')
  const [dark, setDark] = useState(false)

  const [selectedFlow, setSelectedFlow] = useState<Block | null>(null)
  const [showDeployModal, setShowDeployModal] = useState(false)
  const [readmeContent, setReadmeContent] = useState<string | null>(null)
  const [codeContent, setCodeContent] = useState<string | null>(null)

  // NEW: cores UX
  const [selectedCore, setSelectedCore] = useState<Core | null>(null)
  const [showAllRunners, setShowAllRunners] = useState(false) // controls “View More”

  // flows filter/sort
  const ALL_TAGS = useMemo(() => {
    const s = new Set<string>(); flowBlocks.forEach(f => f.tags.forEach(t => s.add(t))); return Array.from(s).sort()
  }, [])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortKey, setSortKey] = useState<SortKey>('recent')
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  // deploy iframe
  const [showDemo, setShowDemo] = useState(true)
  const [scale, setScale] = useState(0.85)
  const [zoomMode, setZoomMode] = useState<'manual'|'fit'|'fitW'|'fitH'>('manual')
  const viewportRef = useRef<HTMLDivElement>(null)

  // theme
  useEffect(() => { setDark(window.matchMedia?.('(prefers-color-scheme: dark)').matches) }, [])
  useEffect(() => { document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light') }, [dark])

  // close menus
  useEffect(() => {
    const close = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest('.menu') && !t.closest('.btnFilter')) setFilterOpen(false)
      if (!t.closest('.menu') && !t.closest('.btnSort')) setSortOpen(false)
    }
    document.addEventListener('click', close); return () => document.removeEventListener('click', close)
  }, [])

  // flows list derived
  const filteredAndSortedFlows = useMemo(() => {
    let list = flowBlocks
      .filter(b => b.name.toLowerCase().includes(q.toLowerCase()))
      .filter(b => selectedTags.every(t => b.tags.includes(t)))
    list = [...list].sort((a, b) => sortKey==='az'?a.name.localeCompare(b.name):sortKey==='za'?b.name.localeCompare(a.name):b.addedAt-a.addedAt)
    return list
  }, [q, selectedTags, sortKey])

  // deploy fit/zoom
  const recomputeScale = React.useCallback(() => {
    if (!viewportRef.current) return
    const vw = viewportRef.current.clientWidth, vh = viewportRef.current.clientHeight
    if (zoomMode === 'fit')  setScale(+Math.min(vw/BASE_WIDTH, vh/BASE_HEIGHT).toFixed(2))
    if (zoomMode === 'fitW') setScale(+(vw/BASE_WIDTH).toFixed(2))
    if (zoomMode === 'fitH') setScale(+(vh/BASE_HEIGHT).toFixed(2))
  }, [zoomMode])
  useEffect(() => { const onR=()=>recomputeScale(); window.addEventListener('resize', onR); recomputeScale(); return ()=>window.removeEventListener('resize', onR) }, [recomputeScale, showDemo, dark])

  // helpers (flows)
  const buildReadme = (flow: Block) => {
    const bullets = flow.mockDiagram.map(s => `- ${s}`).join('\n')
    return `# ${flow.name} — README 

This is a placeholder README for **${flow.name}**.
Replace with your installation, configuration and usage docs.

## Tags
${flow.tags.map(t => '- ' + t).join('\n')}

## Pipeline 
${bullets}

## Quick Start 
1. Install dependencies
2. Configure environment
3. Start the dev server
4. Run the demo`
  }
  const buildCode = (flow: Block) => `// ${flow.name} - code
type Step = (input: any) => any
const pipeline: Step[] = [
  ${flow.mockDiagram.map(s => `// ${s}`).join('\n  ')}
]
export function run(input: any) {
  return pipeline.reduce((acc, _step) => ({ ...acc, tick:(acc.tick||0)+1 }), { tick:0, input })
}
console.log('Running ${flow.name} (...) ->', run({ foo:'bar' }))`

  /* ---------- Flows UI ---------- */
  function FlowGrid() {
    return (
      <>
        <div className="spread">
          <div className="row">
            <button className="btn primary" onClick={()=>alert('New Flow')}><Plus size={16}/> New Flow</button>
            <button className="btn" onClick={()=>alert('Import')}><Upload size={16}/> Import</button>
            <button className="btn" onClick={()=>alert('Add to Flow')}><Link2 size={16}/> Add to Flow</button>
          </div>

          <div className="row">
            <div className="menuWrap">
              <button className="btn btnFilter" onClick={()=>setFilterOpen(o=>!o)}><SlidersHorizontal size={16}/> Filter</button>
              {filterOpen && (
                <div className="menu">
                  <div className="menuTitle">Filter by tags</div>
                  <div className="menuList">
                    {ALL_TAGS.map(tag => {
                      const active = selectedTags.includes(tag)
                      return (
                        <label key={tag} className="menuCheck">
                          <input type="checkbox" checked={active}
                            onChange={(e)=> setSelectedTags(prev => e.target.checked ? [...prev, tag] : prev.filter(t=>t!==tag))}/>
                          <span>{tag}</span>
                        </label>
                      )
                    })}
                  </div>
                  <div className="menuFooter">
                    <button className="btn" onClick={()=>setSelectedTags([])}>Clear All</button>
                  </div>
                </div>
              )}
            </div>

            <div className="menuWrap">
              <button className="btn btnSort" onClick={()=>setSortOpen(o=>!o)}>Sort <ChevronDown size={16}/></button>
              {sortOpen && (
                <div className="menu">
                  <div className="menuTitle">Sort by</div>
                  <div className="menuList">
                    {([['az','A → Z'],['za','Z → A'],['recent','Recently added']] as [SortKey,string][])
                      .map(([key,label])=>(
                        <button key={key} className={`menuItem ${sortKey===key?'active':''}`}
                          onClick={()=>{ setSortKey(key); setSortOpen(false) }}>{label}</button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedTags.length>0 && (
          <div className="chipRow">
            {selectedTags.map(tag=>(
              <span key={tag} className="chip">{tag}
                <button className="chipX" onClick={()=>setSelectedTags(prev=>prev.filter(t=>t!==tag))}><X size={12}/></button>
              </span>))}
            <button className="btn btnTiny" onClick={()=>setSelectedTags([])}>Clear all</button>
          </div>
        )}

        <h2 className="h2">MisaFlow Building blocks</h2>

        <div className="grid">
          {filteredAndSortedFlows.map(({ id, name, Icon }) => (
            <div key={id} className="cardItem blockCard hoverable"
                 onClick={() => setSelectedFlow(flowBlocks.find(f => f.id === id) || null)}>
              <div className="blockIcon"><Icon size={28} /></div>
              <div className="blockTitle">{name}</div>
            </div>
          ))}
          {filteredAndSortedFlows.length === 0 && <div className="muted">No blocks match your filters.</div>}
        </div>
      </>
    )
  }

  /* ---------- Flow detail (uses PNG for 2 flows) ---------- */
  function FlowDetail({ flow }: { flow: Block }) {
    const [livePhase, setLivePhase] = useState<'log'|'live'>('log')
    const liveViewportRef = useRef<HTMLDivElement>(null)
    const [liveScale, setLiveScale] = useState(0.9)
    const [zoomMode] = useState<'manual'|'fit'|'fitW'|'fitH'>('manual')
    const LIVE_BASE_W = 1440, LIVE_BASE_H = 1000

    const recomputeLiveScale = React.useCallback(() => {
      if (!liveViewportRef.current) return
      const vw = liveViewportRef.current.clientWidth, vh = liveViewportRef.current.clientHeight
      if (zoomMode==='fit')  setLiveScale(+Math.min(vw/LIVE_BASE_W, vh/LIVE_BASE_H).toFixed(2))
      if (zoomMode==='fitW') setLiveScale(+(vw/LIVE_BASE_W).toFixed(2))
      if (zoomMode==='fitH') setLiveScale(+(vh/LIVE_BASE_H).toFixed(2))
    }, [zoomMode])

    useEffect(() => { const onR=()=>recomputeLiveScale(); window.addEventListener('resize', onR); if (livePhase==='live') recomputeLiveScale(); return ()=>window.removeEventListener('resize', onR) }, [recomputeLiveScale, livePhase])

    useEffect(() => {
      if (showDeployModal && LIVE_DEMOS[flow.id]) {
        setLivePhase('log'); const t=setTimeout(()=>setLivePhase('live'), 1200); return ()=>clearTimeout(t)
      }
    }, [showDeployModal, flow.id])

    // ✅ FIX: use grant-generator id instead of webcrawler
    const isGrantGen   = flow.id === 'grant-generator'
    const isCustSupport = flow.id === 'cust-support'

    return (
      <>
        <div className="detailHeader">
          <button className="btn back-button" onClick={() => setSelectedFlow(null)}><ArrowLeft size={16}/> Back</button>
          <h2 className="h2">MisaFlow: {flow.name}</h2>
          <div className="row">
            <button className="btn outline" onClick={() => setReadmeContent(buildReadme(flow))}>Readme</button>
            <button className="btn outline" onClick={() => setCodeContent(buildCode(flow))}>Code</button>
            <button className="btn primary" onClick={() => setShowDeployModal(true)}>Deploy</button>
          </div>
        </div>

        {/* Diagram section */}
        <div className="diagramCard">
          <div className="diagramTitle">Architecture Diagram</div>
          {(isGrantGen || isCustSupport) ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="flowImgFrame">
                <img
                  className="flowImg"
                  src={isGrantGen ? webcrawlerFlowImg : customerServiceFlowImg}
                  alt={isGrantGen ? 'Grant Generator Flow' : 'Customer Service Flow'}
                />
              </div>
            </div>
          ) : (
            <div className="diagramCanvas">
              {flow.mockDiagram.map((n, i) => (
                <React.Fragment key={i}>
                  <div className="node">{n}</div>
                  {i < flow.mockDiagram.length - 1 && <div className="arrow">→</div>}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {showDeployModal && (
          <div className="modal">
            <div className={`modalCard ${LIVE_DEMOS[flow.id] ? 'modalWide' : ''}`}>
              <div className="modalHeader">
                <div className="h3">Deploy: {flow.name}</div>
                <div className="row">
                  {LIVE_DEMOS[flow.id] && livePhase==='live' && (
                    <a className="btn" href={LIVE_DEMOS[flow.id]} target="_blank" rel="noreferrer">Open in new tab</a>
                  )}
                  <button className="btn" onClick={() => setShowDeployModal(false)}>Close</button>
                </div>
              </div>

              {!LIVE_DEMOS[flow.id] && (
                <div className="deployLog">
                  <div>• Validating configuration for <b>{flow.name}</b>…</div>
                  <div>• Reserving resources…</div>
                  <div>• Loading model weights…</div>
                  <div>• Starting containers…</div>
                  <div className="ok">✓ Deployment complete </div>
                </div>
              )}

              {LIVE_DEMOS[flow.id] && (
                <>
                  {livePhase==='log' && (
                    <div className="deployLog">
                      <div>• Validating configuration for <b>{flow.name}</b>…</div>
                      <div>• Reserving resources…</div>
                      <div>• Loading model weights…</div>
                      <div>• Starting containers…</div>
                      <div className="ok">✓ Deployment complete. Launching …</div>
                    </div>
                  )}
                  {livePhase==='live' && (
                    <div className="embedViewport modalViewport" ref={liveViewportRef}>
                      <div className="embedCanvas" style={{ ['--s' as any]: liveScale}}>
                        <iframe className="embedFrame scaled" src={LIVE_DEMOS[flow.id]} title="Live Demo"
                                loading="lazy" referrerPolicy="no-referrer"
                                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"/>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {readmeContent && (
          <div className="modal"><div className="modalCard">
            <div className="modalHeader"><div className="h3">README</div>
              <button className="btn" onClick={() => setReadmeContent(null)}>Close</button></div>
            <div className="docWrap"><pre>{readmeContent}</pre></div>
          </div></div>
        )}

        {codeContent && (
          <div className="modal"><div className="modalCard">
            <div className="modalHeader"><div className="h3">Code Sample</div>
              <button className="btn" onClick={() => setCodeContent(null)}>Close</button></div>
            <div className="docWrap"><pre>{codeContent}</pre></div>
          </div></div>
        )}
      </>
    )
  }

  /* ---------- Model details ---------- */
  function ModelDetail({ core }: { core: Core }) {
    return (
      <div className="modelDetailWrap">
        <div className="detailHeader">
          <button className="btn back-button" onClick={() => setSelectedCore(null)}><ArrowLeft size={16}/> Back</button>
          <h2 className="h2">MisaCores</h2>
          <div className="row">
            <button className="btn primary" onClick={() => setTab('deploy')}>Go to Deployment Dashboard</button>
          </div>
        </div>

        <div className="modelTitleBar">
          <div className="logoBox"><img src={core.logo} alt="" /></div>
          <div className="titleText">{core.name}</div>
        </div>

        <div className="specGrid">
          {BENCH.specs.map((s, i) => (
            <div key={i} className="specCard">
              <div className="specTop">
                <div className={`chipSmall ${s.theme}`}>{s.badge}</div>
                <div className="miniBadge">{s.label}</div>
              </div>
              <div className="kv">
                {Object.entries(s.kv).map(([k,v]) => (
                  <div className="kvRow" key={k}><div className="k">{k}</div><div className="v">{v}</div></div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="benchTitleBar">Misa Meter Benchmark Results</div>

        <div className="metricGrid">
          {BENCH.metrics.map((m,i)=>(
            <div className="metricCard" key={i}>
              <div className="metricTitle"><span className={`dot ${m.tint}`}/> {m.title}</div>
              <div className="kv">
                {Object.entries(m.rows).map(([k,v])=>(
                  <div className="kvRow" key={k}><div className="k">{k}</div><div className="v">{v}</div></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ---------- UI ---------- */
  return (
    <div className="app">
      <div className="card">
        {/* Topbar */}
        <div className="topbar">
          <div className="search">
            <Search size={16} style={{ position:'absolute', left:8, top:8, opacity:.6 }}/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…" />
          </div>
          <button className="btn" onClick={()=>setDark(x=>!x)} aria-label="Toggle theme">
            {dark ? <Sun size={18}/> : <Moon size={18}/>}
          </button>
        </div>

        <div className="layout">
          <aside className="sidebar">
            <div className="logo"><img src={logo} alt="misalabs" className="logo-img" /></div>
            <nav className="nav">
              <button className={tab==='flows' ? 'active' : ''} onClick={()=>{setTab('flows'); setSelectedFlow(null); setSelectedCore(null)}}>
                <GitBranch size={18}/> MisaFlows
              </button>
              <button className={tab==='cores' ? 'active' : ''} onClick={()=>{setTab('cores'); setSelectedFlow(null)}}>
                <Cpu size={18}/> MisaCores
              </button>
              <button className={tab==='deploy' ? 'active' : ''} onClick={()=>{setTab('deploy'); setSelectedFlow(null); setSelectedCore(null)}}>
                <LayoutDashboard size={18}/> Deployment Dashboard
              </button>
            </nav>
          </aside>

          <main className="content">
            {tab === 'flows' && (selectedFlow ? <FlowDetail flow={selectedFlow}/> : <FlowGrid/>)}

            {tab === 'cores' && (
              <>
                {!selectedCore ? (
                  <>
                    <h2 className="h2">MisaCores</h2>

                    {/* Model Runner Microservices */}
                    <div className="sectionHeader">
                      <div className="sectionTitle">Model Runner Microservices</div>
                      <button className="btn pill outline" onClick={()=>setShowAllRunners(v=>!v)}>
                        {showAllRunners ? 'View Less' : 'View More'} <ChevronDown size={14} style={{ marginLeft: 4, transform: showAllRunners ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s' }}/>
                      </button>
                    </div>

                    <div className="grid">
                      {(showAllRunners ? runnerCores : runnerCores.slice(0,4)).map((c) => (
                        <div key={c.name} className="cardItem blockCard hoverable"
                             onClick={() => setSelectedCore(c)}>
                          <div className="blockIcon">
                            <img src={c.logo} alt={c.name}
                                 className={`coreLogo ${c.invertOnDark ? 'invertOnDark' : ''} ${c.large ? 'large' : ''}`} />
                          </div>
                          <div className="blockTitle">{c.name}</div>
                        </div>
                      ))}
                    </div>

                    {/* Agent Microservices */}
                    <div className="sectionHeader" style={{marginTop:18}}>
                      <div className="sectionTitle">Agent Microservices</div>
                    </div>

                    <div className="grid">
                      {agentCores.map(c => (
                        <div key={c.name} className="cardItem blockCard hoverable"
                             onClick={() => setTab('deploy')}>
                          <div className="blockIcon">
                            <img src={c.logo} alt={c.name} className="coreLogo"/>
                          </div>
                          <div className="blockTitle">{c.name}</div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <ModelDetail core={selectedCore}/>
                )}
              </>
            )}

            {tab === 'deploy' && (
              <>
                <div className="spread">
                  <div className="row"><span className="badge"></span></div>
                </div>

                <h2 className="h2">Deployments</h2>

                <div className="embedHeader">
                  <h3 className="h3"></h3>
                  <div className="row">
                    <div className="zoomGroup">
                      <button className="btn" onClick={() => { setZoomMode('manual'); setScale(s => Math.max(0.5, +(s - 0.1).toFixed(2))) }}>−</button>
                      <button className="btn" onClick={() => { setZoomMode('manual'); setScale(0.85) }}>{Math.round(scale * 100)}%</button>
                      <button className="btn" onClick={() => { setZoomMode('manual'); setScale(s => Math.min(1.5, +(s + 0.1).toFixed(2))) }}>+</button>
                    </div>
                    <div className="zoomGroup">
                      <button className="btn" onClick={() => { setZoomMode('fit');  recomputeScale() }}>Fit</button>
                      <button className="btn" onClick={() => { setZoomMode('fitW'); recomputeScale() }}>Fit W</button>
                      <button className="btn" onClick={() => { setZoomMode('fitH'); recomputeScale() }}>Fit H</button>
                    </div>
                    <button className="btn" onClick={() => setShowDemo(s => !s)}>{showDemo ? 'Hide' : 'Show'}</button>
                    <a className="btn" href={DEPLOY_DEMO_URL} target="_blank" rel="noreferrer">Open in new tab</a>
                  </div>
                </div>

                {showDemo && (
                  <div className="embedViewport" ref={viewportRef}>
                    <div className="embedCanvas" style={{ ['--s' as any]: scale }}>
                      <iframe className="embedFrame scaled" src={DEPLOY_DEMO_URL} title="Embedded Demo"
                              loading="lazy" referrerPolicy="no-referrer"
                              sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
                    </div>
                  </div>
                )}

                <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
