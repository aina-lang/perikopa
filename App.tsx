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
import { TouchableOpacity, View, StatusBar } from 'react-native';
import { Bookmark, Search } from 'lucide-react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#1e3a8a" barStyle="light-content" translucent={false} />
      <NavigationContainer>
        <SQLiteProvider databaseName="perikopa.db" assetSource={{ assetId: require('./assets/perikopa.db') }}>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: '#1e3a8a' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen 
              name="Books" 
              component={BooksScreen} 
              options={({ navigation }: any) => ({ 
                title: 'Baiboly Malagasy',
                headerRight: () => (
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <TouchableOpacity onPress={() => navigation.navigate('Search')} className="p-2">
                      <Search color="#fff" size={22} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Bookmarks')} className="p-2">
                      <Bookmark color="#fff" size={22} />
                    </TouchableOpacity>
                  </View>
                )
              })} 
            />
            <Stack.Screen 
              name="Chapters" 
              component={ChaptersScreen} 
              options={({ route }: any) => ({ title: route.params.boky.anarana })}
            />
            <Stack.Screen 
              name="Reader" 
              component={ReaderScreen} 
              options={({ route }: any) => ({ title: `${route.params.boky.anarana} ${route.params.toko}` })}
            />
            <Stack.Screen 
              name="Bookmarks" 
              component={BookmarksScreen} 
              options={{ title: 'Favoris' }} 
            />
            <Stack.Screen 
              name="Search" 
              component={SearchScreen} 
              options={{ title: 'Recherche' }} 
            />
          </Stack.Navigator>
        </SQLiteProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
