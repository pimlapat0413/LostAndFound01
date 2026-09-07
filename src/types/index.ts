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
}

export interface ClaimRequest {
  id: string;
  itemId: string;
  claimerName: string;
  claimerStudentId: string;
  claimerContact: string;
  meetingPlace: string;
  meetingPlaceDetail: string;
  meetingDate: string;
  meetingTime: string;
  note: string;
  status: 'pending' | 'approved' | 'completed';
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
