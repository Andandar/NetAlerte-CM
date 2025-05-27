import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { BatteryManager } from 'react-native-battery';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 seconde
const LOW_BATTERY_THRESHOLD = 20; // 20%
const BATCH_SIZE = 5; // Nombre de signalements à synchroniser par lot

class SyncManager {
  static async syncOfflineReports() {
    try {
      // Vérification de la connexion
      const isConnected = (await NetInfo.fetch()).isConnected;
      if (!isConnected) {
        return {
          success: false,
          error: 'Pas de connexion internet'
        };
      }

      // Vérification du niveau de batterie
      const batteryLevel = await BatteryManager.getBatteryLevel();
      if (batteryLevel <= LOW_BATTERY_THRESHOLD) {
        return {
          success: false,
          error: 'Niveau de batterie trop faible pour la synchronisation'
        };
      }

      const offlineReports = await AsyncStorage.getItem('offlineReports');
      if (!offlineReports) {
        return {
          success: true,
          synced: 0,
          failed: 0
        };
      }

      const reports = JSON.parse(offlineReports);
      const successfulReports = [];
      const failedReports = [];

      // Traitement par lots pour optimiser les performances
      for (let i = 0; i < reports.length; i += BATCH_SIZE) {
        const batch = reports.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(async (report) => {
          let retryCount = 0;
          let success = false;

          while (retryCount < MAX_RETRIES && !success) {
            try {
              await axios.post(`${API_URL}/reports`, report);
              successfulReports.push(report);
              success = true;
            } catch (error) {
              retryCount++;
              if (retryCount === MAX_RETRIES) {
                console.error('Échec de la synchronisation après plusieurs tentatives:', error);
                failedReports.push(report);
              } else {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
              }
            }
          }
        });

        await Promise.all(batchPromises);
      }

      // Mise à jour des signalements hors ligne
      if (failedReports.length > 0) {
        await AsyncStorage.setItem('offlineReports', JSON.stringify(failedReports));
      } else {
        await AsyncStorage.removeItem('offlineReports');
      }

      return {
        success: true,
        synced: successfulReports.length,
        failed: failedReports.length
      };
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async startAutoSync(interval = 5 * 60 * 1000) { // 5 minutes par défaut
    let syncInterval;

    // Fonction de synchronisation avec vérification de la batterie
    const syncWithBatteryCheck = async () => {
      const batteryLevel = await BatteryManager.getBatteryLevel();
      if (batteryLevel > LOW_BATTERY_THRESHOLD) {
        await this.syncOfflineReports();
      }
    };

    // Vérification initiale
    await syncWithBatteryCheck();

    // Configuration de la synchronisation périodique
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        syncWithBatteryCheck();
      }
    });

    // Synchronisation périodique
    syncInterval = setInterval(async () => {
      const isConnected = (await NetInfo.fetch()).isConnected;
      if (isConnected) {
        await syncWithBatteryCheck();
      }
    }, interval);

    // Nettoyage lors de l'arrêt
    return () => {
      if (syncInterval) {
        clearInterval(syncInterval);
      }
    };
  }
}

export default SyncManager; 