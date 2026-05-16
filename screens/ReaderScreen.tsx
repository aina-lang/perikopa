import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Text, ToastAndroid, Platform, FlatList, Dimensions } from 'react-native';
import { ReaderScreenProps } from '../navigation/types';
import { useBible } from '../hooks/useBible';
import ChapterPage from '../components/ChapterPage';
import { Andininy, Boky } from '../services/database';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Copy, BookmarkPlus, BookmarkMinus, Share2 } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useBookmarks } from '../hooks/useBookmarks';
import { BlurView } from 'expo-blur';
import { theme } from '../constants/theme';

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
  const { width } = Dimensions.get('window');
  
  const flatListRef = useRef<FlatList<FlattenedChapter>>(null);

  useEffect(() => {
    setSelectedVerse(null);
    getAllChaptersFlattened().then((data) => {
      setAllChapters(data);
      
      const idx = data.findIndex(c => c.boky.slug === boky.slug && c.toko === toko);
      const safeIdx = Math.max(0, idx);
      
      setCurrentIndex(safeIdx);
      
      const item = data[safeIdx];
      if (item) {
        navigation.setOptions({ 
          title: `${formatBookName(item.boky.anarana)} ${item.index}`,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.textPrimary,
          headerShadowVisible: false,
        });
      }
      
      setLoading(false);
      
      if (safeIdx >= 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: safeIdx, animated: false });
        }, 100);
      }
    });
  }, [getAllChaptersFlattened]);

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      if (newIndex !== null && newIndex !== undefined) {
        setCurrentIndex(newIndex);
        const item = allChapters[newIndex];
        if (item) {
          navigation.setOptions({ 
            title: `${formatBookName(item.boky.anarana)} ${item.index}`,
            headerStyle: { backgroundColor: theme.colors.background },
            headerTintColor: theme.colors.textPrimary,
            headerShadowVisible: false,
          });
        }
        setSelectedVerse(null);
      }
    }
  }).current;

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
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      {/* Mesh Gradient Background Approximation */}
      <View className="absolute inset-0 overflow-hidden" pointerEvents="none">
        <View className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-10" style={{ backgroundColor: theme.colors.primary, transform: [{ scale: 1.5 }] }} />
        <View className="absolute -right-32 top-1/2 h-96 w-96 rounded-full opacity-10" style={{ backgroundColor: theme.colors.secondary, transform: [{ scale: 1.5 }] }} />
        <View className="absolute -bottom-32 left-1/4 h-96 w-96 rounded-full opacity-10" style={{ backgroundColor: '#8B5CF6', transform: [{ scale: 1.5 }] }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={allChapters}
        keyExtractor={(item) => `${item.boky.slug}-${item.toko}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={currentIndex}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        windowSize={5}
        maxToRenderPerBatch={3}
        initialNumToRender={3}
        removeClippedSubviews={true}
        renderItem={({ item, index }) => {
          const isTargetChapter = item.boky.slug === boky.slug && item.toko === toko;
          const isActive = Math.abs(index - currentIndex) <= 2;

          return (
            <View style={{ width, flex: 1 }}>
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
                isActive={isActive}
              />
            </View>
          );
        }}
      />

      {/* Floating Action Bar */}
      {selectedVerse && (
        <Animated.View 
          entering={FadeInDown.springify()} 
          exiting={FadeOutDown}
          className="absolute bottom-10 left-6 right-6 overflow-hidden rounded-[32px]"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 }}
        >
          <BlurView intensity={40} tint="dark" className="flex-row justify-around p-4" style={{ backgroundColor: theme.colors.glassBg, borderColor: theme.colors.glassBorder, borderWidth: 1 }}>
            <TouchableOpacity onPress={handleCopy} className="h-12 w-12 items-center justify-center rounded-full bg-white/10">
              <Copy size={22} color={theme.colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleBookmark} className="h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: verseIsBookmarked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)' }}>
              {verseIsBookmarked ? (
                <BookmarkMinus size={22} color="#fca5a5" />
              ) : (
                <BookmarkPlus size={22} color={theme.colors.textPrimary} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => {}} className="h-12 w-12 items-center justify-center rounded-full bg-white/10">
              <Share2 size={22} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      )}
    </View>
  );
}
