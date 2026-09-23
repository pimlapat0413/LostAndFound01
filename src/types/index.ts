export interface LostItem {
  id: string;
  code: string; // e.g. LF-2024-00048
  name: string;
  description: string;
  category: string;
  color: string;
  brand: string;
  imageUrl: string;
  thumbnails: string[];
  location: string;
  locationDetail: string;
  faculty: string;
  building: string;
  floor: string;
  room: string;
  dateLost: string;
  timeLost: string;
  status: 'searching' | 'found' | 'returned';
  reporterName: string;
  reporterStudentId: string;
  reporterEmail: string;
  reporterPhone: string;
  reporterContact: string; // Line ID etc
  reporterAvatar: string;
  createdAt: string;
  pinX?: number; // ละติจูดของหมุดบนแผนที่ (Leaflet)
  pinY?: number; // ลองจิจูดของหมุดบนแผนที่ (Leaflet)
  reportType?: 'lost' | 'found'; // ไม่ระบุ = 'lost' (ข้อมูลเก่า)
  urgency?: 'normal' | 'high';
  secretQuestion?: string; // คำถามยืนยันเจ้าของ (ไม่แสดงสาธารณะ)
  secretAnswer?: string;
}

export interface ClaimRequest {
  requestId: string;
  itemId: string;
  itemName: string;
  itemCode: string;
  claimerName: string;
  studentId: string;
  department: string;
  claimDateTime: string;
  claimLocation: string;
  contact: string;
  note: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  secretAnswerGiven?: string;
  handoverCode?: string; // รหัส 6 หลักที่ออกให้เมื่ออนุมัติ
  approvedAt?: string;
  handedOverAt?: string;
  handedOverBy?: string;
  isNewItemReport?: boolean; // ข้อมูลเก่าที่ถูกบันทึกปนมาในรายการคำขอ
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  studentId: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface LocationOption {
  id: string;
  name: string;
  buildings: { id: string; name: string; floors: string[] }[];
}
