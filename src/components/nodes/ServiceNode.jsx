import { Handle, Position } from '@xyflow/react'
import './node.css'

export default function ServiceNode({ data }) {
  return (
    <div className="custom-node service-node">
      <Handle type="target" position={Position.Top} />
      <div className="node-icon">⚙️</div>
      <div className="node-label">{data.label}</div>
      {data.description && (
        <div className="node-description">{data.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
