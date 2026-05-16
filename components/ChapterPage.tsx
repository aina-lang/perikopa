import React, { useEffect, useState, memo, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useBible } from '../hooks/useBible';
import { BookmarkItem } from '../hooks/useBookmarks';
import { Andininy, Boky } from '../services/database';
import Animated, { FadeInRight } from 'react-native-reanimated';

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
        <ActivityIndicator size="small" color="#dbeafe" />
      </View>
    );
  }
  
  return (
    <View className="flex-1 bg-white">
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

          let containerClass = 'mb-2 flex-row rounded-xl p-3 ';
          let containerStyle: any = {};
          if (isSelected) {
            containerClass += 'bg-blue-100';
            containerStyle = { shadowColor: '#93c5fd', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 2, elevation: 2 };
          } else if (isTarget) {
            containerClass += 'bg-white border-l-4 border-yellow-400';
          } else if (isMarked) {
            containerClass += 'bg-emerald-50 border-l-4 border-emerald-500';
          } else {
            containerClass += 'bg-transparent';
          }

          return (
            <Animated.View entering={FadeInRight.delay(Math.min(index * 15, 300)).springify()}>
              {item.lohateny && (
                <View className="mb-3 mt-5 items-center rounded-lg px-4 py-3"
                  style={{ backgroundColor: '#fffbeb', borderTopWidth: 2, borderBottomWidth: 2, borderColor: '#f59e0b' }}
                >
                  <Text className="text-center text-sm font-bold uppercase tracking-wider"
                    style={{ color: '#92400e' }}
                  >
                    {item.lohateny}
                  </Text>
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
                className={containerClass}
                style={containerStyle}
              >
                <Text className="mr-3 mt-1 text-sm font-bold" style={{ color: '#1e3a8a' }}>{item.laharana}</Text>
                <Text className="flex-1 text-lg leading-relaxed">
                  {(searchQuery && isTarget) ? (
                    item.votoatiny.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')).map((part, i) =>
                      part.toLowerCase() === searchQuery.toLowerCase() ? (
                        <Text key={i} style={{ backgroundColor: '#fef08a', color: '#1e3a8a', fontWeight: 'bold' }}>{part}</Text>
                      ) : (
                        <Text key={i} className="text-slate-800" style={isMarked ? { backgroundColor: '#d1fae5' } : {}}>{part}</Text>
                      )
                    )
                  ) : (
                    <Text className="text-slate-800" style={isMarked ? { backgroundColor: '#d1fae5' } : {}}>{item.votoatiny}</Text>
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
