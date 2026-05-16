import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeScreenProps } from '../navigation/types';
import { CURRENT_PERIKOPA } from '../data/perikopaData';
import { Book, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { usePerikopaNavigation } from '../hooks/usePerikopaNavigation';

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { parseReference } = usePerikopaNavigation();

  const handlePressReference = async (ref: string) => {
    const target = await parseReference(ref);
    if (target) {
      navigation.push('Reader', {
        boky: target.book,
        toko: target.chapter,
        targetVerse: target.verse,
        targetVerseEnd: target.verseEnd,
        targetVerseId: target.verseId
      });
    } else {
      alert("Tsy hita ny andininy: " + ref);
    }
  };
  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Verse Card */}
        <Animated.View 
          entering={FadeInDown.duration(800).springify()}
          className="m-4 rounded-3xl bg-blue-900 p-6 shadow-xl"
          style={{ backgroundColor: '#1e3a8a' }}
        >
          <Text className="text-center text-xs font-bold uppercase tracking-widest text-blue-200">
            Tenin'ny Taona {CURRENT_PERIKOPA.year}
          </Text>
          <Text className="mt-4 text-center text-lg font-bold italic leading-relaxed text-white">
            "{CURRENT_PERIKOPA.headerVerse.text}"
          </Text>
          <Text className="mt-3 text-right text-sm font-bold text-blue-300">
            — {CURRENT_PERIKOPA.headerVerse.reference}
          </Text>
        </Animated.View>

        {/* Quick Bible Access */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('Books')}
          className="mx-4 mb-6 flex-row items-center justify-between rounded-2xl bg-white p-5 shadow-sm border border-slate-100"
        >
          <View className="flex-row items-center">
            <View className="rounded-xl bg-blue-100 p-3">
              <Book size={24} color="#1e3a8a" />
            </View>
            <View className="ml-4">
              <Text className="text-lg font-bold text-slate-800">Hamaky Baiboly</Text>
              <Text className="text-xs text-slate-500">Hitady boky na toko...</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#cbd5e1" />
        </TouchableOpacity>

        {/* Perikopa Table Section */}
        <View className="px-4 pb-10">
          <Text className="mb-4 text-xl font-black text-slate-800">Perikopa {CURRENT_PERIKOPA.year}</Text>

          {CURRENT_PERIKOPA.sections.map((section, sIdx) => (
            <View key={sIdx} className="mb-8">
              {/* Section Header */}
              <View className="mb-3 flex-row items-center rounded-xl bg-blue-50 px-4 py-3 border-l-4 border-blue-600">
                <Text className="text-sm font-black uppercase text-blue-800 tracking-tight flex-1">
                  {section.theme}
                </Text>
              </View>

              {/* Table Header */}
              <View className="flex-row border-b border-slate-200 pb-2 px-1">
                <Text className="w-16 text-[10px] font-black text-slate-400 uppercase">Daty</Text>
                <Text className="flex-1 text-[10px] font-black text-slate-400 uppercase">T.Taloha</Text>
                <Text className="flex-1 text-[10px] font-black text-slate-400 uppercase">Filazantsara</Text>
                <Text className="flex-1 text-[10px] font-black text-slate-400 uppercase">Epistily</Text>
                <Text className="w-20 text-[10px] font-black text-slate-400 uppercase">Fampaherezana</Text>
              </View>

              {/* Entries */}
              {section.entries.map((entry, eIdx) => (
                <Animated.View 
                  key={entry.id}
                  entering={FadeInRight.delay(eIdx * 50).springify()}
                  className={`flex-row items-center py-4 px-1 border-b border-slate-50 ${eIdx % 2 === 0 ? 'bg-white/50' : 'bg-transparent'}`}
                >
                  <View className="w-16">
                    <Text className="text-[10px] font-black text-slate-800">{entry.date.split(' ')[0]}</Text>
                    <Text className="text-[9px] font-bold text-slate-400">{entry.date.split(' ').slice(1).join(' ')}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handlePressReference(entry.testamentTaloha)} className="flex-1 pr-1">
                    <Text className="text-[11px] font-bold text-slate-700">{entry.testamentTaloha}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handlePressReference(entry.filazantsara)} className="flex-1 pr-1">
                    <Text className="text-[11px] font-bold text-blue-700">{entry.filazantsara}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handlePressReference(entry.epistily)} className="flex-1 pr-1">
                    <Text className="text-[11px] font-bold text-slate-700">{entry.epistily}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handlePressReference(entry.fampaherezana)} className="w-20 rounded-lg bg-pink-50 p-1">
                    <Text className="text-center text-[10px] font-black text-pink-600">{entry.fampaherezana}</Text>
                  </TouchableOpacity>
                  
                  {/* Fampaherezana info - absolute badge if needed or just part of UI */}
                </Animated.View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
