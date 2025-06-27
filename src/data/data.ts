// src/data/data.ts

export interface MenuItem {
  namaMenu: string;
  harga: number;
  kategori: 'Makanan' | 'Minuman' | 'Lainnya';
}

export interface ExpenseItem {
  description: string;
  amount: number;
  quantity: number;
}

export const dummyMenus: MenuItem[] = [
  { namaMenu: 'Nasi Goreng Spesial', harga: 20000, kategori: 'Makanan' },
  { namaMenu: 'Mie Ayam', harga: 15000, kategori: 'Makanan' },
  { namaMenu: 'Ayam Geprek', harga: 22000, kategori: 'Makanan' },
  { namaMenu: 'Es Teh Manis', harga: 5000, kategori: 'Minuman' },
  { namaMenu: 'Jus Alpukat', harga: 12000, kategori: 'Minuman' },
  { namaMenu: 'Kopi Hitam', harga: 8000, kategori: 'Minuman' },
  { namaMenu: 'Cemilan Kentang', harga: 10000, kategori: 'Lainnya' },
  { namaMenu: 'Tahu Crispy', harga: 7000, kategori: 'Lainnya' },
];
