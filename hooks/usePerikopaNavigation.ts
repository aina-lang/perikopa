import { useBible } from './useBible';

export const usePerikopaNavigation = () => {
  const { getBooks, getVerses } = useBible();

  const parseReference = async (ref: string) => {
    // Regex to match "Book Chapter:Verse" or "Book Chapter"
    // Example: "Jaona 16:19-24" -> Book: "Jaona", Chapter: 16, Verse: 19
    const match = ref.match(/^(.+?)\s+(\d+)(?::(\d+))?/);
    if (!match) return null;

    const bookName = match[1].trim();
    const chapter = parseInt(match[2]);
    const verse = match[3] ? parseInt(match[3]) : 1;

    // Abbreviations mapping to match database names
    const mapping: { [key: string]: string } = {
      'I Tan.': '1CH',
      'II Tan.': '2CH',
      'Deo.': 'Deotornomia', // Note the 'o' instead of 'e' in database
      'Mpitsara': 'Mpitsara',
      'I Mpa.': 'Mpanjaka I',
      'II Mpa.': 'Mpanjaka II',
      'Sal.': 'Salamo',
      'Neh.': 'Nehemia',
      'Isaia': 'Isaia',
      'Amosa': 'Amosa',
      'Josoa': 'Josoa',
      'Jaona': 'Jaona',
      'Lioka': 'Lioka',
      'Marka': 'Marka',
      'Matio': 'Matio',
      'Asa.': 'Asan\'ny Apositoly',
      'I Kor.': 'Korintiana I',
      'II Kor.': 'Korintiana II',
      'I Tim.': 'Timoty I',
      'II Tim.': 'Timoty II',
      'I Tes.': 'Tesaloniana I',
      'II Tes.': 'Tesaloniana II',
      'Rom.': 'Romana',
      'Gal.': 'Galatiana',
      'Jakoba': 'Jakoba',
      'Joda': 'Joda',
      'Apo.': 'Apokalipsy', // 'Apokalipsy' with 'i' in database
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

    const verses = await getVerses(book.slug, chapter);
    const targetVerse = verses.find(v => v.laharana === verse);

    return { book, chapter, verse, verseId: targetVerse?.id };
  };

  return { parseReference };
};
