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
  Sparkles,
  PackageCheck,
  FileText
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
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

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [soundNotif, setSoundNotif] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // โหลดรายการแจ้งเตือนและซิงค์สถานะการอ่าน
  useEffect(() => {
    const loadDynamicNotifications = () => {
      let dynamicList: any[] = [];
      const savedReadState = JSON.parse(localStorage.getItem('readNotificationIds') || '[]');

      // 1. ดึงรายการแจ้งของหายใหม่จาก lostItems
      const savedItems = localStorage.getItem('lostItems');
      if (savedItems) {
        try {
          const items = JSON.parse(savedItems);
          items.forEach((item: any, index: number) => {
            const notifId = `item-${item.id || index}`;
            const isRead = savedReadState.includes(notifId);
            dynamicList.push({
              id: notifId,
              targetUrl: `/items/${item.id}`,
              title: 'มีผู้แจ้งรายการสิ่งของใหม่',
              desc: `สิ่งของ: ${item.name} (${item.location || 'ไม่ระบุสถานที่'})`,
              time: item.dateLost ? `วันที่: ${item.dateLost}` : 'เมื่อสักครู่',
              read: isRead,
              type: 'item'
            });
          });
        } catch (e) {
          console.error(e);
        }
      }

      // 2. ดึงคำขอรับคืนจาก adminClaimRequests
      const savedClaims = localStorage.getItem('adminClaimRequests');
      if (savedClaims) {
        try {
          const claims = JSON.parse(savedClaims);
          claims.forEach((claim: any, index: number) => {
            if (!claim.isNewItemReport) {
              const notifId = `claim-${claim.requestId || index}`;
              const isRead = savedReadState.includes(notifId);
              dynamicList.push({
                id: notifId,
                targetUrl: currentRole === 'admin' ? '/admin' : '/claim',
                title: claim.status === 'approved' ? 'อนุมัติการรับคืนทรัพย์สินสำเร็จ' : 'มีคำขอรับของคืนเข้ามาใหม่',
                desc: `${claim.claimerName || 'นักศึกษา'} ขอรับคืน "${claim.itemName}"`,
                time: claim.claimDateTime || 'เร็วๆ นี้',
                read: isRead,
                type: 'claim'
              });
            }
          });
        } catch (e) {
          console.error(e);
        }
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
    const interval = setInterval(loadDynamicNotifications, 1000);
    
    return () => {
      window.removeEventListener('storage', loadDynamicNotifications);
      clearInterval(interval);
    };
  }, [currentRole]);

  const unreadCount = notifications.filter(n => !n.read).length;

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
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/90 backdrop-blur-md border-b border-[#c2c6d3]/40 shadow-xs">
      
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 text-[#424751] rounded-xl hover:bg-[#eff4ff] hover:text-[#00366f] focus:outline-none transition-colors cursor-pointer"
          title="สลับเมนูข้าง"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <span className="text-base sm:text-lg font-black text-[#00366f] tracking-tight font-sans">
            Missing Items System
          </span>
          <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-[#737782] font-medium font-['Inter'] px-2.5 py-1 rounded-full bg-[#f8f9ff] border border-[#c2c6d3]/30">
            <Sparkles className="w-3 h-3 text-[#00366f]" />
            ระบบสารสนเทศทรัพย์สินสูญหาย
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        
        {/* Notifications Dropdown (ซ่อนตัวเลข เอาแค่จุดแดงกระพริบ) */}
        <div className="relative" ref={notifMenuRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2.5 text-[#424751] rounded-xl hover:bg-[#eff4ff] hover:text-[#00366f] transition-colors focus:outline-none cursor-pointer"
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
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#c2c6d3]/40 py-3 z-50 animate-fade-in">
              <div className="flex items-center justify-between px-4 pb-2.5 border-b border-[#c2c6d3]/20">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#0d1c2f] font-['Plus_Jakarta_Sans']">การแจ้งเตือนล่าสุด</h4>
                  {unreadCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllNotifsAsRead}
                    className="text-xs text-[#00366f] hover:text-[#004c99] font-semibold font-['Inter'] cursor-pointer"
                  >
                    อ่านทั้งหมดแล้ว
                  </button>
                )}
              </div>

              <div className="divide-y divide-[#f8f9ff] max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 hover:bg-[#eff4ff]/80 transition-colors flex gap-3 cursor-pointer ${!n.read ? 'bg-[#eff4ff]/60' : ''}`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-[#00366f]' : 'bg-transparent'}`} />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[#0d1c2f] font-['Plus_Jakarta_Sans'] flex items-center gap-1.5">
                        {n.type === 'claim' ? <PackageCheck className="w-3.5 h-3.5 text-emerald-600" /> : <FileText className="w-3.5 h-3.5 text-blue-600" />}
                        {n.title}
                      </p>
                      <p className="text-xs text-[#424751] mt-0.5 font-['Inter']">{n.desc}</p>
                      <span className="text-[10px] text-[#737782] mt-1 block font-['Inter']">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 pt-2.5 border-t border-[#c2c6d3]/20 text-center">
                <span className="text-[11px] text-[#737782] font-['Inter']">คลิกที่รายการเพื่อดูรายละเอียดข้อมูล</span>
              </div>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2.5 text-[#424751] rounded-xl hover:bg-[#eff4ff] hover:text-[#00366f] transition-colors focus:outline-none cursor-pointer"
          title="ตั้งค่าพื้นฐาน"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* User Profile & Role Switcher Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-[#eff4ff] transition-colors focus:outline-none border border-transparent hover:border-[#c2c6d3]/40 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#002244] text-white flex items-center justify-center shrink-0 shadow-xs font-['Plus_Jakarta_Sans'] font-bold">
              A
            </div>
            <div className="hidden sm:flex flex-col items-start text-left">
              <span className="text-xs font-bold text-[#0d1c2f] leading-tight font-['Plus_Jakarta_Sans']">Aom</span>
              <span className="text-[10px] font-semibold text-[#00366f] uppercase tracking-wider font-['Inter']">
                {currentRole === 'admin' ? 'ผู้ดูแลระบบ' : currentRole === 'teacher' ? 'อาจารย์/บุคลากร' : 'นักศึกษา'}
              </span>
            </div>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-[#c2c6d3]/40 p-4 z-50 animate-fade-in space-y-4">
              
              <div className="flex items-center gap-3 pb-3 border-b border-[#c2c6d3]/20">
                <div className="w-10 h-10 rounded-xl bg-[#002244] text-white flex items-center justify-center shrink-0 shadow-xs font-['Plus_Jakarta_Sans'] font-bold">
                  A
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-[#0d1c2f] truncate font-['Plus_Jakarta_Sans']">Aom (ออม สุขเจริญ)</h4>
                  <p className="text-xs text-[#424751] truncate font-['Inter']">aom123@gmail.com</p>
                  <span className="inline-block font-mono text-[11px] text-[#737782] mt-0.5">รหัสนักศึกษา: 65012345</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#0d1c2f] font-['Plus_Jakarta_Sans']">เลือกตำแหน่ง / ยศ (Role):</span>
                  <span className="text-[10px] bg-[#d8e4f1] text-[#00366f] px-2 py-0.5 rounded-full font-semibold">สลับสิทธิ์</span>
                </div>

                <div className="space-y-1.5 font-['Inter']">
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
                            ? 'bg-[#d8e4f1]/70 border-[#00366f] shadow-xs text-[#00366f]' 
                            : 'bg-[#f8f9ff] border-[#c2c6d3]/40 hover:bg-[#eff4ff] text-[#424751]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#00366f] text-white' : 'bg-white text-[#737782] border border-[#c2c6d3]/40'}`}>
                            <ItemIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold">{roleItem.label}</p>
                            <p className="text-[10px] text-[#737782]">{roleItem.desc}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#00366f] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-[#c2c6d3]/20">
                <Link
                  href="/admin"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-[#334155] hover:bg-[#1e293b] text-white p-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all font-['Inter']"
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
          <form onSubmit={verifyAndChangeRole} className="space-y-4 text-xs text-[#424751] font-['Inter']">
            <div className="p-3.5 bg-[#eff4ff] text-[#00366f] border border-[#d8e4f1] rounded-xl flex items-start gap-3">
              <KeyRound className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm font-['Plus_Jakarta_Sans']">จำเป็นต้องยืนยันตัวตน</p>
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
              <label className="font-bold text-[#0d1c2f] flex items-center gap-1.5 font-['Plus_Jakarta_Sans']">
                <Lock className="w-4 h-4 text-[#00366f]" />
                <span>รหัสผ่านยืนยันสิทธิ์:</span>
              </label>
              <input
                type="password"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน..."
                autoFocus
                required
                className="w-full px-4 py-2.5 bg-white border border-[#c2c6d3] rounded-xl text-sm text-[#0d1c2f] focus:outline-none focus:border-[#00366f] focus:ring-2 focus:ring-[#d8e4f1]"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#c2c6d3]/20">
              <button
                type="button"
                onClick={() => { setIsAuthModalOpen(false); setPendingRole(null); setInputPassword(''); }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#424751] font-semibold rounded-xl transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#00366f] hover:bg-[#004c99] text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
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
          <div className="space-y-5 text-xs text-[#424751] font-['Inter']">
            {settingsSaved && (
              <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center gap-2 font-semibold animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>บันทึกการตั้งค่าเรียบร้อยแล้ว</span>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="font-bold text-[#0d1c2f] border-b border-[#c2c6d3]/20 pb-2 text-sm font-['Plus_Jakarta_Sans']">การตั้งค่าการแจ้งเตือน</h4>
              
              <div className="flex items-center justify-between p-3.5 bg-[#f8f9ff] rounded-xl border border-[#c2c6d3]/40">
                <div>
                  <p className="font-semibold text-[#0d1c2f]">แจ้งเตือนผ่านอีเมล</p>
                  <p className="text-[11px] text-[#737782]">รับอีเมลแจ้งเตือนเมื่อมีคนพบสิ่งของหรืออัปเดตคำขอ</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={emailNotif} 
                  onChange={(e) => setEmailNotif(e.target.checked)}
                  className="w-4 h-4 text-[#00366f] rounded cursor-pointer accent-[#00366f]"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-[#f8f9ff] rounded-xl border border-[#c2c6d3]/40">
                <div>
                  <p className="font-semibold text-[#0d1c2f]">เสียงแจ้งเตือนในระบบ</p>
                  <p className="text-[11px] text-[#737782]">เล่นเสียงเตือนเบาๆ เมื่อมีรายการใหม่เข้ามา</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={soundNotif} 
                  onChange={(e) => setSoundNotif(e.target.checked)}
                  className="w-4 h-4 text-[#00366f] rounded cursor-pointer accent-[#00366f]"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#c2c6d3]/20">
              <div className="flex items-center justify-between text-[#737782] text-[11px]">
                <span>เวอร์ชันระบบ: <strong>v1.0.4 (Academic MIS)</strong></span>
                <span>ผู้ใช้งาน: <strong>aom123@gmail.com</strong></span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#c2c6d3]/20">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#424751] font-semibold rounded-xl transition-colors cursor-pointer"
              >
                ปิด
              </button>
              <button
                onClick={() => {
                  setSettingsSaved(true);
                  setTimeout(() => {
                    setSettingsSaved(false);
                    setIsSettingsOpen(false);
                  }, 1200);
                }}
                className="px-4 py-2 bg-[#00366f] hover:bg-[#004c99] text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
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