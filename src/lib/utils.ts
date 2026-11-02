import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isUUID(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return isValid(date) ? format(date, 'MMM d, yyyy') : '';
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return isValid(date) ? format(date, 'MMM d, yyyy • h:mm a') : '';
  } catch {
    return dateString;
  }
}

export function formatTime(dateString?: string): string {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return isValid(date) ? format(date, 'h:mm a') : '';
  } catch {
    return dateString;
  }
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'ES-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateSecureToken(): string {
  return 'TKT_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}
