import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BooksScreenProps } from '../navigation/types';
import { useBible } from '../hooks/useBible';
import { Boky } from '../services/database';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { BookOpen, ChevronRight } from 'lucide-react-native';
import theme from '../constants/theme';

export default function BooksScreen({ navigation }: BooksScreenProps) {
  const { getBooks } = useBible();
  const [books, setBooks] = useState<Boky[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBooks().then((data) => {
      setBooks(data);
      setLoading(false);
    });
  }, [getBooks]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background-primary">
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background-primary">
      {/* ── Blobs décoratifs ──────────────────────────────────────────── */}
      <View className="absolute inset-0" pointerEvents="none">
        <View className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary-600 opacity-[0.07]" />
        <View className="absolute -bottom-15 -left-20 w-60 h-60 rounded-full bg-emerald-500 opacity-[0.06]" />
      </View>

      <FlatList
        data={books}
        keyExtractor={(item) => item.slug}
        contentContainerClassName="p-4 pb-12"
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInUp.delay(index * 15).springify().damping(12)}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Chapters', { boky: item })}
              className="mb-3 flex-row items-center rounded-2xl border border-background-tertiary bg-background-primary p-4 shadow-sm shadow-primary-600/10"
              activeOpacity={0.8}
              style={{ elevation: 2 }}
            >
              <View className="mr-4 rounded-2xl bg-primary-50 p-3">
                <BookOpen size={22} color={theme.colors.primary[600]} strokeWidth={1.5} />
              </View>
              <View className="flex-1">
                <Text className="text-[17px] font-bold text-text-primary">{item.anarana}</Text>
                <Text className="text-[12px] text-text-tertiary mt-0.5">{item.testament}</Text>
              </View>
              <ChevronRight size={18} color={theme.colors.primary[300]} strokeWidth={1.5} />
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </SafeAreaView>
  );
}
