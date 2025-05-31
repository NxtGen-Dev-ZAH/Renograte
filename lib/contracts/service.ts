import { getTemplateById } from "./templates";

export interface TermSheet {
  id: string;
  templateId: string;
  name: string;
  propertyAddress: string;
  partyOne: string;
  partyTwo: string;
  date: string;
  terms: string;
  data: Record<string, any>;
  signatureOne?: string;
  signatureTwo?: string;
  createdAt: string;
}

// Local storage key
const TERM_SHEETS_STORAGE_KEY = "renograte_term_sheets";

// Get all term sheets
export const getAllTermSheets = (): TermSheet[] => {
  if (typeof window === "undefined") {
    return [];
  }
  
  const storedData = localStorage.getItem(TERM_SHEETS_STORAGE_KEY);
  if (!storedData) {
    return [];
  }
  
  try {
    return JSON.parse(storedData);
  } catch (error) {
    console.error("Error parsing term sheets from storage:", error);
    return [];
  }
};

// Get a term sheet by ID
export const getTermSheetById = (id: string): TermSheet | null => {
  const termSheets = getAllTermSheets();
  return termSheets.find(sheet => sheet.id === id) || null;
};

// Save a term sheet
export const saveTermSheet = (termSheet: Omit<TermSheet, "id" | "createdAt">): TermSheet => {
  const termSheets = getAllTermSheets();
  
  // Create a new term sheet with ID and timestamp
  const newTermSheet: TermSheet = {
    ...termSheet,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  
  // Add to list and save to storage
  const updatedTermSheets = [...termSheets, newTermSheet];
  saveTermSheetsToStorage(updatedTermSheets);
  
  return newTermSheet;
};

// Update an existing term sheet
export const updateTermSheet = (id: string, updates: Partial<TermSheet>): TermSheet | null => {
  const termSheets = getAllTermSheets();
  const index = termSheets.findIndex(sheet => sheet.id === id);
  
  if (index === -1) {
    return null;
  }
  
  // Update the term sheet
  const updatedTermSheet = {
    ...termSheets[index],
    ...updates,
  };
  
  termSheets[index] = updatedTermSheet;
  saveTermSheetsToStorage(termSheets);
  
  return updatedTermSheet;
};

// Delete a term sheet
export const deleteTermSheet = (id: string): boolean => {
  const termSheets = getAllTermSheets();
  const filteredTermSheets = termSheets.filter(sheet => sheet.id !== id);
  
  if (filteredTermSheets.length === termSheets.length) {
    return false;
  }
  
  saveTermSheetsToStorage(filteredTermSheets);
  return true;
};

// Generate a document from a term sheet
export const generateDocument = (termSheet: TermSheet): string => {
  const template = getTemplateById(termSheet.templateId);
  
  if (!template) {
    throw new Error(`Template not found: ${termSheet.templateId}`);
  }
  
  return template.template({
    ...termSheet.data,
    propertyAddress: termSheet.propertyAddress,
    partyOne: termSheet.partyOne,
    partyTwo: termSheet.partyTwo,
    date: termSheet.date,
    terms: termSheet.terms,
  });
};

// Helper function to save term sheets to storage
const saveTermSheetsToStorage = (termSheets: TermSheet[]): void => {
  if (typeof window === "undefined") {
    return;
  }
  
  localStorage.setItem(TERM_SHEETS_STORAGE_KEY, JSON.stringify(termSheets));
};

// Helper function to generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}; 