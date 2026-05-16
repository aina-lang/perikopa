import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ZOOM_KEY = '@perikopa_zoom_level';

export function useSettings() {
  const [zoomLevel, setZoomLevel] = useState(50);
  const [loading, setLoading] = useState(true);

  // Charger le zoom au démarrage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedZoom = await AsyncStorage.getItem(ZOOM_KEY);
        if (savedZoom !== null) {
          setZoomLevel(parseInt(savedZoom, 10));
        }
      } catch (e) {
        console.error('Erreur chargement paramètres:', e);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Sauvegarder le zoom
  const saveZoomLevel = async (level: number) => {
    try {
      setZoomLevel(level);
      await AsyncStorage.setItem(ZOOM_KEY, level.toString());
    } catch (e) {
      console.error('Erreur sauvegarde paramètres:', e);
    }
  };

  return {
    zoomLevel,
    saveZoomLevel,
    loading
  };
}
