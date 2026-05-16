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
import theme from '../constants/theme';

type SearchResult = Andininy & { bookName: string };

export default function SearchScreen({ navigation }: SearchScreenProps) {
  const { searchVerses, getBooks } = useBible();
  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [books, setBooks] = useState<Boky[]>([]);
  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load all books on mount
  useEffect(() => {
    getBooks().then(setBooks);
  }, [getBooks]);

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
    await addToHistory(text);
  }, [searchVerses, addToHistory]);

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
    debounceRef.current = setTimeout(() => runSearch(text), 300);
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

  // Derive unique books from results for count badges
  const bookCounts = new Map<string, number>();
  results.forEach(r => bookCounts.set(r.bookName, (bookCounts.get(r.bookName) || 0) + 1));

  // Filter results by selected book
  const filteredResults = selectedBook
    ? results.filter(r => r.bookName === selectedBook)
    : results;

  const highlightText = (text: string, q: string) => {
    if (!q.trim()) return <Text className="text-base leading-relaxed text-text-secondary">{text}</Text>;
    const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
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

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background-primary">
      {/* ── Blobs décoratifs ──────────────────────────────────────────── */}
      <View className="absolute inset-0" pointerEvents="none">
        <View className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary-600 opacity-[0.07]" />
        <View className="absolute -bottom-15 -left-20 w-60 h-60 rounded-full bg-emerald-500 opacity-[0.06]" />
      </View>

      {/* Search Bar */}
      <View className="bg-background-primary px-4 pb-4 pt-2 border-b border-background-tertiary">
        <View className="flex-row items-center rounded-2xl bg-background-secondary px-4 border-2 border-primary-600">
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

      {/* Book filter chips - always visible */}
      <View className="bg-background-primary pb-2 pt-1 border-b border-background-tertiary">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
          <TouchableOpacity
            onPress={() => setSelectedBook(null)}
            className={`mx-1 rounded-full px-4 py-2 ${selectedBook === null ? 'bg-primary-600' : 'bg-background-secondary'}`}
          >
            <Text className={`text-xs font-bold ${selectedBook === null ? 'text-white' : 'text-text-tertiary'}`}>
              Tous{results.length > 0 ? ` (${results.length})` : ''}
            </Text>
          </TouchableOpacity>
          {books.map((b) => {
            const count = bookCounts.get(b.anarana) || 0;
            const isActive = selectedBook === b.anarana;
            return (
              <TouchableOpacity
                key={b.slug}
                onPress={() => setSelectedBook(isActive ? null : b.anarana)}
                className={`mx-1 rounded-full px-3 py-2 ${isActive ? 'bg-primary-600' : 'bg-background-secondary'}`}
              >
                <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-text-tertiary'}`}>
                  {b.anarana}{count > 0 ? ` (${count})` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* History Panel */}
      {showHistory && history.length > 0 && (
        <Animated.View entering={FadeInDown.springify()} className="bg-background-primary border-b border-background-tertiary">
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
                className={`flex-row items-center justify-between px-4 py-3 ${i === 0 ? '' : 'border-t border-background-tertiary'}`}
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

      {/* Loading */}
      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text className="mt-3 text-sm text-text-tertiary">Recherche en cours...</Text>
        </View>
      )}

      {/* Empty state before search */}
      {!loading && !searched && !showHistory && (
        <View className="flex-1 items-center justify-center p-8">
          <Search size={56} color={theme.colors.primary[100]} />
          <Text className="mt-4 text-center text-lg font-semibold text-text-tertiary">
            Rechercher dans la Bible
          </Text>
          <Text className="mt-2 text-center text-sm text-text-tertiary">
            Tapez au moins 2 caractères pour commencer
          </Text>
        </View>
      )}

      {/* Empty state - no history, no search */}
      {!loading && !searched && showHistory && history.length === 0 && (
        <View className="flex-1 items-center justify-center p-8">
          <Search size={56} color={theme.colors.primary[100]} />
          <Text className="mt-4 text-center text-lg font-semibold text-text-tertiary">
            Rechercher dans la Bible
          </Text>
          <Text className="mt-2 text-center text-sm text-text-tertiary">
            Tapez au moins 2 caractères pour commencer
          </Text>
        </View>
      )}

      {/* No results */}
      {!loading && searched && results.length === 0 && (
        <View className="flex-1 items-center justify-center p-8">
          <BookOpen size={56} color={theme.colors.primary[100]} />
          <Text className="mt-4 text-center text-lg font-semibold text-text-tertiary">Aucun résultat</Text>
          <Text className="mt-2 text-center text-sm text-text-tertiary">Essayez d'autres mots-clés</Text>
        </View>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <FlatList
          data={filteredResults}
          keyExtractor={(item) => item.id.toString()}
          contentContainerClassName="p-4 pb-12"
          ListHeaderComponent={() => (
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              {filteredResults.length} résultat{filteredResults.length > 1 ? 's' : ''}
              {selectedBook ? ` dans ${selectedBook}` : ''}
            </Text>
          )}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInUp.delay(index * 20).springify()}>
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  navigation.push('Reader', {
                    boky: {
                      id: 0,
                      slug: item.boky_slug,
                      anarana: item.bookName,
                      laharana: 0,
                      testament: '',
                    },
                    toko: item.toko,
                    targetVerse: item.laharana,
                    targetVerseId: item.id,
                    searchQuery: query,
                  },);
                }}
                className="mb-3 rounded-2xl bg-background-primary p-4 shadow-sm shadow-primary-600/10 border border-background-tertiary"
                style={{ elevation: 2 }}
              >
                <View className="mb-2 flex-row items-center">
                  <View className="rounded-lg px-2 py-1 bg-primary-100">
                    <Text className="text-xs font-bold text-primary-600">
                      {item.bookName} {item.toko}:{item.laharana}
                    </Text>
                  </View>
                </View>
                {highlightText(item.votoatiny, query)}
              </TouchableOpacity>
            </Animated.View>
          )}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
}
