import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  ToastAndroid,
  Platform,
  FlatList,
  Dimensions,
  Text,
  Share,
} from 'react-native';
import { ReaderScreenProps } from '../navigation/types';
import { useBible } from '../hooks/useBible';
import ChapterPage from '../components/ChapterPage';
import { Andininy, Boky } from '../services/database';
import Animated, {
  FadeInDown,
  FadeOutDown,
} from 'react-native-reanimated';
import { Copy, BookmarkPlus, BookmarkMinus, Share2, Type } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useBookmarks } from '../hooks/useBookmarks';
import { BlurView } from 'expo-blur';
import theme from '../constants/theme';
import Slider from '@react-native-community/slider';

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

const { width } = Dimensions.get('window');

// ─── Hauteurs fixes ────────────────────────────────────────────────────────────
const SLIDER_BAR_HEIGHT = 64;   // barre du slider en bas
const FAB_BOTTOM = SLIDER_BAR_HEIGHT + 16; // FAB juste au-dessus du slider

export default function ReaderScreen({ route, navigation }: ReaderScreenProps) {
  const { boky, toko, targetVerse, targetVerseEnd, targetVerseId, searchQuery } = route.params;
  const { getAllChaptersFlattened } = useBible();
  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = useBookmarks();

  const [allChapters, setAllChapters] = useState<FlattenedChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerse, setSelectedVerse] = useState<Andininy | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [zoomLevel, setZoomLevel] = useState(50);

  const flatListRef = useRef<FlatList<FlattenedChapter>>(null);

  // fontSize : 14px (zoom=10) → 32px (zoom=100)
  const calculatedFontSize = 14 + ((zoomLevel - 10) / 90) * 18;

  // ─── Chargement des chapitres ─────────────────────────────────────────────────
  useEffect(() => {
    setSelectedVerse(null);
    getAllChaptersFlattened().then((data) => {
      setAllChapters(data);

      const idx = data.findIndex(c => c.boky.slug === boky.slug && c.toko === toko);
      const safeIdx = Math.max(0, idx);
      setCurrentIndex(safeIdx);

      const item = data[safeIdx];
      if (item) updateHeader(item);

      setLoading(false);

      if (safeIdx >= 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: safeIdx, animated: false });
        }, 100);
      }
    });
  }, [getAllChaptersFlattened]);

  const updateHeader = (item: FlattenedChapter) => {
    navigation.setOptions({
      title: `${formatBookName(item.boky.anarana)} ${item.index}`,
    });
  };

  const currentIndexRef = useRef(currentIndex);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const onScroll = useRef((event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(x / width);
    
    if (newIndex >= 0 && newIndex < allChapters.length && newIndex !== currentIndexRef.current) {
      // On met à jour l'état (pour le rendu) et le ref (pour le prochain calcul)
      currentIndexRef.current = newIndex;
      setCurrentIndex(newIndex);
      
      const item = allChapters[newIndex];
      if (item) {
        navigation.setOptions({
          title: `${formatBookName(item.boky.anarana)} ${item.toko}`,
        });
      }
      setSelectedVerse(null);
    }
  }).current;

  // ─── Actions ──────────────────────────────────────────────────────────────────
  const handleCopy = async () => {
    const current = allChapters[currentIndex];
    if (selectedVerse && current) {
      const textToCopy = `${formatBookName(current.boky.anarana)} ${current.index}:${selectedVerse.laharana} - ${selectedVerse.votoatiny}`;
      await Clipboard.setStringAsync(textToCopy);
      if (Platform.OS === 'android') ToastAndroid.show('Verset copié', ToastAndroid.SHORT);
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
        addBookmark(current.boky, { ...selectedVerse, toko: current.toko });
        if (Platform.OS === 'android') ToastAndroid.show('Verset marqué', ToastAndroid.SHORT);
      }
      setSelectedVerse(null);
    }
  };

  const handleShare = async () => {
    const current = allChapters[currentIndex];
    if (selectedVerse && current) {
      const textToShare = `${formatBookName(current.boky.anarana)} ${current.index}:${selectedVerse.laharana} - ${selectedVerse.votoatiny}`;
      try {
        await Share.share({
          message: textToShare,
        });
        setSelectedVerse(null);
      } catch (error) {
        console.error('Erreur de partage:', error);
      }
    }
  };

  // ─── Loading ──────────────────────────────────────────────────────────────────
  if (loading || currentIndex === -1) {
    return (
      <View className="flex-1 items-center justify-center bg-background-primary gap-3">
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
        <Text className="text-sm text-text-secondary mt-2">Chargement...</Text>
      </View>
    );
  }

  const current = allChapters[currentIndex];
  const verseIsBookmarked = selectedVerse && current
    ? isBookmarked(current.boky.slug, current.toko, selectedVerse.laharana)
    : false;

  return (
    <View className="flex-1 bg-background-primary">

      {/* ── Mesh Gradient blobs ────────────────────────────────────────────── */}
      <View className="absolute inset-0" pointerEvents="none">
        <View className="absolute -top-[100px] -left-[100px] w-80 h-80 rounded-full bg-primary-600 opacity-[0.07] scale-[1.4]" />
        <View className="absolute top-[40%] -right-[100px] w-80 h-80 rounded-full bg-emerald-500 opacity-[0.06] scale-[1.3]" />
        <View className="absolute bottom-15 left-[20%] w-80 h-80 rounded-full bg-gold-500 opacity-[0.07] scale-[1.2]" />
      </View>

      {/* ── FlatList horizontale ──────────────────────────────────────────── */}
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
        onScroll={onScroll}
        scrollEventThrottle={16}
        windowSize={5}
        maxToRenderPerBatch={3}
        initialNumToRender={3}
        removeClippedSubviews
        // Laisse de la place en bas pour le slider
        contentContainerStyle={{ paddingBottom: 0 }}
        renderItem={({ item, index }) => {
          const isTargetChapter = item.boky.slug === boky.slug && item.toko === toko;
          const isActive = Math.abs(index - currentIndex) <= 2;
          return (
            <View style={{ width, flex: 1, paddingBottom: SLIDER_BAR_HEIGHT + 8 }}>
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
                fontSize={calculatedFontSize}
              />
            </View>
          );
        }}
      />

      {/* ── FAB (actions verset sélectionné) ─────────────────────────────── */}
      {selectedVerse && (
        <Animated.View
          entering={FadeInDown.duration(150)}
          exiting={FadeOutDown.duration(120)}
          className="absolute left-5 right-5 z-[100] shadow-lg shadow-primary-800/20"
          style={{ bottom: FAB_BOTTOM, elevation: 12 }}
        >
          <View
            className="flex-row items-center justify-around rounded-[28px] border border-background-tertiary py-2.5 px-2 overflow-hidden bg-white shadow-xl shadow-black/10"
            style={{ elevation: 15 }}
          >
            {/* Copier */}
            <TouchableOpacity onPress={handleCopy} className="flex-1 items-center justify-center gap-1.5" activeOpacity={0.7}>
              <View className="w-12 h-12 rounded-full items-center justify-center bg-primary-50">
                <Copy size={20} color={theme.tokens.fab.copyBtn} />
              </View>
              <Text className="text-[11px] font-bold" style={{ color: theme.tokens.fab.copyBtn }}>Copier</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="w-[0.5px] h-12 bg-background-tertiary" />

            {/* Favori */}
            <TouchableOpacity onPress={handleBookmark} className="flex-1 items-center justify-center gap-1.5" activeOpacity={0.7}>
              <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: verseIsBookmarked ? 'rgba(5,150,105,0.08)' : 'rgba(232,197,71,0.08)' }}>
                {verseIsBookmarked
                  ? <BookmarkMinus size={20} color={theme.tokens.fab.shareBtn} />
                  : <BookmarkPlus size={20} color={theme.tokens.fab.bookmarkBtn} />
                }
              </View>
              <Text className="text-[11px] font-bold" style={{ color: verseIsBookmarked ? theme.tokens.fab.shareBtn : theme.tokens.fab.bookmarkBtn }}>
                {verseIsBookmarked ? 'Retirer' : 'Marquer'}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="w-[0.5px] h-12 bg-background-tertiary" />

            {/* Partager */}
            <TouchableOpacity onPress={handleShare} className="flex-1 items-center justify-center gap-1.5" activeOpacity={0.7}>
              <View className="w-12 h-12 rounded-full items-center justify-center bg-emerald-50">
                <Share2 size={20} color={theme.tokens.fab.shareBtn} />
              </View>
              <Text className="text-[11px] font-bold" style={{ color: theme.tokens.fab.shareBtn }}>Partager</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* ── Barre slider TOUJOURS visible en bas ─────────────────────────── */}
      <View className="absolute bottom-0 left-0 right-0 z-[90] shadow shadow-black/5" style={{ height: SLIDER_BAR_HEIGHT, elevation: 8 }} pointerEvents="box-none">
        <View
          className="flex-1 flex-row items-center px-4 border-t border-background-tertiary gap-2 overflow-hidden bg-[#DBEAFE]"
        >
          <Type size={13} color={theme.colors.primary[400]} strokeWidth={1.5} />
          <View style={{ flex: 1, height: 40, justifyContent: 'center' }}>
            {/* Ticks/Dots behind the slider */}
            <View style={{ position: 'absolute', left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              {[...Array(10)].map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: theme.colors.primary[200],
                    opacity: 0.8
                  }}
                />
              ))}
            </View>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={10}
              maximumValue={100}
              step={10}
              value={zoomLevel}
              onValueChange={setZoomLevel}
              minimumTrackTintColor={theme.colors.primary[600]}
              maximumTrackTintColor="transparent" // Let the dots show
              thumbTintColor={theme.colors.primary[600]}
            />
          </View>
          <Type size={20} color={theme.colors.primary[600]} strokeWidth={1.5} />
          <Text className="text-[12px] text-text-primary font-bold min-w-[24px] text-right">{zoomLevel}</Text>
        </View>
      </View>

    </View>
  );
}