import { Handle, Position } from '@xyflow/react'

const hs = { opacity: 0 }

/**
 * ActorNode
 * 人間（Aki）のアクター表現。UML actor 的なシンプルな丸アイコン + ラベル。
 */
export default function ActorNode({ data }) {
  return (
    <div className="actor-node">
      <Handle type="source" position={Position.Bottom} id="bottom"    style={hs} />
      <Handle type="source" position={Position.Right}  id="right-src" style={hs} />

      <div className="actor-node__avatar">{data.icon || '👤'}</div>
      <div className="actor-node__label">{data.label}</div>
      {data.subtitle && <div className="actor-node__subtitle">{data.subtitle}</div>}
    </div>
  )
}
