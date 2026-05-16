import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Andininy, Boky } from '../services/database';

export interface BookmarkItem {
  id: string;
  boky: Boky;
  andininy: Andininy;
  dateAdded: number;
}

const STORAGE_KEY = '@baiboly_bookmarks';

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        setBookmarks(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Failed to load bookmarks', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const addBookmark = async (boky: Boky, andininy: Andininy) => {
    try {
      const newBookmark: BookmarkItem = {
        id: `${boky.slug}-${andininy.toko}-${andininy.laharana}`,
        boky,
        andininy,
        dateAdded: Date.now(),
      };

      // Check if already exists
      const exists = bookmarks.find((b) => b.id === newBookmark.id);
      if (exists) return;

      const updated = [newBookmark, ...bookmarks];
      setBookmarks(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save bookmark', e);
    }
  };

  const removeBookmark = async (id: string) => {
    try {
      const updated = bookmarks.filter((b) => b.id !== id);
      setBookmarks(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to remove bookmark', e);
    }
  };

  const isBookmarked = (bokySlug: string, toko: number, laharana: number) => {
    const id = `${bokySlug}-${toko}-${laharana}`;
    return bookmarks.some((b) => b.id === id);
  };

  return { bookmarks, loading, addBookmark, removeBookmark, isBookmarked, refreshBookmarks: loadBookmarks };
};
