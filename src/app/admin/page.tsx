'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  CalendarRange, 
  FileText, 
  Search, 
  PackageCheck, 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  ClipboardList, 
  UserCog, 
  History, 
  CheckCircle,
  ShieldAlert,
  UserCheck,
  Check,
  BellRing,
  XCircle,
  Package,
  MapPin,
  Calendar,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { useRole } from '@/context/RoleContext'
import { LostItem } from '@/types'

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
  const [claimRequests, setClaimRequests] = useState<any[]>([])
  const [users, setUsers] = useState(initialUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'pending' | 'returned' | 'claims'>('all')
  const [viewingItem, setViewingItem] = useState<LostItem | null>(null)
  const [editingItem, setEditingItem] = useState<LostItem | null>(null)
  const [newStatus, setNewStatus] = useState<LostItem['status']>('searching')
  const [showUserModal, setShowUserModal] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  useEffect(() => {
    const loadData = () => {
      const savedItems = localStorage.getItem('lostItems')
      if (savedItems) {
        try { setItems(JSON.parse(savedItems)) } catch (e) { console.error(e) }
      }
      const savedRequests = localStorage.getItem('adminClaimRequests')
      if (savedRequests) {
        try { setClaimRequests(JSON.parse(savedRequests)) } catch (e) { console.error(e) }
      }
    }
    loadData()
    window.addEventListener('storage', loadData)
    return () => window.removeEventListener('storage', loadData)
  }, [])

  const showToast = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  const handleApproveClaim = (requestId: string, itemId: string, itemName: string) => {
    let updatedItems = items.map(item => item.id === itemId ? { ...item, status: 'returned' as const } : item)
    setItems(updatedItems)
    localStorage.setItem('lostItems', JSON.stringify(updatedItems))

    let updatedRequests = claimRequests.map(req => req.requestId === requestId ? { ...req, status: 'approved' } : req)
    setClaimRequests(updatedRequests)
    localStorage.setItem('adminClaimRequests', JSON.stringify(updatedRequests))

    showToast(`อนุมัติรับคืน "${itemName}" สำเร็จ!`)
  }

  const handleRejectClaim = (requestId: string, itemId: string, itemName: string) => {
    let updatedItems = items.map(item => item.id === itemId ? { ...item, status: 'searching' as const } : item)
    setItems(updatedItems)
    localStorage.setItem('lostItems', JSON.stringify(updatedItems))

    let updatedRequests = claimRequests.map(req => req.requestId === requestId ? { ...req, status: 'rejected' } : req)
    setClaimRequests(updatedRequests)
    localStorage.setItem('adminClaimRequests', JSON.stringify(updatedRequests))

    showToast(`ปฏิเสธคำขอ "${itemName}" เรียบร้อย`)
  }

  const handleStatusChange = (id: string, status: LostItem['status']) => {
    const updated = items.map(item => item.id === id ? { ...item, status } : item)
    setItems(updated)
    localStorage.setItem('lostItems', JSON.stringify(updated))
    setEditingItem(null)
    showToast('อัปเดตสถานะสำเร็จ!')
  }

  const handleDeleteItem = (id: string, name: string) => {
    if (confirm(`ต้องการลบรายการ "${name}" ใช่หรือไม่?`)) {
      const updated = items.filter(item => item.id !== id)
      setItems(updated)
      localStorage.setItem('lostItems', JSON.stringify(updated))
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
          <h2 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans']">เฉพาะผู้ดูแลระบบเท่านั้น</h2>
          <button onClick={() => setCurrentRole('admin')} className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2">
            <UserCheck className="w-4 h-4" />
            <span>สลับเป็นสิทธิ์แอดมิน</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col justify-between font-sans text-[#0d1c2f] overflow-hidden px-4 py-2">
      {notification && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-semibold animate-bounce border border-emerald-400/30">
          <CheckCircle className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      <div className="max-w-7xl w-full mx-auto space-y-3 flex flex-col h-full">
        
        {/* Header แบนเนอร์ดีไซน์กระจกเงาและลูกเล่นเรืองแสง */}
        <div className="flex justify-between items-center bg-gradient-to-r from-[#00366f] via-[#004c99] to-[#1e3a8a] text-white px-6 py-3.5 rounded-2xl shadow-lg relative overflow-hidden shrink-0 border border-white/10">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-0.5 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md mb-1 border border-white/20">
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              Admin Portal
            </div>
            <h1 className="text-lg font-extrabold tracking-tight font-['Plus_Jakarta_Sans']">แผงควบคุมผู้ดูแลระบบ</h1>
          </div>
          <button 
            onClick={() => setShowUserModal(true)}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl text-xs font-semibold border border-white/25 transition-all duration-300 shadow-sm cursor-pointer group hover:scale-105 active:scale-95"
          >
            <UserCog className="w-4 h-4 text-amber-300 group-hover:rotate-45 transition-transform" />
            <span>จัดการผู้ใช้ ({users.length})</span>
          </button>
        </div>

        {/* Stats Grid แบบมีการ์ดลูกเล่น Hover ยกตัวและเปลี่ยนสีขอบ */}
        <div className="grid grid-cols-4 gap-3 shrink-0">
          
          <div onClick={() => setActiveFilterTab('all')} className={`bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 group ${activeFilterTab === 'all' ? 'border-[#00366f] bg-blue-50/40 ring-2 ring-[#00366f]/20' : 'border-gray-200 hover:border-blue-300'}`}>
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase font-['Inter']">รายการทั้งหมด</p>
              <Layers className="w-3.5 h-3.5 text-blue-500 opacity-70 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-black text-[#0d1c2f] font-mono mt-0.5">{computedAdminStats.totalItems}</h3>
          </div>

          <div onClick={() => setActiveFilterTab('pending')} className={`bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 group ${activeFilterTab === 'pending' ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20' : 'border-gray-200 hover:border-amber-300'}`}>
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase font-['Inter']">กำลังค้นหา</p>
              <Search className="w-3.5 h-3.5 text-amber-500 opacity-70 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-black text-[#0d1c2f] font-mono mt-0.5">{computedAdminStats.searching}</h3>
          </div>

          <div onClick={() => setActiveFilterTab('returned')} className={`bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 group ${activeFilterTab === 'returned' ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20' : 'border-gray-200 hover:border-emerald-300'}`}>
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase font-['Inter']">รับคืนแล้ว</p>
              <PackageCheck className="w-3.5 h-3.5 text-emerald-500 opacity-70 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-black text-[#0d1c2f] font-mono mt-0.5">{computedAdminStats.returned}</h3>
          </div>

          <div onClick={() => setActiveFilterTab('claims')} className={`bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 group relative ${activeFilterTab === 'claims' ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20' : 'border-gray-200 hover:border-blue-300'}`}>
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase font-['Inter']">คำขอรับของคืน</p>
              <BellRing className="w-3.5 h-3.5 text-blue-500 opacity-70 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex justify-between items-center mt-0.5">
              <h3 className="text-xl font-black text-[#0d1c2f] font-mono">{computedAdminStats.pendingClaims}</h3>
              {computedAdminStats.pendingClaims > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse font-mono shadow-xs">
                  {computedAdminStats.pendingClaims} ใหม่
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Main Content Area (ตารางหรือคำขอแบบไร้รอยต่อ) */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/80 overflow-hidden flex flex-col flex-1 shadow-sm">
          
          {/* Toolbar ด้านบนตาราง พร้อมปุ่มสลับแท็บย่อยมีลูกเล่น */}
          <div className="px-4 py-2.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-200/70 p-0.5 rounded-xl text-xs font-semibold">
                <button 
                  onClick={() => setActiveFilterTab('all')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${activeFilterTab !== 'claims' ? 'bg-white text-[#00366f] shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  รายการสิ่งของ
                </button>
                <button 
                  onClick={() => setActiveFilterTab('claims')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${activeFilterTab === 'claims' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <span>คำขอรับคืน</span>
                  {computedAdminStats.pendingClaims > 0 && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  )}
                </button>
              </div>
            </div>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, รหัส หรือสถานที่..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00366f]/30 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* ส่วนแสดงตารางเนื้อหา (ล็อกความสูงไม่ให้หน้าเว็บยืดเลื่อน) */}
          <div className="overflow-y-auto flex-1 max-h-[350px]">
            {activeFilterTab === 'claims' ? (
              <div className="p-4 space-y-2.5">
                {claimRequests.length > 0 ? (
                  claimRequests.map((req) => (
                    <div key={req.requestId} className="p-3.5 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50/80 to-white flex justify-between items-center gap-4 text-xs hover:border-blue-200 transition-colors shadow-2xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] bg-blue-100 text-[#00366f] px-2 py-0.5 rounded font-bold">{req.requestId}</span>
                          <span className="font-bold text-gray-900">สิ่งของ: {req.itemName}</span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-1">ผู้ขอ: <strong className="text-gray-900">{req.claimerName}</strong> | นัดรับ: {req.claimDateTime} | โทร: <span className="text-blue-600 font-medium">{req.contact}</span></p>
                      </div>
                      {req.status === 'pending' ? (
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => handleRejectClaim(req.requestId, req.itemId, req.itemName)} className="px-3 py-1 bg-white text-red-600 border border-red-200 rounded-lg text-[11px] font-semibold cursor-pointer hover:bg-red-50 shadow-2xs">ปฏิเสธ</button>
                          <button onClick={() => handleApproveClaim(req.requestId, req.itemId, req.itemName)} className="px-3.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-semibold cursor-pointer hover:bg-emerald-700 shadow-xs flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>อนุมัติ</span>
                          </button>
                        </div>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {req.status === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว'}
                        </span>
                      )}
                    </div>
                  ))
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
                <tbody className="divide-y divide-gray-100 text-xs font-['Inter']">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200 shadow-2xs group-hover:scale-105 transition-transform">
                            {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : <Package className="w-4 h-4 text-gray-400" />}
                          </div>
                          <span className="font-bold text-gray-900 truncate max-w-[150px]">{item.name}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-mono font-bold text-[#00366f]">{item.code || '-'}</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{item.location || '-'}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-gray-800">{item.reporterName || 'ไม่ระบุ'}</p>
                        <p className="text-[10px] text-gray-400">{item.dateLost ? new Date(item.dateLost).toLocaleDateString('th-TH') : '-'}</p>
                      </td>
                      <td className="p-3">{getStatusBadge(item.status)}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setViewingItem(item)} className="p-1.5 text-gray-500 hover:text-[#00366f] hover:bg-blue-50 rounded-lg cursor-pointer transition-colors" title="ดู"><Eye className="w-3.5 h-3.5" /></button>
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
                    <td className="p-2 uppercase font-mono text-[10px] text-blue-600 font-bold">{u.role}</td>
                    <td className="p-2 text-center"><button onClick={() => toggleUserRole(u.id, u.role)} className="px-2.5 py-1 bg-gray-100 hover:bg-[#00366f] hover:text-white rounded-lg text-[10px] cursor-pointer transition-colors shadow-2xs">สลับสิทธิ์</button></td>
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
          </div>
        </Modal>
      )}

      {editingItem && (
        <Modal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title="เปลี่ยนสถานะรายการ">
          <div className="space-y-3 text-xs">
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as LostItem['status'])} className="w-full p-2 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#00366f]/30">
              <option value="searching">กำลังค้นหา</option>
              <option value="found">พบแล้ว</option>
              <option value="returned">รับคืนแล้ว</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingItem(null)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">ยกเลิก</button>
              <button onClick={() => handleStatusChange(editingItem.id, newStatus)} className="px-3 py-1.5 bg-[#00366f] hover:bg-[#002855] text-white rounded-lg cursor-pointer transition-colors shadow-sm">บันทึก</button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}