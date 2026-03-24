import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amountPence: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amountPence / 100);
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy, HH:mm');
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getMonthName(month: number): string {
  return format(new Date(2024, month - 1, 1), 'MMMM');
}

export function getMatchLabel(matchType: string): string {
  switch (matchType) {
    case 'five_match': return '5 Number Match 🏆';
    case 'four_match': return '4 Number Match 🥈';
    case 'three_match': return '3 Number Match 🥉';
    default: return matchType;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'text-emerald-400';
    case 'inactive': case 'cancelled': case 'lapsed': return 'text-ruby-400';
    case 'pending_verification': return 'text-yellow-400';
    case 'approved': return 'text-emerald-400';
    case 'rejected': return 'text-ruby-400';
    case 'paid': return 'text-gold-400';
    default: return 'text-gray-400';
  }
}

export function getStatusBadge(status: string): string {
  switch (status) {
    case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    case 'cancelled': case 'lapsed': return 'bg-ruby-500/20 text-ruby-400 border-ruby-500/30';
    case 'pending_verification': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'approved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'rejected': return 'bg-ruby-500/20 text-ruby-400 border-ruby-500/30';
    case 'paid': return 'bg-gold-500/20 text-gold-400 border-gold-500/30';
    case 'published': return 'bg-gold-500/20 text-gold-400 border-gold-500/30';
    case 'pending': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    case 'simulated': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

// Generate draw entry numbers from user scores
export function generateEntryNumbers(scores: number[]): number[] {
  if (scores.length === 0) return [];
  // Create 5 numbers based on scores (1-45 range)
  const base = scores.slice(-5);
  while (base.length < 5) base.push(Math.floor(Math.random() * 45) + 1);
  return base.slice(0, 5).sort((a, b) => a - b);
}

// Run draw logic
export function runDrawLogic(
  logic: 'random' | 'algorithmic',
  allEntryNumbers?: number[][]
): number[] {
  if (logic === 'random') {
    const numbers = new Set<number>();
    while (numbers.size < 5) {
      numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    return Array.from(numbers).sort((a, b) => a - b);
  }

  // Algorithmic: weight by most frequent numbers across all entries
  if (!allEntryNumbers || allEntryNumbers.length === 0) {
    return runDrawLogic('random');
  }

  const frequency: Record<number, number> = {};
  allEntryNumbers.flat().forEach(n => {
    frequency[n] = (frequency[n] || 0) + 1;
  });

  const sorted = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .map(([n]) => parseInt(n));

  const top = sorted.slice(0, 10);
  const selected = new Set<number>();
  while (selected.size < 5 && top.length > 0) {
    const idx = Math.floor(Math.random() * Math.min(top.length, 5));
    selected.add(top[idx]);
  }
  while (selected.size < 5) {
    selected.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(selected).sort((a, b) => a - b);
}

// Check how many numbers match
export function checkMatches(entryNumbers: number[], winningNumbers: number[]): number {
  return entryNumbers.filter(n => winningNumbers.includes(n)).length;
}

// Calculate prize amount
export function calculatePrize(
  matchCount: number,
  pool: { jackpot: number; four_match: number; three_match: number },
  winnerCount: number
): number {
  if (winnerCount === 0) return 0;
  switch (matchCount) {
    case 5: return pool.jackpot / winnerCount;
    case 4: return pool.four_match / winnerCount;
    case 3: return pool.three_match / winnerCount;
    default: return 0;
  }
}
