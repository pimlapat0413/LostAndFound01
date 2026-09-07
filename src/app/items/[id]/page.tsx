'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Calendar, MapPin, Package, Tag } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { LostItem } from '@/types'

export default function ItemDetailPage() {
  const params = useParams<{ id: string }>()
  const [item, setItem] = useState<LostItem | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const savedItems = JSON.parse(localStorage.getItem('lostItems') || '[]') as LostItem[]
      setItem(savedItems.find((savedItem) => savedItem.id === params.id) || null)
    } catch {
      setItem(null)
    } finally {
      setLoaded(true)
    }
  }, [params.id])

  if (!loaded) return <div className="p-8 text-sm text-slate-500">กำลังโหลดข้อมูล...</div>

  if (!item) {
    return (
      <div className="max-w-3xl mx-auto p-6 md:p-10 text-center">
        <Package className="w-10 h-10 mx-auto mb-4 text-slate-400" />
        <h1 className="text-xl font-bold text-slate-800">ไม่พบรายการสิ่งของ</h1>
        <p className="mt-2 text-sm text-slate-500">รายการนี้อาจถูกลบหรือไม่มีอยู่ในอุปกรณ์นี้</p>
        <Link href="/items" className="inline-flex mt-6 items-center gap-2 rounded-xl bg-[#00366f] px-4 py-2 text-sm font-semibold text-white"><ArrowLeft className="w-4 h-4" /> กลับไปหน้ารายการ</Link>
      </div>
    )
  }

  const statusVariant = item.status === 'searching' ? 'searching' : item.status === 'found' ? 'found' : 'returned'

  return (
    <main className="min-h-screen bg-[#f8f9ff] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/items" className="inline-flex items-center gap-2 text-sm font-semibold text-[#00366f] hover:underline"><ArrowLeft className="w-4 h-4" /> กลับไปหน้ารายการ</Link>
        <article className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid md:grid-cols-2">
            <div className="min-h-72 bg-slate-100">{item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400"><Package className="w-14 h-14" /></div>}</div>
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-medium text-slate-500">{item.code}</p><h1 className="mt-1 text-2xl font-extrabold text-[#0d1c2f]">{item.name}</h1></div><Badge variant={statusVariant}>{item.status === 'searching' ? 'กำลังค้นหา' : item.status === 'found' ? 'พบแล้ว' : 'รับคืนแล้ว'}</Badge></div>
              <p className="mt-5 text-sm leading-6 text-slate-600">{item.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>
              <dl className="mt-6 space-y-4 border-t border-slate-100 pt-5 text-sm">
                <div className="flex gap-3"><Tag className="w-5 h-5 shrink-0 text-[#00366f]" /><div><dt className="text-slate-500">หมวดหมู่</dt><dd className="font-semibold text-slate-800">{item.category}</dd></div></div>
                <div className="flex gap-3"><MapPin className="w-5 h-5 shrink-0 text-[#00366f]" /><div><dt className="text-slate-500">สถานที่</dt><dd className="font-semibold text-slate-800">{item.location}{item.locationDetail ? ` — ${item.locationDetail}` : ''}</dd></div></div>
                <div className="flex gap-3"><Calendar className="w-5 h-5 shrink-0 text-[#00366f]" /><div><dt className="text-slate-500">วันที่แจ้ง</dt><dd className="font-semibold text-slate-800">{item.dateLost || item.createdAt}</dd></div></div>
              </dl>
              {item.status !== 'returned' && <Link href="/claim" className="mt-7 inline-flex rounded-xl bg-[#00366f] px-5 py-3 text-sm font-bold text-white hover:bg-[#004c99]">ยื่นคำขอรับคืน</Link>}
            </div>
          </div>
        </article>
      </div>
    </main>
  )
}
