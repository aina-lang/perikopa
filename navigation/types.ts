import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Boky } from '../services/database';

export type RootStackParamList = {
  Home: undefined;
  Books: undefined;
  Chapters: { boky: Boky };
  Reader: { boky: Boky; toko: number; targetVerse?: number; targetVerseId?: number; searchQuery?: string };
  Bookmarks: undefined;
  Search: undefined;
  About: undefined;
};

export type BooksScreenProps = NativeStackScreenProps<RootStackParamList, 'Books'>;
export type ChaptersScreenProps = NativeStackScreenProps<RootStackParamList, 'Chapters'>;
export type ReaderScreenProps = NativeStackScreenProps<RootStackParamList, 'Reader'>;
export type SearchScreenProps = NativeStackScreenProps<RootStackParamList, 'Search'>;
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type AboutScreenProps = NativeStackScreenProps<RootStackParamList, 'About'>;
