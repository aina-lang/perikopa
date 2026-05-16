import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeScreenProps } from '../navigation/types';
import { usePerikopa } from '../context/PerikopaContext';
import { Book, ChevronRight, BookOpen, Calendar, Star } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeInRight } from 'react-native-reanimated';
import { usePerikopaNavigation } from '../hooks/usePerikopaNavigation';
import { BlurView } from 'expo-blur';
import theme from '../constants/theme';
import { ActivityIndicator } from 'react-native';

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { parseReference } = usePerikopaNavigation();
  const { perikopa, loading } = usePerikopa();

  // On attend que les données soient chargées (AsyncStorage ou local)
  if (loading || !perikopa) {
    return (
      <View className="flex-1 items-center justify-center bg-background-primary">
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
      </View>
    );
  }

  const yearData = perikopa.perikopa.find(y => y.year === 2026) || perikopa.perikopa[0];

  const getUpcomingPerikopa = () => {
    const now = new Date();
    // Fusionner toutes les sections de tous les semestres de l'année
    const allSections = yearData.semesters.flatMap(s => s.sections);
    const allEntries = allSections.flatMap(s => s.entries.map(e => ({ ...e, theme: s.theme })));
    
    const parseDate = (dateStr: string) => {
      const [day, monthStr, yearShort] = dateStr.split(' ');
      const months: any = {
        'JAN': 0, 'FEV': 1, 'MAR': 2, 'AVR': 3, 'MAI': 4, 'JUN': 5,
        'JUL': 6, 'AOU': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11,
        'JAN.': 0, 'FEV.': 1, 'MAR.': 2, 'AVR.': 3, 'MAI.': 4, 'JUN.': 5,
        'JUL.': 6, 'AOU.': 7, 'SEP.': 8, 'OCT.': 9, 'NOV.': 10, 'DEC.': 11
      };
      const m = months[monthStr.toUpperCase().replace('.', '')];
      return new Date(2000 + parseInt(yearShort), m || 0, parseInt(day));
    };

    const upcoming = allEntries.find(e => {
      const d = parseDate(e.date);
      d.setHours(23, 59, 59);
      return d >= now;
    });

    return upcoming || null;
  };

  const nextEntry = getUpcomingPerikopa();

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
        showsHorizontalScrollIndicator={false}
      >



        {/* ── Blobs décoratifs ─────────────────────────────────────────── */}
        <View className="absolute inset-0" pointerEvents="none">
          <View className="absolute -right-20 -top-20 h-[280px] w-[280px] rounded-full bg-primary-600 opacity-[0.06]" />
          <View className="absolute -left-24 top-[320px] h-[280px] w-[280px] rounded-full bg-emerald-500 opacity-5" />
        </View>

        {/* ══════════════════════════════════════════════════════════════
            HERO — Verset de l'année
        ══════════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.duration(500).springify()} className="mb-4 overflow-hidden rounded-[24px] bg-primary-800 p-6 shadow-lg shadow-primary-900/30" style={{ elevation: 10 }}>

          {/* Fond bleu profond + blob interne */}
          <View className="absolute -right-14 -top-14 h-[200px] w-[200px] rounded-full bg-primary-600 opacity-25" pointerEvents="none" />

          {/* Label année */}
          <View className="mb-3.5 flex-row items-center justify-center gap-1.5">
            <Star size={11} color={theme.colors.gold[400]} fill={theme.colors.gold[400]} />
            <Text className="text-[10px] font-bold uppercase tracking-[2px] text-gold-300">
              Teny Faneva Taona {yearData.year}
            </Text>
            <Star size={11} color={theme.colors.gold[400]} fill={theme.colors.gold[400]} />
          </View>

          {/* Verset */}
          <Text className="mb-4 text-center text-[17px] italic leading-[27px] text-[#F0F7FF]" style={{ fontFamily: theme.typography.fontVerset }}>
            "{yearData.headerVerse?.text || ''}"
          </Text>
 
          {/* Référence */}
          <View className="items-center">
            <View className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5">
              <Text className="text-xs font-bold text-gold-300">
                {yearData.headerVerse?.reference || ''}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* ══════════════════════════════════════════════════════════════
            PROCHAINE PERIKOPA — Card Premium
        ══════════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} className="mb-6 overflow-hidden rounded-[28px] bg-white border border-primary-100 shadow-xl shadow-primary-900/10">
          <View className="bg-primary-800 px-5 py-3.5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Calendar size={16} color="white" strokeWidth={2.5} />
              <Text className="text-[11px] font-black uppercase tracking-[1.5px] text-white/90">Manaraka</Text>
            </View>
            {nextEntry && (
              <View className="bg-white/20 rounded-full px-3 py-1">
                <Text className="text-[11px] font-bold text-white">
                  {(() => {
                    const parts = nextEntry.date.split(' ');
                    const day = parts[0];
                    const monthAbbr = parts[1]?.replace('.', '').toUpperCase();
                    const monthsMg: any = {
                      'JAN': 'Janoary', 'FEV': 'Febroary', 'MAR': 'Martsa', 'AVR': 'Aprily',
                      'MAI': 'May', 'JUN': 'Jona', 'JUL': 'Jolay', 'AOU': 'Aogositra',
                      'SEP': 'Septambra', 'OCT': 'Oktobra', 'NOV': 'Novambra', 'DEC': 'Desambra'
                    };
                    return `${day} ${monthsMg[monthAbbr] || monthAbbr}`;
                  })()}
                </Text>
              </View>
            )}
          </View>
          
          <View className="p-5">
             {nextEntry ? (
               <>
                 <Text className="text-[10px] font-bold uppercase tracking-[1px] text-primary-400 mb-1">Lohahevitra</Text>
                 <Text className="text-[15px] font-extrabold text-primary-900 leading-5 mb-4">{nextEntry.theme}</Text>
                 
                 <View className="flex-row flex-wrap gap-2">
                    {[
                      { label: 'T. Taloha', ref: nextEntry.testamentTaloha, color: 'bg-primary-50 text-primary-700' },
                      { label: 'Filazantsara', ref: nextEntry.filazantsara, color: 'bg-emerald-50 text-emerald-700' },
                      { label: 'Epistily', ref: nextEntry.epistily, color: 'bg-primary-100 text-primary-800' },
                      { label: 'Fampah.', ref: nextEntry.fampaherezana, color: 'bg-gold-50 text-gold-700' }
                    ].map((item, idx) => (
                      <TouchableOpacity 
                        key={idx} 
                        onPress={() => handlePressReference(item.ref)}
                        className={`px-3 py-2 rounded-xl flex-1 min-w-[45%] ${item.color.split(' ')[0]} border border-black/5`}
                      >
                        <Text className="text-[9px] font-bold uppercase opacity-60 mb-0.5">{item.label}</Text>
                        <Text className={`text-[12px] font-black ${item.color.split(' ')[1]}`} numberOfLines={1}>{item.ref}</Text>
                      </TouchableOpacity>
                    ))}
                 </View>
               </>
             ) : (
               <View className="items-center py-2">
                 <View className="bg-primary-50 rounded-full p-3 mb-3">
                   <Calendar size={24} color={theme.colors.primary[400]} />
                 </View>
                 <Text className="text-[14px] font-bold text-primary-900 text-center mb-1">Tsy mbola misy ny Perikopa manaraka</Text>
                 <Text className="text-[12px] text-text-tertiary text-center px-4">
                   Mila manao fanavaozana (update) ny App ianao na miandry ny fandaharam-potoana vaovao.
                 </Text>
               </View>
             )}
          </View>
        </Animated.View>

        {/* ══════════════════════════════════════════════════════════════
            ACCÈS RAPIDE — Lire la Bible
        ══════════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.delay(80).duration(450).springify()}>
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
            ACCÈS AU PROGRAMME COMPLET
        ══════════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.delay(180).duration(450).springify()} className="mb-8">
          <TouchableOpacity
            onPress={() => navigation.navigate('Perikopa')}
            className="flex-row items-center rounded-[24px] border border-primary-200 bg-primary-50 p-5 shadow-sm shadow-primary-800/5"
            style={{ elevation: 2 }}
            activeOpacity={0.8}
          >
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary-600">
              <Calendar size={24} color="white" strokeWidth={2} />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-[16px] font-black text-primary-900">Fandaharam-potoana {yearData.year}</Text>
              <Text className="mt-0.5 text-[12px] font-bold text-primary-400">Hijery ny perikopa rehetra amin'ity taona ity</Text>
            </View>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-white/80">
              <ChevronRight size={20} color={theme.colors.primary[600]} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}