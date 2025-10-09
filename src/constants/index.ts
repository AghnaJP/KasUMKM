export * from './colors';
export * from './fonts';
export * from './messages';
export * from './sqlQueries';

export const MENU_ALERTS = {
  deleteWithoutTransaction: (name: string) =>
    `Apakah kamu yakin ingin menghapus menu "${name}"?`,
  deleteWithTransaction: (count: number, name: string) =>
    `Menu "${name}" memiliki ${count} transaksi. Menghapusnya akan memengaruhi data tersebut. Lanjutkan?`,
  editWithTransaction: (count: number, name: string) =>
    `Menu "${name}" memiliki ${count} transaksi. Mengedit harga/nama dapat memengaruhi laporan. Lanjutkan?`,
};
