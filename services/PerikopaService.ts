import AsyncStorage from '@react-native-async-storage/async-storage';
import { PerikopaData, PerikopaYear } from '../types/perikopa';

const STORAGE_KEY = '@perikopa_remote_data';
// URL REELLE DE VOTRE GIST DE MISE A JOUR
const GIST_URL = 'https://gist.githubusercontent.com/aina-lang/a8c712c6d596011eafa4e6d1f93813b3/raw';

export class PerikopaService {
  static async loadData(): Promise<PerikopaData> {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData) as PerikopaData;
      }
    } catch (e) {
      console.error('Erreur chargement données distantes:', e);
    }
    return {
      version: 0,
      lastUpdated: '',
      perikopa: []
    };
  }

  /**
   * Vérifie si une mise à jour est disponible sans tout télécharger
   */
  static async checkForUpdate(): Promise<boolean> {
    try {
      console.log('[PerikopaService] Checking for updates from:', GIST_URL);
      const response = await fetch(`${GIST_URL}?t=${Date.now()}`);
      if (!response.ok) {
        console.error('[PerikopaService] Update check failed: Network response was not OK', response.status);
        return false;
      }
      
      const remoteData = await response.json() as PerikopaData;
      const localData = await this.loadData();
      
      console.log('[PerikopaService] Version check - Local:', localData.version || 0, '| Remote:', remoteData.version);
      
      // Si la version distante est supérieure, une mise à jour est disponible
      const isAvailable = remoteData.version > (localData.version || 0);
      console.log('[PerikopaService] Is update available?', isAvailable);
      return isAvailable;
    } catch (e) {
      console.error('[PerikopaService] Error checking for update:', e);
      return false;
    }
  }

  /**
   * Télécharge et fusionne les nouvelles données (Fusion par année et semestre)
   */
  static async updateData(): Promise<boolean> {
    try {
      console.log('[PerikopaService] Starting calendar download...');
      const response = await fetch(`${GIST_URL}?t=${Date.now()}`);
      if (!response.ok) {
        console.error('[PerikopaService] Download failed: Network response was not OK', response.status);
        throw new Error('Erreur réseau');
      }
      
      const remoteData = await response.json() as PerikopaData;
      if (!remoteData || !remoteData.perikopa) {
        console.error('[PerikopaService] Download failed: Invalid JSON or empty calendar structure');
        return false;
      }

      console.log('[PerikopaService] Calendar downloaded successfully! Size of years:', remoteData.perikopa.length);
      console.log('[PerikopaService] Loading local data for merge...');

      // 1. Charger les données actuelles (Asset ou Storage)
      const currentData = await this.loadData();
      
      // 2. Fusionner intelligemment
      console.log('[PerikopaService] Merging local data with downloaded data...');
      const mergedPerikopa = [...currentData.perikopa];

      remoteData.perikopa.forEach(remoteYear => {
        const existingYearIdx = mergedPerikopa.findIndex(y => y.year === remoteYear.year);

        if (existingYearIdx === -1) {
          console.log(`[PerikopaService] Merging: Adding completely new year ${remoteYear.year}`);
          mergedPerikopa.push(remoteYear);
        } else {
          console.log(`[PerikopaService] Merging: Updating existing year ${remoteYear.year}`);
          const existingYear = mergedPerikopa[existingYearIdx];
          
          // Mise à jour du verset de l'année si présent
          if (remoteYear.headerVerse) {
            console.log(`[PerikopaService] Merging: Updating header verse for year ${remoteYear.year}`);
            existingYear.headerVerse = remoteYear.headerVerse;
          }

          remoteYear.semesters.forEach(remoteSem => {
            const existingSemIdx = existingYear.semesters.findIndex(s => s.id === remoteSem.id);
            
            if (existingSemIdx === -1) {
              console.log(`[PerikopaService] Merging: Adding new semester ${remoteSem.id} (${remoteSem.name}) to year ${remoteYear.year}`);
              existingYear.semesters.push(remoteSem);
            } else {
              console.log(`[PerikopaService] Merging: Overwriting existing semester ${remoteSem.id} (${remoteSem.name}) in year ${remoteYear.year}`);
              existingYear.semesters[existingSemIdx] = remoteSem;
            }
          });
        }
      });

      // 3. Sauvegarder le résultat fusionné
      console.log('[PerikopaService] Merging complete. Saving consolidated database to AsyncStorage...');
      const finalData: PerikopaData = { ...remoteData, perikopa: mergedPerikopa };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(finalData));
      
      console.log('[PerikopaService] Sync and save completed successfully! Database updated to version:', remoteData.version);
      return true;
    } catch (e) {
      console.error('[PerikopaService] Error merging data during download:', e);
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
