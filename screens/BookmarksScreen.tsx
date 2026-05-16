import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useBookmarks } from '../hooks/useBookmarks';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookmarkMinus, BookOpen, ChevronRight, Bookmark } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import theme from '../constants/theme';

type BookmarksScreenProps = NativeStackScreenProps<RootStackParamList, 'Bookmarks'>;

export default function BookmarksScreen({ navigation }: BookmarksScreenProps) {
  const { bookmarks, loading, removeBookmark, refreshBookmarks } = useBookmarks();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', refreshBookmarks);
    return unsubscribe;
  }, [navigation, refreshBookmarks]);

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background-primary p-8">
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
      </View>
    );
  }

  // ── État vide ──────────────────────────────────────────────────────────
  if (bookmarks.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-background-primary p-8">
        {/* Blob décoratif */}
        <View className="absolute top-[20%] h-[280px] w-[280px] rounded-full bg-primary-600 opacity-5" />

        <Animated.View entering={FadeInDown.duration(600).springify()} className="items-center gap-3">
          <View className="mb-1 h-20 w-20 items-center justify-center rounded-3xl border border-primary-100 bg-primary-50">
            <BookOpen size={32} color={theme.colors.primary[300]} strokeWidth={1.5} />
          </View>
          <Text className="text-[18px] font-extrabold text-text-primary">Tsy misy marika</Text>
          <Text className="text-center text-[14px] leading-[22px] text-text-tertiary">
            Aucun verset marqué pour le moment.{'\n'}
            Tsindrio lava ny andininy vao marika azy.
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background-primary">

      {/* ── Blobs décoratifs ──────────────────────────────────────────── */}
      <View className="absolute inset-0" pointerEvents="none">
        <View className="absolute -right-[60px] -top-[60px] h-[200px] w-[200px] rounded-full bg-primary-600 opacity-[0.06]" />
        <View className="absolute -left-[60px] bottom-[60px] h-[200px] w-[200px] rounded-full bg-emerald-500 opacity-5" />
      </View>

      {/* ── Compteur ──────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(500)} className="flex-row items-center gap-1.5 px-4 pb-2.5 pt-3.5">
        <Bookmark size={14} color={theme.colors.emerald[600]} fill={theme.colors.emerald[600]} />
        <Text className="text-[13px] font-bold text-emerald-600">
          {bookmarks.length} verset{bookmarks.length > 1 ? 's' : ''} marqué{bookmarks.length > 1 ? 's' : ''}
        </Text>
      </Animated.View>

      {/* ── Liste ─────────────────────────────────────────────────────── */}
      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 pb-8"
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="h-2.5" />}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp
              .delay(index * 45)
              .springify()
              .damping(theme.animation.spring.damping)
              .stiffness(theme.animation.spring.stiffness)
            }
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Reader', {
                boky:          item.boky,
                toko:          item.andininy.toko,
                targetVerse:   item.andininy.laharana,
                targetVerseId: item.andininy.id,
              })}
              className="flex-row overflow-hidden rounded-2xl border border-background-tertiary bg-background-primary shadow-sm shadow-primary-800/10"
              style={{ elevation: 3 }}
            >
              {/* ── Accent gauche émeraude ─────────────────────────── */}
              <View className="w-1 bg-emerald-600" />

              <View className="flex-1 gap-2 p-3.5">
                {/* Référence + actions */}
                <View className="flex-row items-center justify-between">
                  <View className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-[3px]">
                    <Text className="text-[11px] font-extrabold text-emerald-700">
                      {item.boky.anarana} {item.andininy.toko}:{item.andininy.laharana}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => removeBookmark(item.id)}
                    className="h-7 w-[30px] items-center justify-center rounded-full bg-background-secondary"
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <BookmarkMinus size={17} color={theme.colors.text.tertiary} strokeWidth={2} />
                  </TouchableOpacity>
                </View>

                {/* Texte du verset */}
                <Text className="text-[14px] leading-[22px] text-text-primary" style={{ fontFamily: theme.typography.fontVerset }} numberOfLines={4}>
                  {item.andininy.votoatiny}
                </Text>

                {/* Pied de carte — lire */}
                <View className="mt-0.5 flex-row items-center gap-0.5">
                  <Text className="text-[11px] font-bold text-primary-400">Hamaky</Text>
                  <ChevronRight size={13} color={theme.colors.primary[400]} />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </SafeAreaView>
  );
}