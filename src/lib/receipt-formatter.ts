// Helper for Plain Text Receipt Formatting (WhatsApp Share & Preview)
// Formatted for standard 32-character receipt paper width

export function formatPlainTextReceipt(order: any, paperWidth = 32): string {
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
  lines.push(center('F&B RESTO & POS'));
  lines.push(center('Jl. Kuliner No. 123, ID'));
  lines.push(center('Telp: 0812-3456-7890'));
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
  lines.push(center('Terima kasih atas kunjungan!'));
  lines.push(center('Simpan nota ini sebagai'));
  lines.push(center('bukti pembayaran.'));
  lines.push('='.repeat(paperWidth));

  return lines.join('\n');
}

export function buildWhatsAppShareUrl(order: any, customerPhone = ''): string {
  const receiptText = formatPlainTextReceipt(order, 32);
  const intro = `*NOTA PEMBAYARAN - F&B RESTO*\n\n\`\`\`\n${receiptText}\n\`\`\`\n\n_Terima kasih atas kunjungan Anda!_`;
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
