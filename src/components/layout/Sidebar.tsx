'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Shield, 
  Home, 
  FileText, 
  PackageCheck, 
  Lock,
  KeyRound,
  AlertCircle,
  GraduationCap,
  Briefcase,
  Check,
  ExternalLink
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useRole, UserRole } from '@/context/RoleContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentRole, isAdmin, setCurrentRole } = useRole();

  // State สำหรับเมนูดรอปดาวน์โปรไฟล์และการสลับสิทธิ์ด้านล่าง Sidebar
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // State สำหรับระบบขอรหัสผ่านเมื่อสลับตำแหน่ง (Role Authentication Modal)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [inputPassword, setInputPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  // ปิดเมนูดรอปดาวน์เมื่อคลิกพื้นที่ด้านนอก
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allNavItems = [
    { label: 'หน้าแรก', icon: Home, href: '/' },
    { label: 'แจ้งของหาย', icon: FileText, href: '/report' },
    { label: 'รายการของหาย / รับคืน', icon: PackageCheck, href: '/claim' },
    { label: 'ผู้ดูแลระบบ (Admin)', icon: Shield, href: '/admin', adminOnly: true },
  ];

  const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin);

  // ฟังก์ชันจัดการคลิกเมนูหลัก (ถ้าเป็น Admin แล้วยังไม่มีสิทธิ์ ต้องกรอกรหัสผ่าน)
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: { href: string; adminOnly?: boolean }) => {
    if (item.adminOnly && !isAdmin) {
      e.preventDefault();
      setPendingRole('admin');
      setInputPassword('');
      setAuthError(false);
      setIsAuthModalOpen(true);
    } else {
      if (window.innerWidth < 1024) onClose();
    }
  };

  // ฟังก์ชันเลือกสลับตำแหน่ง / Role จากกล่องโปรไฟล์
  const handleRoleSelect = (role: UserRole) => {
    if (role === currentRole) {
      setIsProfileMenuOpen(false);
      return;
    }

    if (role === 'admin' || role === 'teacher') {
      setPendingRole(role);
      setInputPassword('');
      setAuthError(false);
      setIsProfileMenuOpen(false);
      setIsAuthModalOpen(true);
    } else {
      setCurrentRole(role);
      setIsProfileMenuOpen(false);
    }
  };

  // ตรวจสอบรหัสผ่าน (Admin: admin123, Teacher: staff123)
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
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[#0d1c2f]/40 backdrop-blur-xs lg:hidden transition-opacity" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white text-[#0d1c2f] border-r border-[#c2c6d3]/40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col shadow-xl lg:shadow-none`}
      >
        {/* Logo Area */}
       <div className="flex flex-col items-start justify-center h-24 px-6 border-b border-[#c2c6d3]/40 bg-[#f8f9ff]/50">
  <div className="flex items-center gap-2.5 text-[#00366f]">
    <Shield className="w-7 h-7 text-[#00366f]" />
    {/* เปลี่ยนเป็นฟอนต์แบบ Monospace (ตัวอักษรขนาดเท่ากันทุกตัว) */}
    <span className="font-mono font-bold text-base text-xl tracking-tight">
      Property Portal
    </span>
  </div>
  <span className="text-[11px] text-[#424751] mt-1 font-mono uppercase tracking-widest">
    Missing Items System
  </span>
</div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#d8e4f1]/70 text-[#00366f] font-semibold shadow-xs'
                    : 'text-[#424751] hover:bg-[#eff4ff] hover:text-[#00366f]'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#00366f] rounded-r-full" />
                )}
                
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#00366f]' : 'text-[#737782] group-hover:text-[#00366f]'}`} />
                <span className="text-sm font-['Inter'] flex-1">{item.label}</span>
                {item.adminOnly && !isAdmin && (
                  <Lock className="w-3.5 h-3.5 text-[#737782]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Card with Role Switcher Dropdown */}
        <div className="relative p-3 m-3 bg-[#f8f9ff] rounded-2xl border border-[#c2c6d3]/40" ref={profileMenuRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-3 w-full p-1 rounded-xl hover:bg-[#eff4ff] transition-colors text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-[#00366f] text-white flex items-center justify-center shrink-0 shadow-xs font-['Plus_Jakarta_Sans'] font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-[#0d1c2f] truncate font-['Plus_Jakarta_Sans'] tracking-wide">Aom</p>
              <p className="text-[11px] text-[#00366f] font-semibold truncate font-['Inter'] uppercase">
                {currentRole === 'admin' ? 'ผู้ดูแลระบบ' : currentRole === 'teacher' ? 'อาจารย์ / บุคลากร' : 'นักศึกษา'}
              </p>
            </div>
          </button>

          {/* Popup Dropdown สลับตำแหน่ง (Role Switcher) แสดงขึ้นด้านบน */}
          {isProfileMenuOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-2xl shadow-2xl border border-[#c2c6d3]/40 p-4 z-50 animate-fade-in space-y-4">
              
              {/* User Info Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-[#c2c6d3]/20">
                <div className="w-11 h-11 rounded-xl bg-[#00366f] text-white flex items-center justify-center font-bold text-base shadow-xs">
                  A
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-[#0d1c2f] truncate font-['Plus_Jakarta_Sans']">Aom (ออม สุขเจริญ)</h4>
                  <p className="text-xs text-[#424751] truncate font-['Inter']">aom123@gmail.com</p>
                  <span className="inline-block font-mono text-[11px] text-[#737782] mt-0.5">รหัสนักศึกษา: 65012345</span>
                </div>
              </div>

              {/* Role Selection Options */}
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
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
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

              {/* Admin Panel Direct Access Link */}
             <div className="pt-2 border-t border-[#c2c6d3]/20">
  <Link
    href="/admin"
    onClick={() => setIsProfileMenuOpen(false)}
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
      </aside>

      {/* ==========================================
          MODAL: PASSWORD AUTHENTICATION FOR ADMIN / TEACHER
          ========================================== */}
      {isAuthModalOpen && (
        <Modal
          isOpen={isAuthModalOpen}
          onClose={() => { setIsAuthModalOpen(false); setInputPassword(''); setPendingRole(null); }}
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
                onClick={() => { setIsAuthModalOpen(false); setInputPassword(''); setPendingRole(null); }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#424751] font-semibold rounded-xl transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#00366f] hover:bg-[#004c99] text-white font-semibold rounded-xl shadow-xs transition-all"
              >
                ยืนยันและสลับสิทธิ์
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}