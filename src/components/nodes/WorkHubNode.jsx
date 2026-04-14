import { Handle, Position } from '@xyflow/react'
import './node.css'

const hs = { opacity: 0 }

export default function WorkHubNode({ data }) {
  return (
    <div className={`wh-node wh-node--${data.variant || 'default'}`}>
      {/* Target handles */}
      <Handle type="target" position={Position.Top}    id="top"        style={hs} />
      <Handle type="target" position={Position.Bottom} id="bottom-tgt" style={hs} />
      <Handle type="target" position={Position.Left}   id="left-tgt"   style={hs} />
      <Handle type="target" position={Position.Right}  id="right-tgt"  style={hs} />
      {/* Source handles */}
      <Handle type="source" position={Position.Bottom} id="bottom"     style={hs} />
      <Handle type="source" position={Position.Top}    id="top-src"    style={hs} />
      <Handle type="source" position={Position.Left}   id="left-src"   style={hs} />
      <Handle type="source" position={Position.Right}  id="right-src"  style={hs} />

      <div className="wh-node__header">
        <span className="wh-node__icon">{data.icon}</span>
        <div className="wh-node__titles">
          <span className="wh-node__label">{data.label}</span>
          {data.subtitle && (
            <span className="wh-node__subtitle">{data.subtitle}</span>
          )}
        </div>
      </div>

      {data.items?.length > 0 && (
        <ul className="wh-node__items">
          {data.items.map((item, i) => (
            <li key={i} className="wh-node__item">{item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
