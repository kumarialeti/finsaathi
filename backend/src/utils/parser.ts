export interface NormalizedTransaction {
  date: Date;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  balance?: number;
  category?: string;
}

export interface ParseResult {
  valid: NormalizedTransaction[];
  invalid: { row: number; reason: string }[];
  scannedPdf?: boolean;
}

// Safely normalize amount formatting
export function normalizeAmount(val: any): number {
  if (typeof val === 'number') return val;
  if (!val) return NaN;
  const str = String(val).replace(/,/g, '').replace(/₹/g, '').replace(/Rs\.?/gi, '').replace(/[^\d.-]/g, '');
  const isNegative = String(val).includes('(') && String(val).includes(')') ? -1 : 1;
  const num = parseFloat(str) * isNegative;
  return Math.abs(num);
}

// Safely normalize dates
export function normalizeDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val.getTime())) return val;
  if (typeof val === 'number') {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(excelEpoch.getTime() + val * 86400000);
  }
  const str = String(val).trim();
  
  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const parts = str.split(/[-/.]/);
  if (parts.length === 3) {
    let day = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);
    
    // YYYY-MM-DD
    if (day > 1000) {
      year = parseInt(parts[0], 10);
      day = parseInt(parts[2], 10);
    }
    
    // YY
    if (year < 100) year += 2000;
    
    const d = new Date(year, month - 1, day);
    if (!isNaN(d.getTime())) return d;
  }
  
  let d = new Date(str);
  if (!isNaN(d.getTime())) return d;
  return null;
}

const SCORE_MAP: Record<string, string[]> = {
  date: ['date', 'transaction date', 'txn date', 'value date', 'posting date'],
  description: ['description', 'narration', 'particulars', 'transaction details', 'remarks', 'reference', 'merchant'],
  expense: ['debit', 'withdrawal', 'withdrawals', 'debit amount', 'spent', 'payment', 'dr'],
  income: ['credit', 'deposit', 'deposits', 'credit amount', 'received', 'cr'],
  amount: ['amount', 'transaction amount', 'value'],
  balance: ['balance', 'closing balance', 'available balance', 'running balance']
};

export function scoreRow(row: string[]): { score: number; mappings: Record<string, number> } {
  let score = 0;
  const mappings: Record<string, number> = {};
  
  for (let i = 0; i < row.length; i++) {
    const cell = String(row[i] || '').toLowerCase().trim();
    if (!cell) continue;
    
    for (const [colType, keywords] of Object.entries(SCORE_MAP)) {
      if (keywords.includes(cell) || keywords.some(kw => cell.includes(kw))) {
        score++;
        mappings[colType] = i;
        break;
      }
    }
  }
  
  return { score, mappings };
}

function detectDataTypes(rows: string[][]): Record<string, number> {
  const mappings: Record<string, number> = {};
  if (rows.length === 0) return mappings;
  
  const numCols = rows[0].length;
  let maxDateScore = 0, dateCol = -1;
  let maxAmountScore = 0, amountCol = -1;
  let maxDescScore = 0, descCol = -1;

  for (let c = 0; c < numCols; c++) {
    let dateScore = 0, amountScore = 0, descScore = 0;
    for (let r = 0; r < Math.min(rows.length, 10); r++) {
      const cell = String(rows[r][c] || '').trim();
      if (!cell) continue;
      
      const isDate = normalizeDate(cell) !== null;
      const numMatch = cell.replace(/,/g, '').match(/^[\d.-]+$/);
      const isNum = numMatch !== null && !isDate;
      const isText = cell.length > 5 && !isDate && !isNum;
      
      if (isDate) dateScore++;
      if (isNum) amountScore++;
      if (isText) descScore++;
    }
    if (dateScore > maxDateScore) { maxDateScore = dateScore; dateCol = c; }
    if (amountScore > maxAmountScore) { maxAmountScore = amountScore; amountCol = c; }
    if (descScore > maxDescScore) { maxDescScore = descScore; descCol = c; }
  }

  if (dateCol !== -1) mappings['date'] = dateCol;
  if (amountCol !== -1) mappings['amount'] = amountCol;
  if (descCol !== -1) mappings['description'] = descCol;

  return mappings;
}

export function parseTransactionTable(rows: any[][]): ParseResult {
  const result: ParseResult = { valid: [], invalid: [] };
  
  let bestScore = 0;
  let headerRowIdx = -1;
  let bestMappings: Record<string, number> = {};

  for (let i = 0; i < Math.min(rows.length, 50); i++) {
    const { score, mappings } = scoreRow(rows[i]);
    if (score > bestScore) {
      bestScore = score;
      headerRowIdx = i;
      bestMappings = mappings;
    }
  }

  const startRow = headerRowIdx !== -1 ? headerRowIdx + 1 : 0;
  
  if (Object.keys(bestMappings).length === 0 && rows.length > 0) {
    bestMappings = detectDataTypes(rows.slice(startRow));
  }

  for (let i = startRow; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || Object.values(row).every(c => !c)) continue;

    const dateVal = bestMappings['date'] !== undefined ? row[bestMappings['date']] : null;
    const date = normalizeDate(dateVal);
    if (!date) {
      result.invalid.push({ row: i + 1, reason: 'Invalid date' });
      continue;
    }

    const descVal = bestMappings['description'] !== undefined ? String(row[bestMappings['description']] || '') : '';
    
    let amount = NaN;
    let type: 'INCOME' | 'EXPENSE' = 'EXPENSE';

    const debitVal = bestMappings['expense'] !== undefined ? normalizeAmount(row[bestMappings['expense']]) : NaN;
    const creditVal = bestMappings['income'] !== undefined ? normalizeAmount(row[bestMappings['income']]) : NaN;
    const amountVal = bestMappings['amount'] !== undefined ? normalizeAmount(row[bestMappings['amount']]) : NaN;
    
    if (!isNaN(debitVal) && debitVal > 0) {
      amount = debitVal;
      type = 'EXPENSE';
    } else if (!isNaN(creditVal) && creditVal > 0) {
      amount = creditVal;
      type = 'INCOME';
    } else if (!isNaN(amountVal) && amountVal > 0) {
      amount = amountVal;
      // Default to expense unless positive amount explicitly marked CR in text or another column?
      // Since amount is absolute, if it was negative, it might be an expense
      type = 'EXPENSE';
    } else {
      // Try to fallback if amount wasn't found in headers
      const dtMap = detectDataTypes([row]);
      if (dtMap['amount'] !== undefined) {
        amount = normalizeAmount(row[dtMap['amount']]);
      }
      if (isNaN(amount) || amount === 0) {
        result.invalid.push({ row: i + 1, reason: 'Missing or zero amount' });
        continue;
      }
    }

    const balance = bestMappings['balance'] !== undefined ? normalizeAmount(row[bestMappings['balance']]) : undefined;

    result.valid.push({
      date,
      description: descVal.substring(0, 255) || 'Unknown Transaction',
      amount,
      type,
      balance: isNaN(balance as number) ? undefined : balance
    });
  }

  return result;
}

export function parsePDFTextToTable(text: string): any[][] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const rows: any[][] = [];
  
  for (const line of lines) {
    // Basic heuristic: space separated columns
    const cols = line.split(/\s{2,}/).map(c => c.trim()).filter(c => c.length > 0);
    if (cols.length > 1) {
      rows.push(cols);
    }
  }
  
  return rows;
}
