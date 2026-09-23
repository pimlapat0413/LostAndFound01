'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
  Package,
  UserCircle2,
  CheckCircle2,
  Trash2,
  Sparkles,
  KeyRound,
  ClipboardList,
  Plus
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import MatchList from '@/components/items/MatchList';
import { currentUser } from '@/data/mockData';
import { LostItem, ClaimRequest } from '@/types';
import { getItems, saveItems, getClaims, getMyStudentId, setMyStudentId, getReportType } from '@/lib/storage';
import { findMatches } from '@/lib/matching';
import PageHeader from '@/components/layout/PageHeader';

const statusBadge = (status: LostItem['status']) =>
  status === 'searching' ? <Badge variant="searching">กำลังค้นหา</Badge>
    : status === 'found' ? <Badge variant="found">พบแล้ว</Badge>
      : <Badge variant="returned">รับคืนแล้ว</Badge>;

// ไทม์ไลน์สถานะของรายการที่ฉันแจ้ง
function ItemTimeline({ item, claims }: { item: LostItem; claims: ClaimRequest[] }) {
  const itemClaims = claims.filter(c => c.itemId === item.id);
  const steps = [
    { label: 'แจ้งเข้าระบบ', done: true },
    { label: 'มีคำขอรับคืน', done: itemClaims.length > 0 },
    { label: 'แอดมินอนุมัติ', done: itemClaims.some(c => c.status === 'approved' || c.status === 'completed') },
    { label: 'ส่งมอบแล้ว', done: item.status === 'returned' },
  ];
  return (
    <ol className="flex items-center gap-1 text-[10px] sm:text-[11px]">
      {steps.map((s, idx) => (
        <li key={s.label} className="flex items-center gap-1 min-w-0">
          <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${s.done ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
            {s.done ? '✓' : idx + 1}
          </span>
          <span className={`truncate ${s.done ? 'text-gray-800 font-semibold' : 'text-gray-400'}`}>{s.label}</span>
          {idx < steps.length - 1 && <span className="w-3 sm:w-6 h-px bg-gray-300 shrink-0" />}
        </li>
      ))}
    </ol>
  );
}

const claimStatusLabel: Record<ClaimRequest['status'], { text: string; cls: string }> = {
  pending: { text: 'รอแอดมินตรวจสอบ', cls: 'bg-amber-100 text-amber-800' },
  approved: { text: 'อนุมัติแล้ว • รอรับของ', cls: 'bg-emerald-100 text-emerald-800' },
  completed: { text: 'รับของเรียบร้อย', cls: 'bg-brand-100 text-[#2346d8]' },
  rejected: { text: 'ไม่ผ่านการอนุมัติ', cls: 'bg-red-100 text-red-800' },
};

export default function MyItemsPage() {
  const [studentId, setStudentId] = useState('');
  const [inputId, setInputId] = useState('');
  const [items, setItems] = useState<LostItem[]>([]);
  const [claims, setClaims] = useState<ClaimRequest[]>([]);

  useEffect(() => {
    const load = () => {
      setItems(getItems());
      setClaims(getClaims());
    };
    const saved = getMyStudentId() || currentUser.studentId;
    setStudentId(saved);
    setInputId(saved);
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const myItems = items.filter(i => i.reporterStudentId === studentId);
  const myClaims = claims.filter(c => c.studentId === studentId);

  const applyStudentId = (e: React.FormEvent) => {
    e.preventDefault();
    const id = inputId.trim();
    if (!id) return;
    setStudentId(id);
    setMyStudentId(id);
  };

  const closeItem = (item: LostItem) => {
    const message = getReportType(item) === 'found'
      ? `ยืนยันว่าได้คืน "${item.name}" ให้เจ้าของแล้ว?`
      : `ยืนยันว่าได้ "${item.name}" คืนแล้ว และไม่ต้องตามหาต่อ?`;
    if (!confirm(message)) return;
    const updated = items.map(i => i.id === item.id ? { ...i, status: 'returned' as const } : i);
    setItems(updated);
    saveItems(updated);
  };

  const deleteItem = (item: LostItem) => {
    if (!confirm(`ลบรายการ "${item.name}" ออกจากระบบ?`)) return;
    const updated = items.filter(i => i.id !== item.id);
    setItems(updated);
    saveItems(updated);
  };

  return (
    <div className="pb-8">
      <div className="space-y-8">
        <PageHeader
          title="รายการของฉัน"
          description="ติดตามสถานะของที่คุณแจ้ง ดูรายการที่ระบบจับคู่ให้ และรับรหัสส่งมอบเมื่อคำขอรับคืนได้รับอนุมัติ"
          icon={<ClipboardList className="w-5 h-5" />}
          actions={
            <form onSubmit={applyStudentId} className="flex items-center gap-2 rounded-2xl bg-white border border-line p-1.5 shadow-card">
              <UserCircle2 className="w-4 h-4 text-slate-400 ml-2" />
              <input
                value={inputId}
                onChange={(e) => setInputId(e.target.value.replace(/\D/g, '').slice(0, 13))}
                className="w-36 px-1 py-1.5 text-sm font-mono bg-transparent focus:outline-none"
                placeholder="รหัสนักศึกษา"
                aria-label="รหัสนักศึกษาของคุณ"
              />
              <button type="submit" className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold cursor-pointer">ดู</button>
            </form>
          }
        />

        {/* คำขอรับคืนของฉัน */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 font-display">
            <ClipboardList className="w-5 h-5 text-[#2346d8]" /> คำขอรับของคืนของฉัน ({myClaims.length})
          </h2>
          {myClaims.length === 0 ? (
            <p className="text-sm text-gray-500 bg-white rounded-2xl border border-line p-6">ยังไม่มีคำขอรับของคืน</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myClaims.map((c) => (
                <div key={c.requestId} className="bg-white rounded-2xl border border-line p-5 space-y-3 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-mono text-gray-500">{c.requestId} • {c.itemCode}</p>
                      <Link href={`/items/${c.itemId}`} className="font-bold text-gray-900 hover:text-[#2346d8] truncate block">{c.itemName}</Link>
                      <p className="text-xs text-gray-500 mt-0.5">นัดรับ {c.claimDateTime}{c.claimLocation ? ` • ${c.claimLocation}` : ''}</p>
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold ${claimStatusLabel[c.status].cls}`}>
                      {claimStatusLabel[c.status].text}
                    </span>
                  </div>
                  {c.status === 'approved' && c.handoverCode && (
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="bg-white p-1.5 rounded-lg border border-emerald-200 shrink-0">
                        <QRCodeSVG value={c.handoverCode} size={72} fgColor="#2346d8" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1"><KeyRound className="w-3.5 h-3.5" /> รหัสส่งมอบ</p>
                        <p className="text-2xl font-black font-mono tracking-[0.3em] text-emerald-900">{c.handoverCode}</p>
                        <p className="text-[11px] text-emerald-800/80">แจ้งรหัสนี้กับเจ้าหน้าที่ตอนรับของ ห้ามส่งให้ผู้อื่น</p>
                      </div>
                    </div>
                  )}
                  {c.status === 'completed' && c.handedOverAt && (
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      รับของเมื่อ {new Date(c.handedOverAt).toLocaleString('th-TH')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ของที่ฉันแจ้ง */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2 font-display">
              <Package className="w-5 h-5 text-[#2346d8]" /> รายการที่ฉันแจ้ง ({myItems.length})
            </h2>
            <Link href="/report" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2346d8] hover:underline">
              <Plus className="w-3.5 h-3.5" /> แจ้งรายการใหม่
            </Link>
          </div>
          {myItems.length === 0 ? (
            <p className="text-sm text-gray-500 bg-white rounded-2xl border border-line p-6">
              ยังไม่มีรายการที่แจ้งด้วยรหัสนักศึกษา <span className="font-mono">{studentId || '-'}</span>
            </p>
          ) : (
            <div className="space-y-4">
              {myItems.map((item) => {
                const matches = item.status === 'returned' ? [] : findMatches(item, items, 3);
                const isFound = getReportType(item) === 'found';
                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-line p-5 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-28 h-28 rounded-xl bg-[#eef1fe] overflow-hidden shrink-0 flex items-center justify-center">
                        {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[11px] font-mono text-gray-500">{item.code} • {isFound ? 'แจ้งพบของ' : 'แจ้งของหาย'}</p>
                            <Link href={`/items/${item.id}`} className="text-base font-bold text-gray-900 hover:text-[#2346d8] truncate block">{item.name}</Link>
                            <p className="text-xs text-gray-500 truncate">{item.location} • {item.dateLost}</p>
                          </div>
                          {statusBadge(item.status)}
                        </div>
                        <ItemTimeline item={item} claims={claims} />
                        {item.status !== 'returned' && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            <button onClick={() => closeItem(item)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
                              <CheckCircle2 className="w-3.5 h-3.5" /> {isFound ? 'คืนเจ้าของแล้ว' : 'ได้ของคืนแล้ว ปิดรายการ'}
                            </button>
                            <button onClick={() => deleteItem(item)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-600 cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" /> ลบ
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {item.status !== 'returned' && (
                      <div className="pt-3 border-t border-gray-100 space-y-2">
                        <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          {isFound ? 'รายการแจ้งหายที่อาจเป็นของชิ้นนี้' : 'ของที่มีคนแจ้งพบซึ่งอาจเป็นของคุณ'}
                        </p>
                        <MatchList matches={matches} emptyText="ยังไม่พบรายการที่ตรงกัน" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
