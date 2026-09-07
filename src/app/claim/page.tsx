'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, 
  ArrowLeft,
  MapPin, 
  Calendar,
  Search,
  CheckCircle2,
  Package,
  Tag,
  X,
  Eye,
  Sparkles,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { categories, locations } from '@/data/mockData';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { LostItem } from '@/types';

export default function ClaimPage() {
  const router = useRouter();
  const [items, setItems] = useState<LostItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [selectedStatus, setSelectedStatus] = useState('ทั้งหมด');
  
  const [claimingItem, setClaimingItem] = useState<LostItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    studentId: '',
    department: '',
    claimDate: new Date().toISOString().split('T')[0],
    claimTime: '',
    claimLocation: 'engineering',
    locationDetail: '',
    contact: '',
    note: ''
  });

  useEffect(() => {
    const savedItems = localStorage.getItem('lostItems');
    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch (e) {
        console.error("Failed to parse items", e);
      }
    }
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesQuery = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ทั้งหมด' || item.status === selectedStatus;
    return matchesQuery && matchesCategory && matchesStatus;
  });

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimingItem) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const updatedItems = items.map(i => i.id === claimingItem.id ? { ...i, status: 'returned' as const } : i);
      setItems(updatedItems);
      localStorage.setItem('lostItems', JSON.stringify(updatedItems));

      const existingRequests = JSON.parse(localStorage.getItem('adminClaimRequests') || '[]');
      const newRequest = {
        requestId: `REQ-${Math.floor(Math.random() * 90000) + 10000}`,
        itemId: claimingItem.id,
        itemName: claimingItem.name,
        itemCode: claimingItem.code || '-',
        claimerName: `${formData.firstName} ${formData.lastName}`,
        studentId: formData.studentId,
        department: formData.department,
        claimDateTime: `${formData.claimDate} ${formData.claimTime}`,
        contact: formData.contact,
        note: formData.note,
        requestDate: new Date().toISOString(),
        status: 'pending'
      };
      localStorage.setItem('adminClaimRequests', JSON.stringify([newRequest, ...existingRequests]));

      window.dispatchEvent(new Event('storage'));

      setIsSubmitting(false);
      setClaimingItem(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    }, 600);
  };

  const getStatusBadge = (status: LostItem['status']) => {
    switch (status) {
      case 'searching':
        return <Badge variant="searching">กำลังค้นหา</Badge>;
      case 'found':
        return <Badge variant="found">พบแล้ว</Badge>;
      case 'returned':
        return <Badge variant="returned">รับคืนแล้ว</Badge>;
      default:
        return <Badge variant="pending">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9ff] to-[#eff4ff]/40 pb-16 font-sans text-[#0d1c2f]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Breadcrumb & Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-['Inter']">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Link href="/" className="hover:text-[#00366f] transition-colors">หน้าแรก</Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-900 font-medium">รายการของหาย / รับคืน</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0d1c2f] font-['Plus_Jakarta_Sans'] tracking-tight">
              รายการของหายและรับของคืน
            </h1>
          </div>
          <button 
            onClick={() => router.back()}
            className="self-start sm:self-auto inline-flex items-center text-xs font-semibold text-gray-600 hover:text-[#00366f] bg-white border border-gray-200 px-4 py-2.5 rounded-2xl shadow-2xs hover:bg-gray-50 transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" /> ย้อนกลับ
          </button>
        </div>

        {/* Hero Banner ดีไซน์พรีเมียม */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#00366f] via-[#004c99] to-[#1e3a8a] rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs text-blue-100 border border-white/20 font-['Inter']">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>ระบบตรวจสอบและยืนยันตัวตนอัจฉริยะ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans']">
              ติดตามและยื่นคำขอรับคืนทรัพย์สิน
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm font-['Inter'] leading-relaxed opacity-90">
              ตรวจสอบสถานะสิ่งของที่พบในสถาบัน พร้อมกรอกข้อมูลยืนยันความเป็นเจ้าของเพื่อประสานงานรับคืนกับแอดมินได้อย่างรวดเร็ว
            </p>
          </div>
          <div className="shrink-0 relative z-10 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-xs space-y-1 font-['Inter']">
            <p className="font-bold text-amber-300 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> ความปลอดภัย
            </p>
            <p className="text-blue-100 opacity-90 max-w-xs">ทุกคำขอจะต้องผ่านการตรวจสอบหลักฐานและอนุมัติโดยผู้ดูแลระบบเพื่อความถูกต้อง</p>
          </div>
        </div>

        {/* Success Alert Banner */}
        {showSuccess && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between animate-fade-in font-['Inter'] border border-emerald-400/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-100" />
              </div>
              <div>
                <p className="font-bold text-sm">ส่งคำขอรับของคืนสำเร็จ!</p>
                <p className="text-xs text-emerald-100 mt-0.5">ระบบได้ส่งข้อมูลของคุณไปยังแอดมินเพื่อตรวจสอบและอนุมัติเรียบร้อยแล้ว</p>
              </div>
            </div>
            <button onClick={() => setShowSuccess(false)} className="text-white hover:text-emerald-200 p-1 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Filter Controls Box แบบกระจกโมเดิร์น */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-xs border border-[#c2c6d3]/40 space-y-4 font-['Inter']">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-xs font-bold text-gray-700">
            <Filter className="w-4 h-4 text-[#00366f]" />
            <span>เครื่องมือค้นหาและกรองข้อมูล</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อสิ่งของ, รหัสรายการ หรือสถานที่..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00366f]/30 focus:bg-white transition-all shadow-inner"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00366f]/30 transition-all cursor-pointer"
              >
                <option value="ทั้งหมด">หมวดหมู่ทั้งหมด</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00366f]/30 transition-all cursor-pointer"
              >
                <option value="ทั้งหมด">สถานะทั้งหมด</option>
                <option value="searching">กำลังค้นหา</option>
                <option value="found">พบแล้ว</option>
                <option value="returned">รับคืนแล้ว</option>
              </select>
            </div>
          </div>
        </div>

        {/* Items Grid Display */}
        <div className="space-y-4 font-['Inter']">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-gray-900 font-['Plus_Jakarta_Sans'] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#00366f]" />
              <span>รายการทรัพย์สินทั้งหมด ({filteredItems.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-white/95 backdrop-blur-sm rounded-3xl border border-[#c2c6d3]/40 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="aspect-video bg-[#eff4ff] relative overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-[#eff4ff]">
                        <Package className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 shadow-xs">
                      {getStatusBadge(item.status)}
                    </div>
                    {item.code && (
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-mono px-2.5 py-1 rounded-xl shadow-xs">
                        {item.code}
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-[#00366f] font-medium">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{item.category}</span>
                    </div>
                    <h4 className="text-base font-bold text-gray-900 font-['Plus_Jakarta_Sans'] truncate group-hover:text-[#00366f] transition-colors">{item.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2">{item.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>
                    
                    <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#00366f] shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{item.dateLost ? new Date(item.dateLost).toLocaleDateString('th-TH') : '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center gap-2">
                  <Link 
                    href={`/items/${item.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-2xl border border-gray-200 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>ดูรายละเอียด</span>
                  </Link>

                  {item.status === 'returned' ? (
                    <span className="flex-1 inline-flex items-center justify-center px-3 py-2.5 bg-blue-50 text-[#00366f] text-xs font-semibold rounded-2xl border border-blue-100">
                      ส่งมอบแล้ว
                    </span>
                  ) : (
                    <button 
                      onClick={() => setClaimingItem(item)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-2xl shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>แจ้งรับของคืน</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="bg-white rounded-3xl border border-[#c2c6d3]/40 p-16 text-center space-y-3 shadow-xs">
              <Package className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-gray-800 font-['Plus_Jakarta_Sans']">ไม่พบรายการสิ่งของ</h3>
              <p className="text-xs text-gray-500">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นดูครับ</p>
            </div>
          )}
        </div>

      </div>

      {/* Modal ฟอร์มยืนยันตัวตนรับของคืนดีไซน์ใหม่ */}
      <Modal 
        isOpen={!!claimingItem} 
        onClose={() => setClaimingItem(null)}
        title="แบบฟอร์มยืนยันตัวตนเพื่อรับของคืน"
      >
        {claimingItem && (
          <form onSubmit={handleClaimSubmit} className="space-y-4 font-['Inter'] text-xs">
            <div className="p-3.5 bg-gradient-to-r from-[#eff4ff] to-[#f8f9ff] rounded-2xl border border-[#d8e4f1] mb-3 shadow-2xs">
              <p className="text-gray-500 text-[11px]">รายการที่คุณกำลังขอรับคืน:</p>
              <p className="font-bold text-[#00366f] text-sm mt-0.5 font-['Plus_Jakarta_Sans']">{claimingItem.name} <span className="font-mono text-xs text-gray-500 font-normal">({claimingItem.code || 'ไม่มีรหัส'})</span></p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">ชื่อจริง <span className="text-red-500">*</span></label>
                <Input 
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="กรอกชื่อจริง"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">นามสกุล <span className="text-red-500">*</span></label>
                <Input 
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="กรอกนามสกุล"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">รหัสนักศึกษา <span className="text-red-500">*</span></label>
                <Input 
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder="เช่น 670410XXXX"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">สังกัด / คณะ <span className="text-red-500">*</span></label>
                <Input 
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="เช่น คณะวิทยาศาสตร์"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">วันที่นัดรับ <span className="text-red-500">*</span></label>
                <Input 
                  type="date"
                  required
                  value={formData.claimDate}
                  onChange={(e) => setFormData({ ...formData, claimDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">เวลานัดรับ <span className="text-red-500">*</span></label>
                <Input 
                  type="time"
                  required
                  value={formData.claimTime}
                  onChange={(e) => setFormData({ ...formData, claimTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">สถานที่นัดรับ <span className="text-red-500">*</span></label>
              <Select 
                options={locations.map(loc => ({ value: loc.id, label: loc.name }))}
                value={formData.claimLocation}
                onChange={(e) => setFormData({ ...formData, claimLocation: e.target.value })}
                placeholder="เลือกสถานที่"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">ช่องทางติดต่อ (Line ID / เบอร์โทร) <span className="text-red-500">*</span></label>
              <Input 
                required
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="เช่น 0812345678 หรือ Line: aom_123"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">หมายเหตุ / จุดสังเกตยืนยันความเป็นเจ้าของ</label>
              <textarea 
                rows={2}
                className="w-full rounded-2xl border border-gray-200 px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#00366f]/30 bg-gray-50/50"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="ระบุตำหนิพิเศษหรือรายละเอียดรหัสผ่านเพื่อยืนยันตัวตน..."
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t">
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => setClaimingItem(null)}
              >
                ยกเลิก
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs cursor-pointer"
              >
                {isSubmitting ? 'กำลังส่งคำขอ...' : 'ยืนยันและส่งคำขอให้แอดมิน'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
}