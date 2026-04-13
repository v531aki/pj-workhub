import { Handle, Position } from '@xyflow/react'
import './node.css'

export default function DatabaseNode({ data }) {
  return (
    <div className="custom-node database-node">
      <Handle type="target" position={Position.Top} />
      <div className="node-icon">🗄️</div>
      <div className="node-label">{data.label}</div>
      {data.description && (
        <div className="node-description">{data.description}</div>
      )}
    </div>
  )
}
