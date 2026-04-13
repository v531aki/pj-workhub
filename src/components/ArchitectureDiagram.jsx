import { useCallback } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import WorkHubNode from './nodes/WorkHubNode'
import './ArchitectureDiagram.css'

const nodeTypes = { workHub: WorkHubNode }

// ─────────────────────────────────────────────
//  Layout (x, y)
//
//           [local-ui]            y=40
//          [github-org]           y=250
//   [mgmt-hub] [project-repos]    y=460
//  [cli-tools] [mcp-server]       y=670
//           [claude]              y=890
//
//  Backwards edge: cli-tools --left--> github-org
//  goes around the left side of the canvas.
// ─────────────────────────────────────────────

const initialNodes = [
  {
    id: 'local-ui',
    type: 'workHub',
    position: { x: 370, y: 40 },
    data: {
      variant: 'ui',
      icon: '💻',
      label: 'Local UI',
      subtitle: 'React + Vite  /  localhost:3000',
      items: [
        'ダッシュボード（今日のタスク一覧）',
        'プロジェクト管理・工数予実',
        'チーム / メンバープロファイル',
        'ナレッジ・マニュアル管理',
      ],
    },
  },
  {
    id: 'github-org',
    type: 'workHub',
    position: { x: 290, y: 255 },
    data: {
      variant: 'github',
      icon: '🐙',
      label: 'GitHub Private Org',
      subtitle: 'データの中枢',
      items: [
        'Issues & Projects v2',
        'Markdown（議事録 / マニュアル）',
        'JSON マスターデータ',
      ],
    },
  },
  {
    id: 'mgmt-hub',
    type: 'workHub',
    position: { x: 60, y: 465 },
    data: {
      variant: 'repo-main',
      icon: '📦',
      label: 'mgmt-hub',
      subtitle: '中枢リポジトリ  ★',
      items: [
        '/app  （ローカルUI）',
        '/cli  （CLIツール群）',
        '/mcp  （MCP Server）',
        '/members  /manuals  /knowledge',
      ],
    },
  },
  {
    id: 'project-repos',
    type: 'workHub',
    position: { x: 540, y: 465 },
    data: {
      variant: 'repo',
      icon: '📦',
      label: 'project-* リポジトリ群',
      subtitle: '各プロジェクト',
      items: [
        'project-sf-a  （Salesforce導入 A社）',
        'project-sf-b  （Salesforce導入 B社）',
        'project-newapp  （新規アプリ）',
        'project-internal  （社内基盤）',
      ],
    },
  },
  {
    id: 'cli-tools',
    type: 'workHub',
    position: { x: 60, y: 680 },
    data: {
      variant: 'cli',
      icon: '⌨️',
      label: 'CLI Tools',
      subtitle: 'Node.js  （mgmt-hub /cli）',
      items: [
        '朝会サポート（今日のタスク取得 + AI要約）',
        '議事録 → Issue 自動生成',
        '工数入力',
        'ラベル一括作成',
      ],
    },
  },
  {
    id: 'mcp-server',
    type: 'workHub',
    position: { x: 540, y: 680 },
    data: {
      variant: 'mcp',
      icon: '🔌',
      label: 'MCP Server',
      subtitle: 'mgmt-hub /mcp',
      items: [
        'GitHub Issue 操作',
        'Projects v2 操作',
        'Claude への自然言語インターフェース',
      ],
    },
  },
  {
    id: 'claude',
    type: 'workHub',
    position: { x: 330, y: 905 },
    data: {
      variant: 'ai',
      icon: '🤖',
      label: 'Claude',
      subtitle: 'MCP 経由で接続',
      items: [
        'Claude Code（ターミナル）',
        'claude.ai（ブラウザ）',
        '自然言語でシステムを操作',
      ],
    },
  },
]

const ls = { fontSize: 10, fill: 'rgba(210,210,220,0.9)' }

const initialEdges = [
  // Local UI ↔ GitHub Org  (main data channel)
  {
    id: 'ui-github',
    source: 'local-ui',
    sourceHandle: 'bottom',
    target: 'github-org',
    targetHandle: 'top',
    type: 'smoothstep',
    animated: true,
    label: 'GitHub REST API / GraphQL',
    style: { stroke: '#5b9cf6', strokeWidth: 2 },
    labelStyle: ls,
    labelBgStyle: { fill: 'rgba(22,42,90,0.88)', rx: 4 },
    labelBgPadding: [5, 3],
  },
  // GitHub Org → mgmt-hub
  {
    id: 'github-mgmt',
    source: 'github-org',
    sourceHandle: 'bottom',
    target: 'mgmt-hub',
    targetHandle: 'top',
    type: 'smoothstep',
    label: 'contains',
    style: { stroke: '#58a6ff' },
    labelStyle: ls,
    labelBgStyle: { fill: 'rgba(13,31,62,0.88)', rx: 4 },
    labelBgPadding: [5, 3],
  },
  // GitHub Org → project-repos
  {
    id: 'github-projects',
    source: 'github-org',
    sourceHandle: 'bottom',
    target: 'project-repos',
    targetHandle: 'top',
    type: 'smoothstep',
    label: 'contains',
    style: { stroke: '#3fb950' },
    labelStyle: ls,
    labelBgStyle: { fill: 'rgba(13,40,24,0.88)', rx: 4 },
    labelBgPadding: [5, 3],
  },
  // mgmt-hub → cli-tools  (hosts)
  {
    id: 'mgmt-cli',
    source: 'mgmt-hub',
    sourceHandle: 'bottom',
    target: 'cli-tools',
    targetHandle: 'top',
    type: 'smoothstep',
    label: 'hosts  /cli',
    style: { stroke: '#58a6ff' },
    labelStyle: ls,
    labelBgStyle: { fill: 'rgba(13,31,62,0.88)', rx: 4 },
    labelBgPadding: [5, 3],
  },
  // CLI Tools → GitHub Org  (Issue CRUD / 朝会 / 議事録変換)
  // Routes around the left side of the diagram
  {
    id: 'cli-github',
    source: 'cli-tools',
    sourceHandle: 'left-src',
    target: 'github-org',
    targetHandle: 'left-tgt',
    type: 'smoothstep',
    animated: true,
    label: 'Issue CRUD  /  朝会  /  議事録変換',
    style: { stroke: '#e3b341', strokeWidth: 2, strokeDasharray: '6 3' },
    labelStyle: ls,
    labelBgStyle: { fill: 'rgba(45,32,0,0.88)', rx: 4 },
    labelBgPadding: [5, 3],
  },
  // CLI Tools → MCP Server  (runs)
  {
    id: 'cli-mcp',
    source: 'cli-tools',
    sourceHandle: 'right-src',
    target: 'mcp-server',
    targetHandle: 'left-tgt',
    type: 'smoothstep',
    label: 'runs',
    style: { stroke: '#e3b341' },
    labelStyle: ls,
    labelBgStyle: { fill: 'rgba(45,32,0,0.88)', rx: 4 },
    labelBgPadding: [5, 3],
  },
  // MCP Server → Claude  (MCP Protocol)
  {
    id: 'mcp-claude',
    source: 'mcp-server',
    sourceHandle: 'bottom',
    target: 'claude',
    targetHandle: 'top',
    type: 'smoothstep',
    animated: true,
    label: 'MCP Protocol',
    style: { stroke: '#39d0d8', strokeWidth: 2 },
    labelStyle: ls,
    labelBgStyle: { fill: 'rgba(10,45,48,0.88)', rx: 4 },
    labelBgPadding: [5, 3],
  },
]

const miniMapColor = {
  'local-ui':       '#5b9cf6',
  'github-org':     '#484f58',
  'mgmt-hub':       '#58a6ff',
  'project-repos':  '#3fb950',
  'cli-tools':      '#e3b341',
  'mcp-server':     '#39d0d8',
  'claude':         '#c49ffd',
}

export default function ArchitectureDiagram() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  )

  return (
    <div className="diagram-wrapper">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
      >
        <Controls />
        <MiniMap
          nodeColor={(n) => miniMapColor[n.id] ?? '#888'}
          maskColor="rgba(15,15,22,0.72)"
        />
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#2a2a3a" />
      </ReactFlow>
    </div>
  )
}
