import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Boky } from '../services/database';

export type RootStackParamList = {
  Books: undefined;
  Chapters: { boky: Boky };
  Reader: { boky: Boky; toko: number; targetVerse?: number; searchQuery?: string };
  Bookmarks: undefined;
  Search: undefined;
};

export type BooksScreenProps = NativeStackScreenProps<RootStackParamList, 'Books'>;
export type ChaptersScreenProps = NativeStackScreenProps<RootStackParamList, 'Chapters'>;
export type ReaderScreenProps = NativeStackScreenProps<RootStackParamList, 'Reader'>;
export type SearchScreenProps = NativeStackScreenProps<RootStackParamList, 'Search'>;
