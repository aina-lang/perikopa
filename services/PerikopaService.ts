import AsyncStorage from '@react-native-async-storage/async-storage';
import { PerikopaData, PerikopaYear } from '../types/perikopa';
import localPerikopa from '../assets/perikopa.json';

const STORAGE_KEY = '@perikopa_remote_data';
// REMPLACEZ CETTE URL PAR VOTRE LIEN "RAW" GITHUB GIST
const GIST_URL = 'https://gist.githubusercontent.com/votre_username/votre_gist_id/raw/perikopa.json';

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
    return localPerikopa as unknown as PerikopaData;
  }

  /**
   * Vérifie si une mise à jour est disponible sans tout télécharger
   */
  static async checkForUpdate(): Promise<boolean> {
    try {
      const response = await fetch(`${GIST_URL}?t=${Date.now()}`);
      if (!response.ok) return false;
      
      const remoteData = await response.json() as PerikopaData;
      const localData = await this.loadData();
      
      // Si la version distante est supérieure, une mise à jour est disponible
      return remoteData.version > (localData.version || 0);
    } catch (e) {
      return false;
    }
  }

  /**
   * Télécharge et fusionne les nouvelles données (Fusion par année et semestre)
   */
  static async updateData(): Promise<boolean> {
    try {
      const response = await fetch(`${GIST_URL}?t=${Date.now()}`);
      if (!response.ok) throw new Error('Erreur réseau');
      
      const remoteData = await response.json() as PerikopaData;
      if (!remoteData || !remoteData.perikopa) return false;

      // 1. Charger les données actuelles (Asset ou Storage)
      const currentData = await this.loadData();
      
      // 2. Fusionner intelligemment
      const mergedPerikopa = [...currentData.perikopa];

      remoteData.perikopa.forEach(remoteYear => {
        const existingYearIdx = mergedPerikopa.findIndex(y => y.year === remoteYear.year);

        if (existingYearIdx === -1) {
          // Nouvelle année complète
          mergedPerikopa.push(remoteYear);
        } else {
          // L'année existe, on fusionne les semestres
          const existingYear = mergedPerikopa[existingYearIdx];
          
          // Mise à jour du verset de l'année si présent
          if (remoteYear.headerVerse) {
            existingYear.headerVerse = remoteYear.headerVerse;
          }

          remoteYear.semesters.forEach(remoteSem => {
            const existingSemIdx = existingYear.semesters.findIndex(s => s.id === remoteSem.id);
            
            if (existingSemIdx === -1) {
              // Nouveau semestre pour cette année
              existingYear.semesters.push(remoteSem);
            } else {
              // Mise à jour du semestre existant
              existingYear.semesters[existingSemIdx] = remoteSem;
            }
          });
        }
      });

      // 3. Sauvegarder le résultat fusionné
      const finalData: PerikopaData = { ...remoteData, perikopa: mergedPerikopa };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(finalData));
      
      return true;
    } catch (e) {
      console.error('Erreur lors de la fusion des données:', e);
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
