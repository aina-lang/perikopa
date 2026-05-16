import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Network from 'expo-network';

// URL DU GOOGLE APPS SCRIPT DEPLOYE POUR LES STATISTIQUES
const GOOGLE_SHEET_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbxp2hK5BoC5n5kZohSQzLik9kp10tMEdfVk8Z5mPabiVmEQ65eNpamPSaTQRAhtrY-UJQ/exec';

export class AnalyticsService {
  /**
   * Récupère ou génère un identifiant unique et anonyme pour ce téléphone
   */
  private static async getOrCreateDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem('@device_id');
      if (!deviceId) {
        // Génération d'un ID unique simple et robuste sans dépendance
        deviceId = 'usr_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        await AsyncStorage.setItem('@device_id', deviceId);
      }
      return deviceId;
    } catch (e) {
      return 'usr_unknown';
    }
  }

  /**
   * Envoie un ping silencieux vers Google Sheets pour enregistrer l'activité
   */
  static async pingActivity(appVersion: string = '1.0.0'): Promise<void> {
    // Si l'utilisateur n'a pas encore configuré son URL, on ignore silencieusement
    if (!GOOGLE_SHEET_WEBAPP_URL) {
      console.log('[AnalyticsService] Google Sheet URL non configurée. Envoi ignoré.');
      return;
    }

    try {
      // Vérifier si l'appareil est connecté à internet
      const netState = await Network.getNetworkStateAsync();
      const isConnected = netState.isConnected && netState.isInternetReachable !== false;
      if (!isConnected) {
        console.log('[AnalyticsService] Téléphone hors-ligne. Envoi du ping ignoré.');
        return;
      }
      const deviceId = await this.getOrCreateDeviceId();
      const platform = Platform.OS; // 'android' ou 'ios'
      
      const payload = {
        deviceId,
        platform,
        appVersion,
      };

      console.log('[AnalyticsService] Envoi du ping d\'activité...', payload);
      
      const response = await fetch(GOOGLE_SHEET_WEBAPP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log('[AnalyticsService] Ping enregistré avec succès dans Google Sheets !');
      } else {
        console.warn('[AnalyticsService] Échec de l\'enregistrement du ping:', response.status);
      }
    } catch (e) {
      console.error('[AnalyticsService] Erreur lors du ping d\'activité:', e);
    }
  }
}
