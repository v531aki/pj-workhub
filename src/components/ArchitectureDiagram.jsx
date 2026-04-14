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
import LayerNode from './nodes/LayerNode'
import ActorNode from './nodes/ActorNode'
import './ArchitectureDiagram.css'

const nodeTypes = {
  workHub: WorkHubNode,
  layer:   LayerNode,
  actor:   ActorNode,
}

// ─────────────────────────────────────────────────────────────
//  機能別 4 レイヤー構成
//
//  Layer 1: 👤 人(Aki) が操作する画面
//  Layer 2: 🤖 Claude の実行環境（ローカル or クラウド）
//  Layer 3: 🔧 自動化・連携ツール（Node.js, Aki のローカル）
//  Layer 4: 📦 データ保管層（GitHub Private Org）
//
//  Canvas 幅 1500px 基準
// ─────────────────────────────────────────────────────────────

const LAYER_W = 1500

// 各レイヤーの y 座標と高さ
const L1 = { y: 110, h: 240 } // 画面
const L2 = { y: 390, h: 220 } // Claude実行
const L3 = { y: 650, h: 260 } // ツール
const L4 = { y: 950, h: 280 } // データ

// ─────── レイヤー背景 ───────
const layerNodes = [
  {
    id: 'layer-1', type: 'layer',
    position: { x: 0, y: L1.y },
    style: { width: LAYER_W, height: L1.h, zIndex: -1 },
    draggable: false, selectable: false, focusable: false,
    data: {
      variant: 'human',
      icon: '👤',
      label: 'Layer 1 : 人(Aki) が操作する画面',
      description: 'ブラウザ / ターミナル で Aki が直接触る UI。ここが全ての入口。',
    },
  },
  {
    id: 'layer-2', type: 'layer',
    position: { x: 0, y: L2.y },
    style: { width: LAYER_W, height: L2.h, zIndex: -1 },
    draggable: false, selectable: false, focusable: false,
    data: {
      variant: 'ai',
      icon: '🤖',
      label: 'Layer 2 : Claude が動く場所',
      description: 'Claude Code は Aki のローカル PC 上で、claude.ai は Anthropic クラウド上で実行される。',
    },
  },
  {
    id: 'layer-3', type: 'layer',
    position: { x: 0, y: L3.y },
    style: { width: LAYER_W, height: L3.h, zIndex: -1 },
    draggable: false, selectable: false, focusable: false,
    data: {
      variant: 'tools',
      icon: '🔧',
      label: 'Layer 3 : 自動化・連携ツール(Aki のローカル PC)',
      description: 'Node.js 製。Claude / UI / 人 から呼ばれて GitHub とやり取りする。',
    },
  },
  {
    id: 'layer-4', type: 'layer',
    position: { x: 0, y: L4.y },
    style: { width: LAYER_W, height: L4.h, zIndex: -1 },
    draggable: false, selectable: false, focusable: false,
    data: {
      variant: 'data',
      icon: '📦',
      label: 'Layer 4 : データ保管層(GitHub Private Org)',
      description: 'タスク/議事録/ナレッジ/コード すべて GitHub に集約。サーバーレス。',
    },
  },
]

// ─────── 実体ノード ───────
const entityNodes = [
  // 👤 アクター（Aki）
  {
    id: 'aki', type: 'actor',
    position: { x: 60, y: 10 },
    draggable: false,
    data: { icon: '👤', label: 'Aki', subtitle: '(PM / 開発者)' },
  },

  // ── Layer 1: 画面 ──────────────────────────────────────────
  {
    id: 'ui-local',
    type: 'workHub',
    position: { x: 100, y: L1.y + 70 },
    data: {
      variant: 'screen',
      icon: '💻',
      label: 'Local UI',
      subtitle: 'ブラウザ  /  localhost:3000',
      items: [
        'ダッシュボード(横断タスク一覧)',
        'PJ 別ビュー / 工数予実',
        'マニュアル・ナレッジ参照',
      ],
    },
  },
  {
    id: 'ui-claude-code',
    type: 'workHub',
    position: { x: 560, y: L1.y + 70 },
    data: {
      variant: 'screen',
      icon: '⌨️',
      label: 'Claude Code',
      subtitle: 'ターミナル  /  `claude` コマンド',
      items: [
        '自然言語で Aki が Claude に指示',
        '朝会サポート / 議事録整理',
        'Issue 作成・更新の対話',
      ],
    },
  },
  {
    id: 'ui-claude-web',
    type: 'workHub',
    position: { x: 1020, y: L1.y + 70 },
    data: {
      variant: 'screen',
      icon: '🌐',
      label: 'claude.ai',
      subtitle: 'ブラウザ(Web チャット)',
      items: [
        '自然言語で Aki が Claude に指示',
        '出先・スマホから手軽に',
        '長文・要約・壁打ち用途',
      ],
    },
  },

  // ── Layer 2: Claude 実行環境 ──────────────────────────────
  {
    id: 'rt-claude-code',
    type: 'workHub',
    position: { x: 560, y: L2.y + 60 },
    data: {
      variant: 'runtime-local',
      icon: '🖥️',
      label: 'Claude Code エージェント',
      subtitle: 'Aki のローカル PC 上で動作',
      items: [
        'ローカル MCP(stdio)に直接接続',
        'ファイル / Git / Shell を操作',
        '※ ここが主戦場',
      ],
    },
  },
  {
    id: 'rt-claude-web',
    type: 'workHub',
    position: { x: 1020, y: L2.y + 60 },
    data: {
      variant: 'runtime-cloud',
      icon: '☁️',
      label: 'claude.ai エージェント',
      subtitle: 'Anthropic クラウド上で動作',
      items: [
        'ローカル MCP には直接届かない',
        'GitHub(リモート)経由でデータ参照',
        '補助的な用途',
      ],
    },
  },

  // ── Layer 3: ツール ───────────────────────────────────────
  {
    id: 'local-config',
    type: 'workHub',
    position: { x: 100, y: L3.y + 70 },
    data: {
      variant: 'local',
      icon: '⚙️',
      label: 'ローカル設定',
      subtitle: '~/.pj-workhub/ (Git 管理外)',
      items: [
        '管理対象リポジトリ一覧',
        'GitHub 認証情報',
        '個人・環境設定',
      ],
    },
  },
  {
    id: 'mcp-server',
    type: 'workHub',
    position: { x: 560, y: L3.y + 70 },
    data: {
      variant: 'mcp',
      icon: '🔌',
      label: 'MCP Server',
      subtitle: 'Node.js  /  mgmt-hub 由来',
      items: [
        'Claude の自然言語 → GitHub 操作',
        '複数 PJ 横断クエリ',
        'Issue / Projects v2 の CRUD',
      ],
    },
  },
  {
    id: 'cli-tools',
    type: 'workHub',
    position: { x: 1020, y: L3.y + 70 },
    data: {
      variant: 'cli',
      icon: '⌨️',
      label: 'CLI Tools',
      subtitle: 'Node.js  /  mgmt-hub 由来',
      items: [
        'pj init / pj use (PJ登録)',
        '朝会サポート・工数入力',
        '議事録 → Issue 自動生成',
      ],
    },
  },

  // ── Layer 4: データ(GitHub) ───────────────────────────────
  {
    id: 'mgmt-hub',
    type: 'workHub',
    position: { x: 80, y: L4.y + 80 },
    data: {
      variant: 'repo-main',
      icon: '🏢',
      label: 'mgmt-hub ★',
      subtitle: '全社管理リポジトリ',
      items: [
        '/members  /manuals  /knowledge',
        '/labels  (全社共通ラベル定義)',
        '/cli  /mcp  (ツールのソース)',
      ],
    },
  },
  {
    id: 'project-sf-a',
    type: 'workHub',
    position: { x: 460, y: L4.y + 80 },
    data: {
      variant: 'repo-project',
      icon: '📁',
      label: 'project-sf-a',
      subtitle: 'Salesforce 導入 A社',
      items: ['Issues / Projects v2', 'コード + タスク 同居'],
    },
  },
  {
    id: 'project-sf-b',
    type: 'workHub',
    position: { x: 790, y: L4.y + 80 },
    data: {
      variant: 'repo-project',
      icon: '📁',
      label: 'project-sf-b',
      subtitle: 'Salesforce 導入 B社',
      items: ['Issues / Projects v2', 'コード + タスク 同居'],
    },
  },
  {
    id: 'project-newapp',
    type: 'workHub',
    position: { x: 1120, y: L4.y + 80 },
    data: {
      variant: 'repo-project',
      icon: '📁',
      label: 'project-newapp',
      subtitle: '新規アプリ開発',
      items: ['Issues / Projects v2', 'コード + タスク 同居'],
    },
  },
]

// 背景レイヤー → 実体 の順で並べる(レイヤーが後ろに回る)
const initialNodes = [...layerNodes, ...entityNodes]

// ─────── スタイルヘルパー ───────
const ls = { fontSize: 10, fill: 'rgba(230,230,240,0.95)' }
const bg = (c) => ({ fill: c, rx: 4 })
const pad = [5, 3]

// ─────── エッジ ───────
const initialEdges = [
  // ── Aki から Layer 1 の各画面へ(操作) ───────────────────
  {
    id: 'aki-ui',
    source: 'aki', sourceHandle: 'bottom',
    target: 'ui-local', targetHandle: 'top',
    type: 'smoothstep',
    label: '操作',
    style: { stroke: '#f0883e', strokeWidth: 2 },
    labelStyle: ls, labelBgStyle: bg('rgba(60,35,0,0.9)'), labelBgPadding: pad,
  },
  {
    id: 'aki-cc',
    source: 'aki', sourceHandle: 'right-src',
    target: 'ui-claude-code', targetHandle: 'top',
    type: 'smoothstep',
    label: '自然言語で指示',
    style: { stroke: '#f0883e', strokeWidth: 2 },
    labelStyle: ls, labelBgStyle: bg('rgba(60,35,0,0.9)'), labelBgPadding: pad,
  },
  {
    id: 'aki-cw',
    source: 'aki', sourceHandle: 'right-src',
    target: 'ui-claude-web', targetHandle: 'top',
    type: 'smoothstep',
    label: '自然言語で指示',
    style: { stroke: '#f0883e', strokeWidth: 2 },
    labelStyle: ls, labelBgStyle: bg('rgba(60,35,0,0.9)'), labelBgPadding: pad,
  },

  // ── Layer 1 → Layer 2 (画面 → 実行環境) ─────────────────
  {
    id: 'cc-screen-runtime',
    source: 'ui-claude-code', sourceHandle: 'bottom',
    target: 'rt-claude-code', targetHandle: 'top',
    type: 'smoothstep',
    label: 'ローカルで起動',
    style: { stroke: '#c49ffd', strokeWidth: 2 },
    labelStyle: ls, labelBgStyle: bg('rgba(40,20,70,0.9)'), labelBgPadding: pad,
  },
  {
    id: 'cw-screen-runtime',
    source: 'ui-claude-web', sourceHandle: 'bottom',
    target: 'rt-claude-web', targetHandle: 'top',
    type: 'smoothstep',
    label: 'クラウドで起動',
    style: { stroke: '#9a7ff5', strokeWidth: 2, strokeDasharray: '5 3' },
    labelStyle: ls, labelBgStyle: bg('rgba(28,16,62,0.9)'), labelBgPadding: pad,
  },

  // ── Layer 1(UI) → Layer 3 (UIから直接ツール・設定を使う) ─
  {
    id: 'ui-config',
    source: 'ui-local', sourceHandle: 'bottom',
    target: 'local-config', targetHandle: 'top',
    type: 'smoothstep',
    label: '設定を読む',
    style: { stroke: '#f0883e', strokeDasharray: '5 3' },
    labelStyle: ls, labelBgStyle: bg('rgba(60,35,0,0.9)'), labelBgPadding: pad,
  },

  // ── Layer 2 → Layer 3 (Claude が MCP を呼ぶ) ─────────────
  {
    id: 'rtcc-mcp',
    source: 'rt-claude-code', sourceHandle: 'bottom',
    target: 'mcp-server', targetHandle: 'top',
    type: 'smoothstep',
    animated: true,
    label: 'MCP (stdio)',
    style: { stroke: '#39d0d8', strokeWidth: 2 },
    labelStyle: ls, labelBgStyle: bg('rgba(10,45,48,0.9)'), labelBgPadding: pad,
  },
  {
    id: 'rtcw-mcp',
    source: 'rt-claude-web', sourceHandle: 'bottom',
    target: 'mcp-server', targetHandle: 'top',
    type: 'smoothstep',
    animated: true,
    label: 'MCP (remote / 制限あり)',
    style: { stroke: '#39d0d8', strokeWidth: 1.5, strokeDasharray: '4 3' },
    labelStyle: ls, labelBgStyle: bg('rgba(10,45,48,0.9)'), labelBgPadding: pad,
  },

  // ── Layer 3 内部 (設定の参照) ────────────────────────────
  {
    id: 'mcp-config',
    source: 'mcp-server', sourceHandle: 'left-src',
    target: 'local-config', targetHandle: 'right-tgt',
    type: 'smoothstep',
    label: '設定を読む',
    style: { stroke: '#f0883e', strokeDasharray: '4 3' },
    labelStyle: ls, labelBgStyle: bg('rgba(60,35,0,0.9)'), labelBgPadding: pad,
  },
  {
    id: 'cli-config',
    source: 'cli-tools', sourceHandle: 'left-src',
    target: 'local-config', targetHandle: 'right-tgt',
    type: 'smoothstep',
    label: '設定を読む',
    style: { stroke: '#f0883e', strokeDasharray: '4 3' },
    labelStyle: ls, labelBgStyle: bg('rgba(60,35,0,0.9)'), labelBgPadding: pad,
  },

  // ── Layer 1(UI) → Layer 4 (UI は GitHub 直叩き) ──────────
  {
    id: 'ui-github',
    source: 'ui-local', sourceHandle: 'bottom',
    target: 'mgmt-hub', targetHandle: 'top',
    type: 'smoothstep',
    animated: true,
    label: 'GitHub REST / GraphQL',
    style: { stroke: '#5b9cf6', strokeWidth: 2 },
    labelStyle: ls, labelBgStyle: bg('rgba(22,42,90,0.9)'), labelBgPadding: pad,
  },

  // ── Layer 3 → Layer 4 (ツールが GitHub を操作) ───────────
  {
    id: 'mcp-github',
    source: 'mcp-server', sourceHandle: 'bottom',
    target: 'project-sf-a', targetHandle: 'top',
    type: 'smoothstep',
    animated: true,
    label: 'Issue / Projects v2 CRUD',
    style: { stroke: '#58a6ff', strokeWidth: 2 },
    labelStyle: ls, labelBgStyle: bg('rgba(13,31,62,0.9)'), labelBgPadding: pad,
  },
  {
    id: 'cli-github',
    source: 'cli-tools', sourceHandle: 'bottom',
    target: 'project-newapp', targetHandle: 'top',
    type: 'smoothstep',
    animated: true,
    label: '朝会 / 議事録変換',
    style: { stroke: '#e3b341', strokeWidth: 2, strokeDasharray: '6 3' },
    labelStyle: ls, labelBgStyle: bg('rgba(45,32,0,0.9)'), labelBgPadding: pad,
  },

  // ── Layer 4 内部: mgmt-hub → 各 PJ (管理関係) ────────────
  {
    id: 'mgmt-pja',
    source: 'mgmt-hub', sourceHandle: 'right-src',
    target: 'project-sf-a', targetHandle: 'left-tgt',
    type: 'smoothstep',
    label: '管理',
    style: { stroke: '#c49ffd', strokeDasharray: '6 3' },
    labelStyle: ls, labelBgStyle: bg('rgba(40,20,70,0.9)'), labelBgPadding: pad,
  },
  {
    id: 'mgmt-pjb',
    source: 'mgmt-hub', sourceHandle: 'right-src',
    target: 'project-sf-b', targetHandle: 'left-tgt',
    type: 'smoothstep',
    label: '管理',
    style: { stroke: '#c49ffd', strokeDasharray: '6 3' },
    labelStyle: ls, labelBgStyle: bg('rgba(40,20,70,0.9)'), labelBgPadding: pad,
  },
  {
    id: 'mgmt-pjnew',
    source: 'mgmt-hub', sourceHandle: 'right-src',
    target: 'project-newapp', targetHandle: 'left-tgt',
    type: 'smoothstep',
    label: '管理',
    style: { stroke: '#c49ffd', strokeDasharray: '6 3' },
    labelStyle: ls, labelBgStyle: bg('rgba(40,20,70,0.9)'), labelBgPadding: pad,
  },

  // ── mgmt-hub が /cli /mcp のソース(点線) ─────────────────
  {
    id: 'mgmt-hosts-mcp',
    source: 'mgmt-hub', sourceHandle: 'top-src',
    target: 'mcp-server', targetHandle: 'bottom-tgt',
    type: 'smoothstep',
    label: '/mcp をホスト',
    style: { stroke: '#58a6ff', strokeDasharray: '3 3', opacity: 0.7 },
    labelStyle: ls, labelBgStyle: bg('rgba(13,31,62,0.9)'), labelBgPadding: pad,
  },
  {
    id: 'mgmt-hosts-cli',
    source: 'mgmt-hub', sourceHandle: 'top-src',
    target: 'cli-tools', targetHandle: 'bottom-tgt',
    type: 'smoothstep',
    label: '/cli をホスト',
    style: { stroke: '#58a6ff', strokeDasharray: '3 3', opacity: 0.7 },
    labelStyle: ls, labelBgStyle: bg('rgba(13,31,62,0.9)'), labelBgPadding: pad,
  },
]

const miniMapColor = {
  'aki':             '#f0883e',
  'ui-local':        '#7fb4ff',
  'ui-claude-code':  '#7fb4ff',
  'ui-claude-web':   '#7fb4ff',
  'rt-claude-code':  '#c49ffd',
  'rt-claude-web':   '#9a7ff5',
  'local-config':    '#f0883e',
  'mcp-server':      '#39d0d8',
  'cli-tools':       '#e3b341',
  'mgmt-hub':        '#58a6ff',
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
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.2}
      >
        <Controls />
        <MiniMap
          nodeColor={(n) => miniMapColor[n.id] ?? '#555'}
          maskColor="rgba(15,15,22,0.72)"
        />
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#2a2a3a" />
      </ReactFlow>
    </div>
  )
}
