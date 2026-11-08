export const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const LETTERS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const pad = (n) => String(n).padStart(2, '0');

// Datas são guardadas como texto "AAAA-MM-DD" e horários como "HH:MM"
export const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromKey = (k) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const todayKey = () => toKey(new Date());
export const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
export const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
export const toTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
export const dateWithTime = (key, hhmm) => {
  const d = fromKey(key);
  const [h, m] = (hhmm || '09:00').split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d;
};
export const byTime = (a, b) => (a.start || '99:99').localeCompare(b.start || '99:99');

export const longDate = (key) => {
  const d = fromKey(key);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
};
export const relativeDate = (key) => {
  if (key === todayKey()) return 'Hoje';
  if (key === toKey(addDays(new Date(), 1))) return 'Amanhã';
  return longDate(key);
};
export const monthTitle = (d) => `${cap(MONTHS[d.getMonth()])} de ${d.getFullYear()}`;
export const weekdayLetters = (weekStart) => Array.from({ length: 7 }, (_, i) => LETTERS[(i + weekStart) % 7]);

export function monthGrid(year, month, weekStart) {
  const offset = (new Date(year, month, 1).getDay() - weekStart + 7) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const total = Math.ceil((offset + days) / 7) * 7;
  return Array.from({ length: total }, (_, i) => {
    const d = new Date(year, month, 1 - offset + i);
    return { key: toKey(d), day: d.getDate(), inMonth: d.getMonth() === month };
  });
}

export function weekOf(key, weekStart) {
  const d = fromKey(key);
  const start = addDays(d, -((d.getDay() - weekStart + 7) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const x = addDays(start, i);
    return { key: toKey(x), day: x.getDate(), inMonth: true };
  });
}

export function weekTitle(cells) {
  const a = fromKey(cells[0].key);
  const b = fromKey(cells[6].key);
  if (a.getMonth() === b.getMonth()) return `${a.getDate()} – ${b.getDate()} de ${MONTHS[b.getMonth()]}`;
  return `${a.getDate()} ${MONTHS[a.getMonth()].slice(0, 3)} – ${b.getDate()} ${MONTHS[b.getMonth()].slice(0, 3)}`;
}
