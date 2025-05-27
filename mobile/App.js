import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import SyncManager from './src/utils/syncManager';

const App = () => {
  useEffect(() => {
    // Démarrer la synchronisation automatique
    SyncManager.startAutoSync();
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
};

export default App; 