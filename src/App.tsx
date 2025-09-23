import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Search, Moon, Sun, GitBranch, Cpu, LayoutDashboard, Plus, Upload, Link2,
  SlidersHorizontal, ChevronDown, Headphones, BadgeDollarSign, Bug, Ticket,
  FileText, TrendingUp, Webhook as WebhookIcon, Activity, ArrowLeft, X
} from 'lucide-react'

import logo from './assets/logo-misalabs.png'

// MisaCores logos
import openaiLogo from './assets/openai-logo.png'
import deepseekLogo from './assets/deepseek-logo.png'
import anthropicLogo from './assets/anthropic-logo.png'
import ollamaLogo from './assets/ollama-logo.png'

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
// Deployments dashboard (right-hand tab)
const DEPLOY_DEMO_URL = 'http://107.21.91.141/index.html'
const BASE_WIDTH  = 1440
const BASE_HEIGHT = 1800

// Live demo to show AFTER "Deploy" on a flow
// 🔥 ADDED: webcrawler → local HTML under public/demos/
const LIVE_DEMOS: Record<string,string> = {
  'cust-support': 'http://ec2-98-88-50-46.compute-1.amazonaws.com:3001',
  'webcrawler': '/demos/openscholar-scientify-demo.html',
}

/* =========================
   Data
========================= */
const flowBlocks: Block[] = [
  {
    id: 'cust-support',
    name: 'AI Customer Service Assistant',
    Icon: Headphones,
    mockDiagram: ['User UI', 'Agent', 'Retriever', 'Vector DB', 'LLM'],
    tags: ['assistant', 'retrieval', 'nlp'],
    addedAt: 9,
  },
  {
    id: 'grant-recommender',
    name: 'Grant Recommender',
    Icon: BadgeDollarSign,
    mockDiagram: ['Intake', 'Scoring', 'Rerank', 'Report'],
    tags: ['recsys', 'analytics'],
    addedAt: 7,
  },
  {
    id: 'webcrawler',
    name: 'WebCrawler',
    Icon: Bug,
    mockDiagram: ['Crawler', 'Parser', 'Vector DB', 'Reranker', 'API'],
    tags: ['ingestion', 'retrieval'],
    addedAt: 10,
  },
  {
    id: 'ticketing',
    name: 'Ticketing System',
    Icon: Ticket,
    mockDiagram: ['Webhook', 'Classifier', 'Router', 'Knowledge Base'],
    tags: ['workflow', 'assistant'],
    addedAt: 6,
  },
  {
    id: 'doc-parser',
    name: 'Document Parser',
    Icon: FileText,
    mockDiagram: ['Upload', 'OCR', 'Chunker', 'Embedder', 'Index'],
    tags: ['ingestion', 'nlp'],
    addedAt: 8,
  },
  {
    id: 'lead-scoring',
    name: 'Lead Scoring',
    Icon: TrendingUp,
    mockDiagram: ['Events', 'Features', 'Model', 'Score', 'CRM'],
    tags: ['recsys', 'analytics'],
    addedAt: 5,
  },
  {
    id: 'webhook',
    name: 'Webhook',
    Icon: WebhookIcon,
    mockDiagram: ['Source', 'Validator', 'Transformer', 'Sink'],
    tags: ['ingestion', 'workflow'],
    addedAt: 4,
  },
  {
    id: 'sentiment',
    name: 'Sentiment Analysis',
    Icon: Activity,
    mockDiagram: ['Stream', 'Language ID', 'Sentiment', 'Dashboard'],
    tags: ['nlp', 'analytics'],
    addedAt: 3,
  },
]

// Cores
const coreItems: Core[] = [
  { name: 'Llama 4 chat',     logo: ollamaLogo },
  { name: 'Llama 3 instruct', logo: ollamaLogo },
  { name: 'OpenAI GPT-5',     logo: openaiLogo },
  { name: 'DeepSeek v3',      logo: deepseekLogo },
  { name: 'Anthropic',        logo: anthropicLogo, invertOnDark: true, large: true },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('flows')
  const [q, setQ] = useState('')
  const [dark, setDark] = useState(false)

  // selection & modals
  const [selectedFlow, setSelectedFlow] = useState<Block | null>(null)
  const [showDeployModal, setShowDeployModal] = useState(false)
  const [readmeContent, setReadmeContent] = useState<string | null>(null)
  const [codeContent, setCodeContent] = useState<string | null>(null)

  // Filter & sort
  const ALL_TAGS = useMemo(() => {
    const s = new Set<string>()
    flowBlocks.forEach(f => f.tags.forEach(t => s.add(t)))
    return Array.from(s).sort()
  }, [])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortKey, setSortKey] = useState<SortKey>('recent')
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  // Deploy tab iframe zoom/fit
  const [showDemo, setShowDemo] = useState(true)
  const [scale, setScale] = useState(0.85)
  const [zoomMode, setZoomMode] = useState<'manual'|'fit'|'fitW'|'fitH'>('manual')
  const viewportRef = useRef<HTMLDivElement>(null)

  // theme
  useEffect(() => {
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    setDark(prefersDark)
  }, [])
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  // close menus on outside click
  useEffect(() => {
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.menu') && !target.closest('.btnFilter')) setFilterOpen(false)
      if (!target.closest('.menu') && !target.closest('.btnSort')) setSortOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  // derived list
  const filteredAndSortedFlows = useMemo(() => {
    let list = flowBlocks
      .filter(b => b.name.toLowerCase().includes(q.toLowerCase()))
      .filter(b => selectedTags.every(t => b.tags.includes(t)))

    list = [...list].sort((a, b) => {
      if (sortKey === 'az') return a.name.localeCompare(b.name)
      if (sortKey === 'za') return b.name.localeCompare(a.name)
      return b.addedAt - a.addedAt
    })
    return list
  }, [q, selectedTags, sortKey])

  // deploy tab zoom/fit
  const recomputeScale = React.useCallback(() => {
    if (!viewportRef.current) return
    const vw = viewportRef.current.clientWidth
    const vh = viewportRef.current.clientHeight
    if (zoomMode === 'fit') {
      const s = Math.min(vw / BASE_WIDTH, vh / BASE_HEIGHT)
      setScale(+s.toFixed(2))
    } else if (zoomMode === 'fitW') {
      setScale(+(vw / BASE_WIDTH).toFixed(2))
    } else if (zoomMode === 'fitH') {
      setScale(+(vh / BASE_HEIGHT).toFixed(2))
    }
  }, [zoomMode])
  useEffect(() => {
    const onResize = () => recomputeScale()
    window.addEventListener('resize', onResize)
    recomputeScale()
    return () => window.removeEventListener('resize', onResize)
  }, [recomputeScale, showDemo, dark])

  const buildReadme = (flow: Block) => {
    const bullets = flow.mockDiagram.map(s => `- ${s}`).join('\n')
    return `# ${flow.name} — README (Mock)

This is a placeholder README for **${flow.name}**.
Replace with your installation, configuration and usage docs.

## Tags
${flow.tags.map(t => '- ' + t).join('\n')}

## Pipeline (mock)
${bullets}

## Quick Start (mock)
1. Install dependencies
2. Configure environment
3. Start the dev server
4. Run the demo`
  }

  const buildCode = (flow: Block) => {
    return `// ${flow.name} — mock code
type Step = (input: any) => any

const pipeline: Step[] = [
  ${flow.mockDiagram.map(s => `// ${s}`).join('\n  ')}
]

export function run(input: any) {
  return pipeline.reduce((acc, _step) => {
    return { ...acc, tick: (acc.tick || 0) + 1 }
  }, { tick: 0, input })
}

console.log('Running ${flow.name} (mock) ->', run({ foo: 'bar' }))`
  }

  /* ---------- Flows UI ---------- */
  function FlowGrid() {
    return (
      <>
        <div className="spread">
          <div className="row">
            <button className="btn primary" onClick={()=>alert('(Mock) New Flow')}>
              <Plus size={16}/> New Flow
            </button>
            <button className="btn" onClick={()=>alert('(Mock) Import')}>
              <Upload size={16}/> Import
            </button>
            <button className="btn" onClick={()=>alert('(Mock) Add to Flow')}>
              <Link2 size={16}/> Add to Flow
            </button>
          </div>

          <div className="row">
            {/* Filter button + menu */}
            <div className="menuWrap">
              <button className="btn btnFilter" onClick={()=>setFilterOpen(o=>!o)}>
                <SlidersHorizontal size={16}/> Filter
              </button>
              {filterOpen && (
                <div className="menu">
                  <div className="menuTitle">Filter by tags</div>
                  <div className="menuList">
                    {ALL_TAGS.map(tag => {
                      const active = selectedTags.includes(tag)
                      return (
                        <label key={tag} className="menuCheck">
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={(e)=> {
                              setSelectedTags(prev =>
                                e.target.checked ? [...prev, tag] : prev.filter(t=>t!==tag)
                              )
                            }}
                          />
                          <span>{tag}</span>
                        </label>
                      )
                    })}
                  </div>
                  <div className="menuFooter">
                    <button className="btn" onClick={()=>setSelectedTags([])}>Clear</button>
                    <button className="btn primary" onClick={()=>setFilterOpen(false)}>Apply</button>
                  </div>
                </div>
              )}
            </div>

            {/* Sort button + menu */}
            <div className="menuWrap">
              <button className="btn btnSort" onClick={()=>setSortOpen(o=>!o)}>
                Sort <ChevronDown size={16}/>
              </button>
              {sortOpen && (
                <div className="menu">
                  <div className="menuTitle">Sort by</div>
                  <div className="menuList">
                    {([
                      ['az','A → Z'],
                      ['za','Z → A'],
                      ['recent','Recently added'],
                    ] as [SortKey,string][]).map(([key,label])=>(
                      <button
                        key={key}
                        className={`menuItem ${sortKey===key ? 'active': ''}`}
                        onClick={()=>{ setSortKey(key); setSortOpen(false) }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {selectedTags.length>0 && (
          <div className="chipRow">
            {selectedTags.map(tag=>(
              <span key={tag} className="chip">
                {tag}
                <button className="chipX" onClick={()=>setSelectedTags(prev=>prev.filter(t=>t!==tag))}>
                  <X size={12}/>
                </button>
              </span>
            ))}
            <button className="btn btnTiny" onClick={()=>setSelectedTags([])}>Clear all</button>
          </div>
        )}

        <h2 className="h2">MisaFlow Building blocks</h2>

        <div className="grid">
          {filteredAndSortedFlows.map(({ id, name, Icon }) => (
            <div
              key={id}
              className="cardItem blockCard hoverable"
              onClick={() => setSelectedFlow(flowBlocks.find(f => f.id === id) || null)}
            >
              <div className="blockIcon"><Icon size={28} /></div>
              <div className="blockTitle">{name}</div>
            </div>
          ))}
          {filteredAndSortedFlows.length === 0 && <div className="muted">No blocks match your filters.</div>}
        </div>
      </>
    )
  }

  function FlowDetail({ flow }: { flow: Block }) {
    // ---- live embed after deploy (only for flows that have LIVE_DEMOS[flow.id]) ----
    const [livePhase, setLivePhase] = useState<'log'|'live'>('log')
    const liveViewportRef = useRef<HTMLDivElement>(null)
    const [liveScale, setLiveScale] = useState(0.9)
    const [zoomMode, setZoomMode] = useState<'manual'|'fit'|'fitW'|'fitH'>('manual')

    const LIVE_BASE_W = 1440
    const LIVE_BASE_H = 1000

    const recomputeLiveScale = React.useCallback(() => {
      if (!liveViewportRef.current) return
      const vw = liveViewportRef.current.clientWidth
      const vh = liveViewportRef.current.clientHeight
      if (zoomMode === 'fit') {
        const s = Math.min(vw / LIVE_BASE_W, vh / LIVE_BASE_H)
        setLiveScale(+s.toFixed(2))
      } else if (zoomMode === 'fitW') {
        setLiveScale(+(vw / LIVE_BASE_W).toFixed(2))
      } else if (zoomMode === 'fitH') {
        setLiveScale(+(vh / LIVE_BASE_H).toFixed(2))
      }
    }, [zoomMode])

    useEffect(() => {
      const onResize = () => recomputeLiveScale()
      window.addEventListener('resize', onResize)
      if (livePhase === 'live') recomputeLiveScale()
      return () => window.removeEventListener('resize', onResize)
    }, [recomputeLiveScale, livePhase])

    // when modal opens for this flow, auto-switch from log -> live
    useEffect(() => {
      if (showDeployModal && LIVE_DEMOS[flow.id]) {
        setLivePhase('log')
        const t = setTimeout(() => setLivePhase('live'), 1200)
        return () => clearTimeout(t)
      }
    }, [showDeployModal, flow.id])

    return (
      <>
        <div className="detailHeader">
          <button className="btn back-button" onClick={() => setSelectedFlow(null)}>
            <ArrowLeft size={16}/> Back
          </button>
          <h2 className="h2">MisaFlow: {flow.name}</h2>
          <div className="row">
            <button className="btn outline" onClick={() => setReadmeContent(buildReadme(flow))}>
              Readme
            </button>
            <button className="btn outline" onClick={() => setCodeContent(buildCode(flow))}>
              Code
            </button>
            <button className="btn primary" onClick={() => setShowDeployModal(true)}>Deploy</button>
          </div>
        </div>

        <div className="diagramCard">
          <div className="diagramTitle">Architecture Diagram</div>
          <div className="diagramCanvas">
            {flow.mockDiagram.map((n, i) => (
              <React.Fragment key={i}>
                <div className="node">{n}</div>
                {i < flow.mockDiagram.length - 1 && <div className="arrow">→</div>}
              </React.Fragment>
            ))}
          </div>
          <div className="muted" style={{marginTop:8}}>
            (Mock diagrams are auto-generated. Replace with real PNG/SVG when ready.)
          </div>
        </div>

        {/* Deploy modal with optional live embed */}
        {showDeployModal && (
          <div className="modal">
            <div className={`modalCard ${LIVE_DEMOS[flow.id] ? 'modalWide' : ''}`}>
              <div className="modalHeader">
                <div className="h3">Deploy: {flow.name}</div>
                <div className="row">
                  {LIVE_DEMOS[flow.id] && livePhase === 'live' && (
                    <a className="btn" href={LIVE_DEMOS[flow.id]} target="_blank" rel="noreferrer">
                      Open in new tab
                    </a>
                  )}
                  <button className="btn" onClick={() => { setShowDeployModal(false); setLivePhase('log'); }}>
                    Close
                  </button>
                </div>
              </div>

              {/* Without live demo → normal mock log */}
              {!LIVE_DEMOS[flow.id] && (
                <div className="deployLog">
                  <div>• Validating configuration for <b>{flow.name}</b>…</div>
                  <div>• Reserving resources…</div>
                  <div>• Loading model weights…</div>
                  <div>• Starting containers…</div>
                  <div className="ok">✓ Deployment complete (mock)</div>
                </div>
              )}

              {/* With live demo */}
              {LIVE_DEMOS[flow.id] && (
                <>
                  {livePhase === 'log' && (
                    <div className="deployLog">
                      <div>• Validating configuration for <b>{flow.name}</b>…</div>
                      <div>• Reserving resources…</div>
                      <div>• Loading model weights…</div>
                      <div>• Starting containers…</div>
                      <div className="ok">✓ Deployment complete (mock). Launching live demo…</div>
                    </div>
                  )}

                  {livePhase === 'live' && (
                    <>
                      <div className="embedHeader" style={{padding:'10px 14px'}}>
                        <div className="h3" style={{margin:0}}>Live Demo</div>
                        <div className="row">
                          <div className="zoomGroup">
                            <button className="btn" onClick={() => { setZoomMode('manual'); setLiveScale(s => Math.max(0.5, +(s - 0.1).toFixed(2))) }}>−</button>
                            <button className="btn" onClick={() => { setZoomMode('manual'); setLiveScale(0.9) }}>{Math.round(liveScale*100)}%</button>
                            <button className="btn" onClick={() => { setZoomMode('manual'); setLiveScale(s => Math.min(1.5, +(s + 0.1).toFixed(2))) }}>+</button>
                          </div>
                          <div className="zoomGroup">
                            <button className="btn" onClick={() => { setZoomMode('fit');  recomputeLiveScale() }}>Fit</button>
                            <button className="btn" onClick={() => { setZoomMode('fitW'); recomputeLiveScale() }}>Fit W</button>
                            <button className="btn" onClick={() => { setZoomMode('fitH'); recomputeLiveScale() }}>Fit H</button>
                          </div>
                        </div>
                      </div>

                      <div className="embedViewport modalViewport" ref={liveViewportRef}>
                        <div className="embedCanvas" style={{ ['--s' as any]: liveScale }}>
                          <iframe
                            className="embedFrame scaled"
                            src={LIVE_DEMOS[flow.id]}
                            title="Live Demo"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* README modal */}
        {readmeContent && (
          <div className="modal">
            <div className="modalCard">
              <div className="modalHeader">
                <div className="h3">README</div>
                <button className="btn" onClick={() => setReadmeContent(null)}>Close</button>
              </div>
              <div className="docWrap">
                <pre>{readmeContent}</pre>
              </div>
            </div>
          </div>
        )}

        {/* CODE modal */}
        {codeContent && (
          <div className="modal">
            <div className="modalCard">
              <div className="modalHeader">
                <div className="h3">Code Sample</div>
                <button className="btn" onClick={() => setCodeContent(null)}>Close</button>
              </div>
              <div className="docWrap">
                <pre>{codeContent}</pre>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

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

        {/* Layout */}
        <div className="layout">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="logo">
              <img src={logo} alt="misalabs" className="logo-img" />
            </div>
            <nav className="nav">
              <button className={tab==='flows' ? 'active' : ''} onClick={()=>{setTab('flows'); setSelectedFlow(null)}}>
                <GitBranch size={18}/> MisaFlows
              </button>
              <button className={tab==='cores' ? 'active' : ''} onClick={()=>setTab('cores')}>
                <Cpu size={18}/> MisaCores
              </button>
              <button className={tab==='deploy' ? 'active' : ''} onClick={()=>setTab('deploy')}>
                <LayoutDashboard size={18}/> Deployment Dashboard
              </button>
            </nav>
          </aside>

          {/* Main */}
          <main className="content">
            {tab === 'flows'   && (selectedFlow ? <FlowDetail flow={selectedFlow}/> : <FlowGrid/>)}

            {tab === 'cores'   && (
              <>
                <h2 className="h2">MisaCores</h2>
                <div className="grid">
                  {coreItems.map(({ name, logo, invertOnDark, large }) => (
                    <div
                      key={name}
                      className="cardItem blockCard hoverable"
                      onClick={() => alert(`(Mock) Selected core: ${name}`)}
                    >
                      <div className="blockIcon">
                        <img
                          src={logo}
                          alt={name}
                          className={`coreLogo ${invertOnDark ? 'invertOnDark' : ''} ${large ? 'large' : ''}`}
                        />
                      </div>
                      <div className="blockTitle">{name}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === 'deploy' && (
              <>
                <div className="spread">
                  <div className="row"><span className="badge">Demo for Red Hat</span></div>
                </div>

                <h2 className="h2">Deployments</h2>

                {/* Embedded demo: zoom + fit controls */}
                <div className="embedHeader">
                  <h3 className="h3">Live Demo</h3>
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
                    <button className="btn" onClick={() => setShowDemo(s => !s)}>
                      {showDemo ? 'Hide' : 'Show'}
                    </button>
                    <a className="btn" href={DEPLOY_DEMO_URL} target="_blank" rel="noreferrer">Open in new tab</a>
                  </div>
                </div>

                {showDemo && (
                  <div className="embedViewport" ref={viewportRef}>
                    <div className="embedCanvas" style={{ ['--s' as any]: scale }}>
                      <iframe
                        className="embedFrame scaled"
                        src={DEPLOY_DEMO_URL}
                        title="Embedded Demo"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      />
                    </div>
                  </div>
                )}

                <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
                  All actions are mocked. No backend involved.
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
