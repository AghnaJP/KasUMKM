// server/src/utils/datetime.js
export function isoToMySQL(iso) {
  if (!iso) return null;
  const d = new Date(iso); // parse ISO+Z (UTC)
  if (isNaN(d.getTime())) return null;

  const pad2 = n => String(n).padStart(2, '0');
  const pad3 = n => String(n).padStart(3, '0');

  const Y = d.getUTCFullYear();
  const M = pad2(d.getUTCMonth() + 1);
  const D = pad2(d.getUTCDate());
  const h = pad2(d.getUTCHours());
  const m = pad2(d.getUTCMinutes());
  const s = pad2(d.getUTCSeconds());
  const ms = pad3(d.getUTCMilliseconds());

  // MySQL DATETIME(6) → sampai mikrodetik, kita kirim milidetik (sisanya 000)
  return `${Y}-${M}-${D} ${h}:${m}:${s}.${ms}`;
}
