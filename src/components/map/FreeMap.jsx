import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// แก้ปัญหาไอคอนหมุดของ Leaflet ไม่แสดงผลใน Next.js
const markerIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// ฟังก์ชันสำหรับจับเหตุการณ์คลิกบนแผนที่
function LocationMarker({ setPosition, position }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={markerIcon}></Marker>
  );
}

export default function FreeMap({ onLocationSelect }) {
  const [position, setPosition] = useState(null);

  // ตั้งค่าศูนย์กลางแผนที่ไปที่มหาวิทยาลัยแม่โจ้
  const defaultCenter = [18.8986, 99.0135]; 

  const handleSetPosition = (latlng) => {
    setPosition(latlng);
    if (onLocationSelect) {
      onLocationSelect(latlng); // ส่งค่าพิกัดกลับไปให้ฟอร์มในหน้า ReportPage
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm" style={{ height: '400px', width: '100%' }}>
      <MapContainer 
        center={defaultCenter} 
        zoom={16} // ปรับให้ซูมใกล้ขึ้นเพื่อให้เห็นรายละเอียดอาคาร
        style={{ height: '100%', width: '100%', zIndex: 0 }} // zIndex 0 ป้องกันแผนที่ทับ Navbar หรือ Modal
      >
        {/* แผนที่ดาวเทียมสมจริง (Hybrid) จาก Google Maps */}
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          attribution="&copy; Google Maps"
          maxZoom={20}
        />
        
        <LocationMarker setPosition={handleSetPosition} position={position} />
      </MapContainer>
    </div>
  );
}