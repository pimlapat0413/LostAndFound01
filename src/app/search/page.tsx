'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Calendar, User, ChevronRight, Package, Tag, Filter } from 'lucide-react';
import { lostItems, categories, popularSearches } from '@/data/mockData';

const statuses = [
  { value: 'ทั้งหมด', label: 'สถานะทั้งหมด' },
  { value: 'searching', label: 'กำลังค้นหา' },
  { value: 'found', label: 'พบแล้ว' },
  { value: 'returned', label: 'รับคืนแล้ว' },
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [selectedStatus, setSelectedStatus] = useState('ทั้งหมด');

  const handlePopularSearch = (term: string) => {
    setSearchQuery(term);
  };

  const filteredItems = lostItems?.filter((item) => {
    const matchesQuery = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;

    const matchesStatus = 
      selectedStatus === 'ทั้งหมด' || item.status === selectedStatus;

    return matchesQuery && matchesCategory && matchesStatus;
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'searching':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">กำลังค้นหา</span>;
      case 'found':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">พบแล้ว</span>;
      case 'returned':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">รับคืนแล้ว</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">{status}</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 flex items-center space-x-2">
        <Link href="/" className="hover:text-blue-600 transition-colors">หน้าแรก</Link>
        <ChevronRight size={16} className="text-gray-400" />
        <span className="text-gray-900 font-medium">ค้นหาของหาย</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">ค้นหาของหาย</h1>
          <p className="text-sm text-gray-500 mt-1">ค้นหารายการสิ่งของสูญหาย กรองตามหมวดหมู่และสถานะ</p>
        </div>
      </div>

      {/* Search Input Section */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
            placeholder="ค้นหาสิ่งของ คำอธิบาย รหัส หรือสถานที่..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Simplified Filter Controls (Category + Status only) */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0 px-1">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>ตัวกรอง:</span>
        </div>

        {/* 1. Category Filter */}
        <div className="flex-1 min-w-[180px]">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 bg-gray-50 hover:bg-white focus:bg-white text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-all"
          >
            <option value="ทั้งหมด">หมวดหมู่ทั้งหมด</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* 2. Status Filter */}
        <div className="flex-1 min-w-[180px]">
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 bg-gray-50 hover:bg-white focus:bg-white text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-all"
          >
            {statuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Reset Filter Button */}
        {(selectedCategory !== 'ทั้งหมด' || selectedStatus !== 'ทั้งหมด' || searchQuery !== '') && (
          <button
            onClick={() => {
              setSelectedCategory('ทั้งหมด');
              setSelectedStatus('ทั้งหมด');
              setSearchQuery('');
            }}
            className="px-4 py-2.5 text-xs text-blue-600 hover:text-blue-700 font-semibold bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors shrink-0"
          >
            ล้างตัวกรอง
          </button>
        )}
      </div>

      {/* Popular Searches */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <h3 className="text-xs font-semibold text-gray-500 mb-2.5">คำค้นหายอดนิยม:</h3>
        <div className="flex flex-wrap gap-2">
          {popularSearches?.map((term) => (
            <button
              key={term}
              onClick={() => handlePopularSearch(term)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                searchQuery === term 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600'
              }`}
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            ผลการค้นหา <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">{filteredItems.length} รายการ</span>
          </h2>
        </div>

        <div className="flex flex-col space-y-4">
          {filteredItems.map((item) => (
            <Link key={item.id} href={`/items/${item.id}`}>
              <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row gap-5 cursor-pointer group">
                {/* Image */}
                <div className="w-full sm:w-44 h-32 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <Package className="w-10 h-10 text-gray-300" />
                  )}
                  <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    {item.code}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-blue-600 font-medium mb-1">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{item.category}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{item.dateLost}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>{item.reporterName}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-start sm:justify-end shrink-0">
                  {getStatusBadge(item.status)}
                </div>
              </div>
            </Link>
          ))}
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 space-y-3">
              <Package className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-base font-bold text-gray-800">ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา</p>
              <p className="text-xs text-gray-500">ลองปรับคำค้นหา หรือเปลี่ยนหมวดหมู่และสถานะใหม่อีกครั้ง</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {filteredItems.length > 0 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-400 text-xs font-medium cursor-not-allowed">
            ก่อนหน้า
          </button>
          <button className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs">1</button>
          <button className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium">2</button>
          <button className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium">ถัดไป</button>
        </div>
      )}
    </div>
  );
}
