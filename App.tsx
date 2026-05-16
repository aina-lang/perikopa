import './global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SQLiteProvider } from 'expo-sqlite';
import { PerikopaProvider } from './context/PerikopaContext';

import { RootStackParamList } from './navigation/types';
import HomeScreen from './screens/HomeScreen';
import BooksScreen from './screens/BooksScreen';
import ChaptersScreen from './screens/ChaptersScreen';
import ReaderScreen from './screens/ReaderScreen';
import BookmarksScreen from './screens/BookmarksScreen';
import SearchScreen from './screens/SearchScreen';
import AboutScreen from './screens/AboutScreen';
import PerikopaScreen from './screens/PerikopaScreen';

import { TouchableOpacity, View, StatusBar } from 'react-native';
import { Bookmark, Search, Info } from 'lucide-react-native';
import theme from './constants/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#F0F7FF" barStyle="dark-content" translucent={false} />
      <NavigationContainer>
        <SQLiteProvider databaseName="perikopa.db" assetSource={{ assetId: require('./assets/perikopa.db') }}>
          <PerikopaProvider>
            <Stack.Navigator initialRouteName="Home">
              <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={({ navigation }: any) => ({ 
                  title: 'Perikopa',
                  headerShown: true,
                  headerStyle: { backgroundColor: '#F0F7FF' },
                  headerTintColor: theme.tokens.header.title,
                  headerTitleStyle: { 
                    fontWeight: 'bold',
                    fontSize: 18,
                    color: theme.tokens.header.title,
                  },
                  headerShadowVisible: false,
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
                  title: route.params.boky.anarana,
                })}
              />
              <Stack.Screen 
                name="Reader" 
                component={ReaderScreen} 
                options={({ route }: any) => ({ 
                  title: `${route.params.boky.anarana} ${route.params.toko}`,
                })}
              />
              <Stack.Screen 
                name="Bookmarks" 
                component={BookmarksScreen} 
                options={{ 
                  title: 'Favoris',
                }} 
              />
              <Stack.Screen 
                name="Search" 
                component={SearchScreen} 
                options={{ 
                  title: 'Recherche',
                }} 
              />
              <Stack.Screen 
                name="About" 
                component={AboutScreen} 
                options={{ 
                  title: 'Momba ny App',
                }} 
              />
              <Stack.Screen 
                name="Perikopa" 
                component={PerikopaScreen} 
                options={{ 
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
