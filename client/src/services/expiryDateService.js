const DATE_PATTERN = /\b(?:\d{4}[/.\-]\d{1,2}[/.\-]\d{1,2}|\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4}|\d{1,2}\s+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{4}|(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2},?\s+\d{4})\b/gi;
const EXPIRY_LABEL = /expir(?:y|es|ation)|valid\s+(?:until|thru|through|till)|use\s+by|good\s+through/i;
const NON_EXPIRY_LABEL = /issue(?:d)?|manufactur(?:e|ed|ing)|\bmfg\b|\bdob\b|birth|effective\s+from/i;

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

const toIsoDate = (year, month, day) => {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `${year.toString().padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const parseDate = (value) => {
  const normalized = value.replace(/,/g, '').trim();
  const iso = normalized.match(/^(\d{4})[/.\-](\d{1,2})[/.\-](\d{1,2})$/);
  if (iso) return toIsoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const numeric = normalized.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})$/);
  if (numeric) {
    const first = Number(numeric[1]);
    const second = Number(numeric[2]);
    let year = Number(numeric[3]);
    if (year < 100) year += year < 70 ? 2000 : 1900;
    const day = first > 12 ? first : second > 12 ? second : first;
    const month = first > 12 ? second : second > 12 ? first : second;
    return toIsoDate(year, month, day);
  }

  const named = normalized.match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$|^([a-z]+)\s+(\d{1,2})\s+(\d{4})$/i);
  if (!named) return null;
  const day = Number(named[1] || named[5]);
  const monthName = (named[2] || named[4]).slice(0, 3).toLowerCase();
  return toIsoDate(Number(named[3] || named[6]), MONTHS[monthName] + 1, day);
};

export const findExpiryDate = (text) => {
  const matches = [...text.matchAll(DATE_PATTERN)];
  const candidates = matches.map((match) => {
    const date = parseDate(match[0]);
    const contextStart = Math.max(0, match.index - 70);
    const context = text.slice(contextStart, Math.min(text.length, match.index + match[0].length + 35));
    const datePosition = match.index - contextStart;
    const expiryPosition = context.search(EXPIRY_LABEL);
    const nonExpiryPosition = context.search(NON_EXPIRY_LABEL);
    if (!date || expiryPosition < 0) return null;
    if (nonExpiryPosition >= 0 && Math.abs(nonExpiryPosition - datePosition) <= Math.abs(expiryPosition - datePosition)) return null;
    return {
      date,
      score: 100 - Math.abs(datePosition - expiryPosition),
    };
  }).filter(Boolean);

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.date || null;
};

export const detectExpiryDate = async (imageFile) => {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng');
  try {
    const { data: { text } } = await worker.recognize(imageFile);
    const expiryDate = findExpiryDate(text);
    if (!expiryDate) {
      throw new Error('No clearly labeled expiry date was found. Please enter the date manually.');
    }
    return expiryDate;
  } finally {
    await worker.terminate();
  }
};