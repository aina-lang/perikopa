import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { VersesScreenProps } from '../navigation/types';
import { useBible } from '../hooks/useBible';
import { Andininy } from '../services/database';
import Animated, { FadeInDown } from 'react-native-reanimated';
import theme from '../constants/theme';

const NUM_COLS  = 4;
const GAP       = 8;
const PADDING   = 16;
const { width } = Dimensions.get('window');
const CELL_SIZE = (width - PADDING * 2 - GAP * (NUM_COLS - 1)) / NUM_COLS;

export default function VersesScreen({ route, navigation }: VersesScreenProps) {
  const { boky, toko } = route.params;
  const { getVerses } = useBible();
  const [verses, setVerses] = useState<Andininy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: `${boky.anarana} ${toko}` });
    getVerses(boky.slug, toko).then((data) => {
      setVerses(data);
      setLoading(false);
    });
  }, [boky, toko]);

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

      {/* ── Sous-titre ─────────────────────────────────────────────────── */}
      <View className="pt-3 pb-3.5 items-start">
        <View className="bg-primary-50 rounded-full py-1 px-3 border border-primary-100">
          <Text className="text-xs font-bold text-primary-600">
            {verses.length} andininy
          </Text>
        </View>
      </View>

      {/* ── Grille des versets ────────────────────────────────────────── */}
      <FlatList
        data={verses}
        keyExtractor={(item) => item.id.toString()}
        numColumns={NUM_COLS}
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 5).duration(140)}
            style={{
              width: CELL_SIZE,
              marginBottom: GAP,
              marginRight: (index + 1) % NUM_COLS === 0 ? 0 : GAP,
            }}
          >
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Reader', {
                  boky,
                  toko,
                  targetVerse: item.laharana,
                  targetVerseId: item.id,
                })
              }
              activeOpacity={0.75}
              className="rounded-xl bg-background-primary items-center justify-center border border-background-tertiary shadow-sm shadow-primary-600/10 gap-0.5"
              style={{ width: CELL_SIZE, height: CELL_SIZE, elevation: 1 }}
            >
              {/* Numéro */}
              <Text className="text-[15px] font-extrabold text-text-primary">
                {item.laharana}
              </Text>

              {/* Dot décoratif */}
              <View className="w-1 h-1 rounded-full bg-primary-200" />
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </View>
  );
}
