import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AboutScreenProps } from '../navigation/types';
import { Info, ExternalLink, RefreshCw, Heart } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function AboutScreen({ navigation }: AboutScreenProps) {
  const openFAMWebsite = () => {
    Linking.openURL('https://www.fam.mg'); // Example URL
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-white">
      <ScrollView className="flex-1 p-6">
        <Animated.View entering={FadeIn.duration(800)} className="items-center mb-8">
          <View className="w-24 h-24 bg-blue-100 rounded-3xl items-center justify-center mb-4">
             <Info size={48} color="#1e3a8a" />
          </View>
          <Text className="text-3xl font-black text-slate-800">Perikopa FAM</Text>
          <Text className="text-slate-500 font-medium">Version 1.0.0</Text>
        </Animated.View>

        <View className="mb-8">
          <Text className="text-xl font-bold text-slate-800 mb-3">Momba ny Fiangonana</Text>
          <Text className="text-slate-600 leading-relaxed">
            Ny Fiangonana FAM (Fiangonana Ara-Pilazantsara eto Madagasikara) dia mamoaka isan-taona ny fandaharam-pamakiana Baiboly na "Perikopa" ho an'ny mpino rehetra.
          </Text>
          <TouchableOpacity 
            onPress={openFAMWebsite}
            className="mt-4 flex-row items-center justify-center bg-blue-50 py-3 rounded-xl border border-blue-100"
          >
            <Text className="text-blue-700 font-bold mr-2">Tsidiho ny tranonkala</Text>
            <ExternalLink size={18} color="#1d4ed8" />
          </TouchableOpacity>
        </View>

        <View className="mb-8">
          <Text className="text-xl font-bold text-slate-800 mb-3">Momba ny App</Text>
          <Text className="text-slate-600 leading-relaxed">
            Ity fampiharana ity dia natao hanampiana anao hanaraka ny Perikopa isan'andro sy hamaky ny Baiboly Malagasy amin'ny fomba mora sy haingana.
          </Text>
        </View>

        <View className="rounded-2xl bg-slate-50 p-6 border border-slate-100 mb-10">
          <View className="flex-row items-center mb-4">
            <RefreshCw size={20} color="#64748b" />
            <Text className="text-lg font-bold text-slate-800 ml-2">Fanavaozana (Update)</Text>
          </View>
          <Text className="text-sm text-slate-500 mb-4">
            Ny Perikopa dia miova isan-taona. Tsindrio ny bokotra eto ambany raha hijery raha misy fandaharana vaovao azo alaina.
          </Text>
          <TouchableOpacity 
            className="bg-blue-900 py-4 rounded-xl items-center"
            style={{ backgroundColor: '#1e3a8a' }}
            onPress={() => alert('Efa mampiasa ny version farany ianao.')}
          >
            <Text className="text-white font-black">Hijerena Fandaharana Vaovao</Text>
          </TouchableOpacity>
        </View>

        <View className="items-center pb-10">
          <View className="flex-row items-center">
            <Text className="text-slate-400 text-xs">Vita tamin'ny fitiavana </Text>
            <Heart size={12} color="#f43f5e" fill="#f43f5e" />
          </View>
          <Text className="text-slate-400 text-[10px] mt-1">© 2026 Perikopa FAM App</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
