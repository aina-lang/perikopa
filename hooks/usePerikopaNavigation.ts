import { useBible } from './useBible';

export const usePerikopaNavigation = () => {
  const { getBooks, getVerses } = useBible();

  const parseReference = async (ref: string) => {
    // Trim and normalize spaces
    const normalizedRef = ref.trim().replace(/\s+/g, ' ');
    
    // Regex to match "Book Chapter:Verse-End" or "Book Chapter:Verse" or "Book Chapter"
    // Supports optional spaces and periods.
    const match = normalizedRef.match(/^(.+?)\s+(\d+)(?:\s*:\s*(\d+)(?:\s*-\s*(\d+))?)?/);
    if (!match) return null;

    let bookName = match[1].trim();
    // Normalize: remove trailing period for mapping
    const cleanBookName = bookName.endsWith('.') ? bookName.slice(0, -1) : bookName;
    const chapter = parseInt(match[2]);
    const verseStart = match[3] ? parseInt(match[3]) : 1;
    const verseEnd = match[4] ? parseInt(match[4]) : undefined;

    // Abbreviations mapping (normalized without periods where possible)
    const mapping: { [key: string]: string } = {
      'I Tan': '1CH',
      'II Tan': '2CH',
      'Deo': 'Deotornomia',
      'Deot': 'Deotornomia',
      'Mpitsara': 'Mpitsara',
      'I Mpa': 'Mpanjaka I',
      'II Mpa': 'Mpanjaka II',
      'Sal': 'Salamo',
      'Oha': 'Ohabolana',
      'Neh': 'Nehemia',
      'Isaia': 'Isaia',
      'Jer': 'Jeremia',
      'Eze': 'Ezekiela',
      'Amosa': 'Amosa',
      'Hag': 'Hagay',
      'Hagay': 'Hagay',
      'Josoa': 'Josoa',
      'Jaona': 'Jaona',
      'Lioka': 'Lioka',
      'Marka': 'Marka',
      'Matio': 'Matio',
      'Asa': 'Asan\'ny Apositoly',
      'I Kor': 'Korintiana I',
      'II Kor': 'Korintiana II',
      'I Tim': 'Timoty I',
      'II Tim': 'Timoty II',
      'I Tes': 'Tesaloniana I',
      'II Tes': 'Tesaloniana II',
      'Rom': 'Romana',
      'Gal': 'Galatiana',
      'Jakoba': 'Jakoba',
      'Joda': 'Joda',
      'Titosy': 'Titosy',
      'Apo': 'Apokalipsy',
    };

    const fullName = mapping[cleanBookName] || cleanBookName;
    const allBooks = await getBooks();
    
    // Advanced matching strategy
    let book = allBooks.find(b => 
      b.anarana.toLowerCase() === fullName.toLowerCase() ||
      b.slug.toLowerCase() === fullName.toLowerCase()
    );

    if (!book) {
      // Try inversion (I Timoty -> Timoty I)
      const parts = fullName.split(' ');
      if (parts[0] === 'I' || parts[0] === 'II' || parts[0] === 'III') {
        const inverted = `${parts.slice(1).join(' ')} ${parts[0]}`;
        book = allBooks.find(b => b.anarana.toLowerCase() === inverted.toLowerCase());
      }
    }

    if (!book) {
      // Fuzzy search
      book = allBooks.find(b => 
        b.anarana.toLowerCase().includes(fullName.toLowerCase()) ||
        fullName.toLowerCase().includes(b.anarana.toLowerCase())
      );
    }

    if (!book) {
      console.log('DEBUG: Book NOT found for:', fullName);
      return null;
    }

    console.log('DEBUG: Book found:', book.anarana, 'slug:', book.slug);
    const verses = await getVerses(book.slug, chapter);
    const targetVerse = verses.find(v => v.laharana === verseStart);
    console.log('DEBUG: Target verse ID found:', targetVerse?.id, 'Total verses in chapter:', verses.length);

    return { book, chapter, verse: verseStart, verseEnd, verseId: targetVerse?.id };
  };

  return { parseReference };
};
