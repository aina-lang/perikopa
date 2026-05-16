export interface PerikopaEntry {
  id: string;
  date: string;
  testamentTaloha: string;
  filazantsara: string;
  epistily: string;
  fampaherezana: string;
}

export interface PerikopaSection {
  theme: string;
  entries: PerikopaEntry[];
}

export interface PerikopaSemester {
  id: number;
  name: string;
  sections: PerikopaSection[];
}

export interface PerikopaYear {
  year: number;
  headerVerse: {
    text: string;
    reference: string;
  } | null;
  semesters: PerikopaSemester[];
}

export interface PerikopaData {
  version: number;
  lastUpdated: string;
  perikopa: PerikopaYear[];
}
