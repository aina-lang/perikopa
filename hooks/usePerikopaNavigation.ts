import { useBible } from './useBible';

export const usePerikopaNavigation = () => {
  const { getBooks } = useBible();

  const parseReference = async (ref: string) => {
    // Regex to match "Book Chapter:Verse" or "Book Chapter"
    // Example: "Jaona 16:19-24" -> Book: "Jaona", Chapter: 16, Verse: 19
    const match = ref.match(/^(.+?)\s+(\d+)(?::(\d+))?/);
    if (!match) return null;

    const bookName = match[1].trim();
    const chapter = parseInt(match[2]);
    const verse = match[3] ? parseInt(match[3]) : 1;

    // Abbreviations mapping
    const mapping: { [key: string]: string } = {
      'I Tan.': '1CH',
      'II Tan.': '2CH',
      'Deo.': 'Deoteronomia',
      'Mpitsara': 'Mpitsara',
      'I Mpa.': '1 Mpanjaka',
      'II Mpa.': '2 Mpanjaka',
      'Sal.': 'Salamo',
      'Neh.': 'Nehemia',
      'Isaia': 'Isaia',
      'Amosa': 'Amosa',
      'Josoa': 'Josoa',
      'Jaona': 'Jaona',
      'Lioka': 'Lioka',
      'Marka': 'Marka',
      'Matio': 'Matio',
      'Asa.': 'Asa',
      'I Kor.': '1 Korintiana',
      'II Kor.': '2 Korintiana',
      'I Tim.': '1 Timoty',
      'II Tim.': '2 Timoty',
      'I Tes.': '1 Tesaloniana',
      'II Tes.': '2 Tesaloniana',
      'Rom.': 'Romana',
      'Gal.': 'Galatiana',
      'Jakoba': 'Jakoba',
      'Joda': 'Joda',
      'Apo.': 'Apokalypsy',
    };

    const fullName = mapping[bookName] || bookName;
    const allBooks = await getBooks();
    
    // Search by full name or slug
    const book = allBooks.find(b => 
      b.anarana.toLowerCase() === fullName.toLowerCase() ||
      b.slug.toLowerCase() === fullName.toLowerCase() ||
      b.anarana.toLowerCase().includes(fullName.toLowerCase())
    );

    if (!book) return null;

    const { getVerses } = useBible();
    const verses = await getVerses(book.slug, chapter);
    const targetVerse = verses.find(v => v.laharana === verse);

    return { book, chapter, verse, verseId: targetVerse?.id };
  };

  return { parseReference };
};
