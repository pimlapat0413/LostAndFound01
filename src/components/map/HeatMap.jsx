import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// จุดโปร่งแสงซ้อนกัน: บริเวณที่มีของหายหนาแน่นจะมีสีเข้มขึ้นเอง (ไม่ต้องใช้ปลั๊กอิน heatmap เพิ่ม)
export default function HeatMap({ points }) {
  const center = [18.8986, 99.0135]; // มหาวิทยาลัยแม่โจ้

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden" style={{ height: '340px', width: '100%' }}>
      <MapContainer center={center} zoom={16} style={{ height: '100%', width: '100%', zIndex: 0 }} scrollWheelZoom={false}>
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          attribution="&copy; Google Maps"
          maxZoom={20}
        />
        {points.map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={18}
            pathOptions={{ stroke: false, fillColor: '#dc2626', fillOpacity: 0.28 }}
          >
            <Tooltip>{p.label}</Tooltip>
          </CircleMarker>
        ))}
        {points.map((p) => (
          <CircleMarker
            key={`${p.id}-dot`}
            center={[p.lat, p.lng]}
            radius={4}
            pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#b91c1c', fillOpacity: 1 }}
          >
            <Tooltip>{p.label}</Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
