import './global.css';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SQLiteProvider } from 'expo-sqlite';
import { PerikopaProvider } from './context/PerikopaContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootStackParamList } from './navigation/types';
import HomeScreen from './screens/HomeScreen';
import BooksScreen from './screens/BooksScreen';
import ChaptersScreen from './screens/ChaptersScreen';
import ReaderScreen from './screens/ReaderScreen';
import BookmarksScreen from './screens/BookmarksScreen';
import SearchScreen from './screens/SearchScreen';
import AboutScreen from './screens/AboutScreen';
import PerikopaScreen from './screens/PerikopaScreen';
import VersesScreen from './screens/VersesScreen';
import OnboardingScreen from './screens/OnboardingScreen';

import { TouchableOpacity, View, StatusBar, ActivityIndicator } from 'react-native';
import { Bookmark, Search, Info } from 'lucide-react-native';
import theme from './constants/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const HEADER_STYLE = {
  headerStyle: { backgroundColor: theme.colors.background.primary },
  headerTintColor: theme.tokens.header.title,
  headerTitleStyle: {
    fontWeight: 'bold' as const,
    fontSize: 18,
    color: theme.tokens.header.title,
  },
  headerShadowVisible: false,
};

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('hasSeenOnboarding').then(value => {
      // if (value === null) {
        setIsFirstLaunch(true);
      // } else {
      //   setIsFirstLaunch(false);
      // }
    });
  }, []);

  if (isFirstLaunch === null) {
    return (
      <View className="flex-1 items-center justify-center bg-background-primary">
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
      </View>
    );
  }

  const initializeDB = async (db: any) => {
    try {
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_books_slug ON books (shortName);
        CREATE INDEX IF NOT EXISTS idx_tokos_book ON tokos (book_id, numero);
        CREATE INDEX IF NOT EXISTS idx_andininys_toko ON andininys (idToko);
      `);
      console.log('Database indexes initialized');
    } catch (e) {
      console.error('Error initializing indexes:', e);
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor={theme.colors.background.primary} barStyle="dark-content" translucent={false} />
      <NavigationContainer>
        <SQLiteProvider 
          databaseName="perikopa.db" 
          assetSource={{ assetId: require('./assets/perikopa.db') }}
          onInit={initializeDB}
        >
          <PerikopaProvider>
            <Stack.Navigator initialRouteName={isFirstLaunch ? "Onboarding" : "Home"}>
              <Stack.Screen 
                name="Onboarding" 
                component={OnboardingScreen} 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={({ navigation }: any) => ({ 
                  ...HEADER_STYLE,
                  title: 'Perikopa',
                  headerRight: () => (
                    <TouchableOpacity onPress={() => navigation.navigate('About')} className="p-2 mr-2">
                      <Info size={22} color={theme.tokens.header.title} />
                    </TouchableOpacity>
                  )
                })} 
              />
              <Stack.Screen 
                name="Books" 
                component={BooksScreen} 
                options={({ navigation }: any) => ({ 
                  ...HEADER_STYLE,
                  title: 'Baiboly',
                  headerRight: () => (
                    <View className="flex-row gap-1">
                      <TouchableOpacity onPress={() => navigation.navigate('Search')} className="p-2">
                        <Search color={theme.tokens.header.title} size={22} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => navigation.navigate('Bookmarks')} className="p-2">
                        <Bookmark color={theme.tokens.header.title} size={22} />
                      </TouchableOpacity>
                    </View>
                  )
                })} 
              />
              <Stack.Screen 
                name="Chapters" 
                component={ChaptersScreen} 
                options={({ route }: any) => ({ 
                  ...HEADER_STYLE,
                  title: route.params.boky.anarana,
                })}
              />
              <Stack.Screen 
                name="Verses" 
                component={VersesScreen} 
                options={({ route }: any) => ({ 
                  ...HEADER_STYLE,
                  title: `${route.params.boky.anarana} ${route.params.toko}`,
                })}
              />
              <Stack.Screen 
                name="Reader" 
                component={ReaderScreen} 
                options={({ route }: any) => ({ 
                  ...HEADER_STYLE,
                  title: `${route.params.boky.anarana} ${route.params.toko}`,
                })}
              />
              <Stack.Screen 
                name="Bookmarks" 
                component={BookmarksScreen} 
                options={{ 
                  ...HEADER_STYLE,
                  title: 'Favoris',
                }} 
              />
              <Stack.Screen 
                name="Search" 
                component={SearchScreen} 
                options={{ 
                  ...HEADER_STYLE,
                  title: 'Recherche',
                }} 
              />
              <Stack.Screen 
                name="About" 
                component={AboutScreen} 
                options={{ 
                  ...HEADER_STYLE,
                  title: 'Momba ny App',
                }} 
              />
              <Stack.Screen 
                name="Perikopa" 
                component={PerikopaScreen} 
                options={{ 
                  ...HEADER_STYLE,
                  title: 'Fandaharam-potoana',
                }} 
              />
            </Stack.Navigator>
          </PerikopaProvider>
        </SQLiteProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
