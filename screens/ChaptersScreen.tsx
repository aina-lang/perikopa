import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChaptersScreenProps } from '../navigation/types';
import { useBible } from '../hooks/useBible';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ChaptersScreen({ route, navigation }: ChaptersScreenProps) {
  const { boky } = route.params;
  const { getChapters } = useBible();
  const [chapters, setChapters] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChapters(boky.slug).then((data) => {
      setChapters(data);
      setLoading(false);
    });
  }, [boky, getChapters]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 p-4">
      <FlatList
        data={chapters}
        keyExtractor={(item) => item.toString()}
        numColumns={4}
        columnWrapperClassName="justify-between"
        contentContainerClassName="pb-12"
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 30).springify()} className="mb-4 w-[22%]">
            <TouchableOpacity
              onPress={() => navigation.navigate('Reader', { boky, toko: item })}
              className="aspect-square items-center justify-center rounded-xl bg-white active:bg-blue-100"
              style={{ shadowColor: '#93c5fd', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 2, elevation: 2 }}
            >
              <Text className="text-xl font-bold" style={{ color: '#1e3a8a' }}>{item}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </View>
  );
}
