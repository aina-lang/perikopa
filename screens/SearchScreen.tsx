import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchScreenProps } from '../navigation/types';
import { useBible } from '../hooks/useBible';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { Andininy, Boky } from '../services/database';
import { Search, X, BookOpen, Clock, Trash2, Filter } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { ScrollView } from 'react-native';

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
    if (!q.trim()) return <Text className="text-base leading-relaxed text-slate-700">{text}</Text>;
    const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <Text className="text-base leading-relaxed text-slate-700">
        {parts.map((part, i) =>
          part.toLowerCase() === q.toLowerCase() ? (
            <Text key={i} className="font-bold" style={{ color: '#1e3a8a', backgroundColor: '#dbeafe' }}>
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
    <SafeAreaView edges={['bottom']} className="flex-1 bg-slate-50">
      {/* Search Bar */}
      <View className="bg-white px-4 pb-4 pt-2"
        style={{ borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}
      >
        <View
          className="flex-row items-center rounded-2xl bg-slate-100 px-4"
          style={{ borderWidth: 2, borderColor: '#1e3a8a' }}
        >
          <Search size={20} color="#1e3a8a" />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={handleSearch}
            onFocus={() => { if (!query) setShowHistory(true); }}
            placeholder="Rechercher un verset, une phrase..."
            placeholderTextColor="#94a3b8"
            className="flex-1 py-3 pl-3 text-base text-slate-800"
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => { runSearch(query); Keyboard.dismiss(); }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} className="p-1">
              <X size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Book filter chips - always visible */}
      <View className="bg-white pb-2 pt-1" style={{ borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
          <TouchableOpacity
            onPress={() => setSelectedBook(null)}
            className="mx-1 rounded-full px-4 py-2"
            style={{ backgroundColor: selectedBook === null ? '#1e3a8a' : '#f1f5f9' }}
          >
            <Text className="text-xs font-bold" style={{ color: selectedBook === null ? '#fff' : '#64748b' }}>
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
                className="mx-1 rounded-full px-3 py-2"
                style={{ backgroundColor: isActive ? '#1e3a8a' : '#f1f5f9' }}
              >
                <Text className="text-xs font-bold" style={{ color: isActive ? '#fff' : '#64748b' }}>
                  {b.anarana}{count > 0 ? ` (${count})` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* History Panel */}
      {showHistory && history.length > 0 && (
        <Animated.View entering={FadeInDown.springify()} className="bg-white border-b border-slate-100">
          <View className="flex-row items-center justify-between px-4 pb-2 pt-3">
            <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Recherches récentes
            </Text>
            <TouchableOpacity onPress={clearHistory} className="flex-row items-center gap-1 p-1">
              <Trash2 size={14} color="#94a3b8" />
              <Text className="text-xs text-slate-400">Tout effacer</Text>
            </TouchableOpacity>
          </View>
          {history.map((h, i) => (
            <Animated.View key={h} entering={FadeInUp.delay(i * 30).springify()}>
              <TouchableOpacity
                onPress={() => selectFromHistory(h)}
                className="flex-row items-center justify-between px-4 py-3"
                style={{ borderTopWidth: i === 0 ? 0 : 1, borderTopColor: '#f1f5f9' }}
              >
                <View className="flex-row items-center gap-3">
                  <Clock size={16} color="#94a3b8" />
                  <Text className="text-base text-slate-700">{h}</Text>
                </View>
                <TouchableOpacity onPress={() => removeFromHistory(h)} className="p-1">
                  <X size={16} color="#cbd5e1" />
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>
      )}

      {/* Loading */}
      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text className="mt-3 text-sm text-slate-500">Recherche en cours...</Text>
        </View>
      )}

      {/* Empty state before search */}
      {!loading && !searched && !showHistory && (
        <View className="flex-1 items-center justify-center p-8">
          <Search size={56} color="#cbd5e1" />
          <Text className="mt-4 text-center text-lg font-semibold text-slate-400">
            Rechercher dans la Bible
          </Text>
          <Text className="mt-2 text-center text-sm text-slate-400">
            Tapez au moins 2 caractères pour commencer
          </Text>
        </View>
      )}

      {/* Empty state - no history, no search */}
      {!loading && !searched && showHistory && history.length === 0 && (
        <View className="flex-1 items-center justify-center p-8">
          <Search size={56} color="#cbd5e1" />
          <Text className="mt-4 text-center text-lg font-semibold text-slate-400">
            Rechercher dans la Bible
          </Text>
          <Text className="mt-2 text-center text-sm text-slate-400">
            Tapez au moins 2 caractères pour commencer
          </Text>
        </View>
      )}

      {/* No results */}
      {!loading && searched && results.length === 0 && (
        <View className="flex-1 items-center justify-center p-8">
          <BookOpen size={56} color="#cbd5e1" />
          <Text className="mt-4 text-center text-lg font-semibold text-slate-400">Aucun résultat</Text>
          <Text className="mt-2 text-center text-sm text-slate-400">Essayez d'autres mots-clés</Text>
        </View>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <FlatList
          data={filteredResults}
          keyExtractor={(item) => item.id.toString()}
          contentContainerClassName="p-4 pb-12"
          ListHeaderComponent={() => (
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {filteredResults.length} résultat{filteredResults.length > 1 ? 's' : ''}
              {selectedBook ? ` dans ${selectedBook}` : ''}
            </Text>
          )}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInUp.delay(index * 20).springify()}>
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  navigation.navigate('Reader', {
                    boky: {
                      id: 0,
                      slug: item.boky_slug,
                      anarana: item.bookName,
                      laharana: 0,
                      testament: '',
                    },
                    toko: item.toko,
                    targetVerse: item.laharana,
                    searchQuery: query,
                  });
                }}
                className="mb-3 rounded-2xl bg-white p-4"
                style={{ shadowColor: '#93c5fd', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.5, shadowRadius: 2, elevation: 2 }}
              >
                <View className="mb-2 flex-row items-center">
                  <View className="rounded-lg px-2 py-1" style={{ backgroundColor: '#dbeafe' }}>
                    <Text className="text-xs font-bold" style={{ color: '#1e3a8a' }}>
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
