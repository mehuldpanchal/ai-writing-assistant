import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import fs from 'fs';
import path from 'path';

// Unified credit system
interface UserCredits {
  lastReset: string; // ISO date string
  credits: number;
  firstRequestTime?: string; // Track first request for tamper protection
  // Legacy fields for backward compatibility
  grammarCredits?: number;
  smartComposerCredits?: number;
  writingStyleCredits?: number;
}

const CREDITS_FILE = path.join(process.cwd(), 'creditStore.json');

// Load credits from file
function loadCredits(): Record<string, UserCredits> {
  try {
    if (fs.existsSync(CREDITS_FILE)) {
      return JSON.parse(fs.readFileSync(CREDITS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error loading credits:', err);
  }
  return {};
}

// Save credits to file
function saveCredits(credits: Record<string, UserCredits>) {
  try {
    fs.writeFileSync(CREDITS_FILE, JSON.stringify(credits, null, 2));
  } catch (err) {
    console.error('Error saving credits:', err);
  }
}

const creditStore: Record<string, UserCredits> = loadCredits();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Initialize or reset credits for a user
function initCredits(userId: string): UserCredits {
  const now = new Date().toISOString();
  const credits = {
    lastReset: now,
    credits: 20,
    firstRequestTime: now
  };
  creditStore[userId] = credits;
  saveCredits(creditStore);
  return credits;
}

// Get current credits with tamper protection
export function getCredits(userId: string): UserCredits {
  const now = new Date();
  const stored = creditStore[userId];
  
  // Initialize if first time
  if (!stored) return initCredits(userId);

  // Handle legacy format migration
  if (stored.grammarCredits !== undefined) {
    stored.credits = stored.grammarCredits;
    delete stored.grammarCredits;
    delete stored.smartComposerCredits;
    delete stored.writingStyleCredits;
    saveCredits(creditStore);
  }

  // Enforce 24-hour reset window from first request
  const firstRequest = new Date(stored.firstRequestTime || stored.lastReset);
  const hoursSinceFirstRequest = (now.getTime() - firstRequest.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceFirstRequest >= 24) {
    return initCredits(userId);
  }

  return stored;
}

// Deduct a credit (only after successful LLM response)
export function deductCredit(userId: string): boolean {
  const credits = getCredits(userId);
  
  if (credits.credits > 0) {
    credits.credits--;
    // Track first request time if not set
    if (!credits.firstRequestTime) {
      credits.firstRequestTime = new Date().toISOString();
    }
    saveCredits(creditStore);
    console.log('Deducted credit:', userId, credits.credits);
    // Notify all components of credit update
    console.log('Credit deducted for user:', userId, 'Remaining:', credits.credits);
    return true;
  }
  
  return false;
}

// Get remaining credits without deduction
export function checkCredits(userId: string) {
  return getCredits(userId);
}