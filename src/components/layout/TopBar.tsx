'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Bell,
  Settings,
  Shield,
  GraduationCap,
  Briefcase,
  Check,
  CheckCircle2,
  ExternalLink,
  Lock,
  KeyRound,
  AlertCircle,
  PackageCheck,
  FileText,
  Search
} from 'lucide-react';
import { LogoMark } from '@/components/layout/Logo';
import Modal from '@/components/ui/Modal';
import { currentUser } from '@/data/mockData';
import { getItems, getClaims, getMyStudentId, getReportType } from '@/lib/storage';
import { findMatches } from '@/lib/matching';
import { useRole, UserRole } from '@/context/RoleContext';

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const router = useRouter();
  
  const { currentRole, setCurrentRole } = useRole();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [inputPassword, setInputPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [soundNotif, setSoundNotif] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // โหลดค่าตั้งค่าที่บันทึกไว้
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('userSettings') || '{}');
      if (typeof saved.emailNotif === 'boolean') setEmailNotif(saved.emailNotif);
      if (typeof saved.soundNotif === 'boolean') setSoundNotif(saved.soundNotif);
    } catch {}
  }, []);

  // โหลดรายการแจ้งเตือนและซิงค์สถานะการอ่าน
  // แอดมิน: เห็นรายการใหม่และคำขอที่รอตรวจ / ผู้ใช้ทั่วไป: เห็นเฉพาะเรื่องที่เกี่ยวกับรหัสนักศึกษาของตัวเอง
  useEffect(() => {
    const loadDynamicNotifications = () => {
      let dynamicList: any[] = [];
      const savedReadState: string[] = JSON.parse(localStorage.getItem('readNotificationIds') || '[]');
      const items = getItems();
      const claims = getClaims();
      const push = (n: { id: string; targetUrl: string; title: string; desc: string; time: string; type: string }) =>
        dynamicList.push({ ...n, read: savedReadState.includes(n.id) });

      if (currentRole === 'admin') {
        items.forEach((item) => push({
          id: `item-${item.id}`,
          targetUrl: `/items/${item.id}`,
          title: getReportType(item) === 'found' ? 'มีผู้แจ้งพบสิ่งของใหม่' : 'มีผู้แจ้งของหายใหม่',
          desc: `สิ่งของ: ${item.name} (${item.location || 'ไม่ระบุสถานที่'})`,
          time: item.dateLost ? `วันที่: ${item.dateLost}` : 'เมื่อสักครู่',
          type: 'item'
        }));
        claims.filter(c => c.status === 'pending').forEach((claim) => push({
          id: `claim-${claim.requestId}`,
          targetUrl: '/admin',
          title: 'มีคำขอรับของคืนเข้ามาใหม่',
          desc: `${claim.claimerName || 'นักศึกษา'} ขอรับคืน "${claim.itemName}"`,
          time: claim.claimDateTime || 'เร็วๆ นี้',
          type: 'claim'
        }));
      } else {
        const myId = getMyStudentId() || currentUser.studentId;
        const myItems = items.filter(i => i.reporterStudentId === myId);

        claims.filter(c => c.studentId === myId && c.status !== 'pending').forEach((claim) => push({
          // ใส่สถานะใน id เพื่อให้แจ้งเตือนใหม่ทุกครั้งที่สถานะเปลี่ยน
          id: `myclaim-${claim.requestId}-${claim.status}`,
          targetUrl: '/my-items',
          title: claim.status === 'approved' ? 'คำขอรับคืนได้รับอนุมัติแล้ว'
            : claim.status === 'completed' ? 'รับของคืนเรียบร้อย'
              : 'คำขอรับคืนไม่ผ่านการอนุมัติ',
          desc: claim.status === 'approved'
            ? `"${claim.itemName}" ดูรหัสส่งมอบ 6 หลักได้ที่รายการของฉัน`
            : `"${claim.itemName}"`,
          time: claim.claimDateTime || '',
          type: 'claim'
        }));

        claims.filter(c => c.studentId !== myId && myItems.some(i => i.id === c.itemId)).forEach((claim) => push({
          id: `claim-on-mine-${claim.requestId}`,
          targetUrl: '/my-items',
          title: 'มีผู้ขอรับคืนรายการของคุณ',
          desc: `${claim.claimerName} ขอรับ "${claim.itemName}"`,
          time: claim.claimDateTime || '',
          type: 'claim'
        }));

        myItems.filter(i => i.status !== 'returned').forEach((item) => {
          findMatches(item, items, 3).forEach((m) => push({
            id: `match-${item.id}-${m.item.id}`,
            targetUrl: `/items/${m.item.id}`,
            title: `พบรายการที่อาจตรงกัน (${m.score}%)`,
            desc: `"${m.item.name}" อาจตรงกับ "${item.name}" ของคุณ`,
            time: m.item.dateLost ? `วันที่: ${m.item.dateLost}` : '',
            type: 'item'
          }));
        });
      }

      if (dynamicList.length === 0) {
        dynamicList = [
          {
            id: 'sys-1',
            targetUrl: '/',
            title: 'ยินดีต้อนรับสู่ Missing Items System',
            desc: 'ระบบสารสนเทศติดตามทรัพย์สินสูญหายภายในสถาบัน',
            time: 'พร้อมใช้งาน',
            read: savedReadState.includes('sys-1'),
            type: 'system'
          }
        ];
      }

      setNotifications(dynamicList);
    };

    loadDynamicNotifications();
    
    window.addEventListener('storage', loadDynamicNotifications);
    const interval = setInterval(loadDynamicNotifications, 3000);
    
    return () => {
      window.removeEventListener('storage', loadDynamicNotifications);
      clearInterval(interval);
    };
  }, [currentRole]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // เล่นเสียงสั้นๆ เมื่อมีแจ้งเตือนที่ยังไม่อ่านเพิ่มขึ้น (ถ้าเปิดไว้ในการตั้งค่า)
  const prevUnreadRef = useRef<number | null>(null);
  useEffect(() => {
    const prev = prevUnreadRef.current;
    prevUnreadRef.current = unreadCount;
    if (prev === null || unreadCount <= prev || !soundNotif) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
      osc.onended = () => ctx.close();
    } catch {}
  }, [unreadCount, soundNotif]);

  const handleNotificationClick = (notif: any) => {
    const savedReadState = JSON.parse(localStorage.getItem('readNotificationIds') || '[]');
    if (!savedReadState.includes(notif.id)) {
      const updatedRead = [...savedReadState, notif.id];
      localStorage.setItem('readNotificationIds', JSON.stringify(updatedRead));
    }

    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    setIsNotifOpen(false);
    router.push(notif.targetUrl);
  };

  const markAllNotifsAsRead = () => {
    const allIds = notifications.map(n => n.id);
    localStorage.setItem('readNotificationIds', JSON.stringify(allIds));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    if (role === currentRole) {
      setIsUserMenuOpen(false);
      return;
    }

    if (role === 'admin' || role === 'teacher') {
      setPendingRole(role);
      setInputPassword('');
      setAuthError(false);
      setIsUserMenuOpen(false);
      setIsAuthModalOpen(true);
    } else {
      setCurrentRole(role);
      setIsUserMenuOpen(false);
    }
  };

  const verifyAndChangeRole = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = pendingRole === 'admin' ? 'admin123' : 'staff123';

    if (inputPassword === correctPassword) {
      if (pendingRole) {
        setCurrentRole(pendingRole);
      }
      setIsAuthModalOpen(false);
      setPendingRole(null);
      setInputPassword('');
      setAuthError(false);
      if (pendingRole === 'admin') {
        router.push('/admin');
      }
    } else {
      setAuthError(true);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 h-16 px-4 sm:px-6 bg-white/80 backdrop-blur-xl border-b border-line">

      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-500 rounded-xl hover:bg-slate-100 hover:text-ink transition-colors cursor-pointer"
          title="สลับเมนูข้าง"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="sm:hidden"><LogoMark size={32} /></span>
        {/* ค้นหาด่วน: ส่งคำค้นไปหน้ารายการของหาย */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = searchText.trim();
            router.push(q ? `/items?q=${encodeURIComponent(q)}` : '/items');
            window.dispatchEvent(new CustomEvent('items-search', { detail: q }));
          }}
          className="hidden sm:flex items-center flex-1 max-w-md relative"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="ค้นหาของหาย เช่น กระเป๋าสตางค์, บัตรนักศึกษา..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100/80 border border-transparent text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-brand-200 focus:ring-4 focus:ring-brand-50 transition-all"
          />
        </form>
      </div>

      <div className="flex items-center gap-2.5">
        
        {/* Notifications Dropdown (ซ่อนตัวเลข เอาแค่จุดแดงกระพริบ) */}
        <div className="relative" ref={notifMenuRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2.5 text-[#475569] rounded-xl hover:bg-[#eef1fe] hover:text-[#2346d8] transition-colors focus:outline-none cursor-pointer"
            title="การแจ้งเตือน"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ba1a1a]"></span>
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-line py-3 z-50 animate-fade-in">
              <div className="flex items-center justify-between px-4 pb-2.5 border-b border-line">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#0f172a] font-display">การแจ้งเตือนล่าสุด</h4>
                  {unreadCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllNotifsAsRead}
                    className="text-xs text-[#2346d8] hover:text-[#1c38b4] font-semibold cursor-pointer"
                  >
                    อ่านทั้งหมดแล้ว
                  </button>
                )}
              </div>

              <div className="divide-y divide-[#f5f7fb] max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 hover:bg-[#eef1fe]/80 transition-colors flex gap-3 cursor-pointer ${!n.read ? 'bg-[#eef1fe]/60' : ''}`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-[#2346d8]' : 'bg-transparent'}`} />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[#0f172a] font-display flex items-center gap-1.5">
                        {n.type === 'claim' ? <PackageCheck className="w-3.5 h-3.5 text-emerald-600" /> : <FileText className="w-3.5 h-3.5 text-brand-600" />}
                        {n.title}
                      </p>
                      <p className="text-xs text-[#475569] mt-0.5">{n.desc}</p>
                      <span className="text-[10px] text-[#64748b] mt-1 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 pt-2.5 border-t border-line text-center">
                <span className="text-[11px] text-[#64748b]">คลิกที่รายการเพื่อดูรายละเอียดข้อมูล</span>
              </div>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2.5 text-[#475569] rounded-xl hover:bg-[#eef1fe] hover:text-[#2346d8] transition-colors focus:outline-none cursor-pointer"
          title="ตั้งค่าพื้นฐาน"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* User Profile & Role Switcher Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-[#eef1fe] transition-colors focus:outline-none border border-transparent hover:border-line cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#2346d8] text-white flex items-center justify-center shrink-0 shadow-sm font-display font-bold">
              A
            </div>
            <div className="hidden sm:flex flex-col items-start text-left">
              <span className="text-xs font-bold text-[#0f172a] leading-tight font-display">Aom</span>
              <span className="text-[10px] font-semibold text-[#2346d8] uppercase tracking-wider">
                {currentRole === 'admin' ? 'ผู้ดูแลระบบ' : currentRole === 'teacher' ? 'อาจารย์/บุคลากร' : 'นักศึกษา'}
              </span>
            </div>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-line p-4 z-50 animate-fade-in space-y-4">
              
              <div className="flex items-center gap-3 pb-3 border-b border-line">
                <div className="w-10 h-10 rounded-xl bg-[#2346d8] text-white flex items-center justify-center shrink-0 shadow-sm font-display font-bold">
                  A
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-[#0f172a] truncate font-display">Aom (พิมพ์ลภัส หอจงกล)</h4>
                  <p className="text-xs text-[#475569] truncate">aom123@gmail.com</p>
                  <span className="inline-block font-mono text-[11px] text-[#64748b] mt-0.5">รหัสนักศึกษา: {currentUser.studentId}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#0f172a] font-display">เลือกตำแหน่ง / ยศ (Role):</span>
                  <span className="text-[10px] bg-[#dfe5fd] text-[#2346d8] px-2 py-0.5 rounded-full font-semibold">สลับสิทธิ์</span>
                </div>

                <div className="space-y-1.5">
                  {[
                    { id: 'admin', label: 'ผู้ดูแลระบบ (Admin)', icon: Shield, desc: 'จัดการระบบและข้อมูลทั้งหมด' },
                    { id: 'teacher', label: 'อาจารย์ / บุคลากร', icon: Briefcase, desc: 'สิทธิ์เจ้าหน้าที่และอาจารย์' },
                    { id: 'student', label: 'นักศึกษา (Student)', icon: GraduationCap, desc: 'แจ้งของหายและขอรับคืน' },
                  ].map((roleItem) => {
                    const ItemIcon = roleItem.icon;
                    const isSelected = currentRole === roleItem.id;
                    return (
                      <button
                        key={roleItem.id}
                        onClick={() => handleRoleSelect(roleItem.id as UserRole)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-[#dfe5fd]/70 border-[#2346d8] shadow-sm text-[#2346d8]' 
                            : 'bg-[#f5f7fb] border-line hover:bg-[#eef1fe] text-[#475569]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#2346d8] text-white' : 'bg-white text-[#64748b] border border-line'}`}>
                            <ItemIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold">{roleItem.label}</p>
                            <p className="text-[10px] text-[#64748b]">{roleItem.desc}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#2346d8] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-line">
                <Link
                  href="/admin"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-[#334155] hover:bg-[#1e293b] text-white p-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  <Shield className="w-4 h-4" />
                  <span>เข้าสู่หน้าแอดมิน (Admin Panel)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>

      {isAuthModalOpen && (
        <Modal
          isOpen={isAuthModalOpen}
          onClose={() => { setIsAuthModalOpen(false); setPendingRole(null); setInputPassword(''); }}
          title={`ยืนยันรหัสผ่านสิทธิ์ ${pendingRole === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'อาจารย์ / บุคลากร'}`}
        >
          <form onSubmit={verifyAndChangeRole} className="space-y-4 text-xs text-[#475569]">
            <div className="p-3.5 bg-[#eef1fe] text-[#2346d8] border border-[#dfe5fd] rounded-xl flex items-start gap-3">
              <KeyRound className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm font-display">จำเป็นต้องยืนยันตัวตน</p>
                <p className="text-xs mt-1">กรุณากรอกรหัสผ่านเพื่อเข้าถึงสิทธิ์ {pendingRole === 'admin' ? 'Admin (รหัสทดสอบ: admin123)' : 'Staff (รหัสทดสอบ: staff123)'}</p>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-[#ffdad6] text-[#93000a] border border-[#ba1a1a]/30 rounded-xl flex items-center gap-2 font-semibold animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>รหัสผ่านไม่ถูกต้อง! กรุณาลองใหม่อีกครั้ง</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-bold text-[#0f172a] flex items-center gap-1.5 font-display">
                <Lock className="w-4 h-4 text-[#2346d8]" />
                <span>รหัสผ่านยืนยันสิทธิ์:</span>
              </label>
              <input
                type="password"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน..."
                autoFocus
                required
                className="w-full px-4 py-2.5 bg-white border border-line rounded-xl text-sm text-[#0f172a] focus:outline-none focus:border-[#2346d8] focus:ring-2 focus:ring-[#dfe5fd]"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => { setIsAuthModalOpen(false); setPendingRole(null); setInputPassword(''); }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#475569] font-semibold rounded-xl transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#2346d8] hover:bg-[#1c38b4] text-white font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                ยืนยันสิทธิ์
              </button>
            </div>
          </form>
        </Modal>
      )}

      {isSettingsOpen && (
        <Modal
          isOpen={isSettingsOpen}
          onClose={() => { setIsSettingsOpen(false); setSettingsSaved(false); }}
          title="การตั้งค่าพื้นฐานระบบ (System Settings)"
        >
          <div className="space-y-5 text-xs text-[#475569]">
            {settingsSaved && (
              <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center gap-2 font-semibold animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>บันทึกการตั้งค่าเรียบร้อยแล้ว</span>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="font-bold text-[#0f172a] border-b border-line pb-2 text-sm font-display">การตั้งค่าการแจ้งเตือน</h4>
              
              <div className="flex items-center justify-between p-3.5 bg-[#f5f7fb] rounded-xl border border-line">
                <div>
                  <p className="font-semibold text-[#0f172a]">แจ้งเตือนผ่านอีเมล</p>
                  <p className="text-[11px] text-[#64748b]">รับอีเมลแจ้งเตือนเมื่อมีคนพบสิ่งของหรืออัปเดตคำขอ (จะส่งจริงเมื่อเชื่อมต่อ backend)</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={emailNotif} 
                  onChange={(e) => setEmailNotif(e.target.checked)}
                  className="w-4 h-4 text-[#2346d8] rounded cursor-pointer accent-[#2346d8]"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-[#f5f7fb] rounded-xl border border-line">
                <div>
                  <p className="font-semibold text-[#0f172a]">เสียงแจ้งเตือนในระบบ</p>
                  <p className="text-[11px] text-[#64748b]">เล่นเสียงเตือนเบาๆ เมื่อมีรายการใหม่เข้ามา</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={soundNotif} 
                  onChange={(e) => setSoundNotif(e.target.checked)}
                  className="w-4 h-4 text-[#2346d8] rounded cursor-pointer accent-[#2346d8]"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-line">
              <div className="flex items-center justify-between text-[#64748b] text-[11px]">
                <span>เวอร์ชันระบบ: <strong>v1.0.4 (Academic MIS)</strong></span>
                <span>ผู้ใช้งาน: <strong>aom123@gmail.com</strong></span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-line">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#475569] font-semibold rounded-xl transition-colors cursor-pointer"
              >
                ปิด
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.setItem('userSettings', JSON.stringify({ emailNotif, soundNotif }));
                  } catch {}
                  setSettingsSaved(true);
                  setTimeout(() => {
                    setSettingsSaved(false);
                    setIsSettingsOpen(false);
                  }, 1200);
                }}
                className="px-4 py-2 bg-[#2346d8] hover:bg-[#1c38b4] text-white font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          </div>
        </Modal>
      )}
    </header>
  );
}