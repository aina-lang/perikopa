import React, { useEffect, useState, memo, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useBible } from '../hooks/useBible';
import { BookmarkItem } from '../hooks/useBookmarks';
import { Andininy, Boky } from '../services/database';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '../constants/theme';

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
}

const ChapterPage = ({ boky, toko, selectedVerse, onSelectVerse, bookmarks, targetVerse, targetVerseEnd, targetVerseId, searchQuery, isActive }: ChapterPageProps) => {
  const { getVerses } = useBible();
  const [verses, setVerses] = useState<Andininy[]>([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList<Andininy>>(null);

  useEffect(() => {
    let mounted = true;
    
    if (isActive && verses.length === 0) {
      getVerses(boky.slug, toko).then((data) => {
        if (mounted) {
          setVerses(data);
          setLoading(false);
          
          if (targetVerseId || targetVerse) {
            setTimeout(() => {
              const idx = data.findIndex(v => (targetVerseId ? v.id === targetVerseId : v.laharana === targetVerse));
              if (idx >= 0) {
                flatListRef.current?.scrollToIndex({ 
                  index: idx, 
                  animated: true, 
                  viewPosition: 0 
                });
              }
            }, 600);
          }
        }
      });
    }

    return () => {
      mounted = false;
    };
  }, [boky.slug, toko, getVerses, targetVerse, targetVerseId, isActive, verses.length]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-transparent">
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }
  
  return (
    <View className="flex-1">
      <FlatList
        ref={flatListRef}
        data={verses}
        keyExtractor={(item) => item.id.toString()}
        contentContainerClassName="p-4 pb-24"
        initialNumToRender={verses.length}
        onScrollToIndexFailed={(info) => {
          flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
        }}
        renderItem={({ item, index }) => {
          const isSelected = selectedVerse?.id === item.id;
          const isMarked = bookmarks.some(b => b.boky.slug === boky.slug && b.andininy.toko === toko && b.andininy.laharana === item.laharana);
          
          // Check if verse is in the target range (for Perikopa)
          let isTarget = false;
          if (targetVerse && targetVerseEnd) {
            isTarget = item.laharana >= targetVerse && item.laharana <= targetVerseEnd;
          } else if (targetVerseId) {
            isTarget = item.id === targetVerseId;
          } else if (targetVerse) {
            isTarget = item.laharana === targetVerse;
          }

          let containerStyle: any = {
            marginBottom: 16,
            flexDirection: 'row',
            borderRadius: 12,
            padding: 16,
            backgroundColor: 'transparent',
            borderLeftWidth: 3,
            borderColor: 'transparent',
          };
          
          let showPerikopaBadge = false;

          if (isSelected) {
            containerStyle.backgroundColor = theme.colors.glassBg;
            containerStyle.borderColor = theme.colors.primary;
            containerStyle.borderWidth = 1;
            containerStyle.borderLeftWidth = 4;
          } else if (isTarget) {
            containerStyle.backgroundColor = theme.colors.primaryLight;
            containerStyle.borderColor = theme.colors.primary;
            showPerikopaBadge = true;
          } else if (isMarked) {
            containerStyle.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            containerStyle.borderColor = theme.colors.secondary;
          }

          return (
            <Animated.View entering={FadeInDown.delay(index * 40).springify().damping(18).stiffness(120)}>
              {item.lohateny && (
                <View className="mb-4 mt-8 items-center">
                  <Text className="text-center text-sm font-bold uppercase tracking-widest"
                    style={{ color: theme.colors.primary, letterSpacing: 2 }}
                  >
                    {item.lohateny}
                  </Text>
                  <View style={{ width: 40, height: 2, backgroundColor: theme.colors.primary, marginTop: 8, opacity: 0.5 }} />
                </View>
              )}
              
              {showPerikopaBadge && (
                <View className="absolute -top-3 left-4 z-10 rounded-full px-3 py-1" style={{ backgroundColor: theme.colors.primary, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 }}>
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-white">Perikopa</Text>
                </View>
              )}
              
              <TouchableOpacity
                activeOpacity={0.7}
                delayLongPress={250}
                onLongPress={() => onSelectVerse(item)}
                onPress={() => {
                  if (selectedVerse) {
                    onSelectVerse(null);
                  }
                }}
                style={containerStyle}
              >
                <Text className="mr-4 mt-1 text-sm font-bold" style={{ color: theme.colors.primary, fontFamily: theme.typography.numberFont }}>{item.laharana}</Text>
                <Text className="flex-1 text-lg" style={{ color: theme.colors.textPrimary, fontFamily: theme.typography.verseFont, lineHeight: 30 }}>
                  {(searchQuery && isTarget) ? (
                    item.votoatiny.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')).map((part, i) =>
                      part.toLowerCase() === searchQuery.toLowerCase() ? (
                        <Text key={i} style={{ backgroundColor: theme.colors.primary, color: '#000', fontWeight: 'bold' }}>{part}</Text>
                      ) : (
                        <Text key={i}>{part}</Text>
                      )
                    )
                  ) : (
                    <Text>{item.votoatiny}</Text>
                  )}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />
    </View>
  );
};

export default memo(ChapterPage);
