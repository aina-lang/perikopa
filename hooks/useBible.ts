import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';
import { Boky, Andininy } from '../services/database';

export const useBible = () => {
  const db = useSQLiteContext();

  const getBooks = useCallback(async (): Promise<Boky[]> => {
    const rows = await db.getAllAsync<{
      id: number;
      shortName: string;
      type: string;
      name: string | null;
      ordre: number | null;
    }>(
      `SELECT b.id, b.shortName, b.type, li.name, li.ordre
       FROM books b
       LEFT JOIN livres_info li ON b.id = li.idBook
       ORDER BY b.id ASC`
    );
    return rows.map((r) => ({
      id: r.id,
      slug: r.shortName,
      anarana: r.name || r.shortName,
      laharana: r.ordre || r.id,
      testament: r.type,
    }));
  }, [db]);

  const getChapters = useCallback(async (boky_slug: string): Promise<number[]> => {
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
  }, [db]);

  const getVerses = useCallback(async (boky_slug: string, toko: number): Promise<Andininy[]> => {
    // Get book id
    const book = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM books WHERE shortName = ?',
      [boky_slug]
    );
    if (!book) return [];

    // Get toko id
    const tokoRow = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM tokos WHERE book_id = ? AND numero = ?',
      [book.id, toko]
    );
    if (!tokoRow) return [];

    // Get verses
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
        laharana: index + 1,   // sequential verse number within chapter
        votoatiny,
        lohateny,
      };
    });
  }, [db]);

  const searchVerses = useCallback(async (query: string): Promise<(Andininy & { bookName: string })[]> => {
    if (!query.trim()) return [];
    const pattern = `%${query.trim()}%`;

    const rows = await db.getAllAsync<{
      id: number;
      idToko: number;
      numeroToko: number;
      text: string;
      shortName: string;
      tokoNumero: number;
      bookName: string;
      rowNum: number;
    }>(
      `SELECT a.id, a.idToko, a.numeroToko, a.text,
              b.shortName, t.numero AS tokoNumero, li.name AS bookName,
              (SELECT COUNT(*) FROM andininys a2 WHERE a2.idToko = a.idToko AND a2.id <= a.id) AS rowNum
       FROM andininys a
       JOIN tokos t ON a.idToko = t.id
       JOIN books b ON t.book_id = b.id
       JOIN livres_info li ON b.id = li.idBook
       WHERE a.text LIKE ? COLLATE NOCASE
       ORDER BY li.ordre, t.numero, a.id`,
      [pattern]
    );

    return rows.map((r) => {
      let votoatiny = r.text;
      const match = r.text.match(/^\[(.+?)\]\s*/);
      if (match) votoatiny = r.text.substring(match[0].length);

      return {
        id: r.id,
        boky_slug: r.shortName,
        toko: r.tokoNumero,
        laharana: r.rowNum,
        votoatiny,
        bookName: r.bookName,
      };
    });
  }, [db]);

  const getAllChaptersFlattened = useCallback(async (): Promise<{ boky: Boky, toko: number, index: number }[]> => {
    const allBooks = await getBooks();
    const result: { boky: Boky, toko: number, index: number }[] = [];
    
    const allTokos = await db.getAllAsync<{ book_id: number, numero: number }>(
      'SELECT book_id, numero FROM tokos ORDER BY id ASC'
    );

    let currentBookId = -1;
    let relativeIndex = 0;
    
    for (const row of allTokos) {
      if (row.book_id !== currentBookId) {
        currentBookId = row.book_id;
        relativeIndex = 1;
      } else {
        relativeIndex++;
      }

      const book = allBooks.find(b => b.id === row.book_id);
      if (book) {
        result.push({ boky: book, toko: row.numero, index: relativeIndex });
      }
    }
    return result;
  }, [db, getBooks]);

  return { getBooks, getChapters, getVerses, searchVerses, getAllChaptersFlattened };
};
