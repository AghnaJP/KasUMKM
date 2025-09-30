/* eslint-disable radix */
export interface BukuEntry {
  tanggal: string;
  keterangan: string;
  pemasukan: number;
  pengeluaran: number;
}

/**
 * Parse hasil OCR buku keuangan.
 * @param text Hasil OCR
 * @param mode 'pendapatan' | 'pengeluaran'
 */
export function parseBukuPendapatan(
  text: string,
  mode: 'pendapatan' | 'pengeluaran' = 'pendapatan',
): BukuEntry[] {
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  const pemasukanIndex = lines.findIndex(l => /pemasukan/i.test(l));
  const pengeluaranIndex = lines.findIndex(l => /pengeluaran/i.test(l));

  if (pemasukanIndex === -1 || pengeluaranIndex === -1) {
    console.warn('Pemasukan/Pengeluaran header not found');
    return [];
  }

  // Descriptions ada sebelum "Pemasukan"
  const descriptionLines = lines.slice(2, pemasukanIndex); // skip header
  const pemasukanLines = lines.slice(pemasukanIndex + 1, pengeluaranIndex);
  const pengeluaranLines = lines.slice(pengeluaranIndex + 1);

  const entries: BukuEntry[] = [];
  const maxRows = Math.max(
    descriptionLines.length,
    pemasukanLines.length,
    pengeluaranLines.length,
  );

  for (let i = 0; i < maxRows; i++) {
    const descLine = descriptionLines[i] ?? '';
    const pemasukanStr = pemasukanLines[i] ?? '0';
    const pengeluaranStr = pengeluaranLines[i] ?? '0';

    // Extract tanggal dan keterangan
    let date = '';
    let keterangan = '';
    // eslint-disable-next-line no-useless-escape
    const dateMatch = descLine.match(/(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})/);
    if (dateMatch) {
      date = dateMatch[1];
      keterangan = descLine
        .substring(dateMatch[0].length)
        .replace('|', '')
        .trim();
    } else {
      keterangan = descLine.replace('|', '').trim();
    }

    const pemasukan = parseInt(pemasukanStr.replace(/[^\d]/g, '')) || 0;
    const pengeluaran = parseInt(pengeluaranStr.replace(/[^\d]/g, '')) || 0;

    // Masukkan sesuai mode
    if (date && keterangan) {
      if (mode === 'pendapatan' && pemasukan > 0) {
        entries.push({tanggal: date, keterangan, pemasukan, pengeluaran: 0});
      }
      if (mode === 'pengeluaran' && pengeluaran > 0) {
        entries.push({tanggal: date, keterangan, pemasukan: 0, pengeluaran});
      }
    }
  }

  return entries;
}
