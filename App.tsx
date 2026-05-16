import './global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SQLiteProvider } from 'expo-sqlite';

import { RootStackParamList } from './navigation/types';
import BooksScreen from './screens/BooksScreen';
import ChaptersScreen from './screens/ChaptersScreen';
import ReaderScreen from './screens/ReaderScreen';
import BookmarksScreen from './screens/BookmarksScreen';
import SearchScreen from './screens/SearchScreen';
import HomeScreen from './screens/HomeScreen';
import AboutScreen from './screens/AboutScreen';
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
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: { backgroundColor: '#F0F7FF' },
              headerTintColor: theme.tokens.header.title,
              headerTitleStyle: { fontWeight: 'bold' },
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={({ navigation }: any) => ({ 
                title: 'Perikopa',
                headerShown: true,
                headerStyle: { backgroundColor: '#F0F7FF' },
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
                headerStyle: { backgroundColor: '#F0F7FF' },
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
                headerStyle: { backgroundColor: '#F0F7FF' },
              })}
            />
            <Stack.Screen 
              name="Reader" 
              component={ReaderScreen} 
              options={({ route }: any) => ({ 
                title: `${route.params.boky.anarana} ${route.params.toko}`,
                headerStyle: { backgroundColor: '#F0F7FF' },
              })}
            />
            <Stack.Screen 
              name="Bookmarks" 
              component={BookmarksScreen} 
              options={{ 
                title: 'Favoris',
                headerStyle: { backgroundColor: '#F0F7FF' },
              }} 
            />
            <Stack.Screen 
              name="Search" 
              component={SearchScreen} 
              options={{ 
                title: 'Recherche',
                headerStyle: { backgroundColor: '#F0F7FF' },
              }} 
            />
            <Stack.Screen 
              name="About" 
              component={AboutScreen} 
              options={{ 
                title: 'Momba ny App',
                headerStyle: { backgroundColor: '#F0F7FF' },
              }} 
            />
          </Stack.Navigator>
        </SQLiteProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
