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

import ServiceNode from './nodes/ServiceNode'
import DatabaseNode from './nodes/DatabaseNode'
import ClientNode from './nodes/ClientNode'
import './ArchitectureDiagram.css'

const nodeTypes = {
  service: ServiceNode,
  database: DatabaseNode,
  client: ClientNode,
}

const initialNodes = [
  {
    id: 'client',
    type: 'client',
    position: { x: 350, y: 50 },
    data: { label: 'Client', description: 'Web / Mobile' },
  },
  {
    id: 'api-gateway',
    type: 'service',
    position: { x: 350, y: 200 },
    data: { label: 'API Gateway', description: 'Routing & Auth' },
  },
  {
    id: 'service-a',
    type: 'service',
    position: { x: 100, y: 380 },
    data: { label: 'Service A', description: 'Business Logic' },
  },
  {
    id: 'service-b',
    type: 'service',
    position: { x: 600, y: 380 },
    data: { label: 'Service B', description: 'Business Logic' },
  },
  {
    id: 'db-a',
    type: 'database',
    position: { x: 100, y: 560 },
    data: { label: 'Database A', description: 'PostgreSQL' },
  },
  {
    id: 'db-b',
    type: 'database',
    position: { x: 600, y: 560 },
    data: { label: 'Database B', description: 'PostgreSQL' },
  },
]

const initialEdges = [
  {
    id: 'client-gateway',
    source: 'client',
    target: 'api-gateway',
    animated: true,
    label: 'HTTPS',
    style: { stroke: '#4f86f7' },
    labelStyle: { fontSize: 11, fill: '#555' },
  },
  {
    id: 'gateway-a',
    source: 'api-gateway',
    target: 'service-a',
    animated: false,
    label: 'REST',
    style: { stroke: '#6ec6a0' },
    labelStyle: { fontSize: 11, fill: '#555' },
  },
  {
    id: 'gateway-b',
    source: 'api-gateway',
    target: 'service-b',
    animated: false,
    label: 'REST',
    style: { stroke: '#6ec6a0' },
    labelStyle: { fontSize: 11, fill: '#555' },
  },
  {
    id: 'service-a-db',
    source: 'service-a',
    target: 'db-a',
    style: { stroke: '#f0a070' },
  },
  {
    id: 'service-b-db',
    source: 'service-b',
    target: 'db-b',
    style: { stroke: '#f0a070' },
  },
]

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
        fitViewOptions={{ padding: 0.2 }}
      >
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'client') return '#4f86f7'
            if (node.type === 'database') return '#f0a070'
            return '#6ec6a0'
          }}
          maskColor="rgba(240,242,245,0.6)"
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#ccc" />
      </ReactFlow>
    </div>
  )
}
