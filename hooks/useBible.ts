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

    const formatBookName = (name: string, slug: string) => {
      const mapping: { [key: string]: string } = {
        '1CH': 'Tantara I',
        '2CH': 'Tantara II',
        '1SA': 'Samoela I',
        '2SA': 'Samoela II',
        '1KI': 'Mpanjaka I',
        '2KI': 'Mpanjaka II',
        '1CO': 'Korintiana I',
        '2CO': 'Korintiana II',
        '1TH': 'Tesaloniana I',
        '2TH': 'Tesaloniana II',
        '1TI': 'Timoty I',
        '2TI': 'Timoty II',
        '1PE': 'Petera I',
        '2PE': 'Petera II',
        '1JO': 'Jaona I',
        '2JO': 'Jaona II',
        '3JO': 'Jaona III',
      };
      return mapping[slug] || name;
    };

    return rows.map((r) => ({
      id: r.id,
      slug: r.shortName,
      anarana: formatBookName(r.name || r.shortName, r.shortName),
      laharana: r.ordre || r.id,
      testament: r.id <= 39 ? 'TALOHA' : 'VAOVAO',
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
    // Une seule requête JOIN au lieu de 3 requêtes séparées
    const rows = await db.getAllAsync<{
      id: number;
      idToko: number;
      numeroToko: number;
      text: string;
    }>(
      `SELECT a.id, a.idToko, a.numeroToko, a.text 
       FROM andininys a
       JOIN tokos t ON a.idToko = t.id
       JOIN books b ON t.book_id = b.id
       WHERE b.shortName = ? AND t.numero = ?
       ORDER BY a.id ASC`,
      [boky_slug, toko]
    );

    return rows.map((r, index) => {
      let lohateny: string | undefined;
      let votoatiny = r.text;

      const match = r.text.match(/^\[(.+?)\]\s*/);
      if (match) {
        lohateny = match[1];
        votoatiny = r.text.substring(match[0].length);
      }

      return {
        id: r.id,
        boky_slug: boky_slug,
        toko: toko,
        laharana: index + 1,
        votoatiny,
        lohateny,
      };
    });
  }, [db]);

  const searchVerses = useCallback(async (query: string): Promise<(Andininy & { bookName: string })[]> => {
    if (!query.trim()) return [];
    const pattern = `%${query.trim()}%`;

    // Requête optimisée : pas de sous-requête COUNT par ligne
    const rows = await db.getAllAsync<{
      id: number;
      idToko: number;
      text: string;
      shortName: string;
      tokoNumero: number;
      bookName: string;
    }>(
      `SELECT a.id, a.idToko, a.text,
              b.shortName, t.numero AS tokoNumero, li.name AS bookName
       FROM andininys a
       JOIN tokos t ON a.idToko = t.id
       JOIN books b ON t.book_id = b.id
       JOIN livres_info li ON b.id = li.idBook
       WHERE a.text LIKE ? COLLATE NOCASE
       ORDER BY li.ordre, t.numero, a.id`,
      [pattern]
    );

    // Calcul du numéro de verset en mémoire (beaucoup plus rapide que COUNT(*) SQL)
    const tokoVerseCountCache = new Map<number, number>();
    return rows.map((r) => {
      let votoatiny = r.text;
      const match = r.text.match(/^\[(.+?)\]\s*/);
      if (match) votoatiny = r.text.substring(match[0].length);

      // Numéro séquentiel approximatif basé sur l'id dans le toko
      const laharana = (tokoVerseCountCache.get(r.idToko) ?? 0) + 1;
      tokoVerseCountCache.set(r.idToko, laharana);

      return {
        id: r.id,
        boky_slug: r.shortName,
        toko: r.tokoNumero,
        laharana,
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
