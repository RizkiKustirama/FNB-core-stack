// Helper for Plain Text Receipt Formatting (WhatsApp Share & Preview)
// Formatted for standard 32-character receipt paper width

import { RECEIPT_CONFIG, wrapReceiptText } from './receipt-config';

export function formatPlainTextReceipt(order: any, paperWidth = RECEIPT_CONFIG.paperWidth || 32): string {
  const padTwoColumn = (left: string, right: string) => {
    const spaceCount = paperWidth - left.length - right.length;
    if (spaceCount < 1) {
      const maxLeft = Math.max(1, paperWidth - right.length - 1);
      return left.substring(0, maxLeft) + ' ' + right;
    }
    return left + ' '.repeat(spaceCount) + right;
  };

  const center = (text: string) => {
    if (text.length >= paperWidth) return text.substring(0, paperWidth);
    const leftPad = Math.floor((paperWidth - text.length) / 2);
    return ' '.repeat(leftPad) + text;
  };

  const orderDate = new Date(order.createdAt || Date.now());
  const dateFormatted =
    orderDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' ' +
    orderDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const lines: string[] = [];

  // Header
  lines.push('='.repeat(paperWidth));
  lines.push(center(RECEIPT_CONFIG.storeName));
  if (RECEIPT_CONFIG.tagline) {
    lines.push(center(RECEIPT_CONFIG.tagline));
  }
  const addressLines = wrapReceiptText(RECEIPT_CONFIG.address, paperWidth);
  addressLines.forEach((addrLine) => {
    lines.push(center(addrLine));
  });
  lines.push(center(`Telp: ${RECEIPT_CONFIG.phone}`));
  lines.push('='.repeat(paperWidth));

  // Metadata
  lines.push(`No.   : ${order.orderNumber || '-'}`);
  lines.push(`Tgl   : ${dateFormatted}`);
  lines.push(`Kasir : ${order.cashier?.name || 'Kasir POS'}`);
  lines.push(`Metode: ${order.paymentMethod || 'CASH'}`);
  lines.push('-'.repeat(paperWidth));

  // Items
  if (order.items && Array.isArray(order.items)) {
    order.items.forEach((item: any) => {
      const levelSuffix = item.levelName ? ` (${item.levelName})` : '';
      const fullName = (item.product?.name || 'Menu') + levelSuffix;
      lines.push(fullName);

      const qtyStr = `  ${item.qty} x ${Number(item.price).toLocaleString('id-ID')}`;
      const subtotalStr = `Rp ${Number(item.subtotal).toLocaleString('id-ID')}`;
      lines.push(padTwoColumn(qtyStr, subtotalStr));

      if (item.note) {
        lines.push(`  * Note: ${item.note}`);
      }
    });
  }

  // Summary
  lines.push('-'.repeat(paperWidth));
  const totalStr = `Rp ${Number(order.totalAmount || 0).toLocaleString('id-ID')}`;
  lines.push(padTwoColumn('TOTAL:', totalStr));

  if (order.paymentMethod === 'CASH') {
    const cashStr = `Rp ${Number(order.cashReceived || order.totalAmount || 0).toLocaleString('id-ID')}`;
    const changeStr = `Rp ${Number(order.changeAmount || 0).toLocaleString('id-ID')}`;
    lines.push(padTwoColumn('Bayar (Tunai):', cashStr));
    lines.push(padTwoColumn('Kembalian:', changeStr));
  }

  // Footer
  lines.push('='.repeat(paperWidth));
  lines.push(center(RECEIPT_CONFIG.footerMessage));
  if (RECEIPT_CONFIG.footerSubMessage) {
    lines.push(center(RECEIPT_CONFIG.footerSubMessage));
  }
  if (RECEIPT_CONFIG.socialMedia) {
    lines.push(center(RECEIPT_CONFIG.socialMedia));
  }
  lines.push('='.repeat(paperWidth));

  return lines.join('\n');
}

export function buildWhatsAppShareUrl(order: any, customerPhone = ''): string {
  const receiptText = formatPlainTextReceipt(order, RECEIPT_CONFIG.paperWidth || 32);
  const intro = `*NOTA PEMBAYARAN - ${RECEIPT_CONFIG.storeName.toUpperCase()}*\n\n\`\`\`\n${receiptText}\n\`\`\`\n\n_${RECEIPT_CONFIG.footerMessage}_`;
  const encoded = encodeURIComponent(intro);

  if (customerPhone.trim()) {
    // Clean phone number (replace leading 0 with 62)
    let cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  }

  return `https://wa.me/?text=${encoded}`;
}
