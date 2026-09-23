'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  PackageCheck,
  Eye,
  Edit,
  Trash2,
  UserCog,
  CheckCircle,
  ShieldAlert,
  UserCheck,
  Check,
  BellRing,
  Package,
  Layers,
  KeyRound,
  BarChart3,
  AlertTriangle
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import AdminStats from '@/components/admin/AdminStats'
import { useRole } from '@/context/RoleContext'
import { LostItem, ClaimRequest } from '@/types'
import { getItems, saveItems, getClaims, saveClaims, getReportType, generateHandoverCode, isSecretAnswerMatch } from '@/lib/storage'
import PageHeader from '@/components/layout/PageHeader'

const initialUsers = [
  { id: '1', name: 'Aom', studentId: '65012345', email: 'aom123@gmail.com', role: 'user', status: 'active' },
  { id: '2', name: 'Bank', studentId: '65012890', email: 'bank_b@gmail.com', role: 'user', status: 'active' },
  { id: '3', name: 'Mint', studentId: '65013004', email: 'mint_m@gmail.com', role: 'admin', status: 'active' },
  { id: '4', name: 'Film', studentId: '65014112', email: 'film_f@gmail.com', role: 'user', status: 'active' },
  { id: '5', name: 'John', studentId: '65015998', email: 'john_j@gmail.com', role: 'user', status: 'active' },
]

export default function AdminDashboardPage() {
  const { currentRole, setCurrentRole, isAdmin } = useRole()

  const [items, setItems] = useState<LostItem[]>([])
  const [claimRequests, setClaimRequests] = useState<ClaimRequest[]>([])
  const [users, setUsers] = useState(initialUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'pending' | 'returned' | 'claims' | 'stats'>('all')
  const [handoverClaim, setHandoverClaim] = useState<ClaimRequest | null>(null)
  const [handoverInput, setHandoverInput] = useState('')
  const [handoverError, setHandoverError] = useState('')
  const [viewingItem, setViewingItem] = useState<LostItem | null>(null)
  const [editingItem, setEditingItem] = useState<LostItem | null>(null)
  const [newStatus, setNewStatus] = useState<LostItem['status']>('searching')
  const [showUserModal, setShowUserModal] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  useEffect(() => {
    const loadData = () => {
      setItems(getItems())
      setClaimRequests(getClaims())
    }
    loadData()
    window.addEventListener('storage', loadData)
    return () => window.removeEventListener('storage', loadData)
  }, [])

  const showToast = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  const updateClaim = (requestId: string, changes: Partial<ClaimRequest>) => {
    const updatedRequests = claimRequests.map(req => req.requestId === requestId ? { ...req, ...changes } : req)
    setClaimRequests(updatedRequests)
    saveClaims(updatedRequests)
  }

  // อนุมัติ = ออกรหัสส่งมอบ 6 หลักให้ผู้ขอ สถานะสิ่งของยังไม่เปลี่ยนจนกว่าจะยืนยันรหัสตอนส่งมอบจริง
  const handleApproveClaim = (requestId: string, itemName: string) => {
    updateClaim(requestId, { status: 'approved', handoverCode: generateHandoverCode(), approvedAt: new Date().toISOString() })
    showToast(`อนุมัติคำขอ "${itemName}" แล้ว ออกรหัสส่งมอบให้ผู้ขอเรียบร้อย`)
  }

  const handleRejectClaim = (requestId: string, itemName: string) => {
    updateClaim(requestId, { status: 'rejected' })
    showToast(`ปฏิเสธคำขอ "${itemName}" เรียบร้อย`)
  }

  const openHandover = (req: ClaimRequest) => {
    setHandoverClaim(req)
    setHandoverInput('')
    setHandoverError('')
  }

  const confirmHandover = (e: React.FormEvent) => {
    e.preventDefault()
    if (!handoverClaim) return
    if (handoverInput.trim() !== handoverClaim.handoverCode) {
      setHandoverError('รหัสไม่ถูกต้อง กรุณาตรวจสอบรหัสจากหน้า "รายการของฉัน" ของผู้รับอีกครั้ง')
      return
    }
    updateClaim(handoverClaim.requestId, {
      status: 'completed',
      handedOverAt: new Date().toISOString(),
      handedOverBy: currentRole === 'admin' ? 'ผู้ดูแลระบบ' : currentRole
    })
    const updatedItems = items.map(item => item.id === handoverClaim.itemId ? { ...item, status: 'returned' as const } : item)
    setItems(updatedItems)
    saveItems(updatedItems)
    showToast(`ส่งมอบ "${handoverClaim.itemName}" สำเร็จ บันทึกประวัติแล้ว`)
    setHandoverClaim(null)
  }

  const handleStatusChange = (id: string, status: LostItem['status']) => {
    const updated = items.map(item => item.id === id ? { ...item, status } : item)
    setItems(updated)
    saveItems(updated)
    setEditingItem(null)
    showToast('อัปเดตสถานะสำเร็จ!')
  }

  const handleDeleteItem = (id: string, name: string) => {
    if (confirm(`ต้องการลบรายการ "${name}" ใช่หรือไม่?`)) {
      const updated = items.filter(item => item.id !== id)
      setItems(updated)
      saveItems(updated)
      showToast(`ลบรายการ "${name}" เรียบร้อย`)
    }
  }

  const toggleUserRole = (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin'
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: nextRole } : u))
    showToast(`เปลี่ยนสิทธิ์ผู้ใช้เรียบร้อย`)
  }

  const computedAdminStats = {
    totalItems: items.length,
    searching: items.filter(i => String(i.status).includes('searching')).length,
    returned: items.filter(i => String(i.status).includes('returned')).length,
    pendingClaims: claimRequests.filter(r => r.status === 'pending').length,
    totalUsers: users.length
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.reporterName && item.reporterName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()))

    if (activeFilterTab === 'pending') return matchesSearch && item.status !== 'returned'
    if (activeFilterTab === 'returned') return matchesSearch && item.status === 'returned'
    return matchesSearch
  })

  const getStatusBadge = (status: LostItem['status']) => {
    switch (status) {
      case 'searching': return <Badge variant="searching">กำลังค้นหา</Badge>
      case 'found': return <Badge variant="found">พบแล้ว</Badge>
      case 'returned': return <Badge variant="returned">รับคืนแล้ว</Badge>
      default: return <Badge variant="pending">{status}</Badge>
    }
  }

  if (!isAdmin) {
    return (
      <div className="h-[calc(100vh-100px)] flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-gray-200/80 shadow-xl text-center max-w-sm space-y-4">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 font-display">เฉพาะผู้ดูแลระบบเท่านั้น</h2>
          <button onClick={() => setCurrentRole('admin')} className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2">
            <UserCheck className="w-4 h-4" />
            <span>สลับเป็นสิทธิ์แอดมิน</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-8">
      {notification && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-semibold animate-bounce border border-emerald-400/30">
          <CheckCircle className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      <div className="space-y-5">
        
        <PageHeader
          eyebrow="แผงควบคุมแอดมิน"
          title="แผงควบคุมผู้ดูแลระบบ"
          description="ตรวจสอบรายการ อนุมัติคำขอรับคืน ยืนยันการส่งมอบ และดูสถิติจุดเสี่ยงภายในมหาวิทยาลัย"
          icon={<ShieldAlert className="w-5 h-5" />}
          actions={
            <button
              onClick={() => setShowUserModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-line px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <UserCog className="w-4 h-4 text-brand-600" />
              จัดการผู้ใช้ ({users.length})
            </button>
          }
        />

        {/* Stats Grid แบบมีการ์ดลูกเล่น Hover ยกตัวและเปลี่ยนสีขอบ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          
          <div onClick={() => setActiveFilterTab('all')} className={`bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 group ${activeFilterTab === 'all' ? 'border-[#2346d8] bg-brand-50/40 ring-2 ring-[#2346d8]/20' : 'border-gray-200 hover:border-brand-200'}`}>
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase">รายการทั้งหมด</p>
              <Layers className="w-3.5 h-3.5 text-brand-500 opacity-70 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-semibold text-ink font-display mt-0.5">{computedAdminStats.totalItems}</h3>
          </div>

          <div onClick={() => setActiveFilterTab('pending')} className={`bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 group ${activeFilterTab === 'pending' ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20' : 'border-gray-200 hover:border-amber-300'}`}>
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase">กำลังค้นหา</p>
              <Search className="w-3.5 h-3.5 text-amber-500 opacity-70 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-semibold text-ink font-display mt-0.5">{computedAdminStats.searching}</h3>
          </div>

          <div onClick={() => setActiveFilterTab('returned')} className={`bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 group ${activeFilterTab === 'returned' ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20' : 'border-gray-200 hover:border-emerald-300'}`}>
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase">รับคืนแล้ว</p>
              <PackageCheck className="w-3.5 h-3.5 text-emerald-500 opacity-70 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-semibold text-ink font-display mt-0.5">{computedAdminStats.returned}</h3>
          </div>

          <div onClick={() => setActiveFilterTab('claims')} className={`bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 group relative ${activeFilterTab === 'claims' ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20' : 'border-gray-200 hover:border-brand-200'}`}>
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase">คำขอรับของคืน</p>
              <BellRing className="w-3.5 h-3.5 text-brand-500 opacity-70 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex justify-between items-center mt-0.5">
              <h3 className="text-2xl font-semibold text-ink font-display">{computedAdminStats.pendingClaims}</h3>
              {computedAdminStats.pendingClaims > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse font-mono shadow-sm">
                  {computedAdminStats.pendingClaims} ใหม่
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Main Content Area (ตารางหรือคำขอแบบไร้รอยต่อ) */}
        <div className="bg-white rounded-2xl border border-line overflow-hidden shadow-card">
          
          {/* Toolbar ด้านบนตาราง พร้อมปุ่มสลับแท็บย่อยมีลูกเล่น */}
          <div className="px-4 py-2.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-200/70 p-0.5 rounded-xl text-xs font-semibold">
                <button 
                  onClick={() => setActiveFilterTab('all')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${activeFilterTab !== 'claims' && activeFilterTab !== 'stats' ? 'bg-white text-[#2346d8] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  รายการสิ่งของ
                </button>
                <button 
                  onClick={() => setActiveFilterTab('claims')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${activeFilterTab === 'claims' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <span>คำขอรับคืน</span>
                  {computedAdminStats.pendingClaims > 0 && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  )}
                </button>
                <button
                  onClick={() => setActiveFilterTab('stats')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${activeFilterTab === 'stats' ? 'bg-white text-[#2346d8] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>สถิติ & จุดเสี่ยง</span>
                </button>
              </div>
            </div>

            <div className={`relative w-64 ${activeFilterTab === 'stats' ? 'invisible' : ''}`}>
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, รหัส หรือสถานที่..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2346d8]/30 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* ส่วนแสดงตารางเนื้อหา (ล็อกความสูงไม่ให้หน้าเว็บยืดเลื่อน) */}
          <div className="overflow-x-auto">
            {activeFilterTab === 'stats' ? (
              <AdminStats items={items} />
            ) : activeFilterTab === 'claims' ? (
              <div className="p-4 space-y-2.5">
                {claimRequests.length > 0 ? (
                  claimRequests.map((req) => {
                    const claimedItem = items.find(i => i.id === req.itemId)
                    const hasSecret = !!(claimedItem?.secretQuestion && claimedItem.secretAnswer)
                    const secretOk = hasSecret && isSecretAnswerMatch(req.secretAnswerGiven || '', claimedItem!.secretAnswer!)
                    return (
                    <div key={req.requestId} className="p-3.5 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50/80 to-white flex justify-between items-center gap-4 text-xs hover:border-brand-200 transition-colors shadow-sm">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] bg-brand-100 text-[#2346d8] px-2 py-0.5 rounded font-bold">{req.requestId}</span>
                          <span className="font-bold text-gray-900">สิ่งของ: {req.itemName}</span>
                        </div>
                        <p className="text-[11px] text-gray-600">ผู้ขอ: <strong className="text-gray-900">{req.claimerName}</strong> ({req.studentId}) | นัดรับ: {req.claimDateTime}{req.claimLocation ? ` @ ${req.claimLocation}` : ''} | ติดต่อ: <span className="text-brand-600 font-medium">{req.contact}</span></p>
                        {req.note && <p className="text-[11px] text-gray-500">หมายเหตุ/จุดสังเกต: {req.note}</p>}
                        {hasSecret && (
                          <p className={`text-[11px] ${secretOk ? 'text-emerald-700' : 'text-red-600'}`}>
                            คำถามลับ: {claimedItem!.secretQuestion} | ตอบ: <strong>{req.secretAnswerGiven || '-'}</strong> | คำตอบจริง: <strong>{claimedItem!.secretAnswer}</strong> {secretOk ? '✓ ตรงกัน' : '✗ ไม่ตรง'}
                          </p>
                        )}
                        {req.status === 'completed' && req.handedOverAt && (
                          <p className="text-[11px] text-gray-500">ส่งมอบเมื่อ {new Date(req.handedOverAt).toLocaleString('th-TH')} โดย {req.handedOverBy}</p>
                        )}
                      </div>
                      {req.status === 'pending' ? (
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => handleRejectClaim(req.requestId, req.itemName)} className="px-3 py-1 bg-white text-red-600 border border-red-200 rounded-lg text-[11px] font-semibold cursor-pointer hover:bg-red-50 shadow-sm">ปฏิเสธ</button>
                          <button onClick={() => handleApproveClaim(req.requestId, req.itemName)} className="px-3.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-semibold cursor-pointer hover:bg-emerald-700 shadow-sm flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>อนุมัติ</span>
                          </button>
                        </div>
                      ) : req.status === 'approved' ? (
                        <button onClick={() => openHandover(req)} className="shrink-0 px-3.5 py-1 bg-[#2346d8] text-white rounded-lg text-[11px] font-semibold cursor-pointer hover:bg-[#1c38b4] shadow-sm flex items-center gap-1">
                          <KeyRound className="w-3 h-3" />
                          <span>ยืนยันส่งมอบ</span>
                        </button>
                      ) : (
                        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold ${req.status === 'completed' ? 'bg-brand-100 text-[#2346d8]' : 'bg-red-100 text-red-800'}`}>
                          {req.status === 'completed' ? 'ส่งมอบแล้ว' : 'ปฏิเสธแล้ว'}
                        </span>
                      )}
                    </div>
                    )
                  })
                ) : (
                  <div className="py-12 text-center text-gray-400 text-xs">ยังไม่มีคำขอรับของคืนในระบบขณะนี้</div>
                )}
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/90 sticky top-0 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase backdrop-blur-sm">
                  <tr>
                    <th className="p-3">สิ่งของ</th>
                    <th className="p-3">รหัส / สถานที่</th>
                    <th className="p-3">ผู้แจ้ง</th>
                    <th className="p-3">สถานะ</th>
                    <th className="p-3 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-brand-50/30 transition-colors group">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200 shadow-sm group-hover:scale-105 transition-transform">
                            {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : <Package className="w-4 h-4 text-gray-400" />}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-gray-900 truncate max-w-[150px] block">{item.name}</span>
                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                              {getReportType(item) === 'found' ? 'แจ้งพบ' : 'แจ้งหาย'}
                              {item.urgency === 'high' && (
                                <span className="inline-flex items-center gap-0.5 text-red-600 font-semibold">
                                  <AlertTriangle className="w-3 h-3" /> สำคัญมาก
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-mono font-bold text-[#2346d8]">{item.code || '-'}</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{item.location || '-'}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-gray-800">{item.reporterName || 'ไม่ระบุ'}</p>
                        <p className="text-[10px] text-gray-400">{item.dateLost ? new Date(item.dateLost).toLocaleDateString('th-TH') : '-'}</p>
                      </td>
                      <td className="p-3">{getStatusBadge(item.status)}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setViewingItem(item)} className="p-1.5 text-gray-500 hover:text-[#2346d8] hover:bg-brand-50 rounded-lg cursor-pointer transition-colors" title="ดู"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => { setEditingItem(item); setNewStatus(item.status); }} className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors" title="แก้"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteItem(item.id, item.name)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors" title="ลบ"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr><td colSpan={5} className="p-10 text-center text-gray-400 text-xs">ไม่พบรายการสิ่งของในระบบตามเงื่อนไข</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

        </div>

      </div>

      {/* Modals */}
      {showUserModal && (
        <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)} title="จัดการผู้ใช้งานในระบบ">
          <div className="space-y-3 text-xs">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr><th className="p-2">ชื่อ</th><th className="p-2">รหัสนักศึกษา</th><th className="p-2">สิทธิ์</th><th className="p-2 text-center">จัดการ</th></tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="p-2 font-semibold">{u.name}</td>
                    <td className="p-2 font-mono">{u.studentId}</td>
                    <td className="p-2 uppercase font-mono text-[10px] text-brand-600 font-bold">{u.role}</td>
                    <td className="p-2 text-center"><button onClick={() => toggleUserRole(u.id, u.role)} className="px-2.5 py-1 bg-gray-100 hover:bg-[#2346d8] hover:text-white rounded-lg text-[10px] cursor-pointer transition-colors shadow-sm">สลับสิทธิ์</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {viewingItem && (
        <Modal isOpen={!!viewingItem} onClose={() => setViewingItem(null)} title={`รายละเอียด ${viewingItem.code || '-'}`}>
          <div className="space-y-3 text-xs">
            {viewingItem.imageUrl && <div className="w-full h-36 rounded-xl overflow-hidden bg-gray-100 border shadow-inner"><img src={viewingItem.imageUrl} alt="" className="w-full h-full object-cover" /></div>}
            <p><strong>ชื่อ:</strong> {viewingItem.name}</p>
            <p><strong>สถานที่:</strong> {viewingItem.location}</p>
            <p><strong>ผู้แจ้ง:</strong> {viewingItem.reporterName || 'ไม่ระบุ'} ({viewingItem.reporterPhone || '-'})</p>
            <p><strong>ประเภท:</strong> {getReportType(viewingItem) === 'found' ? 'แจ้งพบของ' : 'แจ้งของหาย'} • <strong>ความสำคัญ:</strong> {viewingItem.urgency === 'high' ? 'สำคัญมาก' : 'ปกติ'}</p>
            {viewingItem.secretQuestion && (
              <p className="p-2 rounded-lg bg-emerald-50 border border-emerald-200"><strong>คำถามลับ:</strong> {viewingItem.secretQuestion} → <strong>{viewingItem.secretAnswer}</strong></p>
            )}
          </div>
        </Modal>
      )}

      {handoverClaim && (
        <Modal isOpen={!!handoverClaim} onClose={() => setHandoverClaim(null)} title="ยืนยันการส่งมอบสิ่งของ">
          <form onSubmit={confirmHandover} className="space-y-3 text-xs">
            <p>ส่งมอบ <strong>{handoverClaim.itemName}</strong> ให้ <strong>{handoverClaim.claimerName}</strong> ({handoverClaim.studentId})</p>
            <p className="text-gray-500">ขอให้ผู้รับเปิดหน้า &quot;รายการของฉัน&quot; แล้วแจ้งรหัสส่งมอบ 6 หลัก เมื่อรหัสถูกต้อง สถานะจะเปลี่ยนเป็น &quot;รับคืนแล้ว&quot; และบันทึกเวลาส่งมอบไว้</p>
            <input
              value={handoverInput}
              onChange={(e) => { setHandoverInput(e.target.value.replace(/\D/g, '').slice(0, 6)); setHandoverError('') }}
              inputMode="numeric"
              autoFocus
              placeholder="______"
              className="w-full p-3 text-center text-2xl font-mono tracking-[0.5em] border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2346d8]/30"
            />
            {handoverError && <p className="text-red-600">{handoverError}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setHandoverClaim(null)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">ยกเลิก</button>
              <button type="submit" disabled={handoverInput.length !== 6} className="px-3 py-1.5 bg-[#2346d8] hover:bg-[#1c38b4] text-white rounded-lg cursor-pointer transition-colors shadow-sm disabled:opacity-50">ยืนยันส่งมอบ</button>
            </div>
          </form>
        </Modal>
      )}

      {editingItem && (
        <Modal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title="เปลี่ยนสถานะรายการ">
          <div className="space-y-3 text-xs">
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as LostItem['status'])} className="w-full p-2 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#2346d8]/30">
              <option value="searching">กำลังค้นหา</option>
              <option value="found">พบแล้ว</option>
              <option value="returned">รับคืนแล้ว</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingItem(null)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">ยกเลิก</button>
              <button onClick={() => handleStatusChange(editingItem.id, newStatus)} className="px-3 py-1.5 bg-[#2346d8] hover:bg-[#1c38b4] text-white rounded-lg cursor-pointer transition-colors shadow-sm">บันทึก</button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}