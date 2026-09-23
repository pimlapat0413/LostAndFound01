'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowLeft, Calendar, MapPin, Package, Tag, Image as ImageIcon, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { LostItem } from '@/types'
import PosterGenerator from '@/components/items/PosterGenerator'
import MatchList from '@/components/items/MatchList'
import { getItems, getReportType } from '@/lib/storage'
import { findMatches, MatchResult } from '@/lib/matching'

// โหลดคอมโพเนนต์แผนที่แบบปิด SSR เพื่อป้องกัน Error window is not defined
const ViewMap = dynamic(() => import('@/components/map/ViewMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-gray-50 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 text-sm">
      กำลังโหลดแผนที่...
    </div>
  )
})

export default function ItemDetailPage() {
  const params = useParams<{ id: string }>()
  const [item, setItem] = useState<LostItem | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [showPoster, setShowPoster] = useState(false)
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [activeImage, setActiveImage] = useState('')

  useEffect(() => {
    const savedItems = getItems()
    const found = savedItems.find((savedItem) => savedItem.id === params.id) || null
    setItem(found)
    setActiveImage(found?.imageUrl || '')
    setMatches(found && found.status !== 'returned' ? findMatches(found, savedItems) : [])
    setLoaded(true)
  }, [params.id])

  if (!loaded) return <div className="p-8 text-sm text-slate-500">กำลังโหลดข้อมูล...</div>

  if (!item) {
    return (
      <div className="max-w-3xl mx-auto p-6 md:p-10 text-center">
        <Package className="w-10 h-10 mx-auto mb-4 text-slate-400" />
        <h1 className="text-xl font-bold text-slate-800">ไม่พบรายการสิ่งของ</h1>
        <p className="mt-2 text-sm text-slate-500">รายการนี้อาจถูกลบหรือไม่มีอยู่ในอุปกรณ์นี้</p>
        <Link href="/items" className="inline-flex mt-6 items-center gap-2 rounded-xl bg-[#2346d8] px-4 py-2 text-sm font-semibold text-white">
          <ArrowLeft className="w-4 h-4" /> กลับไปหน้ารายการ
        </Link>
      </div>
    )
  }

  const statusVariant = item.status === 'searching' ? 'searching' : item.status === 'found' ? 'found' : 'returned'
  const isFound = getReportType(item) === 'found'
  const gallery = item.thumbnails?.length ? item.thumbnails : item.imageUrl ? [item.imageUrl] : []

  return (
    <div className="pb-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/items" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2346d8] hover:underline">
          <ArrowLeft className="w-4 h-4" /> กลับไปหน้ารายการ
        </Link>
        <article className="mt-5 overflow-hidden rounded-3xl border border-line bg-white shadow-card">
          <div className="grid md:grid-cols-2">
            
            {/* ฝั่งซ้าย: รูปภาพ และ แผนที่ */}
            <div className="flex flex-col border-r border-slate-100">
              <div className="min-h-72 bg-slate-100 relative">
                {activeImage ? (
                  <img src={activeImage} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    <Package className="w-14 h-14" />
                  </div>
                )}
                {gallery.length > 1 && (
                  <div className="absolute bottom-3 left-3 flex gap-1.5">
                    {gallery.map((src) => (
                      <button
                        key={src}
                        onClick={() => setActiveImage(src)}
                        className={`w-12 h-12 rounded-lg overflow-hidden border-2 cursor-pointer ${activeImage === src ? 'border-white shadow-md' : 'border-white/50 opacity-80'}`}
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex-1">
                <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5 font-display">
                  <MapPin className="w-3.5 h-3.5" /> ตำแหน่งที่ปักหมุดบนแผนที่
                </p>
                {/* ตรวจสอบว่าของชิ้นนี้มีการปักหมุดพิกัด (pinX, pinY) ไว้หรือไม่ */}
                {item.pinX != null && item.pinY != null ? (
                  <ViewMap lat={item.pinX} lng={item.pinY} />
                ) : (
                  <div className="flex h-[300px] w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-sm text-gray-400">
                    ไม่มีการระบุพิกัดบนแผนที่สำหรับรายการนี้
                  </div>
                )}
              </div>
            </div>

            {/* ฝั่งขวา: รายละเอียดสิ่งของ */}
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">{item.code} • {isFound ? 'แจ้งพบสิ่งของ' : 'แจ้งของหาย'}</p>
                  <h1 className="mt-1 text-2xl font-extrabold text-[#0f172a]">{item.name}</h1>
                </div>
                <Badge variant={statusVariant}>
                  {item.status === 'searching' ? 'กำลังค้นหา' : item.status === 'found' ? 'พบแล้ว' : 'รับคืนแล้ว'}
                </Badge>
              </div>
              
              {item.urgency === 'high' && (
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700">
                  <AlertTriangle className="w-3.5 h-3.5" /> สำคัญมาก (เอกสารสำคัญ / ของมีค่าสูง)
                </p>
              )}
              <p className="mt-5 text-sm leading-6 text-slate-600">{item.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>
              
              <dl className="mt-6 space-y-4 border-t border-slate-100 pt-5 text-sm">
                <div className="flex gap-3">
                  <Tag className="w-5 h-5 shrink-0 text-[#2346d8]" />
                  <div>
                    <dt className="text-slate-500">หมวดหมู่</dt>
                    <dd className="font-semibold text-slate-800">{item.category}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 shrink-0 text-[#2346d8]" />
                  <div>
                    <dt className="text-slate-500">สถานที่</dt>
                    <dd className="font-semibold text-slate-800">
                      {item.location}{item.locationDetail ? ` — ${item.locationDetail}` : ''}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Calendar className="w-5 h-5 shrink-0 text-[#2346d8]" />
                  <div>
                    <dt className="text-slate-500">{isFound ? 'วันที่พบ' : 'วันที่ทำหาย'}</dt>
                    <dd className="font-semibold text-slate-800">{item.dateLost || item.createdAt}{item.timeLost ? ` เวลา ${item.timeLost} น.` : ''}</dd>
                  </div>
                </div>
              </dl>
              
              <div className="mt-7 flex flex-wrap gap-3">
                {item.status !== 'returned' && (
                  <Link href={`/claim?item=${item.id}`} className="inline-flex rounded-xl bg-[#2346d8] px-5 py-3 text-sm font-bold text-white hover:bg-[#1c38b4]">
                    ยื่นคำขอรับคืน
                  </Link>
                )}
                <button
                  onClick={() => setShowPoster(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4" />
                  สร้างใบประกาศตามหา
                </button>
              </div>

              {item.secretQuestion && item.status !== 'returned' && (
                <p className="mt-4 text-xs text-emerald-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> ผู้พบตั้งคำถามยืนยันความเป็นเจ้าของไว้ ต้องตอบให้ถูกตอนยื่นคำขอรับคืน
                </p>
              )}

              {item.status !== 'returned' && (
                <div className="mt-7 pt-5 border-t border-slate-100 space-y-3">
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    {isFound ? 'รายการแจ้งหายที่อาจเป็นของชิ้นนี้' : 'ของที่มีคนแจ้งพบที่อาจตรงกัน'}
                  </p>
                  <MatchList matches={matches} emptyText="ยังไม่พบรายการที่ตรงกันในระบบ" />
                </div>
              )}
            </div>
            
          </div>
        </article>
      </div>

      {/* Poster Generator Modal */}
      <PosterGenerator item={item} isOpen={showPoster} onClose={() => setShowPoster(false)} />
    </div>
  )
}