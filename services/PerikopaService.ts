import AsyncStorage from '@react-native-async-storage/async-storage';
import { PerikopaData } from '../types/perikopa';
import localPerikopa from '../assets/perikopa.json';

const STORAGE_KEY = '@perikopa_remote_data';
// REMPLACEZ CETTE URL PAR VOTRE LIEN "RAW" GITHUB GIST
const GIST_URL = 'https://gist.githubusercontent.com/votre_username/votre_gist_id/raw/perikopa.json';

export class PerikopaService {
  /**
   * Charge les données (Priorité : AsyncStorage > Local Assets)
   */
  static async loadData(): Promise<PerikopaData> {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData) as PerikopaData;
      }
    } catch (e) {
      console.error('Erreur chargement données distantes:', e);
    }
    return localPerikopa as PerikopaData;
  }

  /**
   * Télécharge les nouvelles données depuis GitHub
   */
  static async updateData(): Promise<boolean> {
    try {
      const response = await fetch(`${GIST_URL}?t=${Date.now()}`); // Cache busting
      if (!response.ok) throw new Error('Erreur réseau');
      
      const newData = await response.json();
      
      // Validation basique de la structure
      if (newData && newData.perikopa) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Erreur lors de la mise à jour:', e);
      return false;
    }
  }

  /**
   * Supprime les données téléchargées pour revenir au fichier local
   */
  static async resetData(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}
