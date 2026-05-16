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

export interface PerikopaPlan {
  year: number;
  headerVerse: {
    text: string;
    reference: string;
  };
  sections: PerikopaSection[];
}
