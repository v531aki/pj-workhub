import { Handle, Position } from '@xyflow/react'
import './node.css'

export default function ClientNode({ data }) {
  return (
    <div className="custom-node client-node">
      <div className="node-icon">🖥️</div>
      <div className="node-label">{data.label}</div>
      {data.description && (
        <div className="node-description">{data.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
