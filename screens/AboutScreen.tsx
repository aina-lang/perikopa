import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AboutScreenProps } from '../navigation/types';
import { Info, ExternalLink, RefreshCw, Heart, BookOpen, Church } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import theme from '../constants/theme';
import { usePerikopa } from '../hooks/usePerikopa';
import { ActivityIndicator, Alert } from 'react-native';

export default function AboutScreen({ navigation }: AboutScreenProps) {
  const { refreshFromRemote, updating } = usePerikopa();
  const openFAMWebsite = () => Linking.openURL('https://www.fam.mg');

  const handleUpdate = async () => {
    const success = await refreshFromRemote();
    if (success) {
      Alert.alert('Fandresena', 'Voaray ny fandaharam-potoana vaovao !');
    } else {
      Alert.alert('Fisomparana', 'Tsy nahitana fandaharana vaovao. Hamarino ny internet.');
    }
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background-primary">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10 pt-6"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >

        {/* ── Blobs décoratifs ─────────────────────────────────────── */}
        <View className="absolute inset-0" pointerEvents="none">
          <View className="absolute -right-[70px] -top-[70px] h-[220px] w-[220px] rounded-full bg-primary-600 opacity-[0.07]" />
          <View className="absolute -left-[70px] bottom-[100px] h-[220px] w-[220px] rounded-full bg-emerald-500 opacity-[0.06]" />
        </View>

        {/* ══════════════════════════════════════════════════════════
            HERO — Logo + nom app
        ══════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeIn.duration(700)} className="mb-7 items-center">
          {/* Icône */}
          <View className="mb-4 h-24 w-24 items-center justify-center rounded-[32px] border-[1.5px] border-primary-100 bg-primary-50 shadow-lg shadow-primary-600/15" style={{ elevation: 6 }}>
            <View className="h-[72px] w-[72px] items-center justify-center rounded-[24px] bg-primary-100">
              <BookOpen size={36} color={theme.colors.primary[600]} strokeWidth={1.6} />
            </View>
          </View>

          {/* Nom */}
          <Text className="text-[30px] font-black tracking-[-0.5px] text-text-primary">Perikopa</Text>
          <Text className="mb-3 mt-1 text-[13px] font-semibold text-text-tertiary">FAM · Fiangonana Ara-Pilazantsara</Text>

          {/* Badge version */}
          <View className="rounded-full border border-background-tertiary bg-background-secondary px-3.5 py-1">
            <Text className="text-[11px] font-bold text-text-tertiary">Version 1.0.0</Text>
          </View>
        </Animated.View>

        {/* ══════════════════════════════════════════════════════════
            CARTE — Momba ny Fiangonana
        ══════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.delay(100).springify()} className="mb-3.5 rounded-2xl border border-background-tertiary bg-background-primary p-[18px] shadow-sm shadow-primary-800/5" style={{ elevation: 2 }}>
          <View className="mb-3 flex-row items-center gap-2.5">
            <View className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-primary-50">
              <Church size={18} color={theme.colors.primary[600]} strokeWidth={1.8} />
            </View>
            <Text className="text-[16px] font-extrabold text-text-primary">Momba ny Fiangonana</Text>
          </View>

          <Text className="text-[14px] leading-[22px] text-text-secondary">
            Ny Fiangonana FAM (Fiangonana Ara-Pilazantsara eto Madagasikara) dia mamoaka isan-taona ny fandaharam-pamakiana Baiboly na "Perikopa" ho an'ny mpino rehetra.
          </Text>

          <TouchableOpacity
            onPress={openFAMWebsite}
            className="mt-3.5 flex-row items-center justify-center gap-2 rounded-xl border border-primary-100 bg-primary-50 py-[11px]"
            activeOpacity={0.8}
          >
            <Text className="text-[14px] font-bold text-primary-600">Tsidiho ny tranonkala</Text>
            <ExternalLink size={15} color={theme.colors.primary[600]} strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>

        {/* ══════════════════════════════════════════════════════════
            CARTE — Momba ny App
        ══════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.delay(180).springify()} className="mb-3.5 rounded-2xl border border-background-tertiary bg-background-primary p-[18px] shadow-sm shadow-primary-800/5" style={{ elevation: 2 }}>
          <View className="mb-3 flex-row items-center gap-2.5">
            <View className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-emerald-50">
              <Info size={18} color={theme.colors.emerald[600]} strokeWidth={1.8} />
            </View>
            <Text className="text-[16px] font-extrabold text-text-primary">Momba ny App</Text>
          </View>

          <Text className="text-[14px] leading-[22px] text-text-secondary">
            Ity fampiharana ity dia natao hanampiana anao hanaraka ny Perikopa isan'andro sy hamaky ny Baiboly Malagasy amin'ny fomba mora sy haingana.
          </Text>

          {/* Stats row */}
          <View className="mt-4 flex-row items-center justify-around border-t border-background-tertiary pt-3.5">
            <View className="flex-1 items-center">
              <Text className="text-[18px] font-black text-primary-600">1 189</Text>
              <Text className="mt-0.5 text-[11px] font-semibold text-text-tertiary">Toko</Text>
            </View>
            <View className="h-8 w-[1px] bg-background-tertiary" />
            <View className="flex-1 items-center">
              <Text className="text-[18px] font-black text-primary-600">31 102</Text>
              <Text className="mt-0.5 text-[11px] font-semibold text-text-tertiary">Andininy</Text>
            </View>
            <View className="h-8 w-[1px] bg-background-tertiary" />
            <View className="flex-1 items-center">
              <Text className="text-[18px] font-black text-primary-600">66</Text>
              <Text className="mt-0.5 text-[11px] font-semibold text-text-tertiary">Boky</Text>
            </View>
          </View>
        </Animated.View>

        {/* ══════════════════════════════════════════════════════════
            CARTE — Fanavaozana
        ══════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.delay(260).springify()} className="mb-3.5 rounded-2xl border border-background-tertiary bg-background-primary p-[18px] shadow-sm shadow-primary-800/5" style={{ elevation: 2 }}>
          <View className="mb-3 flex-row items-center gap-2.5">
            <View className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-gold-100">
              <RefreshCw size={18} color={theme.colors.gold[700]} strokeWidth={1.8} />
            </View>
            <Text className="text-[16px] font-extrabold text-text-primary">Fanavaozana</Text>
          </View>

          <Text className="text-[14px] leading-[22px] text-text-secondary">
            Ny Perikopa dia miova isan-taona. Tsindrio ny bokotra eto ambany raha hijery raha misy fandaharana vaovao azo alaina.
          </Text>

          <TouchableOpacity
            className={`mt-4 flex-row items-center justify-center gap-2 rounded-xl py-3.5 shadow-md ${updating ? 'bg-primary-400' : 'bg-primary-600 shadow-primary-600/30'}`}
            style={{ elevation: 5 }}
            activeOpacity={0.85}
            onPress={handleUpdate}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <RefreshCw size={16} color="#fff" strokeWidth={2} />
            )}
            <Text className="text-[14px] font-extrabold text-[#FFFFFF]">
              {updating ? 'Andraso kely...' : 'Hijerena Fandaharana Vaovao'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ══════════════════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.delay(340).springify()} className="mt-2 items-center pt-2">
          <View className="mb-4 h-[1px] w-[60px] bg-background-tertiary" />
          <View className="flex-row items-center">
            <Text className="text-[12px] text-text-tertiary">Vita tamin'ny fitiavana </Text>
            <Heart size={12} color="#f43f5e" fill="#f43f5e" />
          </View>
          <Text className="mt-1 text-[10px] text-text-tertiary">© 2026 Perikopa FAM App</Text>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}