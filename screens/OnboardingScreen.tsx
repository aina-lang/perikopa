import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { BookOpen, Search, Star, ChevronRight, Check } from 'lucide-react-native';
import theme from '../constants/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
}

const SLIDES = [
  {
    id: 1,
    title: "Perikopan'ny FAM",
    description: 'Ny Baiboly sy ny fandaharam-potoana eo am-pelatananao amin\'ny fotoana rehetra.',
    icon: <BookOpen size={80} color={theme.colors.primary[600]} strokeWidth={1.5} />,
    color: theme.colors.primary[600],
    bg: '#EFF6FF',
  },
  {
    id: 2,
    title: 'Mikaroka & Mitahiry',
    description: 'Mitadiava andininy haingana ary tahirizo ireo teny mampahery anao.',
    icon: <Search size={80} color={theme.colors.emerald[600]} strokeWidth={1.5} />,
    color: theme.colors.emerald[600],
    bg: '#ECFDF5',
  },
  {
    id: 3,
    title: 'Araho ny Perikopa',
    description: 'Vakiteny isan\'andro sy lohahevitra mampahery ho an\'ny fitomboanao ara-panahy.',
    icon: <Star size={80} color={theme.colors.gold[600]} strokeWidth={1.5} />,
    color: theme.colors.gold[600],
    bg: '#FFFBEB',
  },
];

export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      navigation.replace('Home', { checkUpdate: true });
    }
  };

  const onScroll = (event: any) => {
    scrollX.value = event.nativeEvent.contentOffset.x;
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      {/* ── Blobs décoratifs ─────────────────────────────────────────── */}
      <View className="absolute inset-0" pointerEvents="none">
        <View className="absolute -right-20 -top-20 h-[350px] w-[350px] rounded-full bg-primary-600 opacity-[0.05]" />
        <View className="absolute -left-20 bottom-20 h-[350px] w-[350px] rounded-full bg-emerald-500 opacity-[0.04]" />
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={{ width, padding: 40 }} className="items-center justify-center">
            <Animated.View 
              entering={FadeInDown.delay(200).duration(800).springify()}
              style={{
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: item.bg,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 40,
                shadowColor: item.color,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
                elevation: 5,
              }}
            >
              {item.icon}
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(600)}>
              <Text className="text-center text-[28px] font-black text-text-primary leading-9 mb-4">
                {item.title}
              </Text>
              <Text className="text-center text-[16px] text-text-secondary leading-6 px-4">
                {item.description}
              </Text>
            </Animated.View>
          </View>
        )}
      />

      {/* ── Pied de page (Pagination & Bouton) ────────────────────────── */}
      <View className="px-10 pb-12 flex-row items-center justify-between">
        {/* Dots */}
        <View className="flex-row gap-2">
          {SLIDES.map((_, i) => {
            const animatedDotStyle = useAnimatedStyle(() => {
              const opacity = interpolate(
                scrollX.value / width,
                [i - 1, i, i + 1],
                [0.3, 1, 0.3],
                Extrapolate.CLAMP
              );
              const scale = interpolate(
                scrollX.value / width,
                [i - 1, i, i + 1],
                [0.8, 1.2, 0.8],
                Extrapolate.CLAMP
              );
              const dotWidth = interpolate(
                scrollX.value / width,
                [i - 1, i, i + 1],
                [8, 20, 8],
                Extrapolate.CLAMP
              );
              return {
                opacity,
                transform: [{ scale }],
                width: dotWidth,
              };
            });

            return (
              <Animated.View
                key={i}
                className="h-2 rounded-full bg-primary-600"
                style={animatedDotStyle}
              />
            );
          })}
        </View>

        {/* Button */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          className="h-14 w-14 rounded-full bg-primary-600 items-center justify-center shadow-lg shadow-primary-600/30"
          style={{ elevation: 5 }}
        >
          {currentIndex === SLIDES.length - 1 ? (
            <Animated.View entering={FadeIn}>
              <Check size={24} color="white" strokeWidth={3} />
            </Animated.View>
          ) : (
            <ChevronRight size={24} color="white" strokeWidth={3} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
