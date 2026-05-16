import * as SQLite from 'expo-sqlite';

// --- Types ---

export interface Boky {
  id: number;
  slug: string;       // shortName from books (e.g. "GEN")
  anarana: string;     // full name from livres_info (e.g. "Genesisy")
  laharana: number;    // ordre from livres_info
  testament: string;   // type from books (e.g. "boky")
}

export interface Andininy {
  id: number;
  boky_slug: string;
  toko: number;
  laharana: number;
  votoatiny: string;
  lohateny?: string;   // subtitle extracted from [...]
}

// --- Database access ---

export const getDb = async () => {
  return await SQLite.openDatabaseAsync('perikopa.db');
};

// --- Queries ---

export const getBooks = async (): Promise<Boky[]> => {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: number;
    shortName: string;
    type: string;
    name: string;
    ordre: number;
  }>(
    `SELECT b.id, b.shortName, b.type, li.name, li.ordre
     FROM books b
     JOIN livres_info li ON b.id = li.idBook
     ORDER BY li.ordre ASC`
  );
  return rows.map((r) => ({
    id: r.id,
    slug: r.shortName,
    anarana: r.name,
    laharana: r.ordre,
    testament: r.type,
  }));
};

export const getChapters = async (boky_slug: string): Promise<number[]> => {
  const db = await getDb();
  // Get the book id from shortName
  const book = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM books WHERE shortName = ?',
    [boky_slug]
  );
  if (!book) return [];

  const rows = await db.getAllAsync<{ numero: number }>(
    'SELECT numero FROM tokos WHERE book_id = ? ORDER BY numero ASC',
    [book.id]
  );
  return rows.map((r) => r.numero);
};

export const getVerses = async (boky_slug: string, toko: number): Promise<Andininy[]> => {
  const db = await getDb();

  // Get the book id
  const book = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM books WHERE shortName = ?',
    [boky_slug]
  );
  if (!book) return [];

  // Get the toko id
  const tokoRow = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM tokos WHERE book_id = ? AND numero = ?',
    [book.id, toko]
  );
  if (!tokoRow) return [];

  // Get all verses for this chapter
  const rows = await db.getAllAsync<{
    id: number;
    idToko: number;
    numeroToko: number;
    text: string;
  }>(
    'SELECT id, idToko, numeroToko, text FROM andininys WHERE idToko = ? ORDER BY id ASC',
    [tokoRow.id]
  );

  return rows.map((r, index) => {
    let lohateny: string | undefined;
    let votoatiny = r.text;

    // Extract subtitle from [...]
    const match = r.text.match(/^\[(.+?)\]\s*/);
    if (match) {
      lohateny = match[1];
      votoatiny = r.text.substring(match[0].length);
    }

    return {
      id: r.id,
      boky_slug: boky_slug,
      toko: toko,
      laharana: r.numeroToko,
      votoatiny,
      lohateny,
    };
  });
};
