import React, { useState, useMemo, memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import { PerikopaScreenProps } from '../navigation/types';
import { usePerikopa } from '../context/PerikopaContext';
import { Filter, BookOpen, ChevronDown } from 'lucide-react-native';
import { usePerikopaNavigation } from '../hooks/usePerikopaNavigation';
import { ActivityIndicator } from 'react-native';

const MONTHS = [
  { id: 'JAN', name: 'Janoary' },
  { id: 'FEV', name: 'Febroary' },
  { id: 'MAR', name: 'Martsa' },
  { id: 'AVR', name: 'Aprily' },
  { id: 'MAI', name: 'May' },
  { id: 'JUN', name: 'Jona' },
  { id: 'JUL', name: 'Jolay' },
  { id: 'AOU', name: 'Aogositra' },
  { id: 'SEP', name: 'Septambra' },
  { id: 'OCT', name: 'Oktobra' },
  { id: 'NOV', name: 'Novambra' },
  { id: 'DEC', name: 'Desambra' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: (currentYear + 5) - 2024 + 1 }, (_, i) => 2024 + i);

const PerikopaScreen = memo(({ navigation }: PerikopaScreenProps) => {
  const { parseReference } = usePerikopaNavigation();
  const { perikopa, loading } = usePerikopa();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const selectedYearData = perikopa?.perikopa.find(y => y.year === selectedYear);

  const filteredSections = useMemo(() => {
    if (!perikopa) return [];
    // Trouver les données de l'année sélectionnée
    const yearData = perikopa.perikopa.find(y => y.year === selectedYear);
    if (!yearData) return [];

    // Fusionner toutes les sections de tous les semestres de cette année
    const allSections = yearData.semesters.flatMap(s => s.sections);

    if (!selectedMonth) return allSections;

    return allSections
      .map(section => ({
        ...section,
        entries: section.entries.filter(e => e.date.toUpperCase().includes(selectedMonth)),
      }))
      .filter(section => section.entries.length > 0);
  }, [selectedMonth, selectedYear]);

  const handlePressReference = async (ref: string) => {
    const target = await parseReference(ref);
    if (target) {
      navigation.push('Reader', {
        boky: target.book,
        toko: target.chapter,
        targetVerse: target.verse,
        targetVerseEnd: target.verseEnd,
        targetVerseId: target.verseId,
      });
    } else {
      alert('Tsy hita ny andininy: ' + ref);
    }
  };

  return (
    <View className="flex-1 bg-sky-50">

      {/* ── Blobs décoratifs ─────────────────────────────────────────────── */}
      <View className="absolute inset-0 overflow-hidden" pointerEvents="none">
        <View className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600 opacity-[0.07]" />
        <View className="absolute -left-20 bottom-32 h-56 w-56 rounded-full bg-emerald-500 opacity-[0.06]" />
      </View>

      {/* ══════════════════════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════════════════════ */}
      <View className="flex-row items-center justify-between px-4 pb-1 pt-2">
        <View>
          <Text className="text-[11px] font-bold uppercase tracking-widest text-blue-400">
            Fandaharam-potoana
          </Text>
          <Text className="text-2xl font-black text-blue-900">Perikopa</Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowYearPicker(true)}
          className="flex-row items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2"
        >
          <Text className="text-lg font-black text-blue-600">{selectedYear}</Text>
          <ChevronDown size={20} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* ── Modal Sélecteur d'année ──────────────────────────────────── */}
      <Modal
        visible={showYearPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowYearPicker(false)}
          className="flex-1 items-center justify-center bg-black/50 px-8"
        >
          <View className="w-full overflow-hidden rounded-3xl bg-white shadow-2xl">
            <View className="border-b border-slate-100 p-5">
              <Text className="text-center text-lg font-black text-slate-800">Hifidy Taona</Text>
            </View>
            <View className="max-h-[400px]">
              <FlatList
                data={YEARS}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedYear(item);
                      setShowYearPicker(false);
                    }}
                    className={`border-b border-slate-50 p-4 ${item === selectedYear ? 'bg-blue-50' : ''}`}
                  >
                    <Text className={`text-center text-lg ${item === selectedYear ? 'font-black text-blue-600' : 'font-bold text-slate-600'}`}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
            <TouchableOpacity
              onPress={() => setShowYearPicker(false)}
              className="bg-slate-50 p-4"
            >
              <Text className="text-center font-bold text-slate-400">Hikatona</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════════
          CHIPS MOIS
      ══════════════════════════════════════════════════════════════════ */}
      <View className="py-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-4 gap-2 items-center h-10"
          style={{ height: 40, marginBottom: 4 }}
        >
          {[{ id: null, name: 'Rehetra' }, ...MONTHS].map((item) => {
            const isActive = selectedMonth === item.id;
            return (
              <TouchableOpacity
                key={item.id ?? 'all'}
                onPress={() => setSelectedMonth(item.id)}
                activeOpacity={0.75}
                className={`mx-1 rounded-full px-5 py-2 ${isActive ? 'bg-primary-600' : 'bg-background-secondary'
                  }`}
              >
                <Text className={`text-[13px] font-bold ${isActive ? 'text-white' : 'text-text-tertiary'
                  }`}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      {/* ══════════════════════════════════════════════════════════════════
          LISTE DES SECTIONS
      ══════════════════════════════════════════════════════════════════ */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-12 gap-4"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {/* ── Verset de l'année (Banner) ────────────────────────────────── */}
        {selectedYearData?.headerVerse && (
          <View className="mb-2 overflow-hidden rounded-2xl bg-primary-800 p-5 shadow-sm">
            <View className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary-600 opacity-20" />
            <Text className="text-center text-[13px] font-bold italic text-white/95 leading-5">
              "{selectedYearData.headerVerse.text}"
            </Text>
            <Text className="mt-2 text-center text-[10px] font-black uppercase tracking-widest text-gold-300">
              {selectedYearData.headerVerse.reference}
            </Text>
          </View>
        )}

        {/* ── État vide ──────────────────────────────────────────────────── */}
        {filteredSections.length === 0 && (
          <View className="items-center justify-center py-24">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50">
              <Filter size={30} color="#93c5fd" strokeWidth={1.5} />
            </View>
            <Text className="text-sm font-bold text-blue-900">Tsy misy perikopa</Text>
            <Text className="mt-1 text-xs text-blue-400">amin'ity volana ity</Text>
          </View>
        )}

        {/* ── Sections ───────────────────────────────────────────────────── */}
        {filteredSections.map((section, sIdx) => (
          <View
            key={sIdx}
            className="overflow-hidden rounded-2xl border border-blue-100 bg-white"
            style={{
              elevation: 2,
              shadowColor: '#2563eb',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.07,
              shadowRadius: 8,
            }}
          >
            {/* ── En-tête thème ─────────────────────────────────────────── */}
            <View className="flex-row items-center gap-3 border-b border-blue-100 bg-blue-50 px-4 py-3">
              <View className="h-10 w-1 rounded-full bg-blue-600" />
              <View className="flex-1">
                <Text className="text-[9px] font-bold uppercase tracking-widest text-blue-400">
                  Lohahevitra
                </Text>
                <Text className="text-sm font-bold leading-snug text-blue-900" numberOfLines={2}>
                  {section.theme}
                </Text>
              </View>
              <BookOpen size={15} color="#93c5fd" strokeWidth={1.5} />
            </View>

            {/* ── En-tête colonnes ──────────────────────────────────────── */}
            <View className="flex-row items-center border-b border-blue-50 bg-slate-50 px-3 py-2">
              <Text className="w-12 text-[9px] font-black uppercase text-slate-500">
                Daty
              </Text>
              <Text className="flex-1 text-center text-[9px] font-black uppercase text-blue-600">
                Taloha
              </Text>
              <Text className="flex-1 text-center text-[9px] font-black uppercase text-emerald-600">
                Vaovao
              </Text>
              <Text className="flex-1 text-center text-[9px] font-black uppercase text-sky-600">
                Epistily
              </Text>
              <Text className="w-16 text-center text-[8px] font-black uppercase text-amber-600">
                Fampaherezana
              </Text>
            </View>

            {/* ── Lignes ────────────────────────────────────────────────── */}
            {section.entries.map((entry, eIdx) => {
              const isLast = eIdx === section.entries.length - 1;
              return (
                <View
                  key={entry.id}
                  className={`flex-row items-center gap-1 px-3 py-2.5
                    ${eIdx % 2 === 0 ? 'bg-sky-50/50' : 'bg-white'}
                    ${!isLast ? 'border-b border-blue-50' : ''}
                  `}
                >
                  {/* Date */}
                  <View className="w-12">
                    <Text className="text-xs font-black text-blue-900">
                      {entry.date.split(' ')[0]}
                    </Text>
                    <Text className="text-[9px] font-semibold text-blue-300" numberOfLines={1}>
                      {entry.date.split(' ').slice(1).join(' ')}
                    </Text>
                  </View>

                  {/* Testament Taloha — bleu */}
                  <TouchableOpacity
                    onPress={() => handlePressReference(entry.testamentTaloha)}
                    activeOpacity={0.7}
                    className="flex-1 rounded-lg bg-blue-50 px-1.5 py-2"
                  >
                    <Text className="text-center text-[10px] font-bold text-blue-700" numberOfLines={2}>
                      {entry.testamentTaloha}
                    </Text>
                  </TouchableOpacity>

                  {/* Filazantsara — émeraude */}
                  <TouchableOpacity
                    onPress={() => handlePressReference(entry.filazantsara)}
                    activeOpacity={0.7}
                    className="flex-1 rounded-lg bg-emerald-50 px-1.5 py-2"
                  >
                    <Text className="text-center text-[10px] font-bold text-emerald-700" numberOfLines={2}>
                      {entry.filazantsara}
                    </Text>
                  </TouchableOpacity>

                  {/* Epistily — sky */}
                  <TouchableOpacity
                    onPress={() => handlePressReference(entry.epistily)}
                    activeOpacity={0.7}
                    className="flex-1 rounded-lg bg-sky-50 px-1.5 py-2"
                  >
                    <Text className="text-center text-[10px] font-bold text-sky-700" numberOfLines={2}>
                      {entry.epistily}
                    </Text>
                  </TouchableOpacity>

                  {/* Fampaherezana — amber */}
                  <TouchableOpacity
                    onPress={() => handlePressReference(entry.fampaherezana)}
                    activeOpacity={0.7}
                    className="w-16 rounded-lg bg-amber-50 px-1.5 py-2"
                  >
                    <Text className="text-center text-[10px] font-black text-amber-700" numberOfLines={2}>
                      {entry.fampaherezana}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

export default PerikopaScreen;