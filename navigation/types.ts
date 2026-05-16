import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Boky } from '../services/database';

export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  Books: undefined;
  Chapters: { boky: Boky };
  Verses: { boky: Boky; toko: number };
  Reader: { boky: Boky; toko: number; targetVerse?: number; targetVerseEnd?: number; targetVerseId?: number; searchQuery?: string };
  Bookmarks: undefined;
  Search: undefined;
  About: undefined;
  Perikopa: undefined;
};

export type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export type BooksScreenProps = NativeStackScreenProps<RootStackParamList, 'Books'>;
export type ChaptersScreenProps = NativeStackScreenProps<RootStackParamList, 'Chapters'>;
export type VersesScreenProps = NativeStackScreenProps<RootStackParamList, 'Verses'>;
export type ReaderScreenProps = NativeStackScreenProps<RootStackParamList, 'Reader'>;
export type SearchScreenProps = NativeStackScreenProps<RootStackParamList, 'Search'>;
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type AboutScreenProps = NativeStackScreenProps<RootStackParamList, 'About'>;
export type PerikopaScreenProps = NativeStackScreenProps<RootStackParamList, 'Perikopa'>;
