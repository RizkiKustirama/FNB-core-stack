// Single Source of Truth for Receipt Template Configuration
// Edit this file to customize receipt branding, address, and footer per client.

export interface ReceiptTemplateConfig {
  storeName: string;
  tagline?: string;
  address: string;
  phone: string;
  footerMessage: string;
  footerSubMessage?: string;
  socialMedia?: string;
  paperWidth: number; // 32 for 58mm thermal, 42/48 for 80mm
}

export const RECEIPT_CONFIG: ReceiptTemplateConfig = {
  // === IDENTITAS KLIEN / RESTO ===
  storeName: 'CwieMie Mbah Kakung',
  tagline: 'Authentic Cwie Mie',
  address: 'Jl. KH. A. Dahlan No.18, Jombatan, Kec. Jombang, Kab. Jombang, Jawa Timur 61419',
  phone: '+62 819-1928-1755',

  // === PESAN BAWAH / FOOTER STRUK ===
  footerMessage: 'Terima kasih atas kunjungan Anda!',
  footerSubMessage: 'Simpan nota ini sebagai bukti pembayaran.',
  socialMedia: '',

  // === SPESIFIKASI KERTAS THERMAL ===
  paperWidth: 32, // Lebar standar kertas thermal 58mm (32 karakter monospaced)
};

/**
 * Word-wrapping helper to split long text (like addresses) into lines
 * that fit within paperWidth without breaking words in the middle.
 */
export function wrapReceiptText(text: string, maxWidth = 32): string[] {
  if (!text) return [];
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
    } else if ((currentLine + ' ' + word).length <= maxWidth) {
      currentLine = currentLine + ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}
