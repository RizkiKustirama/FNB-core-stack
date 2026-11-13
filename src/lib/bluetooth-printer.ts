// Web Bluetooth API Utility for Thermal Receipt Printers (ESC/POS)
// Compatible with Chrome on Android, Windows, Mac, Linux

export interface ThermalPrinterState {
  isSupported: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  deviceName: string | null;
  error: string | null;
}

// Common Thermal Printer GATT Service UUIDs
export const THERMAL_PRINTER_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb', // Standard POS Service
  '0000e781-0000-1000-8000-00805f9b34fb', // Common Thermal
  '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC Transparent UART
  '0000ff00-0000-1000-8000-00805f9b34fb', // Vendor Custom
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
  '0000fee7-0000-1000-8000-00805f9b34fb', // Tencent/WeChat Printer
  '0000af30-0000-1000-8000-00805f9b34fb',
  '0000fff0-0000-1000-8000-00805f9b34fb',
  '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART
];

// In-memory singletons
let activeDevice: any = null;
let activeCharacteristic: any = null;
let isConnecting = false;
let lastError: string | null = null;
const listeners: Array<(state: ThermalPrinterState) => void> = [];

export function isBluetoothSupported(): boolean {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}

export function getPrinterState(): ThermalPrinterState {
  const isSupported = isBluetoothSupported();
  const isConnected = Boolean(activeDevice && activeDevice.gatt?.connected && activeCharacteristic);
  const savedName = typeof window !== 'undefined' ? localStorage.getItem('bt_printer_name') : null;
  const deviceName = activeDevice?.name || savedName || null;

  return {
    isSupported,
    isConnected,
    isConnecting,
    deviceName,
    error: lastError,
  };
}

export function subscribePrinterState(callback: (state: ThermalPrinterState) => void): () => void {
  listeners.push(callback);
  callback(getPrinterState());
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

function notifyStateChange() {
  const state = getPrinterState();
  listeners.forEach((cb) => {
    try {
      cb(state);
    } catch (e) {
      console.error('Error in printer listener:', e);
    }
  });
}

// Find a writable characteristic by probing services
async function findWritableCharacteristic(server: any): Promise<any> {
  for (const serviceUuid of THERMAL_PRINTER_SERVICES) {
    try {
      const service = await server.getPrimaryService(serviceUuid);
      const characteristics = await service.getCharacteristics();
      for (const char of characteristics) {
        if (char.properties.writeWithoutResponse || char.properties.write) {
          return char;
        }
      }
    } catch {
      // Continue searching next service
    }
  }

  // Fallback: try getting all primary services if supported
  try {
    const allServices = await server.getPrimaryServices();
    for (const service of allServices) {
      try {
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.writeWithoutResponse || char.properties.write) {
            return char;
          }
        }
      } catch {
        // Continue
      }
    }
  } catch {
    // Continue
  }

  throw new Error('Tidak ditemukan karakteristik printer yang dapat ditulisi (Writable Characteristic).');
}

// Initial Pairing with Chrome picker
export async function connectBluetoothPrinter(): Promise<boolean> {
  if (!isBluetoothSupported()) {
    lastError = 'Browser ini tidak mendukung Web Bluetooth API. Gunakan Google Chrome.';
    notifyStateChange();
    throw new Error(lastError);
  }

  try {
    isConnecting = true;
    lastError = null;
    notifyStateChange();

    const nav: any = navigator;
    const device = await nav.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: THERMAL_PRINTER_SERVICES,
    });

    if (!device) {
      throw new Error('Tidak ada perangkat printer yang dipilih.');
    }

    device.addEventListener('gattserverdisconnected', onDeviceDisconnected);

    const server = await device.gatt.connect();
    const writableChar = await findWritableCharacteristic(server);

    activeDevice = device;
    activeCharacteristic = writableChar;
    isConnecting = false;
    lastError = null;

    if (device.name) {
      localStorage.setItem('bt_printer_name', device.name);
      localStorage.setItem('bt_printer_id', device.id);
    }

    notifyStateChange();
    return true;
  } catch (err: any) {
    isConnecting = false;
    // Don't treat user cancel as a critical error
    if (err.name === 'NotFoundError') {
      lastError = 'Pemilihan printer dibatalkan.';
    } else {
      lastError = err.message || 'Gagal menyambungkan ke printer Bluetooth.';
    }
    notifyStateChange();
    throw err;
  }
}

// Daily Reconnect: Reconnect to previously paired device without Chrome picker
export async function reconnectKnownPrinter(): Promise<boolean> {
  if (!isBluetoothSupported()) return false;
  const nav: any = navigator;

  try {
    isConnecting = true;
    notifyStateChange();

    let targetDevice = activeDevice;

    if (!targetDevice && nav.bluetooth.getDevices) {
      const devices = await nav.bluetooth.getDevices();
      const savedId = localStorage.getItem('bt_printer_id');
      targetDevice = devices.find((d: any) => d.id === savedId) || devices[0];
    }

    if (!targetDevice) {
      isConnecting = false;
      notifyStateChange();
      return false;
    }

    targetDevice.addEventListener('gattserverdisconnected', onDeviceDisconnected);
    const server = await targetDevice.gatt.connect();
    const writableChar = await findWritableCharacteristic(server);

    activeDevice = targetDevice;
    activeCharacteristic = writableChar;
    isConnecting = false;
    lastError = null;

    if (targetDevice.name) {
      localStorage.setItem('bt_printer_name', targetDevice.name);
      localStorage.setItem('bt_printer_id', targetDevice.id);
    }

    notifyStateChange();
    return true;
  } catch (err: any) {
    isConnecting = false;
    lastError = err.message || 'Gagal menyambungkan kembali ke printer.';
    notifyStateChange();
    return false;
  }
}

export function disconnectBluetoothPrinter(): void {
  if (activeDevice && activeDevice.gatt?.connected) {
    try {
      activeDevice.gatt.disconnect();
    } catch {
      // Ignore
    }
  }
  activeDevice = null;
  activeCharacteristic = null;
  isConnecting = false;
  lastError = null;
  notifyStateChange();
}

function onDeviceDisconnected() {
  activeCharacteristic = null;
  notifyStateChange();
}

// 20-Byte BLE Chunking Engine with micro-delay (Essential for BLE MTU limits)
export async function writeDataInChunks(
  characteristic: any,
  data: Uint8Array,
  chunkSize = 20,
  delayMs = 15
): Promise<void> {
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    if (characteristic.writeValueWithoutResponse) {
      await characteristic.writeValueWithoutResponse(chunk);
    } else {
      await characteristic.writeValue(chunk);
    }
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

// ESC/POS Command Byte Generator for 58mm (32 characters width)
export function generateEscPosReceipt(order: any, paperWidth = 32): Uint8Array {
  const encoder = new TextEncoder();
  const bytes: number[] = [];

  // Helper push bytes
  const push = (...args: number[]) => bytes.push(...args);
  const pushText = (text: string) => {
    const encoded = encoder.encode(text);
    for (let i = 0; i < encoded.length; i++) {
      bytes.push(encoded[i]);
    }
  };

  // Helper pad row to exactly paperWidth columns (Left and Right aligned)
  const formatTwoColumn = (left: string, right: string) => {
    const spaceCount = paperWidth - left.length - right.length;
    if (spaceCount < 1) {
      const maxLeft = Math.max(1, paperWidth - right.length - 1);
      return left.substring(0, maxLeft) + ' ' + right;
    }
    return left + ' '.repeat(spaceCount) + right;
  };

  const centerText = (text: string) => {
    if (text.length >= paperWidth) return text.substring(0, paperWidth);
    const leftPad = Math.floor((paperWidth - text.length) / 2);
    return ' '.repeat(leftPad) + text;
  };

  // 1. Initialize Printer (ESC @)
  push(0x1b, 0x40);

  // 2. Center Align (ESC a 1)
  push(0x1b, 0x61, 0x01);

  // Store Title Bold (ESC E 1) & Double Height (GS ! 0x01)
  push(0x1b, 0x45, 0x01, 0x1d, 0x21, 0x01);
  pushText('F&B RESTO & POS\n');

  // Normal text
  push(0x1d, 0x21, 0x00, 0x1b, 0x45, 0x00);
  pushText('Jl. Kuliner No. 123, Indonesia\n');
  pushText('Telp: 0812-3456-7890\n');

  // Divider
  pushText('='.repeat(paperWidth) + '\n');

  // 3. Left Align (ESC a 0) for Order Metadata
  push(0x1b, 0x61, 0x00);

  const orderDate = new Date(order.createdAt || Date.now());
  const dateFormatted =
    orderDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' ' +
    orderDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  pushText(`No. Struk : ${order.orderNumber || '-'}\n`);
  pushText(`Tanggal   : ${dateFormatted}\n`);
  pushText(`Kasir     : ${order.cashier?.name || 'Kasir POS'}\n`);
  pushText(`Metode    : ${order.paymentMethod || 'CASH'}\n`);
  pushText('-'.repeat(paperWidth) + '\n');

  // 4. Items List
  if (order.items && Array.isArray(order.items)) {
    order.items.forEach((item: any) => {
      // Menu name + Level variant
      const levelSuffix = item.levelName ? ` (${item.levelName})` : '';
      const fullName = (item.product?.name || 'Menu') + levelSuffix;

      // Print item name (bold)
      push(0x1b, 0x45, 0x01);
      pushText(fullName + '\n');
      push(0x1b, 0x45, 0x00);

      // Qty x Price and Subtotal
      const qtyStr = `  ${item.qty} x ${Number(item.price).toLocaleString('id-ID')}`;
      const subtotalStr = `Rp ${Number(item.subtotal).toLocaleString('id-ID')}`;
      pushText(formatTwoColumn(qtyStr, subtotalStr) + '\n');

      // Note if exists
      if (item.note) {
        pushText(`  * Note: ${item.note}\n`);
      }
    });
  }

  // 5. Calculations Summary
  pushText('-'.repeat(paperWidth) + '\n');

  // Total (Bold)
  push(0x1b, 0x45, 0x01);
  const totalStr = `Rp ${Number(order.totalAmount || 0).toLocaleString('id-ID')}`;
  pushText(formatTwoColumn('TOTAL:', totalStr) + '\n');
  push(0x1b, 0x45, 0x00);

  if (order.paymentMethod === 'CASH') {
    const cashStr = `Rp ${Number(order.cashReceived || order.totalAmount || 0).toLocaleString('id-ID')}`;
    const changeStr = `Rp ${Number(order.changeAmount || 0).toLocaleString('id-ID')}`;
    pushText(formatTwoColumn('Bayar (Tunai):', cashStr) + '\n');
    pushText(formatTwoColumn('Kembalian:', changeStr) + '\n');
  }

  // 6. Footer (Center)
  pushText('='.repeat(paperWidth) + '\n');
  push(0x1b, 0x61, 0x01);
  pushText('Terima kasih atas kunjungan Anda!\n');
  pushText('Simpan struk ini sebagai\n');
  pushText('bukti pembayaran.\n');

  // Feed 4 lines so it clears the cutter
  pushText('\n\n\n\n');

  return new Uint8Array(bytes);
}

// Print receipt directly via Bluetooth
export async function printReceiptBluetooth(order: any): Promise<boolean> {
  const isConnected = Boolean(activeDevice && activeDevice.gatt?.connected && activeCharacteristic);

  if (!isConnected) {
    // Try reconnecting first
    const reconnected = await reconnectKnownPrinter();
    if (!reconnected) {
      // Connect fresh
      await connectBluetoothPrinter();
    }
  }

  if (!activeCharacteristic) {
    throw new Error('Printer belum tersambung.');
  }

  const receiptBytes = generateEscPosReceipt(order, 32);
  await writeDataInChunks(activeCharacteristic, receiptBytes, 20, 15);
  return true;
}

// Print quick test receipt
export async function testPrintBluetooth(): Promise<boolean> {
  const isConnected = Boolean(activeDevice && activeDevice.gatt?.connected && activeCharacteristic);
  if (!isConnected) {
    const reconnected = await reconnectKnownPrinter();
    if (!reconnected) {
      await connectBluetoothPrinter();
    }
  }

  if (!activeCharacteristic) {
    throw new Error('Printer belum tersambung.');
  }

  const sampleOrder = {
    orderNumber: 'TEST-PRINT-001',
    createdAt: new Date().toISOString(),
    cashier: { name: 'Kasir Uji Coba' },
    paymentMethod: 'CASH',
    totalAmount: 25000,
    cashReceived: 50000,
    changeAmount: 25000,
    items: [
      {
        product: { name: 'Cwie Mie Special' },
        levelName: 'Level 2',
        qty: 1,
        price: 15000,
        subtotal: 15000,
        note: 'Pedas sedang',
      },
      {
        product: { name: 'Es Teh Manis' },
        qty: 2,
        price: 5000,
        subtotal: 10000,
      },
    ],
  };

  const bytes = generateEscPosReceipt(sampleOrder, 32);
  await writeDataInChunks(activeCharacteristic, bytes, 20, 15);
  return true;
}
