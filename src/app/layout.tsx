'use client';

import React, { useState, useEffect } from 'react';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { RoleProvider } from '@/context/RoleContext';

// ==========================================
// 1. FONT CONFIGURATION (Academic Clarity Typography)
// ==========================================
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-jakarta',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // สถานะควบคุมการเปิด-ปิดของ Sidebar (เปิดอัตโนมัติบนเดสก์ท็อปขนาด 1024px ขึ้นไป)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <html lang="th" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <head>
        <title>Missing Items System - ระบบสารสนเทศทรัพย์สินสูญหาย</title>
      </head>
      {/* ใช้โทนสีพื้นหลังหลัก #f8f9ff และสีข้อความ #0d1c2f ตามสเปก Academic Clarity */}
      <body className={`${inter.className} bg-[#f8f9ff] text-[#0d1c2f] antialiased selection:bg-[#d8e4f1] selection:text-[#00366f]`}>
        <RoleProvider>
          {/* ==========================================
              2. INSTITUTIONAL APP LAYOUT CONTAINER
              ========================================== */}
          <div className="flex h-screen overflow-hidden bg-[#f8f9ff]">
            
            {/* Sidebar ด้านข้าง (เรียกใช้คอมโพเนนต์ Sidebar โดยตรง ไม่ครอบด้วย div ซ้ำซ้อน) */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            {/* พื้นที่เนื้อหาหลักทางขวา (ปรับเว้นระยะขอบซ้ายตามสถานะเปิด/ปิดของ Sidebar อย่างถูกต้อง) */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
              
              {/* แถบเครื่องมือด้านบนแบบ Sticky */}
              <div className="sticky top-0 z-30 border-b border-[#c2c6d3]/40 bg-white/80 backdrop-blur-md">
                <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
              </div>
              
              {/* พื้นที่แสดงผลหน้าเว็บแต่ละหน้า (Main Content Area) */}
              <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#f8f9ff]">
                <div className="max-w-[1280px] mx-auto w-full">
                  {children}
                </div>
              </main>

            </div>
          </div>
        </RoleProvider>
      </body>
    </html>
  );
}