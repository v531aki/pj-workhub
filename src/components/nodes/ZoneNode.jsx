import './zone.css'

export default function ZoneNode({ data }) {
  return (
    <div
      className={`zone-node zone-node--${data.variant || 'default'}`}
      style={{ width: '100%', height: '100%' }}
    >
      <div className="zone-node__header">
        <span className="zone-node__icon">{data.icon}</span>
        <span className="zone-node__label">{data.label}</span>
      </div>
      {data.note && (
        <span className="zone-node__note">{data.note}</span>
      )}
    </div>
  )
}
