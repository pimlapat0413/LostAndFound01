'use client'

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, 
  MapPin, 
  Image as ImageIcon, 
  Upload, 
  X, 
  CheckCircle2, 
  Tag, 
  Calendar, 
  Clock, 
  Phone, 
  ArrowRight,
  Plus,
  Sparkles,
  AlertCircle,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { categories, locations } from '@/data/mockData';
import Modal from '@/components/ui/Modal';
import { LostItem } from '@/types';

interface UploadedPhoto {
  id: string;
  name: string;
  size: string;
  url: string;
}

export default function ReportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: 'electronics',
    urgency: 'normal', 
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    faculty: 'engineering',
    building: 'eng-1',
    room: '',
    locationDetail: '',
    contactName: '',
    contactPhone: '',
    contactOther: ''
  });

  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdItem, setCreatedItem] = useState<any>(null);

  const handleQuickFill = () => {
    setFormData(prev => ({
      ...prev,
      contactName: 'กุริญา ทาเทร์',
      contactPhone: '0812345678',
      contactOther: 'Line ID: kuriya_t'
    }));
  };

  const handleAddTag = (tagText: string) => {
    setFormData(prev => ({
      ...prev,
      description: prev.description ? `${prev.description}, ${tagText}` : tagText
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const newPhotos: UploadedPhoto[] = newFiles.map((file) => ({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        url: URL.createObjectURL(file)
      }));
      setPhotos((prev) => [...prev, ...newPhotos]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      const newPhotos: UploadedPhoto[] = droppedFiles.map((file) => ({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        url: URL.createObjectURL(file)
      }));
      setPhotos((prev) => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const selectedFacultyObj = locations.find((l) => l.id === formData.faculty) || locations[0];
  const buildingOptions = selectedFacultyObj.buildings.map((b) => ({
    value: b.id,
    label: b.name
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedCode = `LF-2026-000${Math.floor(Math.random() * 90) + 10}`;
    const selectedCat = categories.find(c => c.id === formData.categoryId)?.name || 'ทั่วไป';
    const selectedFac = locations.find(l => l.id === formData.faculty)?.name || '';
    const selectedBld = selectedFacultyObj.buildings.find(b => b.id === formData.building)?.name || '';
    const locationString = `${selectedFac} (${selectedBld} ${formData.room ? `ห้อง ${formData.room}` : ''}) ${formData.locationDetail}`;

    const newItem = {
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      code: generatedCode,
      name: formData.name,
      description: formData.description,
      category: selectedCat,
      location: locationString,
      dateLost: formData.date,
      timeLost: formData.time,
      reporterName: formData.contactName,
      reporterPhone: formData.contactPhone,
      reporterContact: formData.contactOther,
      status: 'searching',
      imageUrl: photos.length > 0 ? photos[0].url : ''
    } as LostItem;

    setTimeout(() => {
      let existingItems: LostItem[] = [];
      const savedItems = localStorage.getItem('lostItems');
      if (savedItems) {
        try {
          existingItems = JSON.parse(savedItems);
        } catch (err) {
          console.error("Error parsing saved items", err);
        }
      }

      const updatedItems = [newItem, ...existingItems];
      localStorage.setItem('lostItems', JSON.stringify(updatedItems));

      const existingClaims = JSON.parse(localStorage.getItem('adminClaimRequests') || '[]');
      const newNotificationItem = {
        requestId: `NOTIF-${Date.now().toString().slice(-4)}`,
        itemId: newItem.id,
        itemName: formData.name,
        claimerName: formData.contactName || 'ผู้ใช้งานระบบ',
        claimDateTime: 'เมื่อสักครู่นี้',
        contact: formData.contactPhone || 'ไม่ระบุเบอร์',
        status: 'pending',
        isNewItemReport: true
      };
      localStorage.setItem('adminClaimRequests', JSON.stringify([newNotificationItem, ...existingClaims]));

      window.dispatchEvent(new Event('storage'));

      setIsSubmitting(false);
      setCreatedItem(newItem);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9ff] to-[#eff4ff]/30 pb-16 font-sans text-[#0d1c2f]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <nav className="flex items-center gap-2 text-xs text-gray-500 font-['Inter']">
          <Link href="/" className="hover:text-[#00366f] transition-colors">หน้าแรก</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium">แจ้งของหาย</span>
        </nav>

        <div className="relative overflow-hidden bg-gradient-to-r from-[#00366f] via-[#004c99] to-[#1e3a8a] rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs text-blue-100 border border-white/20 font-['Inter']">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>ระบบบันทึกทรัพย์สินอัจฉริยะ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans']">แบบฟอร์มแจ้งของหาย / พบของหาย</h1>
            <p className="text-blue-100 text-xs sm:text-sm font-['Inter'] leading-relaxed opacity-90">
              กรอกรายละเอียด อัปโหลดรูปถ่ายจริง และระบุสถานที่ เพื่อให้ระบบกระจายข้อมูลและช่วยติดตามคืนทรัพย์สินได้อย่างรวดเร็ว
            </p>
          </div>
          <div className="shrink-0 relative z-10 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-xs space-y-1 font-['Inter']">
            <p className="font-bold text-amber-300 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> คำแนะนำ
            </p>
            <p className="text-blue-100 opacity-90 max-w-xs">กรอกข้อมูลให้ครบถ้วนและแนบรูปภาพชัดเจน จะช่วยเพิ่มโอกาสในการตามหาของเจอสูงถึง 90%</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-[#c2c6d3]/40 space-y-4">
                <div className="flex items-center justify-between font-['Inter']">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 font-['Plus_Jakarta_Sans']">
                    <ImageIcon className="w-4 h-4 text-[#00366f]" />
                    <span>รูปภาพสิ่งของ (ถ่ายจริง / อัปโหลด)</span>
                  </h3>
                  <span className="text-xs bg-blue-50 text-[#00366f] px-2.5 py-0.5 rounded-full font-semibold">
                    {photos.length} รูป
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  multiple
                  className="hidden"
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-[#00366f]/30 hover:border-[#00366f] rounded-2xl p-6 flex flex-col items-center justify-center bg-[#eff4ff]/30 hover:bg-[#eff4ff]/60 cursor-pointer transition-all text-center group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-[#00366f] group-hover:scale-110 transition-transform mb-3">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-[#00366f] font-['Plus_Jakarta_Sans']">คลิกเลือกรูปภาพจากเครื่อง</p>
                  <p className="text-[11px] text-gray-500 mt-1 font-['Inter']">หรือลากไฟล์ภาพมาวางที่นี่ (รองรับ JPG, PNG, WEBP)</p>
                </div>

                {photos.length > 0 && (
                  <div className="space-y-2 pt-2 font-['Inter']">
                    <p className="text-xs font-semibold text-gray-700">รูปภาพที่แนบแล้ว:</p>
                    <div className="grid grid-cols-3 gap-2.5">
                      {photos.map((photo) => (
                        <div key={photo.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-200 shadow-xs bg-gray-100">
                          <img 
                            src={photo.url} 
                            alt={photo.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(photo.id)}
                            className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white rounded-full p-1 transition-colors shadow-xs cursor-pointer"
                            title="ลบรูปนี้"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-[#c2c6d3]/40 space-y-4 font-['Inter']">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 font-['Plus_Jakarta_Sans']">
                  <MapPin className="w-4 h-4 text-[#00366f]" />
                  <span>สถานที่พบหรือทำหาย</span>
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">คณะ / หน่วยงาน <span className="text-red-500">*</span></label>
                    <Select 
                      options={locations.map(loc => ({ value: loc.id, label: loc.name }))}
                      value={formData.faculty}
                      onChange={(e) => {
                        const newFac = e.target.value;
                        const facObj = locations.find(l => l.id === newFac) || locations[0];
                        setFormData({
                          ...formData, 
                          faculty: newFac,
                          building: facObj.buildings[0]?.id || ''
                        });
                      }}
                      placeholder="เลือกคณะ"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">อาคาร / ตึก <span className="text-red-500">*</span></label>
                    <Select 
                      options={buildingOptions}
                      value={formData.building}
                      onChange={(e) => setFormData({...formData, building: e.target.value})}
                      placeholder="เลือกอาคาร"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">ห้อง / ชั้น <span className="text-red-500">*</span></label>
                    <Input 
                      required
                      value={formData.room}
                      onChange={(e) => setFormData({...formData, room: e.target.value})}
                      placeholder="เช่น ชั้น 2 ห้อง 204 หรือ หน้าลิฟต์"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">รายละเอียดสถานที่เพิ่มเติม <span className="text-red-500">*</span></label>
                    <Input 
                      required
                      value={formData.locationDetail}
                      onChange={(e) => setFormData({...formData, locationDetail: e.target.value})}
                      placeholder="เช่น วางลืมไว้บนโต๊ะแถวหลังสุด"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#eff4ff] to-white p-6 rounded-3xl border border-[#d8e4f1] space-y-3 font-['Inter']">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#00366f]">
                  <Eye className="w-4 h-4" />
                  <span>ตัวอย่างการแสดงผลในการ์ด (Live Preview)</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">LF-2026-XX</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">กำลังค้นหา</span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 font-['Plus_Jakarta_Sans']">{formData.name || 'ชื่อสิ่งของ (ตัวอย่าง)'}</h4>
                  <p className="text-[11px] text-gray-500 line-clamp-1">{formData.description || 'รายละเอียดลักษณะสิ่งของ...'}</p>
                </div>
              </div>

            </div>

            <div className="lg:col-span-7 space-y-6">
              
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-[#c2c6d3]/40 space-y-5 font-['Inter']">
                <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2 font-['Plus_Jakarta_Sans']">
                  <Tag className="w-4 h-4 text-[#00366f]" />
                  <span>ข้อมูลสิ่งของ</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">ชื่อสิ่งของ <span className="text-red-500">*</span></label>
                    <Input 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="เช่น iPhone 15 Pro สีดำ, กระเป๋าสตางค์หนังสีน้ำตาล"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">หมวดหมู่ <span className="text-red-500">*</span></label>
                    <Select 
                      options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                      value={formData.categoryId}
                      onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                      placeholder="เลือกหมวดหมู่"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">ระดับความสำคัญ / ความเร่งด่วน</label>
                    <select
                      value={formData.urgency}
                      onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00366f]"
                    >
                      <option value="normal">ปกติ (ทรัพย์สินทั่วไป)</option>
                      <option value="high">สำคัญมาก (เอกสารสำคัญ / ของมีค่าสูง)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">วันที่ทำหาย / พบ <span className="text-red-500">*</span></label>
                    <Input 
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">เวลาโดยประมาณ <span className="text-red-500">*</span></label>
                    <Input 
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-gray-700">รายละเอียดและลักษณะพิเศษ <span className="text-red-500">*</span></label>
                      <div className="flex gap-1.5 flex-wrap">
                        {['มีพวงกุญแจ', 'มีรอยขีดข่วน', 'ติดสติ๊กเกอร์', 'เคสสีใส'].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleAddTag(tag)}
                            className="text-[10px] bg-[#eff4ff] hover:bg-[#d8e4f1] text-[#00366f] px-2 py-0.5 rounded-lg border border-[#d8e4f1] transition-colors cursor-pointer"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea 
                      required
                      className="w-full rounded-2xl border border-gray-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#00366f] bg-white"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="ระบุ สี ยี่ห้อ สัญลักษณ์ รอยตำหนิ หรือเคส เพื่อให้จำแนกได้ชัดเจน..."
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 font-['Plus_Jakarta_Sans']">
                      <Phone className="w-4 h-4 text-[#00366f]" />
                      <span>ช่องทางติดต่อผู้แจ้ง</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleQuickFill}
                      className="text-xs bg-[#eff4ff] hover:bg-[#d8e4f1] text-[#00366f] px-3 py-1.5 rounded-xl font-semibold border border-[#d8e4f1] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>เติมข้อมูลโปรไฟล์ของฉันด่วน</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">ชื่อผู้ติดต่อ <span className="text-red-500">*</span></label>
                      <Input 
                        required
                        value={formData.contactName}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[0-9]/g, ''); // บังคับกรอกได้เฉพาะตัวหนังสือ
                          setFormData({...formData, contactName: val});
                        }}
                        placeholder="ชื่อ-นามสกุล (ตัวอักษรเท่านั้น)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                      <Input 
                        type="tel"
                        required
                        maxLength={10}
                        value={formData.contactPhone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, ''); // บังคับกรอกได้เฉพาะตัวเลขเท่านั้น
                          setFormData({...formData, contactPhone: val});
                        }}
                        placeholder="08XXXXXXXX (ตัวเลขเท่านั้น)"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">ช่องทางอื่นๆ (Line ID, Facebook, Email) <span className="text-red-500">*</span></label>
                      <Input 
                        required
                        value={formData.contactOther}
                        onChange={(e) => setFormData({...formData, contactOther: e.target.value})}
                        placeholder="เช่น Line ID: kuriya_t / Email: student@university.ac.th"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                  <Button 
                    variant="secondary" 
                    type="button" 
                    onClick={() => router.back()}
                  >
                    ยกเลิก
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-[#00366f] hover:bg-[#004c99] text-white font-semibold px-6 shadow-xs cursor-pointer"
                  >
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกและโพสต์ข้อมูล'}
                  </Button>
                </div>

              </div>

            </div>

          </div>
        </form>

      </div>

      {createdItem && (
        <Modal
          isOpen={!!createdItem}
          onClose={() => setCreatedItem(null)}
          title="บันทึกข้อมูลสิ่งของสูญหายสำเร็จ!"
        >
          <div className="space-y-4 text-xs text-gray-700 font-['Inter']">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-emerald-900 font-['Plus_Jakarta_Sans']">โพสต์รายการเรียบร้อยแล้ว</p>
                <p className="text-emerald-700 mt-0.5">
                  รหัสรายการของคุณคือ <strong className="font-mono text-emerald-900 font-bold">{createdItem.code}</strong> ข้อมูลถูกบันทึกและพร้อมแสดงในคลังของหายทันที
                </p>
              </div>
            </div>

            <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50 flex gap-4 items-center">
              {createdItem.imageUrl ? (
                <img src={createdItem.imageUrl} alt="preview" className="w-16 h-16 rounded-xl object-cover border" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-gray-900 truncate font-['Plus_Jakarta_Sans']">{createdItem.name}</p>
                <p className="text-gray-500">{createdItem.category} • {createdItem.location}</p>
                <p className="text-gray-400 text-[11px] mt-0.5">ผู้แจ้ง: {createdItem.reporterName} ({createdItem.reporterPhone})</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => {
                  setCreatedItem(null);
                  setFormData({
                    name: '',
                    description: '',
                    categoryId: 'electronics',
                    urgency: 'normal',
                    date: new Date().toISOString().split('T')[0],
                    time: '12:00',
                    faculty: 'engineering',
                    building: 'eng-1',
                    room: '',
                    locationDetail: '',
                    contactName: '',
                    contactPhone: '',
                    contactOther: ''
                  });
                  setPhotos([]);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl cursor-pointer"
              >
                แจ้งรายการอื่นเพิ่ม
              </button>
              <Link
                href="/items"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00366f] hover:bg-[#004c99] text-white font-semibold rounded-xl shadow-xs"
              >
                <span>ดูรายการของหายทั้งหมด</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}