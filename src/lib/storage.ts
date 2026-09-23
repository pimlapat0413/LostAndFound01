import { LostItem, ClaimRequest } from '@/types';

const ITEMS_KEY = 'lostItems';
const CLAIMS_KEY = 'adminClaimRequests';
const MY_STUDENT_ID_KEY = 'myStudentId';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// คืนค่า false ถ้าบันทึกไม่สำเร็จ (เช่น พื้นที่ localStorage เต็มเพราะรูปใหญ่)
function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('storage'));
    return true;
  } catch (err) {
    console.error(`Failed to save ${key}`, err);
    return false;
  }
}

// รายการที่บันทึกด้วยโค้ดเวอร์ชันเก่าเก็บรูปเป็น blob: URL ซึ่งใช้ไม่ได้หลังรีเฟรช
// ล้างออกให้เหลือค่าว่าง เพื่อให้หน้าเว็บแสดงไอคอน "ไม่มีรูปภาพ" แทนรูปเสีย
const isDeadUrl = (url?: string) => !!url && url.startsWith('blob:');

export const getItems = () => {
  const items = readJson<LostItem[]>(ITEMS_KEY, []);
  if (!items.some((i) => isDeadUrl(i.imageUrl) || i.thumbnails?.some(isDeadUrl))) return items;

  const cleaned = items.map((i) => {
    const thumbnails = (i.thumbnails || []).filter((t) => !isDeadUrl(t));
    return { ...i, imageUrl: isDeadUrl(i.imageUrl) ? thumbnails[0] || '' : i.imageUrl, thumbnails };
  });
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(cleaned));
  } catch {}
  return cleaned;
};
export const saveItems = (items: LostItem[]) => writeJson(ITEMS_KEY, items);

// กรองรายการ "แจ้งของใหม่" ที่โค้ดเวอร์ชันก่อนบันทึกปนไว้ในรายการคำขอรับคืนออก
export const getClaims = () =>
  readJson<ClaimRequest[]>(CLAIMS_KEY, []).filter((c) => !c.isNewItemReport);
export const saveClaims = (claims: ClaimRequest[]) => writeJson(CLAIMS_KEY, claims);

export const getMyStudentId = () => {
  try {
    return localStorage.getItem(MY_STUDENT_ID_KEY) || '';
  } catch {
    return '';
  }
};
export const setMyStudentId = (id: string) => {
  try {
    localStorage.setItem(MY_STUDENT_ID_KEY, id);
    window.dispatchEvent(new Event('storage'));
  } catch {}
};

export const getReportType = (item: LostItem) => item.reportType ?? 'lost';

export const generateHandoverCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ย่อรูปให้กว้างไม่เกิน maxSize px แล้วแปลงเป็น data URL เพื่อให้เก็บใน localStorage ได้ถาวร
export function fileToCompressedDataUrl(file: File, maxSize = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas unavailable'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// เทียบคำตอบลับแบบหลวม: ไม่สนตัวพิมพ์/ช่องว่าง และยอมรับถ้าข้อความหนึ่งอยู่ในอีกข้อความ
export function isSecretAnswerMatch(given: string, expected: string) {
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '');
  const a = norm(given);
  const b = norm(expected);
  if (!a || !b) return false;
  return a === b || (a.length >= 2 && b.includes(a)) || (b.length >= 2 && a.includes(b));
}

const ATTEMPTS_KEY = 'secretAnswerAttempts';
export const MAX_SECRET_ATTEMPTS = 3;

export function getSecretAttempts(itemId: string, studentId: string) {
  const all = readJson<Record<string, number>>(ATTEMPTS_KEY, {});
  return all[`${itemId}:${studentId}`] || 0;
}
export function addSecretAttempt(itemId: string, studentId: string) {
  const all = readJson<Record<string, number>>(ATTEMPTS_KEY, {});
  const key = `${itemId}:${studentId}`;
  all[key] = (all[key] || 0) + 1;
  try {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(all));
  } catch {}
  return all[key];
}
