import React from 'react'

// ✅ Update these paths if your filenames differ
import agentLogo from './assets/agent-logo.png'
import uiIcon from './assets/icon-ui.png'
import embedIcon from './assets/icon-embedding.png'
import sqlIcon from './assets/icon-sql.png'
import hybridRetrieverIcon from './assets/icon-hybrid-retriever.png'

/**
 * Exact layout replica (orthogonal connectors):
 *
 *  UI (top center)
 *     │
 *  Deep Research Agent (center)
 *  ┌──┴───────────────┐
 *  │                  │
 * WebCrawl         Recommender
 *  Agent             Agent
 *    │                  │
 *  ┌─┴───┐          ┌───┴─┐
 *  │     └─→ Embedding ─→┘
 *            │
 *           SQL ──────────→ Hybrid Search Retriever
 *
 * - Uses theme tokens (var(--panel), --border, --text, --muted)
 * - No arrows (to match the reference), 2px lines, crisp corners
 */
export default function WebcrawlerDiagram() {
  const purple = '#5a3bd4' // ring color for the agent circles

  // Node positions (tuned to match your screenshot as closely as possible)
  const P = {
    ui: { x: 480, y: 60 },
    center: { x: 480, y: 190 },
    left: { x: 280, y: 330 },
    right: { x: 700, y: 330 },
    embed: { x: 520, y: 420 },
    sql: { x: 520, y: 520 },
    hybrid: { x: 800, y: 500 },
  }

  const R = {
    agent: 56,       // agent circle radius
    boxW: 132,       // rounded box width
    boxH: 90,        // rounded box height
    boxR: 14,        // box corner radius
  }

  return (
    <div className="diagramCard">
      <div className="diagramTitle">Architecture Diagram</div>

      <svg
        viewBox="0 0 960 640"
        width="100%"
        style={{ display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ---------- defs ---------- */}
        <defs>
          <filter id="drop" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(0,0,0,.25)" floodOpacity="0.35"/>
          </filter>
          <clipPath id="clipCircle">
            <circle cx="0" cy="0" r={R.agent - 8}/>
          </clipPath>
          <clipPath id="clipBox">
            <rect x={-R.boxW/2} y={-R.boxH/2} width={R.boxW} height={R.boxH} rx={R.boxR} ry={R.boxR}/>
          </clipPath>
        </defs>

        {/* ---------- local styles ---------- */}
        <style>{`
          .edge {
            stroke: var(--muted);
            stroke-width: 2;
            fill: none;
            shape-rendering: crispEdges;
          }
          .label {
            font: 600 14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
            fill: var(--text);
          }
          .labelCenter {
            font: 700 15px system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
            fill: var(--text);
          }
          .boxTitle {
            font: 600 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
            fill: var(--text);
            opacity: .95;
          }
        `}</style>

        {/* ---------- orthogonal connectors (no arrows) ---------- */}
        {/* UI down to center */}
        <path className="edge" d={`M ${P.ui.x} ${P.ui.y + R.boxH/2} L ${P.center.x} ${P.center.y - R.agent}`} />

        {/* Center to left (up-left elbow, then down to left circle top) */}
        <path className="edge" d={[
          `M ${P.center.x - R.agent} ${P.center.y}`,         // start at left side of center circle
          `L ${P.left.x - 40} ${P.center.y}`,                // go left horizontally
          `L ${P.left.x - 40} ${P.left.y - R.agent}`,        // go down to above left circle
          `L ${P.left.x} ${P.left.y - R.agent}`              // small right to circle top
        ].join(' ')} />

        {/* Center to right (up-right elbow, then down to right circle top) */}
        <path className="edge" d={[
          `M ${P.center.x + R.agent} ${P.center.y}`,
          `L ${P.right.x + 40} ${P.center.y}`,
          `L ${P.right.x + 40} ${P.right.y - R.agent}`,
          `L ${P.right.x} ${P.right.y - R.agent}`
        ].join(' ')} />

        {/* Left to embedding (down, right, down) */}
        <path className="edge" d={[
          `M ${P.left.x} ${P.left.y + R.agent}`,
          `L ${P.left.x} ${P.embed.y - R.boxH/2 - 20}`,
          `L ${P.embed.x - R.boxW/2 - 30} ${P.embed.y - R.boxH/2 - 20}`,
          `L ${P.embed.x - R.boxW/2 - 30} ${P.embed.y - R.boxH/2}`
        ].join(' ')} />

        {/* Center to embedding (down with elbow) */}
        <path className="edge" d={[
          `M ${P.center.x} ${P.center.y + R.agent}`,
          `L ${P.center.x} ${P.embed.y - 46}`,
          `L ${P.embed.x - R.boxW/2} ${P.embed.y - 46}`,
          `L ${P.embed.x - R.boxW/2} ${P.embed.y - R.boxH/2}`
        ].join(' ')} />

        {/* Embedding to SQL (straight down) */}
        <path className="edge" d={`M ${P.embed.x} ${P.embed.y + R.boxH/2} L ${P.sql.x} ${P.sql.y - R.boxH/2}`} />

        {/* SQL to Hybrid (right, up slightly, then right to box) */}
        <path className="edge" d={[
          `M ${P.sql.x + R.boxW/2} ${P.sql.y}`,
          `L ${P.hybrid.x - R.boxW/2 - 40} ${P.sql.y}`,
          `L ${P.hybrid.x - R.boxW/2 - 40} ${P.hybrid.y}`,
          `L ${P.hybrid.x - R.boxW/2} ${P.hybrid.y}`
        ].join(' ')} />

        {/* Right agent down to Hybrid (vertical) */}
        <path className="edge" d={`M ${P.right.x} ${P.right.y + R.agent} L ${P.hybrid.x} ${P.hybrid.y - R.boxH/2}`} />

        {/* ---------- nodes ---------- */}

        {/* UI box */}
        <g transform={`translate(${P.ui.x}, ${P.ui.y})`} filter="url(#drop)">
          <rect x={-R.boxW/2} y={-R.boxH/2} width={R.boxW} height={R.boxH} rx={R.boxR} ry={R.boxR}
                fill="var(--panel)" stroke="var(--border)"/>
          <image href={uiIcon} x={-24} y={-24} width="48" height="48"/>
          <text className="boxTitle" textAnchor="middle" x="0" y={R.boxH/2 + 18}>UI</text>
        </g>

        {/* Center agent (Deep Research Agent) */}
        <g transform={`translate(${P.center.x}, ${P.center.y})`} filter="url(#drop)">
          <circle r={R.agent} fill="rgba(90,59,212,.08)" stroke={purple} strokeWidth="3"/>
          <g clipPath="url(#clipCircle)">
            <image href={agentLogo} x={-R.agent + 8} y={-R.agent + 8} width={2*(R.agent-8)} height={2*(R.agent-8)}/>
          </g>
          <text className="labelCenter" textAnchor="middle" x="0" y={R.agent + 22}>Deep</text>
          <text className="labelCenter" textAnchor="middle" x="0" y={R.agent + 42}>Research</text>
          <text className="labelCenter" textAnchor="middle" x="0" y={R.agent + 62}>Agent</text>
        </g>

        {/* Left agent (label to the left) */}
        <g transform={`translate(${P.left.x}, ${P.left.y})`} filter="url(#drop)">
          <circle r={R.agent} fill="rgba(90,59,212,.08)" stroke={purple} strokeWidth="3"/>
          <g clipPath="url(#clipCircle)">
            <image href={agentLogo} x={-R.agent + 8} y={-R.agent + 8} width={2*(R.agent-8)} height={2*(R.agent-8)}/>
          </g>
        </g>
        <text className="label" textAnchor="end" x={P.left.x - R.agent - 14} y={P.left.y - 4}>WebCrawl</text>
        <text className="label" textAnchor="end" x={P.left.x - R.agent - 14} y={P.left.y + 16}>Agent</text>

        {/* Right agent (label to the right) */}
        <g transform={`translate(${P.right.x}, ${P.right.y})`} filter="url(#drop)">
          <circle r={R.agent} fill="rgba(90,59,212,.08)" stroke={purple} strokeWidth="3"/>
          <g clipPath="url(#clipCircle)">
            <image href={agentLogo} x={-R.agent + 8} y={-R.agent + 8} width={2*(R.agent-8)} height={2*(R.agent-8)}/>
          </g>
        </g>
        <text className="label" x={P.right.x + R.agent + 14} y={P.right.y - 4}>Recommender</text>
        <text className="label" x={P.right.x + R.agent + 14} y={P.right.y + 16}>Agent</text>

        {/* Embedding box */}
        <g transform={`translate(${P.embed.x}, ${P.embed.y})`} filter="url(#drop)">
          <rect x={-R.boxW/2} y={-R.boxH/2} width={R.boxW} height={R.boxH} rx={R.boxR} ry={R.boxR}
                fill="var(--panel)" stroke="var(--border)"/>
          <image href={embedIcon} x={-20} y={-22} width="40" height="44"/>
          <text className="boxTitle" textAnchor="middle" x="0" y={R.boxH/2 + 18}>Embedding</text>
        </g>

        {/* SQL box (rounded cylinder look via icon) */}
        <g transform={`translate(${P.sql.x}, ${P.sql.y})`} filter="url(#drop)">
          <rect x={-R.boxW/2} y={-R.boxH/2} width={R.boxW} height={R.boxH} rx={R.boxR+8} ry={R.boxR+8}
                fill="var(--panel)" stroke="var(--border)"/>
          <image href={sqlIcon} x={-22} y={-20} width="44" height="44"/>
          <text className="boxTitle" textAnchor="middle" x="0" y={R.boxH/2 + 18}>SQL</text>
        </g>

        {/* Hybrid Search Retriever box */}
        <g transform={`translate(${P.hybrid.x}, ${P.hybrid.y})`} filter="url(#drop)">
          <rect x={-R.boxW/2} y={-R.boxH/2} width={R.boxW} height={R.boxH} rx={R.boxR} ry={R.boxR}
                fill="var(--panel)" stroke="var(--border)"/>
          <image href={hybridRetrieverIcon} x={-24} y={-24} width="48" height="48"/>
          <text className="boxTitle" textAnchor="middle" x="0" y={R.boxH/2 + 18}>Hybrid Search</text>
          <text className="boxTitle" textAnchor="middle" x="0" y={R.boxH/2 + 34}>Retriever</text>
        </g>
      </svg>

      <div className="muted" style={{ marginTop: 8 }}>
        (Static mock — SVG scales crisply. Colors follow the current theme.)
      </div>
    </div>
  )
}
