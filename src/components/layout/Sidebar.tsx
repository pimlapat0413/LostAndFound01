'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield,
  Home,
  FilePlus2,
  PackageSearch,
  HandHelping,
  ClipboardList,
  Lock,
  KeyRound,
  AlertCircle,
  X,
  ArrowRight
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Logo from '@/components/layout/Logo';
import { useRole } from '@/context/RoleContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  adminOnly?: boolean;
}

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: 'เมนูหลัก',
    items: [
      { label: 'หน้าแรก', icon: Home, href: '/' },
      { label: 'ค้นหาของหาย', icon: PackageSearch, href: '/items' },
      { label: 'แจ้งของหาย / พบของ', icon: FilePlus2, href: '/report' },
      { label: 'ขอรับของคืน', icon: HandHelping, href: '/claim' },
      { label: 'รายการของฉัน', icon: ClipboardList, href: '/my-items' },
    ],
  },
  {
    title: 'สำหรับเจ้าหน้าที่',
    items: [{ label: 'แผงควบคุมแอดมิน', icon: Shield, href: '/admin', adminOnly: true }],
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, setCurrentRole } = useRole();

  // ขอรหัสผ่านเมื่อผู้ใช้ที่ไม่ใช่แอดมินกดเมนูแอดมิน
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: NavItem) => {
    if (item.adminOnly && !isAdmin) {
      e.preventDefault();
      setInputPassword('');
      setAuthError(false);
      setIsAuthModalOpen(true);
    } else if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const verifyAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === 'admin123') {
      setCurrentRole('admin');
      setIsAuthModalOpen(false);
      setInputPassword('');
      router.push('/admin');
    } else {
      setAuthError(true);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px] lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[272px] bg-white border-r border-line transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 px-5 flex items-center justify-between">
          <Link href="/" onClick={() => window.innerWidth < 1024 && onClose()}>
            <Logo />
          </Link>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100" aria-label="ปิดเมนู">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pt-4 pb-6 space-y-6 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{group.title}</p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item)}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      active
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-ink'
                    }`}
                  >
                    <Icon className={`w-[18px] h-[18px] ${active ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span className="flex-1">{item.label}</span>
                    {item.adminOnly && !isAdmin && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* CTA card */}
        <div className="p-4">
          <div className="relative overflow-hidden rounded-2xl bg-brand-gradient p-4 text-white">
            <div className="absolute inset-0 bg-dots opacity-60 pointer-events-none" />
            <div className="relative space-y-1">
              <p className="font-display font-semibold text-sm">เก็บของได้ใช่ไหม?</p>
              <p className="text-xs text-white/80 leading-relaxed">แจ้งพบของในไม่กี่นาที ระบบจะช่วยจับคู่กับเจ้าของให้อัตโนมัติ</p>
              <Link
                href="/report"
                onClick={() => window.innerWidth < 1024 && onClose()}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
              >
                แจ้งพบของ <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {isAuthModalOpen && (
        <Modal
          isOpen={isAuthModalOpen}
          onClose={() => { setIsAuthModalOpen(false); setInputPassword(''); }}
          title="ยืนยันสิทธิ์ผู้ดูแลระบบ"
        >
          <form onSubmit={verifyAdmin} className="space-y-4 text-sm">
            <div className="p-3.5 bg-brand-50 text-brand-700 rounded-xl flex items-start gap-3">
              <KeyRound className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs">กรุณากรอกรหัสผ่านเพื่อเข้าหน้าแอดมิน (รหัสทดสอบ: admin123)</p>
            </div>
            {authError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง
              </div>
            )}
            <input
              type="password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder="กรอกรหัสผ่าน..."
              autoFocus
              required
              className="w-full px-4 py-2.5 bg-white border border-line rounded-xl focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setIsAuthModalOpen(false); setInputPassword(''); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                ยกเลิก
              </button>
              <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-xs">
                ยืนยัน
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
