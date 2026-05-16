import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useBookmarks } from '../hooks/useBookmarks';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookmarkMinus, BookOpen } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type BookmarksScreenProps = NativeStackScreenProps<RootStackParamList, 'Bookmarks'>;

export default function BookmarksScreen({ navigation }: BookmarksScreenProps) {
  const { bookmarks, loading, removeBookmark, refreshBookmarks } = useBookmarks();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshBookmarks();
    });
    return unsubscribe;
  }, [navigation, refreshBookmarks]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 p-6">
        <BookOpen size={48} color="#cbd5e1" />
        <Text className="mt-4 text-center text-lg text-slate-500">
          Aucun verset marqué pour le moment.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-slate-50">
      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4 pb-12"
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInUp.delay(index * 50).springify()}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Reader', { 
                boky: item.boky, 
                toko: item.andininy.toko,
                targetVerse: item.andininy.laharana,
                targetVerseId: item.andininy.id
              })}
              className="mb-4 rounded-2xl bg-white p-5"
              style={{ shadowColor: '#93c5fd', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 2, elevation: 2 }}
            >
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm font-bold" style={{ color: '#1e3a8a' }}>
                  {item.boky.anarana} {item.andininy.toko}:{item.andininy.laharana}
                </Text>
                <TouchableOpacity onPress={() => removeBookmark(item.id)} className="p-1">
                  <BookmarkMinus size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
              <Text className="text-base text-slate-700 leading-relaxed">
                {item.andininy.votoatiny}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </SafeAreaView>
  );
}
