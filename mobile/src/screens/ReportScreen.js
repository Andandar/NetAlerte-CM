import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {
  Button,
  Text,
  RadioButton,
  List,
  TextInput,
  IconButton,
  useTheme,
  SegmentedButtons,
} from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import api from '../config/api';

const PROBLEM_TYPES = [
  'Pas de réseau',
  'Réseau lent',
  'Appels impossibles',
  'Internet lent',
  'Autre',
];
const OPERATORS = ['Orange', 'MTN', 'Nexttel', 'Camtel', 'Autre'];
const NETWORK_TECH = ['2G', '3G', '4G', '5G'];

const ReportScreen = ({ navigation }) => {
  const theme = useTheme();
  const [problemType, setProblemType] = useState('');
  const [operator, setOperator] = useState('');
  const [networkType, setNetworkType] = useState('');
  const [signalStrength, setSignalStrength] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation(position.coords);
      },
      (error) => {
        console.log('Erreur de géolocalisation:', error);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  const handleSubmit = async () => {
    try {
      if (!operator || !problemType) {
        setError('Veuillez sélectionner un opérateur et un type de problème');
        return;
      }

      setLoading(true);
      setError('');

      const reportData = {
        operator,
        problem_type: problemType,
        signal_strength: signalStrength,
        network_type: networkType,
        latitude: location?.latitude,
        longitude: location?.longitude,
      };

      await api.post('/reports', reportData);
      navigation.goBack();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'envoi du signalement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Nouveau signalement</Text>

        <Text style={styles.label}>Opérateur</Text>
        <SegmentedButtons
          value={operator}
          onValueChange={setOperator}
          buttons={OPERATORS.map((op) => ({
            value: op,
            label: op,
          }))}
          style={styles.segmentedButtons}
        />

        <Text style={styles.label}>Type de problème</Text>
        <SegmentedButtons
          value={problemType}
          onValueChange={setProblemType}
          buttons={PROBLEM_TYPES.map((type) => ({
            value: type,
            label: type,
          }))}
          style={styles.segmentedButtons}
        />

        <TextInput
          label="Force du signal (0-100)"
          value={signalStrength}
          onChangeText={setSignalStrength}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
        />

        <TextInput
          label="Type de réseau (2G, 3G, 4G, 5G)"
          value={networkType}
          onChangeText={setNetworkType}
          mode="outlined"
          style={styles.input}
        />

        <Text style={styles.label}>Localisation (optionnelle)</Text>
        <Button
          mode={location ? 'contained' : 'outlined'}
          icon="map-marker"
          onPress={getCurrentLocation}
          style={{ marginBottom: 16 }}
        >
          {location ? 'Position enregistrée' : 'Utiliser ma position actuelle'}
        </Button>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          style={styles.button}
        >
          Envoyer le signalement
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2196F3',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  segmentedButtons: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    padding: 5,
  },
  error: {
    color: '#B00020',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default ReportScreen; 