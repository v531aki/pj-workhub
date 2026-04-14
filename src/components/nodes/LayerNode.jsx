/**
 * LayerNode
 * レイヤー（帯）を表現する背景ノード。
 * - ドラッグ・選択不可として、他ノードの下に敷くだけのコンテナとして使う
 * - data: { icon, label, description, variant }
 */
export default function LayerNode({ data }) {
  return (
    <div className={`layer-node layer-node--${data.variant || 'default'}`}>
      <div className="layer-node__badge">
        <span className="layer-node__icon">{data.icon}</span>
        <span className="layer-node__label">{data.label}</span>
      </div>
      {data.description && (
        <div className="layer-node__desc">{data.description}</div>
      )}
    </div>
  )
}
