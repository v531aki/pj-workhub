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

// ─────────────────────────────────────────────────────────────
//  3つの管理領域
//
//  ① ローカル管理  (橙)  ~/.pj-workhub/
//      管理対象リポジトリを指定・認証情報を保持
//
//  ② 全社管理リポジトリ  (青)  mgmt-hub
//      メンバー / マニュアル / ナレッジ / 全社ラベル
//      CLI Tools・MCP Server を収容
//
//  ③ 案件リポジトリ  (緑・破線)  project-*
//      各案件で独立して `pj init` 可能
//      mgmt-hub から管理対象として指定して横断管理できる
//
//  Layout (x, y):
//
//   [local-config]    [local-ui]                                    y=40/250
//                    [github-org]                                   y=250
//   [mgmt-hub]                      [project-sf-a]                 y=460/370
//   [cli-tools]  [mcp-server]       [project-sf-b]  [repo-config]  y=680/560/490
//                                   [project-newapp]               y=750
//                [claude]                                           y=920
// ─────────────────────────────────────────────────────────────

const initialNodes = [
  // ── ① ローカル管理 ──────────────────────────────────────────
  {
    id: 'local-config',
    type: 'workHub',
    position: { x: -140, y: 250 },
    data: {
      variant: 'local',
      icon: '⚙️',
      label: 'ローカル設定',
      subtitle: '~/.pj-workhub/  （マシンローカル / Git管理外）',
      items: [
        '管理対象リポジトリ一覧を定義',
        'GitHub 認証情報（PAT等）',
        '個人・環境設定',
      ],
    },
  },
  {
    id: 'local-ui',
    type: 'workHub',
    position: { x: 330, y: 40 },
    data: {
      variant: 'ui',
      icon: '💻',
      label: 'Local UI',
      subtitle: 'React + Vite  /  localhost:3000',
      items: [
        'ダッシュボード（複数PJ横断タスク一覧）',
        '管理対象リポジトリを切り替え表示',
        '工数予実・スプリント管理',
        'ナレッジ・マニュアル参照',
      ],
    },
  },

  // ── ② 全社管理 ──────────────────────────────────────────────
  {
    id: 'github-org',
    type: 'workHub',
    position: { x: 300, y: 250 },
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
    position: { x: 60, y: 460 },
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
        '/cli  /mcp  （ツール群）',
      ],
    },
  },
  {
    id: 'cli-tools',
    type: 'workHub',
    position: { x: 60, y: 690 },
    data: {
      variant: 'cli',
      icon: '⌨️',
      label: 'CLI Tools',
      subtitle: 'Node.js  （mgmt-hub /cli）',
      items: [
        'pj init  （各PJフォルダ内で実行）',
        'pj use <repo>  （ローカル設定に登録）',
        '朝会サポート・工数入力',
        '議事録 → Issue 自動生成',
      ],
    },
  },
  {
    id: 'mcp-server',
    type: 'workHub',
    position: { x: 390, y: 690 },
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
    position: { x: 300, y: 930 },
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

  // ── ③ 案件リポジトリ（独立 init 可能） ─────────────────────
  {
    id: 'project-sf-a',
    type: 'workHub',
    position: { x: 660, y: 370 },
    data: {
      variant: 'repo-project',
      icon: '📁',
      label: 'project-sf-a',
      subtitle: 'Salesforce導入 A社  ｜  pj init 済み',
      items: [
        'Issues / Projects v2',
        'SFDXソース / コード',
        'ブランチ・PR管理',
      ],
    },
  },
  {
    id: 'project-sf-b',
    type: 'workHub',
    position: { x: 660, y: 560 },
    data: {
      variant: 'repo-project',
      icon: '📁',
      label: 'project-sf-b',
      subtitle: 'Salesforce導入 B社  ｜  pj init 済み',
      items: [
        'Issues / Projects v2',
        'SFDXソース / コード',
        'ブランチ・PR管理',
      ],
    },
  },
  {
    id: 'project-newapp',
    type: 'workHub',
    position: { x: 660, y: 750 },
    data: {
      variant: 'repo-project',
      icon: '📁',
      label: 'project-newapp',
      subtitle: '新規アプリ開発  ｜  pj init 済み',
      items: [
        'Issues / Projects v2',
        'アプリコード',
        'ブランチ・PR管理',
      ],
    },
  },

  // ── リポジトリ設定（案件リポジトリにコミットされる設定） ──────
  {
    id: 'repo-config',
    type: 'workHub',
    position: { x: 960, y: 490 },
    data: {
      variant: 'repo-cfg',
      icon: '📋',
      label: 'リポジトリ設定',
      subtitle: '.pj-workhub/config.yml  （pj init で生成・Git管理）',
      items: [
        'PJフォルダ内で pj init を実行して生成',
        'ブランチ戦略・スプリント設定',
        'Issueラベル・マイルストーン定義',
        'プロジェクト固有ルール',
      ],
    },
  },
]

const ls = { fontSize: 10, fill: 'rgba(210,210,220,0.9)' }

const initialEdges = [
  // ローカル設定 → Local UI（管理対象を設定）
  {
    id: 'localcfg-ui',
    source: 'local-config',
    sourceHandle: 'right-src',
    target: 'local-ui',
    targetHandle: 'left-tgt',
    type: 'smoothstep',
    label: '管理対象リポジトリを設定',
    style: { stroke: '#f0883e', strokeDasharray: '5 3' },
    labelStyle: ls,
    labelBgStyle: { fill: 'rgba(60,35,0,0.88)', rx: 4 },
    labelBgPadding: [5, 3],
  },

  // Local UI → GitHub Org（APIアクセス）
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

  // GitHub Org → 各案件リポジトリ（収容）
  {
    id: 'github-pja',
    source: 'github-org',
    sourceHandle: 'right-src',
    target: 'project-sf-a',
    targetHandle: 'top',
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
    targetHandle: 'top',
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
    targetHandle: 'top',
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

  // mgmt-hub → 各案件リポジトリ（管理対象として指定）
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

  // CLI Tools → GitHub Org（Issue CRUD / 朝会 / 議事録変換）
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

  // CLI Tools → リポジトリ設定（pj init で生成）
  {
    id: 'cli-repocfg',
    source: 'cli-tools',
    sourceHandle: 'right-src',
    target: 'repo-config',
    targetHandle: 'bottom-tgt',
    type: 'smoothstep',
    label: 'pj init（PJフォルダ内で実行）',
    style: { stroke: '#e3b341', strokeDasharray: '5 3' },
    labelStyle: ls,
    labelBgStyle: { fill: 'rgba(45,32,0,0.88)', rx: 4 },
    labelBgPadding: [5, 3],
  },

  // 案件リポジトリ → リポジトリ設定（config.yml を保持）
  {
    id: 'pja-repocfg',
    source: 'project-sf-a',
    sourceHandle: 'right-src',
    target: 'repo-config',
    targetHandle: 'left-tgt',
    type: 'smoothstep',
    label: '設定を保持',
    style: { stroke: '#56d364', strokeDasharray: '5 3' },
    labelStyle: ls,
    labelBgStyle: { fill: 'rgba(10,34,21,0.88)', rx: 4 },
    labelBgPadding: [5, 3],
  },
  {
    id: 'pjb-repocfg',
    source: 'project-sf-b',
    sourceHandle: 'right-src',
    target: 'repo-config',
    targetHandle: 'left-tgt',
    type: 'smoothstep',
    label: '設定を保持',
    style: { stroke: '#56d364', strokeDasharray: '5 3' },
    labelStyle: ls,
    labelBgStyle: { fill: 'rgba(10,34,21,0.88)', rx: 4 },
    labelBgPadding: [5, 3],
  },
  {
    id: 'pjnew-repocfg',
    source: 'project-newapp',
    sourceHandle: 'right-src',
    target: 'repo-config',
    targetHandle: 'left-tgt',
    type: 'smoothstep',
    label: '設定を保持',
    style: { stroke: '#56d364', strokeDasharray: '5 3' },
    labelStyle: ls,
    labelBgStyle: { fill: 'rgba(10,34,21,0.88)', rx: 4 },
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
  'repo-config':     '#56d364',
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
