import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AboutScreenProps } from '../navigation/types';
import { Info, ExternalLink, RefreshCw, Heart, BookOpen, Church, Mail, MessageCircle } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import theme from '../constants/theme';
import UpdateModal from '../components/UpdateModal';

export default function AboutScreen({ navigation }: AboutScreenProps) {
  const [showUpdate, setShowUpdate] = useState(false);
  const openFAMWebsite = () => Linking.openURL('https://www.fam.mg');


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
          <View className="mb-4 h-24 w-24 items-center justify-center rounded-[32px] border-[1.5px] border-primary-100 bg-primary-50 shadow-lg shadow-primary-600/15" style={{ elevation: 6 }}>
            <View className="h-[72px] w-[72px] items-center justify-center rounded-[24px] bg-primary-100">
              <BookOpen size={36} color={theme.colors.primary[600]} strokeWidth={1.6} />
            </View>
          </View>
          <Text className="text-[30px] font-black tracking-[-0.5px] text-text-primary">Perikopa</Text>
          <Text className="mb-3 mt-1 text-[13px] font-semibold text-text-tertiary">FAM · Fiangonana Apokalipsy Manerantany</Text>
          <View className="rounded-full border border-background-tertiary bg-background-secondary px-3.5 py-1">
            <Text className="text-[11px] font-bold text-text-tertiary">Version 1.0.0</Text>
          </View>
        </Animated.View>

        {/* ══════════════════════════════════════════════════════════
            CARTE — Momba ny App & Fiangonana
        ══════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.delay(100).springify()} className="mb-3.5 rounded-2xl border border-background-tertiary bg-background-primary p-[18px] shadow-sm shadow-primary-800/5" style={{ elevation: 2 }}>
          <View className="mb-3 flex-row items-center gap-2.5">
            <View className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-emerald-50">
              <Info size={18} color={theme.colors.emerald[600]} strokeWidth={1.8} />
            </View>
            <Text className="text-[16px] font-extrabold text-text-primary">Momba ny App</Text>
          </View>

          <Text className="text-[14px] leading-[22px] text-text-secondary">
            Ny Fiangonana FAM (Fiangonana Apokalipsy Manerantany) dia mamoaka isan-taona ny fandaharam-pamakiana Baiboly na "Perikopa" ho an'ny mpino rehetra.
          </Text>
          
          <Text className="text-[14px] leading-[22px] text-text-secondary mt-3">
            Ity fampiharana ity dia natao hanampiana anao hanaraka ny Perikopa isan'andro sy hamaky ny Baiboly Malagasy amin'ny fomba mora sy haingana.
          </Text>

          {/* Bouton Lien */}
          <View className="mt-4">
            <TouchableOpacity
              onPress={() => Linking.openURL('https://apokalypsy.com/')}
              className="flex-row items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 py-[11px]"
              activeOpacity={0.8}
            >
              <Text className="text-[14px] font-bold text-blue-600">apokalypsy.com</Text>
              <ExternalLink size={15} color="#2563eb" strokeWidth={2} />
            </TouchableOpacity>
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
            className="mt-4 flex-row items-center justify-center gap-2 rounded-xl py-3.5 shadow-md bg-primary-600 shadow-primary-600/30"
            style={{ elevation: 5 }}
            activeOpacity={0.85}
            onPress={() => setShowUpdate(true)}
          >
            <RefreshCw size={16} color="#fff" strokeWidth={2} />
            <Text className="text-[14px] font-extrabold text-[#FFFFFF]">
              Hijerena Fandaharana Vaovao
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ══════════════════════════════════════════════════════════
            CARTE — Mpamorona (Developer)
        ══════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.delay(340).springify()} className="mb-3.5 rounded-2xl border border-background-tertiary bg-background-primary p-[18px] shadow-sm shadow-primary-800/5" style={{ elevation: 2 }}>
          <View className="mb-3 flex-row items-center gap-2.5">
            <View className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-slate-100">
              <MessageCircle size={18} color={theme.colors.text.secondary} strokeWidth={1.8} />
            </View>
            <Text className="text-[16px] font-extrabold text-text-primary">Mpamorona ny App</Text>
          </View>

          <Text className="text-[15px] font-black text-primary-600 mb-1">
            RAFANDEFERANA Maminiaina Mercia
          </Text>
          <Text className="text-[13px] leading-[20px] text-text-secondary mb-4">
            Developer Full-stack & Mobile
          </Text>

          <View className="gap-2.5 border-t border-background-tertiary pt-4">
            {/* Email */}
            <TouchableOpacity 
              onPress={() => Linking.openURL('mailto:merciaaina@gmail.com')}
              className="flex-row items-center gap-3"
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-red-50">
                <Mail size={16} color="#dc2626" />
              </View>
              <Text className="text-[14px] text-text-secondary">merciaaina@gmail.com</Text>
            </TouchableOpacity>

            {/* WhatsApp */}
            <TouchableOpacity 
              onPress={() => Linking.openURL('https://wa.me/261325715347')}
              className="flex-row items-center gap-3"
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
                <MessageCircle size={16} color="#059669" />
              </View>
              <Text className="text-[14px] text-text-secondary">+261 32 571 53 47</Text>
            </TouchableOpacity>

            {/* GitHub */}
            <TouchableOpacity 
              onPress={() => Linking.openURL('https://github.com/aina-lang')}
              className="flex-row items-center gap-3"
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                <ExternalLink size={16} color="#1e293b" />
              </View>
              <Text className="text-[14px] text-text-secondary">GitHub: aina-lang</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ══════════════════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.delay(420).springify()} className="mt-2 items-center pt-2">
          <View className="mb-4 h-[1px] w-[60px] bg-background-tertiary" />
          <View className="flex-row items-center">
            <Text className="text-[12px] text-text-tertiary">Vita tamin'ny fitiavana </Text>
            <Heart size={12} color="#f43f5e" fill="#f43f5e" />
          </View>
          <Text className="mt-1 text-[10px] text-text-tertiary">© 2026 Perikopa FAM App</Text>
        </Animated.View>

      </ScrollView>

      <UpdateModal 
        isVisible={showUpdate} 
        onClose={() => setShowUpdate(false)}
        onSuccess={() => {
          // Les données sont synchronisées
        }}
      />
    </SafeAreaView>
  );
}