import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeScreenProps } from '../navigation/types';
import { CURRENT_PERIKOPA } from '../data/perikopaData';
import { Book, ChevronRight, BookOpen, Calendar, Star } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeInRight } from 'react-native-reanimated';
import { usePerikopaNavigation } from '../hooks/usePerikopaNavigation';
import { BlurView } from 'expo-blur';
import theme from '../constants/theme';

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { parseReference } = usePerikopaNavigation();

  const handlePressReference = async (ref: string) => {
    const target = await parseReference(ref);
    if (target) {
      navigation.push('Reader', {
        boky:          target.book,
        toko:          target.chapter,
        targetVerse:   target.verse,
        targetVerseEnd: target.verseEnd,
        targetVerseId: target.verseId,
      });
    } else {
      alert('Tsy hita ny andininy: ' + ref);
    }
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background-primary">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pt-4"
        showsVerticalScrollIndicator={false}
      >

        {/* ── Blobs décoratifs ─────────────────────────────────────────── */}
        <View className="absolute inset-0" pointerEvents="none">
          <View className="absolute -right-20 -top-20 h-[280px] w-[280px] rounded-full bg-primary-600 opacity-[0.06]" />
          <View className="absolute -left-24 top-[320px] h-[280px] w-[280px] rounded-full bg-emerald-500 opacity-5" />
        </View>

        {/* ══════════════════════════════════════════════════════════════
            HERO — Verset de l'année
        ══════════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.duration(700).springify()} className="mb-4 overflow-hidden rounded-[24px] bg-primary-800 p-6 shadow-lg shadow-primary-900/30" style={{ elevation: 10 }}>

          {/* Fond bleu profond + blob interne */}
          <View className="absolute -right-14 -top-14 h-[200px] w-[200px] rounded-full bg-primary-600 opacity-25" pointerEvents="none" />

          {/* Label année */}
          <View className="mb-3.5 flex-row items-center justify-center gap-1.5">
            <Star size={11} color={theme.colors.gold[400]} fill={theme.colors.gold[400]} />
            <Text className="text-[10px] font-bold uppercase tracking-[2px] text-gold-300">
              Tenin'ny Taona {CURRENT_PERIKOPA.year}
            </Text>
            <Star size={11} color={theme.colors.gold[400]} fill={theme.colors.gold[400]} />
          </View>

          {/* Verset */}
          <Text className="mb-4 text-center text-[17px] italic leading-[27px] text-[#F0F7FF]" style={{ fontFamily: theme.typography.fontVerset }}>
            "{CURRENT_PERIKOPA.headerVerse.text}"
          </Text>

          {/* Référence */}
          <View className="items-center">
            <View className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5">
              <Text className="text-xs font-bold text-gold-300">
                {CURRENT_PERIKOPA.headerVerse.reference}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* ══════════════════════════════════════════════════════════════
            ACCÈS RAPIDE — Lire la Bible
        ══════════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.delay(120).duration(600).springify()}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Books')}
            className="mb-5 flex-row items-center rounded-2xl border border-background-tertiary bg-background-primary p-4 shadow-sm shadow-primary-800/10"
            style={{ elevation: 3 }}
            activeOpacity={0.8}
          >
            <View className="h-11 w-11 items-center justify-center rounded-xl border border-primary-100 bg-primary-50">
              <Book size={22} color={theme.colors.primary[600]} strokeWidth={1.8} />
            </View>
            <View className="ml-3.5 flex-1">
              <Text className="text-[15px] font-bold text-text-primary">Hamaky Baiboly</Text>
              <Text className="mt-0.5 text-xs text-text-tertiary">Hitady boky na toko...</Text>
            </View>
            <View className="h-8 w-8 items-center justify-center rounded-full bg-background-secondary">
              <ChevronRight size={18} color={theme.colors.primary[400]} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* ══════════════════════════════════════════════════════════════
            TABLEAU PERIKOPA
        ══════════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.delay(200).duration(600).springify()}>
          <View className="mb-3 flex-row items-center gap-2">
            <BookOpen size={16} color={theme.colors.primary[600]} strokeWidth={1.8} />
            <Text className="text-[18px] font-extrabold text-text-primary">
              Perikopa {CURRENT_PERIKOPA.year}
            </Text>
          </View>
        </Animated.View>

        {CURRENT_PERIKOPA.sections.map((section, sIdx) => (
          <Animated.View
            key={sIdx}
            entering={FadeInDown.delay(sIdx * 80 + 260).springify()}
            className="mb-4 overflow-hidden rounded-2xl border border-background-tertiary bg-background-primary shadow-sm shadow-primary-800/5"
            style={{ elevation: 2 }}
          >
            {/* ── En-tête de thème ──────────────────────────────────── */}
            <View className="flex-row items-center gap-2.5 border-b border-background-tertiary bg-primary-50 px-3.5 py-3">
              <View className="h-9 w-1 rounded-full bg-primary-600" />
              <View className="flex-1">
                <Text className="mb-0.5 text-[9px] font-bold uppercase tracking-[1.5px] text-primary-400">Lohahevitra</Text>
                <Text className="text-[13px] font-bold leading-[18px] text-primary-800" numberOfLines={2}>{section.theme}</Text>
              </View>
              <Calendar size={16} color={theme.colors.primary[400]} className="ml-auto" />
            </View>

            {/* ── En-tête colonnes ──────────────────────────────────── */}
            <View className="flex-row items-center gap-1 border-b border-background-tertiary px-2.5 py-2">
              <Text className="w-[52px] text-[9px] font-extrabold uppercase tracking-[0.8px] text-text-tertiary">Daty</Text>
              <Text className="flex-1 text-[9px] font-extrabold uppercase tracking-[0.8px] text-text-tertiary">T.Taloha</Text>
              <Text className="flex-1 text-[9px] font-extrabold uppercase tracking-[0.8px] text-text-tertiary">Filazantsara</Text>
              <Text className="flex-1 text-[9px] font-extrabold uppercase tracking-[0.8px] text-text-tertiary">Epistily</Text>
              <Text className="w-[72px] text-[9px] font-extrabold uppercase tracking-[0.8px] text-text-tertiary">Fampah.</Text>
            </View>

            {/* ── Lignes ────────────────────────────────────────────── */}
            {section.entries.map((entry, eIdx) => (
              <Animated.View
                key={entry.id}
                entering={FadeInRight.delay(eIdx * 40 + sIdx * 80).springify()}
                className={`flex-row items-center gap-1 px-2.5 py-2.5 ${eIdx % 2 === 0 ? 'bg-background-secondary' : 'bg-background-primary'} ${eIdx === section.entries.length - 1 ? '' : 'border-b border-background-tertiary'}`}
              >
                {/* Date */}
                <View className="w-[52px]">
                  <Text className="text-[12px] font-extrabold leading-4 text-text-primary">
                    {entry.date.split(' ')[0]}
                  </Text>
                  <Text className="mt-[1px] text-[9px] font-semibold text-text-tertiary" numberOfLines={1}>
                    {entry.date.split(' ').slice(1).join(' ')}
                  </Text>
                </View>

                {/* Testament Taloha */}
                <TouchableOpacity
                  onPress={() => handlePressReference(entry.testamentTaloha)}
                  className="flex-1 items-center justify-center rounded-lg bg-primary-50 px-1.5 py-1"
                  activeOpacity={0.7}
                >
                  <Text className="text-center text-[10px] font-bold text-primary-700" style={{ lineHeight: 14 }} numberOfLines={2}>
                    {entry.testamentTaloha}
                  </Text>
                </TouchableOpacity>

                {/* Filazantsara */}
                <TouchableOpacity
                  onPress={() => handlePressReference(entry.filazantsara)}
                  className="flex-1 items-center justify-center rounded-lg bg-emerald-50 px-1.5 py-1"
                  activeOpacity={0.7}
                >
                  <Text className="text-center text-[10px] font-bold text-emerald-700" style={{ lineHeight: 14 }} numberOfLines={2}>
                    {entry.filazantsara}
                  </Text>
                </TouchableOpacity>

                {/* Epistily */}
                <TouchableOpacity
                  onPress={() => handlePressReference(entry.epistily)}
                  className="flex-1 items-center justify-center rounded-lg bg-primary-100 px-1.5 py-1"
                  activeOpacity={0.7}
                >
                  <Text className="text-center text-[10px] font-bold text-primary-600" style={{ lineHeight: 14 }} numberOfLines={2}>
                    {entry.epistily}
                  </Text>
                </TouchableOpacity>

                {/* Fampaherezana */}
                <TouchableOpacity
                  onPress={() => handlePressReference(entry.fampaherezana)}
                  className="w-[72px] items-center justify-center rounded-lg bg-gold-100 px-1 py-1"
                  activeOpacity={0.7}
                >
                  <Text className="text-center text-[10px] font-extrabold text-gold-700" style={{ lineHeight: 14 }} numberOfLines={2}>
                    {entry.fampaherezana}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>
        ))}

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}