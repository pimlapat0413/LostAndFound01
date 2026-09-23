'use client';

import React, { useState, useEffect } from 'react';
import { Anuphan, Prompt } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { RoleProvider } from '@/context/RoleContext';

// ฟอนต์เนื้อหา: Anuphan (ไทย/อังกฤษ อ่านง่าย ทันสมัย) / ฟอนต์หัวข้อ: Prompt
const bodyFont = Anuphan({
  subsets: ['thai', 'latin'],
  variable: '--font-body',
  display: 'swap',
});

const displayFont = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // เปิด Sidebar อัตโนมัติบนเดสก์ท็อป (1024px ขึ้นไป)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <html lang="th" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <head>
        <title>Missing Items — ระบบแจ้งของหาย ม.แม่โจ้</title>
      </head>
      <body className="font-sans bg-surface text-ink antialiased">
        <RoleProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'lg:ml-[272px]' : 'lg:ml-0'}`}>
              <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

              <main className="flex-1 overflow-y-auto">
                <div className="max-w-[1240px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
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
