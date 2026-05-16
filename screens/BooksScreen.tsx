import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BooksScreenProps } from '../navigation/types';
import { useBible } from '../hooks/useBible';
import { Boky } from '../services/database';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { BookOpen, Bookmark } from 'lucide-react-native';

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
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-slate-50">
      <FlatList
        data={books}
        keyExtractor={(item) => item.slug}
        contentContainerClassName="p-4 pb-12"
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInUp.delay(index * 50).springify()}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Chapters', { boky: item })}
              className="mb-3 flex-row items-center rounded-2xl bg-white p-4 active:bg-blue-50"
              style={{ shadowColor: '#93c5fd', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 2, elevation: 2 }}
            >
              <View className="mr-4 rounded-full bg-blue-100 p-3">
                <BookOpen size={24} color="#1e3a8a" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-slate-800">{item.anarana}</Text>
                <Text className="text-sm text-slate-500">{item.testament}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </SafeAreaView>
  );
}
