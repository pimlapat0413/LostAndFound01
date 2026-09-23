import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const markerIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function ViewMap({ lat, lng }) {
  // หากมีพิกัดให้แสดงตรงพิกัดนั้น ถ้าไม่มีให้ตั้งศูนย์กลางที่ ม.แม่โจ้
  const center = lat && lng ? [lat, lng] : [18.8986, 99.0135];

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm" style={{ height: '300px', width: '100%' }}>
      <MapContainer 
        center={center} 
        zoom={17} // ซูมใกล้ๆ เพื่อให้เห็นจุดที่ของหายชัดเจน
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={false} // ปิดการซูมด้วยลูกกลิ้งเมาส์ เพื่อไม่ให้รบกวนเวลาผู้ใช้เลื่อนอ่านหน้าเว็บ
        dragging={true} // ยังคงให้ใช้เมาส์คลิกค้างเพื่อเลื่อนดูรอบๆ ได้
      >
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          attribution="&copy; Google Maps"
          maxZoom={20}
        />
        
        {/* แสดงหมุดถ้ามีพิกัดส่งมา */}
        {lat && lng && <Marker position={[lat, lng]} icon={markerIcon} />}
      </MapContainer>
    </div>
  );
}