import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchScreenProps } from '../navigation/types';
import { useBible } from '../hooks/useBible';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { Andininy, Boky } from '../services/database';
import { Search, X, BookOpen, Clock, Trash2 } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import theme from '../constants/theme';

type SearchResult = Andininy & { bookName: string };

export default function SearchScreen({ }: SearchScreenProps) {
  // ── Hook navigation — plus stable que la prop ─────────────────────────
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { searchVerses, getBooks } = useBible();
  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  const [query, setQuery]               = useState('');
  const [results, setResults]           = useState<SearchResult[]>([]);
  const [loading, setLoading]           = useState(false);
  const [searched, setSearched]         = useState(false);
  const [showHistory, setShowHistory]   = useState(true);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [books, setBooks]               = useState<Boky[]>([]);

  const inputRef    = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Chargement des livres ─────────────────────────────────────────────
  useEffect(() => {
    getBooks().then(setBooks);
  }, [getBooks]);

  // ── Recherche principale ──────────────────────────────────────────────
  const runSearch = useCallback(async (text: string) => {
    if (text.trim().length < 2) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await searchVerses(text);
    setResults(data as SearchResult[]);
    setLoading(false);
    setSearched(true);
    // Sauvegarder dans l'historique seulement si la recherche est "complète"
    addToHistory(text);
  }, [searchVerses, addToHistory]);

  // ── Debounce à la frappe (500ms pour ne pas surcharger SQLite) ────────
  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    setShowHistory(text.trim().length === 0);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 2) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => runSearch(text), 500);
  }, [runSearch]);

  const selectFromHistory = (h: string) => {
    setQuery(h);
    setShowHistory(false);
    runSearch(h);
    Keyboard.dismiss();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    setShowHistory(true);
    setSelectedBook(null);
    inputRef.current?.focus();
  };

  // ── Comptage par livre ────────────────────────────────────────────────
  const bookCounts = new Map<string, number>();
  results.forEach(r => bookCounts.set(r.bookName, (bookCounts.get(r.bookName) || 0) + 1));

  const filteredResults = selectedBook
    ? results.filter(r => r.bookName === selectedBook)
    : results;

  // ── Surlignage du mot cherché ─────────────────────────────────────────
  const highlightText = (text: string, q: string) => {
    if (!q.trim()) {
      return (
        <Text className="text-base leading-relaxed text-text-secondary">{text}</Text>
      );
    }
    const parts = text.split(
      new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    );
    return (
      <Text className="text-base leading-relaxed text-text-secondary">
        {parts.map((part, i) =>
          part.toLowerCase() === q.toLowerCase() ? (
            <Text key={i} className="font-bold bg-gold-200" style={{ color: theme.colors.primary[600] }}>
              {part}
            </Text>
          ) : (
            <Text key={i}>{part}</Text>
          )
        )}
      </Text>
    );
  };

  // ── Navigation vers le lecteur ────────────────────────────────────────
  const goToVerse = (item: SearchResult) => {
    Keyboard.dismiss();
    navigation.push('Reader', {
      boky: {
        id:       0,
        slug:     item.boky_slug,
        anarana:  item.bookName,
        laharana: 0,
        testament: '',
      },
      toko:          item.toko,
      targetVerse:   item.laharana,
      targetVerseId: item.id,
      searchQuery:   query,
    });
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background-primary">

      {/* ── Blobs décoratifs ─────────────────────────────────────────── */}
      <View className="absolute inset-0 overflow-hidden" pointerEvents="none">
        <View className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary-600 opacity-[0.07]" />
        <View className="absolute -left-20 bottom-20 h-60 w-60 rounded-full bg-emerald-500 opacity-[0.06]" />
      </View>

      {/* ══════════════════════════════════════════════════════════════
          BARRE DE RECHERCHE
      ══════════════════════════════════════════════════════════════ */}
      <View className="border-b border-background-tertiary bg-background-primary px-4 pb-3 pt-2">
        <View className="flex-row items-center rounded-2xl border-2 border-primary-600 bg-background-secondary px-4">
          <Search size={20} color={theme.colors.primary[600]} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={handleSearch}
            onFocus={() => { if (!query) setShowHistory(true); }}
            placeholder="Rechercher un verset, une phrase..."
            placeholderTextColor={theme.colors.text.tertiary}
            className="flex-1 py-3 pl-3 text-base text-text-primary"
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => { runSearch(query); Keyboard.dismiss(); }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} className="p-1">
              <X size={18} color={theme.colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ══════════════════════════════════════════════════════════════
          CHIPS FILTRES LIVRES — toujours visible
      ══════════════════════════════════════════════════════════════ */}
      <View style={{ height: 52 }} className="border-b border-background-tertiary bg-background-primary">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center', height: 52 }}
          style={{ height: 52 }}
        >
          {/* Chip "Tous" */}
          <TouchableOpacity
            onPress={() => setSelectedBook(null)}
            className={`rounded-full px-4 py-2 ${
              selectedBook === null ? 'bg-primary-600' : 'bg-background-secondary'
            }`}
          >
            <Text className={`text-xs font-bold ${
              selectedBook === null ? 'text-white' : 'text-text-tertiary'
            }`}>
              Tous{results.length > 0 ? ` (${results.length})` : ''}
            </Text>
          </TouchableOpacity>

          {/* Chips tous les livres — toujours affichés */}
          {books.map((b) => {
            const count = bookCounts.get(b.anarana) || 0;
            const isActive = selectedBook === b.anarana;
            const hasResults = searched && count > 0;
            return (
              <TouchableOpacity
                key={b.slug}
                onPress={() => setSelectedBook(isActive ? null : b.anarana)}
                className={`rounded-full px-4 py-2 ${
                  isActive ? 'bg-primary-600' : 'bg-background-secondary'
                }`}
              >
                <Text className={`text-xs font-bold ${
                  isActive ? 'text-white' : 'text-text-tertiary'
                }`}>
                  {b.anarana}{hasResults ? ` (${count})` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>


      {/* ══════════════════════════════════════════════════════════════
          HISTORIQUE
      ══════════════════════════════════════════════════════════════ */}
      {showHistory && history.length > 0 && (
        <Animated.View
          entering={FadeInDown.springify()}
          className="border-b border-background-tertiary bg-background-primary"
        >
          <View className="flex-row items-center justify-between px-4 pb-2 pt-3">
            <Text className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Recherches récentes
            </Text>
            <TouchableOpacity onPress={clearHistory} className="flex-row items-center gap-1 p-1">
              <Trash2 size={14} color={theme.colors.text.tertiary} />
              <Text className="text-xs text-text-tertiary">Tout effacer</Text>
            </TouchableOpacity>
          </View>

          {history.map((h, i) => (
            <Animated.View key={h} entering={FadeInUp.delay(i * 30).springify()}>
              <TouchableOpacity
                onPress={() => selectFromHistory(h)}
                className={`flex-row items-center justify-between px-4 py-3 ${
                  i > 0 ? 'border-t border-background-tertiary' : ''
                }`}
              >
                <View className="flex-row items-center gap-3">
                  <Clock size={16} color={theme.colors.text.tertiary} />
                  <Text className="text-base text-text-secondary">{h}</Text>
                </View>
                <TouchableOpacity onPress={() => removeFromHistory(h)} className="p-1">
                  <X size={16} color={theme.colors.text.tertiary} />
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>
      )}

      {/* ══════════════════════════════════════════════════════════════
          LOADING
      ══════════════════════════════════════════════════════════════ */}
      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text className="mt-3 text-sm text-text-tertiary">Recherche en cours...</Text>
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════════
          ÉTAT VIDE (avant recherche)
      ══════════════════════════════════════════════════════════════ */}
      {!loading && !searched && (
        <View className="flex-1 items-center justify-center p-8">
          <View className="mb-4 h-24 w-24 items-center justify-center rounded-3xl border border-primary-100 bg-primary-50">
            <Search size={40} color={theme.colors.primary[300]} strokeWidth={1.5} />
          </View>
          <Text className="text-center text-lg font-bold text-text-primary">
            Rechercher dans la Bible
          </Text>
          <Text className="mt-2 text-center text-sm text-text-tertiary">
            Tapez au moins 2 caractères pour commencer
          </Text>
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════════
          AUCUN RÉSULTAT
      ══════════════════════════════════════════════════════════════ */}
      {!loading && searched && results.length === 0 && (
        <View className="flex-1 items-center justify-center p-8">
          <View className="mb-4 h-24 w-24 items-center justify-center rounded-3xl border border-primary-100 bg-primary-50">
            <BookOpen size={40} color={theme.colors.primary[300]} strokeWidth={1.5} />
          </View>
          <Text className="text-center text-lg font-bold text-text-primary">Aucun résultat</Text>
          <Text className="mt-2 text-center text-sm text-text-tertiary">
            Essayez d'autres mots-clés
          </Text>
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════════
          RÉSULTATS
      ══════════════════════════════════════════════════════════════ */}
      {!loading && results.length > 0 && (
        <FlatList
          data={filteredResults}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={() => (
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              {filteredResults.length} résultat{filteredResults.length > 1 ? 's' : ''}
              {selectedBook ? ` dans ${selectedBook}` : ''}
            </Text>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => goToVerse(item)}
              activeOpacity={0.8}
              className="mb-3 rounded-2xl border border-background-tertiary bg-background-primary p-4"
              style={{ elevation: 2, shadowColor: theme.colors.primary[600], shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 }}
            >
              {/* Référence */}
              <View className="mb-2 flex-row items-center">
                <View className="rounded-lg bg-primary-100 px-2.5 py-1">
                  <Text className="text-xs font-bold text-primary-600">
                    {item.bookName} {item.toko}:{item.laharana}
                  </Text>
                </View>
              </View>

              {/* Texte avec surlignage */}
              {highlightText(item.votoatiny, query)}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}