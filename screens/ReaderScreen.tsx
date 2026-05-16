import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Text, ToastAndroid, Platform } from 'react-native';
import { ReaderScreenProps } from '../navigation/types';
import { useBible } from '../hooks/useBible';
import PagerView from 'react-native-pager-view';
import ChapterPage from '../components/ChapterPage';
import { Andininy, Boky } from '../services/database';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Copy, BookmarkPlus, BookmarkMinus } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useBookmarks } from '../hooks/useBookmarks';

interface FlattenedChapter {
  boky: Boky;
  toko: number;
  index: number;
}

const formatBookName = (name: string) => {
  const parts = name.split(' ');
  const last = parts[parts.length - 1];
  if (last === 'I' || last === 'II' || last === 'III') {
    return `${last} ${parts.slice(0, -1).join(' ')}`;
  }
  return name;
};

export default function ReaderScreen({ route, navigation }: ReaderScreenProps) {
  const { boky, toko, targetVerse, targetVerseEnd, targetVerseId, searchQuery } = route.params;
  const { getAllChaptersFlattened } = useBible();
  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = useBookmarks();
  
  const [allChapters, setAllChapters] = useState<FlattenedChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerse, setSelectedVerse] = useState<Andininy | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  const pagerRef = useRef<PagerView>(null);

  useEffect(() => {
    setSelectedVerse(null);
    getAllChaptersFlattened().then((data) => {
      setAllChapters(data);
      
      // Find initial index in global list
      // We look for same book slug and same chapter numero
      const idx = data.findIndex(c => c.boky.slug === boky.slug && c.toko === toko);
      const safeIdx = Math.max(0, idx);
      
      setCurrentIndex(safeIdx);
      
      // Set initial title
      const item = data[safeIdx];
      if (item) {
        navigation.setOptions({ title: `${formatBookName(item.boky.anarana)} ${item.index}` });
      }
      
      setLoading(false);
      
      // Use setTimeout to ensure PagerView is ready if we need to jump
      if (idx >= 0) {
        setTimeout(() => {
          pagerRef.current?.setPage(idx);
        }, 100);
      }
    });
  }, [getAllChaptersFlattened]);

  const onPageSelected = (e: any) => {
    const newIndex = e.nativeEvent.position;
    setCurrentIndex(newIndex);
    const item = allChapters[newIndex];
    if (item) {
      navigation.setOptions({ title: `${formatBookName(item.boky.anarana)} ${item.index}` });
    }
    setSelectedVerse(null);
  };

  const handleCopy = async () => {
    const current = allChapters[currentIndex];
    if (selectedVerse && current) {
      const textToCopy = `${formatBookName(current.boky.anarana)} ${current.index}:${selectedVerse.laharana} - ${selectedVerse.votoatiny}`;
      await Clipboard.setStringAsync(textToCopy);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Verset copié', ToastAndroid.SHORT);
      }
      setSelectedVerse(null);
    }
  };

  const handleBookmark = () => {
    const current = allChapters[currentIndex];
    if (selectedVerse && current) {
      const bookmarked = isBookmarked(current.boky.slug, current.toko, selectedVerse.laharana);
      if (bookmarked) {
        removeBookmark(`${current.boky.slug}-${current.toko}-${selectedVerse.laharana}`);
        if (Platform.OS === 'android') ToastAndroid.show('Marque supprimée', ToastAndroid.SHORT);
      } else {
        const verseWithToko = { ...selectedVerse, toko: current.toko };
        addBookmark(current.boky, verseWithToko);
        if (Platform.OS === 'android') ToastAndroid.show('Verset marqué', ToastAndroid.SHORT);
      }
      setSelectedVerse(null);
    }
  };

  if (loading || currentIndex === -1) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  const current = allChapters[currentIndex];
  const verseIsBookmarked = selectedVerse && current ? isBookmarked(current.boky.slug, current.toko, selectedVerse.laharana) : false;

  return (
    <View className="flex-1 bg-white">
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={currentIndex}
        onPageSelected={onPageSelected}
        offscreenPageLimit={5}
      >
        {allChapters.map((item, index) => {
          const isTargetChapter = item.boky.slug === boky.slug && item.toko === toko;

          return (
            <View key={`${item.boky.slug}-${item.toko}`} style={{ flex: 1 }}>
              <ChapterPage 
                boky={item.boky} 
                toko={item.toko} 
                selectedVerse={selectedVerse}
                onSelectVerse={setSelectedVerse}
                bookmarks={bookmarks}
                targetVerse={isTargetChapter ? targetVerse : undefined}
                targetVerseEnd={isTargetChapter ? targetVerseEnd : undefined}
                targetVerseId={isTargetChapter ? targetVerseId : undefined}
                searchQuery={searchQuery}
                isActive={true}
              />
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
