import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Text, ToastAndroid, Platform } from 'react-native';
import { ReaderScreenProps } from '../navigation/types';
import { useBible } from '../hooks/useBible';
import PagerView from 'react-native-pager-view';
import ChapterPage from '../components/ChapterPage';
import { Andininy } from '../services/database';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Copy, BookmarkPlus, BookmarkMinus } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useBookmarks } from '../hooks/useBookmarks';

export default function ReaderScreen({ route, navigation }: ReaderScreenProps) {
  const { boky, toko, targetVerse, targetVerseId, searchQuery } = route.params;
  const { getChapters } = useBible();
  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = useBookmarks();
  
  const [chapters, setChapters] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerse, setSelectedVerse] = useState<Andininy | null>(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const pagerRef = useRef<PagerView>(null);

  useEffect(() => {
    setSelectedVerse(null);
    getChapters(boky.slug).then((data) => {
      setChapters(data);
      const idx = Math.max(0, data.findIndex((c) => c === toko));
      setCurrentIndex(idx);
      setLoading(false);
      // If pager is already mounted and toko changes, move to it
      if (pagerRef.current) {
        pagerRef.current.setPage(idx);
      }
    });
  }, [boky.slug, toko, getChapters]);

  const onPageSelected = (e: any) => {
    const newIndex = e.nativeEvent.position;
    setCurrentIndex(newIndex);
    const currentToko = chapters[newIndex];
    if (currentToko) {
      navigation.setOptions({ title: `${boky.anarana} ${currentToko}` });
    }
    setSelectedVerse(null);
  };

  // Get current chapter number from index
  const getCurrentToko = () => chapters[currentIndex] ?? toko;

  const handleCopy = async () => {
    if (selectedVerse) {
      const currentToko = getCurrentToko();
      const textToCopy = `${boky.anarana} ${currentToko}:${selectedVerse.laharana} - ${selectedVerse.votoatiny}`;
      await Clipboard.setStringAsync(textToCopy);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Verset copié', ToastAndroid.SHORT);
      }
      setSelectedVerse(null);
    }
  };

  const handleBookmark = () => {
    if (selectedVerse) {
      const currentToko = getCurrentToko();
      const bookmarked = isBookmarked(boky.slug, currentToko, selectedVerse.laharana);
      if (bookmarked) {
        removeBookmark(`${boky.slug}-${currentToko}-${selectedVerse.laharana}`);
        if (Platform.OS === 'android') ToastAndroid.show('Marque supprimée', ToastAndroid.SHORT);
      } else {
        // Make sure the verse has the correct toko
        const verseWithToko = { ...selectedVerse, toko: currentToko };
        addBookmark(boky, verseWithToko);
        if (Platform.OS === 'android') ToastAndroid.show('Verset marqué', ToastAndroid.SHORT);
      }
      setSelectedVerse(null);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  const initialIndex = Math.max(0, chapters.findIndex((c) => c === toko));
  const currentToko = getCurrentToko();
  const verseIsBookmarked = selectedVerse ? isBookmarked(boky.slug, currentToko, selectedVerse.laharana) : false;

  return (
    <View className="flex-1 bg-white">
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={initialIndex}
        onPageSelected={onPageSelected}
      >
        {chapters.map((chapterToko, index) => {
          const isNear = Math.abs(index - currentIndex) <= 1;

          return (
            <View key={chapterToko.toString()} style={{ flex: 1 }}>
              {isNear ? (
                <ChapterPage 
                  boky={boky} 
                  toko={chapterToko} 
                  selectedVerse={selectedVerse}
                  onSelectVerse={setSelectedVerse}
                  bookmarks={bookmarks}
                  targetVerse={chapterToko === toko ? targetVerse : undefined}
                  targetVerseId={chapterToko === toko ? targetVerseId : undefined}
                  searchQuery={searchQuery}
                />
              ) : (
                <View className="flex-1 items-center justify-center bg-white">
                  <ActivityIndicator size="small" color="#dbeafe" />
                </View>
              )}
            </View>
          );
        })}
      </PagerView>

      {/* Floating Action Bar */}
      {selectedVerse && (
        <Animated.View 
          entering={FadeInDown.springify()} 
          exiting={FadeOutDown}
          className="absolute bottom-8 left-4 right-4 flex-row justify-around rounded-2xl p-4"
          style={{ backgroundColor: '#1e3a8a', shadowColor: '#1e3a8a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 8 }}
        >
          <TouchableOpacity onPress={handleCopy} className="items-center justify-center">
            <Copy size={24} color="#fff" />
            <Text className="mt-1 text-xs font-medium text-white">Copier</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleBookmark} className="items-center justify-center">
            {verseIsBookmarked ? (
              <BookmarkMinus size={24} color="#fca5a5" />
            ) : (
              <BookmarkPlus size={24} color="#fff" />
            )}
            <Text className={`mt-1 text-xs font-medium ${verseIsBookmarked ? 'text-red-300' : 'text-white'}`}>
              {verseIsBookmarked ? 'Retirer' : 'Marquer'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}
