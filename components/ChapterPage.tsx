import React, { useEffect, useState, memo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useBible } from '../hooks/useBible';
import { BookmarkItem } from '../hooks/useBookmarks';
import { Andininy, Boky } from '../services/database';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Bookmark } from 'lucide-react-native';
import theme from '../constants/theme';

interface ChapterPageProps {
  boky: Boky;
  toko: number;
  selectedVerse: Andininy | null;
  onSelectVerse: (verse: Andininy | null) => void;
  bookmarks: BookmarkItem[];
  targetVerse?: number;
  targetVerseEnd?: number;
  targetVerseId?: number;
  searchQuery?: string;
  isActive: boolean;
  fontSize: number;
}

// ─── Composant verset individualisé ──────────────────────────────────────────
interface VerseRowProps {
  item: Andininy;
  index: number;
  isSelected: boolean;
  isTarget: boolean;
  isMarked: boolean;
  fontSize: number;
  searchQuery?: string;
  onSelectVerse: (verse: Andininy | null) => void;
  selectedVerse: Andininy | null;
}

const VerseRow = memo(({
  item,
  index,
  isSelected,
  isTarget,
  isMarked,
  fontSize,
  searchQuery,
  onSelectVerse,
  selectedVerse,
}: VerseRowProps) => {

  // ── Couleurs de fond dynamiques ───────────────────────────────────────────
  let rowBg          = 'transparent';
  let borderLeft     = 3;
  let borderColor    = 'transparent';
  let borderWidth    = 0;

  if (isSelected) {
    rowBg         = theme.tokens.reader.verseSelectedBg;
    borderColor   = theme.tokens.reader.verseSelectedBorder;
    borderWidth   = 1;
    borderLeft    = 4;
  } else if (isTarget) {
    rowBg         = theme.tokens.reader.perikopaHighlight;
    borderColor   = theme.colors.gold[600];
    borderWidth   = 1;
    borderLeft    = 4;
  } else if (isMarked) {
    rowBg         = theme.colors.emerald[50] ?? '#ECFDF5';
    borderColor   = theme.tokens.reader.bookmarkActive;
    borderWidth   = 1;
    borderLeft    = 3;
  }

  const numberSize = Math.max(11, fontSize * 0.72);
  const lineH      = fontSize * theme.typography.lineHeight.normal;

  // ── Texte avec surlignage recherche ─────────────────────────────────────
  const renderText = () => {
    if (searchQuery && isTarget) {
      const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const parts   = item.votoatiny.split(new RegExp(`(${escaped})`, 'gi'));
      return (
        <Text className="text-text-primary" style={{ fontSize, lineHeight: lineH, fontFamily: theme.typography.fontVerset }}>
          {parts.map((part, i) =>
            part.toLowerCase() === searchQuery.toLowerCase() ? (
              <Text
                key={i}
                className="bg-gold-200 text-text-primary font-bold rounded-[3px]"
                style={{ fontSize }}
              >
                {part}
              </Text>
            ) : (
              <Text key={i}>{part}</Text>
            )
          )}
        </Text>
      );
    }
    return (
      <Text className="text-text-primary" style={{ fontSize, lineHeight: lineH, fontFamily: theme.typography.fontVerset }}>
        {item.votoatiny}
      </Text>
    );
  };

  return (
    <Animated.View
      entering={FadeInDown
        .delay(index * theme.animation.stagger.delayMs)
        .springify()
        .damping(theme.animation.spring.damping)
        .stiffness(theme.animation.spring.stiffness)
      }
      className="mb-0.5"
    >
      {/* ── En-tête de section (lohateny) ──────────────────────────────── */}
      {item.lohateny ? (
        <View className="flex-row items-center mt-7 mb-4 px-1 gap-2.5">
          <View className="flex-1 h-[0.5px] bg-primary-200 opacity-60" />
          <Text 
            className="font-semibold tracking-[2px] uppercase text-text-tertiary text-center"
            style={{ fontSize: Math.max(12, fontSize * 0.75) }}
          >
            {item.lohateny}
          </Text>
          <View className="flex-1 h-[0.5px] bg-primary-200 opacity-60" />
        </View>
      ) : null}

      {/* ── Rangée du verset ───────────────────────────────────────────── */}
      <TouchableOpacity
        activeOpacity={0.75}
        delayLongPress={220}
        onLongPress={() => onSelectVerse(item)}
        onPress={() => selectedVerse ? onSelectVerse(null) : null}
        className="flex-row rounded-md py-3 px-3 border-transparent"
        style={{
            backgroundColor: rowBg,
            borderColor,
            borderWidth,
            borderLeftWidth: borderLeft,
        }}
      >
        {/* Numéro */}
        <View className="w-[30px] items-center pt-0.5 mr-2.5">
          <Text className="font-bold text-text-tertiary text-center" style={{ fontSize: numberSize, fontFamily: theme.typography.fontUI }}>
            {item.laharana}
          </Text>
          {/* Icône bookmark si marqué */}
          {isMarked ? (
            <Bookmark
              size={10}
              color={theme.tokens.reader.bookmarkActive}
              fill={theme.tokens.reader.bookmarkActive}
              className="mt-1"
            />
          ) : null}
        </View>

        {/* Texte */}
        <View className="flex-1">
          {renderText()}
        </View>

        {/* Indicateur de sélection */}
        {isSelected ? (
          <View className="w-1.5 h-1.5 rounded-full bg-primary-600 self-center ml-2" />
        ) : null}
      </TouchableOpacity>
    </Animated.View>
  );
});

// ─── ChapterPage principal ────────────────────────────────────────────────────
const ChapterPage = ({
  boky,
  toko,
  selectedVerse,
  onSelectVerse,
  bookmarks,
  targetVerse,
  targetVerseEnd,
  targetVerseId,
  searchQuery,
  isActive,
  fontSize,
}: ChapterPageProps) => {
  const { getVerses } = useBible();
  const [verses, setVerses]   = useState<Andininy[]>([]);
  const [loading, setLoading] = useState(true);
  const flatListRef           = useRef<FlatList<Andininy>>(null);

  useEffect(() => {
    let mounted = true;
    if (isActive && verses.length === 0) {
      getVerses(boky.slug, toko).then((data) => {
        if (!mounted) return;
        setVerses(data);
        setLoading(false);
        if (targetVerseId || targetVerse) {
          setTimeout(() => {
            const idx = data.findIndex(v =>
              targetVerseId ? v.id === targetVerseId : v.laharana === targetVerse
            );
            if (idx >= 0) {
              flatListRef.current?.scrollToIndex({
                index: idx,
                animated: true,
                viewPosition: 0.15,
              });
            }
          }, 600);
        }
      });
    }
    return () => { mounted = false; };
  }, [boky.slug, toko, getVerses, targetVerse, targetVerseId, isActive, verses.length]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-transparent">
        <ActivityIndicator size="small" color={theme.colors.primary[600]} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        ref={flatListRef}
        data={verses}
        keyExtractor={(item) => item.id.toString()}
        contentContainerClassName="px-5 pt-3 pb-8"
        initialNumToRender={verses.length}
        onScrollToIndexFailed={(info) => {
          flatListRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: true,
          });
        }}
        // Séparateur discret entre versets
        ItemSeparatorComponent={() => <View className="h-0 bg-transparent" />}
        renderItem={({ item, index }) => {
          const isSelected = selectedVerse?.id === item.id;
          const isMarked   = bookmarks.some(
            b =>
              b.boky.slug === boky.slug &&
              b.andininy.toko === toko &&
              b.andininy.laharana === item.laharana
          );

          let isTarget = false;
          if (targetVerse && targetVerseEnd) {
            isTarget = item.laharana >= targetVerse && item.laharana <= targetVerseEnd;
          } else if (targetVerseId) {
            isTarget = item.id === targetVerseId;
          } else if (targetVerse) {
            isTarget = item.laharana === targetVerse;
          }

          return (
            <VerseRow
              key={item.id}
              item={item}
              index={index}
              isSelected={isSelected}
              isTarget={isTarget}
              isMarked={isMarked}
              fontSize={fontSize}
              searchQuery={searchQuery}
              onSelectVerse={onSelectVerse}
              selectedVerse={selectedVerse}
            />
          );
        }}
      />
    </View>
  );
};

export default memo(ChapterPage);