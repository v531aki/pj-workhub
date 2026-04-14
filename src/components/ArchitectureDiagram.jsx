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
import ZoneNode    from './nodes/ZoneNode'
import './ArchitectureDiagram.css'

const nodeTypes = { workHub: WorkHubNode, zone: ZoneNode }

// ─────────────────────────────────────────────────────────────────────────────
//  3列ゾーン構成
//
//  ┌─────────────────────┐  ┌──────────────────────────────┐  ┌─────────────┐
//  │  ① ローカル管理      │  │  ② 全社管理リポジトリ         │  │  ③ 案件     │
//  │  ~/.pj-workhub/     │  │  mgmt-hub (GitHub)           │  │  リポジトリ  │
//  │                     │  │                              │  │  pj init    │
//  │  [local-ui]         │  │  [github-org]                │  │  [sf-a]     │
//  │  [local-config]     │  │  [mgmt-hub]                  │  │  [sf-b]     │
//  │                     │  │  [cli-tools] [mcp-server]    │  │  [newapp]   │
//  │                     │  │  [claude]                    │  │             │
//  └─────────────────────┘  └──────────────────────────────┘  └─────────────┘
//
//  x zones:  local=-185..195  |  company=210..710  |  projects=720..1000
// ─────────────────────────────────────────────────────────────────────────────

const initialNodes = [
  // ── ゾーン背景（zIndex: 0、コンテンツノードは zIndex: 1） ─────────────────
  {
    id: 'zone-local',
    type: 'zone',
    position: { x: -185, y: 10 },
    zIndex: 0,
    selectable: false,
    draggable: false,
    style: { width: 380, height: 460 },
    data: { variant: 'local', icon: '🖥️', label: 'ローカル管理  （Git管理外）' },
  },
  {
    id: 'zone-company',
    type: 'zone',
    position: { x: 210, y: 10 },
    zIndex: 0,
    selectable: false,
    draggable: false,
    style: { width: 505, height: 945 },
    data: {
      variant: 'company',
      icon: '🏢',
      label: '全社管理リポジトリ  （GitHub Org）',
      note: 'mgmt-hub に全社共通リソースを集約',
    },
  },
  {
    id: 'zone-projects',
    type: 'zone',
    position: { x: 725, y: 10 },
    zIndex: 0,
    selectable: false,
    draggable: false,
    style: { width: 278, height: 640 },
    data: {
      variant: 'projects',
      icon: '📁',
      label: '案件リポジトリ群',
      note: 'pj init で独立初期化',
    },
  },

  // ── ① ローカル管理ゾーン ──────────────────────────────────────────────────
  {
    id: 'local-ui',
    type: 'workHub',
    position: { x: -110, y: 55 },
    zIndex: 1,
    data: {
      variant: 'ui',
      icon: '💻',
      label: 'Local UI',
      subtitle: 'React + Vite  /  localhost:3000',
      items: [
        'ダッシュボード（複数PJ横断タスク）',
        '管理対象リポジトリを切り替え表示',
        '工数予実・スプリント管理',
        'ナレッジ・マニュアル参照',
      ],
    },
  },
  {
    id: 'local-config',
    type: 'workHub',
    position: { x: -110, y: 280 },
    zIndex: 1,
    data: {
      variant: 'local',
      icon: '⚙️',
      label: 'ローカル設定',
      subtitle: '~/.pj-workhub/  （Git管理外）',
      items: [
        '管理対象リポジトリ一覧を定義',
        'GitHub 認証情報',
        '個人・環境設定',
      ],
    },
  },

  // ── ② 全社管理リポジトリゾーン ───────────────────────────────────────────
  {
    id: 'github-org',
    type: 'workHub',
    position: { x: 260, y: 55 },
    zIndex: 1,
    data: {
      variant: 'github',
      icon: '🐙',
      label: 'GitHub Private Org',
      subtitle: '全リポジトリの親',
      items: [
        'mgmt-hub  （全社管理リポジトリ）',
        'project-*  （案件リポジトリ群）',
        'Issues & Projects v2',
      ],
    },
  },
  {
    id: 'mgmt-hub',
    type: 'workHub',
    position: { x: 260, y: 275 },
    zIndex: 1,
    data: {
      variant: 'repo-main',
      icon: '🏢',
      label: 'mgmt-hub',
      subtitle: '全社管理リポジトリ  ★',
      items: [
        '/members  （メンバー・組織情報）',
        '/manuals  （マニュアル・ルール）',
        '/knowledge  （ナレッジベース）',
        '/labels  （全社共通ラベル定義）',
        '全案件ロードマップの横断参照',
        '/cli  /mcp  （ツール群）',
      ],
    },
  },
  {
    id: 'cli-tools',
    type: 'workHub',
    position: { x: 260, y: 520 },
    zIndex: 1,
    data: {
      variant: 'cli',
      icon: '⌨️',
      label: 'CLI Tools',
      subtitle: 'Node.js  （mgmt-hub /cli）',
      items: [
        'pj init  （案件リポジトリを初期化）',
        'pj use <repo>  （管理対象を指定）',
        '朝会サポート・工数入力',
        '議事録 → Issue 自動生成',
      ],
    },
  },
  {
    id: 'mcp-server',
    type: 'workHub',
    position: { x: 465, y: 520 },
    zIndex: 1,
    data: {
      variant: 'mcp',
      icon: '🔌',
      label: 'MCP Server',
      subtitle: 'mgmt-hub /mcp',
      items: [
        '指定PJの Issue / Projects v2 操作',
        '複数リポジトリを横断してクエリ',
        'Claude への自然言語インターフェース',
      ],
    },
  },
  {
    id: 'claude',
    type: 'workHub',
    position: { x: 360, y: 760 },
    zIndex: 1,
    data: {
      variant: 'ai',
      icon: '🤖',
      label: 'Claude',
      subtitle: 'MCP 経由で接続',
      items: [
        'Claude Code（ターミナル）',
        'claude.ai（ブラウザ）',
        '自然言語で複数PJを横断管理',
      ],
    },
  },

  // ── ③ 案件リポジトリゾーン（pj init で独立初期化） ─────────────────────
  {
    id: 'project-sf-a',
    type: 'workHub',
    position: { x: 748, y: 55 },
    zIndex: 1,
    data: {
      variant: 'repo-project',
      icon: '📁',
      label: 'project-sf-a',
      subtitle: 'Salesforce導入 A社',
      items: [
        '.pj-workhub/config.yml  （pj init）',
        'Projects v2 ロードマップ（ガント）',
        'マイルストーン / スプリント',
        'Issues（タスク・バグ・依頼）',
      ],
    },
  },
  {
    id: 'project-sf-b',
    type: 'workHub',
    position: { x: 748, y: 260 },
    zIndex: 1,
    data: {
      variant: 'repo-project',
      icon: '📁',
      label: 'project-sf-b',
      subtitle: 'Salesforce導入 B社',
      items: [
        '.pj-workhub/config.yml  （pj init）',
        'Projects v2 ロードマップ（ガント）',
        'マイルストーン / スプリント',
        'Issues（タスク・バグ・依頼）',
      ],
    },
  },
  {
    id: 'project-newapp',
    type: 'workHub',
    position: { x: 748, y: 465 },
    zIndex: 1,
    data: {
      variant: 'repo-project',
      icon: '📁',
      label: 'project-newapp',
      subtitle: '新規アプリ開発',
      items: [
        '.pj-workhub/config.yml  （pj init）',
        'Projects v2 ロードマップ（ガント）',
        'マイルストーン / スプリント',
        'Issues（タスク・バグ・依頼）',
      ],
    },
  },
]

const ls = { fontSize: 10, fill: 'rgba(210,210,220,0.9)' }

const initialEdges = [
  // ローカル設定 → Local UI（管理対象リポジトリを設定して UI に反映）
  {
    id: 'localcfg-ui',
    source: 'local-config',
    sourceHandle: 'top-src',
    target: 'local-ui',
    targetHandle: 'bottom-tgt',
    type: 'smoothstep',
    label: '管理対象リポジトリを設定',
    style: { stroke: '#f0883e', strokeDasharray: '5 3' },
    labelStyle: ls,
    labelBgStyle: { fill: 'rgba(60,35,0,0.88)', rx: 4 },
    labelBgPadding: [5, 3],
  },

  // Local UI → GitHub Org（APIアクセス、zone-local → zone-company）
  {
    id: 'ui-github',
    source: 'local-ui',
    sourceHandle: 'right-src',
    target: 'github-org',
    targetHandle: 'left-tgt',
    type: 'smoothstep',
    animated: true,
    label: 'GitHub REST API / GraphQL',
    style: { stroke: '#5b9cf6', strokeWidth: 2 },
    labelStyle: ls,
    labelBgStyle: { fill: 'rgba(22,42,90,0.88)', rx: 4 },
    labelBgPadding: [5, 3],
  },

  // GitHub Org → mgmt-hub（全社管理リポジトリを収容）
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

  // GitHub Org → 各案件リポジトリ（収容、zone-company → zone-projects）
  {
    id: 'github-pja',
    source: 'github-org',
    sourceHandle: 'right-src',
    target: 'project-sf-a',
    targetHandle: 'left-tgt',
    type: 'smoothstep',
    label: 'contains',
    style: { stroke: '#3fb950' },
    labelStyle: ls,
    labelBgStyle: { fill: 'rgba(13,40,24,0.88)', rx: 4 },
    labelBgPadding: [5, 3],
  },
  {
    id: 'github-pjb',
    source: 'github-org',
    sourceHandle: 'right-src',
    target: 'project-sf-b',
    targetHandle: 'left-tgt',
    type: 'smoothstep',
    label: 'contains',
    style: { stroke: '#3fb950' },
    labelStyle: ls,
    labelBgStyle: { fill: 'rgba(13,40,24,0.88)', rx: 4 },
    labelBgPadding: [5, 3],
  },
  {
    id: 'github-pjnew',
    source: 'github-org',
    sourceHandle: 'right-src',
    target: 'project-newapp',
    targetHandle: 'left-tgt',
    type: 'smoothstep',
    label: 'contains',
    style: { stroke: '#3fb950' },
    labelStyle: ls,
    labelBgStyle: { fill: 'rgba(13,40,24,0.88)', rx: 4 },
    labelBgPadding: [5, 3],
  },

  // mgmt-hub → CLI Tools（/cli を収容）
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

  // mgmt-hub → 各案件リポジトリ（管理対象として指定、zone-company → zone-projects）
  {
    id: 'mgmt-pja',
    source: 'mgmt-hub',
    sourceHandle: 'right-src',
    target: 'project-sf-a',
    targetHandle: 'left-tgt',
    type: 'smoothstep',
    label: '管理',
    style: { stroke: '#c49ffd', strokeDasharray: '6 3' },
    labelStyle: ls,
    labelBgStyle: { fill: 'rgba(40,20,70,0.88)', rx: 4 },
    labelBgPadding: [5, 3],
  },
  {
    id: 'mgmt-pjb',
    source: 'mgmt-hub',
    sourceHandle: 'right-src',
    target: 'project-sf-b',
    targetHandle: 'left-tgt',
    type: 'smoothstep',
    label: '管理',
    style: { stroke: '#c49ffd', strokeDasharray: '6 3' },
    labelStyle: ls,
    labelBgStyle: { fill: 'rgba(40,20,70,0.88)', rx: 4 },
    labelBgPadding: [5, 3],
  },
  {
    id: 'mgmt-pjnew',
    source: 'mgmt-hub',
    sourceHandle: 'right-src',
    target: 'project-newapp',
    targetHandle: 'left-tgt',
    type: 'smoothstep',
    label: '管理',
    style: { stroke: '#c49ffd', strokeDasharray: '6 3' },
    labelStyle: ls,
    labelBgStyle: { fill: 'rgba(40,20,70,0.88)', rx: 4 },
    labelBgPadding: [5, 3],
  },

  // CLI Tools → GitHub Org（Issue CRUD / 朝会 / 議事録変換）左回り
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

  // CLI Tools → MCP Server（起動）
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

  // MCP Server → Claude（MCP Protocol）
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
  'zone-local':      'rgba(240,136,62,0.25)',
  'zone-company':    'rgba(88,166,255,0.2)',
  'zone-projects':   'rgba(63,185,80,0.2)',
  'local-config':    '#f0883e',
  'local-ui':        '#5b9cf6',
  'github-org':      '#484f58',
  'mgmt-hub':        '#58a6ff',
  'cli-tools':       '#e3b341',
  'mcp-server':      '#39d0d8',
  'claude':          '#c49ffd',
  'project-sf-a':    '#3fb950',
  'project-sf-b':    '#3fb950',
  'project-newapp':  '#3fb950',
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
        fitViewOptions={{ padding: 0.12 }}
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
