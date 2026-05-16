import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { ChaptersScreenProps } from '../navigation/types';
import { useBible } from '../hooks/useBible';
import Animated, { FadeInDown } from 'react-native-reanimated';
import theme from '../constants/theme';

const NUM_COLS   = 4;
const GAP        = 10;
const PADDING    = 16;
const { width }  = Dimensions.get('window');
const CELL_SIZE  = (width - PADDING * 2 - GAP * (NUM_COLS - 1)) / NUM_COLS;

export default function ChaptersScreen({ route, navigation }: ChaptersScreenProps) {
  const { boky }       = route.params;
  const { getChapters } = useBible();
  const [chapters, setChapters] = useState<number[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getChapters(boky.slug).then((data) => {
      setChapters(data);
      setLoading(false);
    });
  }, [boky, getChapters]);

  // ── Header navigation ───────────────────────────────────────────────────
  useEffect(() => {
    navigation.setOptions({
      title:              boky.anarana,
      headerStyle:        { backgroundColor: '#F0F7FF' },
      headerTintColor:    theme.tokens.header.title,
      headerShadowVisible: false,
      headerTitleStyle: {
        fontWeight: '700',
        fontSize:   17,
        color:      theme.tokens.header.title,
      },
    });
  }, [boky]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background-primary gap-3">
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
        <Text className="text-[13px] text-text-tertiary mt-1">Efa avy...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-primary px-4">

      {/* ── Blobs décoratifs ──────────────────────────────────────────── */}
      <View className="absolute inset-0" pointerEvents="none">
        <View className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary-600 opacity-[0.07]" />
        <View className="absolute -bottom-15 -left-20 w-60 h-60 rounded-full bg-emerald-500 opacity-[0.06]" />
      </View>

      {/* ── Sous-titre nombre de chapitres ───────────────────────────── */}
      <View className="pt-3 pb-3.5 items-start">
        <View className="bg-primary-50 rounded-full py-1 px-3 border border-primary-100">
          <Text className="text-xs font-bold text-primary-600">
            {chapters.length} toko
          </Text>
        </View>
      </View>

      {/* ── Grille des chapitres ─────────────────────────────────────── */}
      <FlatList
        data={chapters}
        keyExtractor={(item) => item.toString()}
        numColumns={NUM_COLS}
        contentContainerClassName="pb-10"
        columnWrapperClassName="flex-row"
        style={{ gap: GAP }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown
              .delay(index * 25)
              .springify()
              .damping(theme.animation.spring.damping)
              .stiffness(theme.animation.spring.stiffness)
            }
            style={{ width: CELL_SIZE, marginBottom: GAP, marginRight: (index + 1) % NUM_COLS === 0 ? 0 : GAP }}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate('Reader', { boky, toko: item })}
              activeOpacity={0.75}
              className="rounded-2xl bg-background-primary items-center justify-center border border-background-tertiary shadow-sm shadow-primary-600/10 gap-1"
              style={{ width: CELL_SIZE, height: CELL_SIZE, elevation: 2 }}
            >
              {/* Numéro */}
              <Text className="text-[18px] font-extrabold text-text-primary" style={{ fontFamily: theme.typography.fontUI }}>{item}</Text>

              {/* Dot décoratif */}
              <View className="w-1.5 h-1.5 rounded-full bg-primary-300" />
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </View>
  );
}