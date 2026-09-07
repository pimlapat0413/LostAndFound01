'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Search, 
  PackageCheck, 
  Users, 
  Package, 
  ArrowRight, 
  TrendingUp,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { LostItem } from '@/types';

const getStatusBadge = (status: LostItem['status']) => {
  switch (status) {
    case 'searching':
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-['Inter']">กำลังค้นหา</span>;
    case 'found':
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-['Inter']">พบแล้ว</span>;
    case 'returned':
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-[#00366f] border border-blue-200 font-['Inter']">รับคืนแล้ว</span>;
    default:
      return null;
  }
};

export default function DashboardPage() {
  const [items, setItems] = useState<LostItem[]>([]);

  useEffect(() => {
    const savedItems = localStorage.getItem('lostItems');
    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch (e) {
        console.error("Failed to parse items", e);
        setItems([]);
      }
    } else {
      setItems([]);
    }
  }, []);

  const computedStats = {
    totalItems: items.length,
    searching: items.filter(i => String(i.status).includes('searching')).length,
    returned: items.filter(i => String(i.status).includes('returned')).length,
    totalUsers: 236
  };

  const recentItems = items.slice(0, 4);

  return (
    <div className="min-h-screen text-[#0d1c2f] font-sans pb-16 relative overflow-x-hidden">
      
      

      {/* เนื้อหาภายในหน้าเว็บทั้งหมด */}
      <div className="p-6 md:p-10 max-w-[1280px] mx-auto space-y-10 relative z-10">
        
        {/* Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#00366f] via-[#004c99] to-[#1e3a8a] text-white p-8 md:p-10 rounded-3xl shadow-xl flex flex-col justify-center gap-4">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-3 relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold tracking-wide uppercase border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              Institutional Academic Portal
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-['Inter'] leading-tight">
  Missing Items System
</h1>
            <p className="text-blue-100 font-['Inter'] text-sm md:text-base leading-relaxed opacity-90">
              ระบบสารสนเทศอัจฉริยะสำหรับการบริหารจัดการ ติดตาม และส่งมอบคืนทรัพย์สินสูญหายภายในสถาบันการศึกษาอย่างโปร่งใสและมีประสิทธิภาพ
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/items" className="block group">
            <div className="relative overflow-hidden bg-white/95 backdrop-blur-sm p-6 rounded-2xl border border-[#c2c6d3]/40 shadow-sm hover:shadow-xl hover:border-[#00366f] transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#00366f]" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#737782] uppercase tracking-wider font-['Inter']">รายการทั้งหมด</p>
<h3 className="text-3xl font-black text-[#0d1c2f] mt-2 font-mono tracking-tight group-hover:text-[#00366f] transition-colors">{computedStats.totalItems}</h3>                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] flex items-center justify-center text-[#00366f] group-hover:bg-[#00366f] group-hover:text-white transition-all duration-300 shadow-xs">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] text-[#737782] font-['Inter'] pt-3 border-t border-[#f0f3fa]">
                <span><strong className="text-[#00366f]">Active</strong> ข้อมูลในระบบ</span>
                <span className="text-[#00366f] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">ดูทั้งหมด →</span>
              </div>
            </div>
          </Link>

          <Link href="/items" className="block group">
            <div className="relative overflow-hidden bg-white/95 backdrop-blur-sm p-6 rounded-2xl border border-[#c2c6d3]/40 shadow-sm hover:shadow-xl hover:border-amber-500 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#737782] uppercase tracking-wider font-['Inter']">กำลังค้นหา</p>
<h3 className="text-3xl font-black text-[#0d1c2f] mt-2 font-mono tracking-tight group-hover:text-amber-600 transition-colors">{computedStats.searching}</h3>                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-xs">
                  <Search className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] text-[#737782] font-['Inter'] pt-3 border-t border-[#f0f3fa]">
                <span><strong className="text-amber-600">Pending</strong> รอเจ้าของมารับ</span>
                <span className="text-amber-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">ตรวจสอบ →</span>
              </div>
            </div>
          </Link>

          <Link href="/items" className="block group">
            <div className="relative overflow-hidden bg-white/95 backdrop-blur-sm p-6 rounded-2xl border border-[#c2c6d3]/40 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-600" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#737782] uppercase tracking-wider font-['Inter']">รับคืนแล้ว</p>
<h3 className="text-3xl font-black text-[#0d1c2f] mt-2 font-mono tracking-tight group-hover:text-emerald-600 transition-colors">{computedStats.returned}</h3>                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-xs">
                  <PackageCheck className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] text-[#737782] font-['Inter'] pt-3 border-t border-[#f0f3fa]">
                <span><strong className="text-emerald-700">Completed</strong> ส่งคืนสำเร็จ</span>
                <span className="text-emerald-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">ดูประวัติ →</span>
              </div>
            </div>
          </Link>

          <div className="relative overflow-hidden bg-white/95 backdrop-blur-sm p-6 rounded-2xl border border-[#c2c6d3]/40 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all duration-300 group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-600" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#737782] uppercase tracking-wider font-['Inter']">อัตราการตามหาสำเร็จ</p>
                <h3 className="text-3xl font-black text-[#0d1c2f] mt-2 font-mono tracking-tight group-hover:text-emerald-600 transition-colors">
                  {computedStats.totalItems > 0 
                    ? Math.round((computedStats.returned / computedStats.totalItems) * 100) 
                    : 0}%
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-[11px] text-[#737782] font-['Inter'] pt-3 border-t border-[#f0f3fa]">
              <span><strong className="text-emerald-700">Verified</strong> ส่งคืนเจ้าของแล้ว</span>
              <span className="text-emerald-600 font-semibold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full">High Success</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/report" className="block group">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#f0f4ff]/95 via-[#e2ecff]/95 to-[#d4e4fc]/95 backdrop-blur-sm rounded-3xl p-8 text-[#00366f] shadow-sm hover:shadow-xl transition-all duration-300 flex items-center justify-between gap-6 hover:-translate-y-1.5 border border-[#c2c6d3]/40">
              <div className="space-y-3 relative z-10 flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 text-[#00366f] text-[11px] font-bold uppercase tracking-wider backdrop-blur-md border border-[#00366f]/10 shadow-xs">
                  <FileText className="w-3.5 h-3.5 text-[#00366f]" />
                  <span>Quick Report</span>
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight font-['Plus_Jakarta_Sans'] text-[#0d1c2f]">
                    แจ้งของหาย
                  </h3>
                  <p className="text-[#424751] text-xs sm:text-sm font-['Inter'] leading-relaxed mt-1 max-w-md">
                    บันทึกรายการสิ่งของที่สูญหายเข้าสู่ระบบ
                  </p>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white text-[#00366f] flex items-center justify-center shrink-0 group-hover:bg-[#00366f] group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-md border border-[#c2c6d3]/40 relative z-10">
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link href="/items" className="block group">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#f8f9fc]/95 via-[#f1f3f9]/95 to-[#e4e9f2]/95 backdrop-blur-sm rounded-3xl p-8 text-[#0d1c2f] shadow-sm hover:shadow-xl transition-all duration-300 flex items-center justify-between gap-6 hover:-translate-y-1.5 border border-[#c2c6d3]/40">
              <div className="space-y-3 relative z-10 flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 text-[#424751] text-[11px] font-bold uppercase tracking-wider backdrop-blur-md border border-[#c2c6d3]/30 shadow-xs">
                  <Search className="w-3.5 h-3.5 text-[#00366f]" />
                  <span>Database Search</span>
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight font-['Plus_Jakarta_Sans'] text-[#0d1c2f]">
                    ค้นหาของหาย
                  </h3>
                  <p className="text-[#424751] text-xs sm:text-sm font-['Inter'] leading-relaxed mt-1 max-w-md">
                    ตรวจสอบสิ่งของที่มีการแจ้งพบหรือสูญหายในระบบ
                  </p>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white text-[#00366f] flex items-center justify-center shrink-0 group-hover:bg-[#00366f] group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-md border border-[#c2c6d3]/40 relative z-10">
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Items */}
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#0d1c2f] flex items-center gap-2.5 font-['Plus_Jakarta_Sans']">
              <div className="p-2.5 bg-[#d8e4f1] rounded-xl text-[#00366f] shadow-xs">
                <TrendingUp className="w-5 h-5" />
              </div>
              รายการล่าสุดในระบบ
            </h2>
            <Link href="/items" className="text-xs sm:text-sm text-[#00366f] hover:text-[#004c99] font-bold flex items-center gap-1 group font-['Inter']">
              ดูทั้งหมด
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {recentItems.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-10 text-center border border-[#c2c6d3]/40 shadow-xs">
              <Package className="w-12 h-12 text-[#737782] mx-auto mb-3 opacity-50" />
              <p className="text-sm font-semibold text-[#0d1c2f] font-['Plus_Jakarta_Sans']">ยังไม่มีรายการสิ่งของในระบบ</p>
              <p className="text-xs text-[#737782] mt-1 font-['Inter']">คุณสามารถเพิ่มรายการใหม่ได้จากเมนูแจ้งของหาย</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentItems.map((item) => (
                <Link key={item.id} href={`/items/${item.id}`} className="group block">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-[#c2c6d3]/40 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-video bg-[#eff4ff] flex items-center justify-center relative overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <Package className="w-12 h-12 text-[#737782] group-hover:scale-110 transition-transform duration-300" />
                      )}
                      <div className="absolute top-3 right-3 shadow-xs">
                        {getStatusBadge(item.status)}
                      </div>
                    </div>

                    <div className="p-5 space-y-3 font-['Inter']">
                      <h3 className="font-bold text-[#0d1c2f] truncate group-hover:text-[#00366f] transition-colors text-base font-['Plus_Jakarta_Sans']">
                        {item.name}
                      </h3>
                      <div className="space-y-2 pt-1 border-t border-[#f0f3fa]">
                        <div className="flex items-start gap-2 text-xs text-[#424751]">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#00366f]" />
                          <span className="line-clamp-1">{item.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#737782]">
                          <Calendar className="w-4 h-4 flex-shrink-0 text-[#737782]" />
                          <span>{item.dateLost ? new Date(item.dateLost).toLocaleDateString('th-TH') : 'ไม่ระบุวันที่'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="space-y-6 pt-8 border-t border-[#c2c6d3]/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[#0d1c2f] font-['Plus_Jakarta_Sans']">
                หมวดหมู่ยอดนิยม
              </h2>
              <p className="text-xs text-[#737782] font-['Inter'] mt-0.5">
                เลือกหมวดหมู่สิ่งของเพื่อคัดกรองดูข้อมูลจริงในระบบทันที
              </p>
            </div>
            <Link 
              href="/items" 
              className="text-xs font-semibold text-[#00366f] hover:text-[#004c99] transition-colors font-['Inter'] flex items-center gap-1 self-start sm:self-auto"
            >
              ดูทั้งหมด →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'กระเป๋าและกระเป๋าสตางค์', shortName: 'กระเป๋าสตางค์', icon: FileText },
              { name: 'โทรศัพท์มือถือและแท็บเล็ต', shortName: 'โทรศัพท์มือถือ', icon: Search },
              { name: 'กุญแจ', shortName: 'กุญแจ', icon: PackageCheck },
              { name: 'บัตรประจำตัวและเอกสาร', shortName: 'บัตรประจำตัว', icon: Users },
              { name: 'อุปกรณ์ไอที', shortName: 'อุปกรณ์ไอที', icon: Package },
              { name: 'เครื่องประดับและนาฬิกา', shortName: 'เครื่องประดับ', icon: Sparkles },
            ].map((cat, index) => {
              const IconComponent = cat.icon;

              return (
                <Link 
                  key={index} 
                  href={`/items?category=${encodeURIComponent(cat.shortName)}`}
                  className="group relative bg-white/95 backdrop-blur-sm rounded-3xl p-6 border border-[#c2c6d3]/40 shadow-sm hover:shadow-xl hover:border-[#00366f] transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-center text-center space-y-3"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#00366f]/5 rounded-full blur-xl group-hover:bg-[#00366f]/15 transition-all pointer-events-none" />
                  <div className="w-14 h-14 rounded-2xl bg-[#eff4ff] text-[#00366f] flex items-center justify-center group-hover:bg-[#00366f] group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-xs relative z-10">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="relative z-10 w-full pt-1">
                    <h3 className="text-xs sm:text-sm font-bold text-[#0d1c2f] group-hover:text-[#00366f] transition-colors font-['Plus_Jakarta_Sans'] truncate">
                      {cat.shortName}
                    </h3>
                  </div>
                  <div className="absolute bottom-0 left-6 right-6 h-1 bg-transparent group-hover:bg-[#00366f] rounded-full transition-all" />
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}