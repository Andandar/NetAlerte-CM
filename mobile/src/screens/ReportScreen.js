import React, { useState } from 'react';
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
} from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';

const PROBLEM_TYPES = [
  'Appels impossibles',
  'SMS non reçus/envoyés',
  'Internet lent ou coupé',
  'Coupures réseau',
];
const OPERATORS = ['Orange', 'MTN', 'Nexttel', 'Camtel', 'Autre'];
const NETWORK_TECH = ['2G', '3G', '4G', '5G'];

const ReportScreen = ({ navigation }) => {
  const theme = useTheme();
  const [problemType, setProblemType] = useState('');
  const [operator, setOperator] = useState('');
  const [networkTech, setNetworkTech] = useState('4G');
  const [signalStrength, setSignalStrength] = useState(3); // 0 à 4
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = async () => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
      Geolocation.getCurrentPosition(
        pos => setLocation(pos.coords),
        err => Alert.alert('Erreur', 'Impossible d'obtenir la position'),
        { enableHighAccuracy: true }
      );
      return;
    }
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          pos => setLocation(pos.coords),
          err => Alert.alert('Erreur', 'Impossible d'obtenir la position'),
          { enableHighAccuracy: true }
        );
      }
    } catch (e) {
      Alert.alert('Erreur', 'Permission refusée');
    }
  };

  const handleSend = async () => {
    if (!problemType || !operator) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    setLoading(true);
    try {
      const net = await NetInfo.fetch();
      const data = {
        problem_type: problemType,
        operator,
        network_type: networkTech,
        signal_strength: signalStrength * 25, // 0 à 100
        latitude: location?.latitude,
        longitude: location?.longitude,
      };
      await axios.post('http://localhost:3000/api/reports', data);
      navigation.replace('ThankYou');
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d'envoyer le signalement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Signaler un problème</Text>
      <Text style={styles.label}>Type de problème</Text>
      <RadioButton.Group onValueChange={setProblemType} value={problemType}>
        {PROBLEM_TYPES.map(type => (
          <RadioButton.Item key={type} label={type} value={type} />
        ))}
      </RadioButton.Group>
      <Text style={styles.label}>Opérateur</Text>
      <RadioButton.Group onValueChange={setOperator} value={operator}>
        {OPERATORS.map(op => (
          <RadioButton.Item key={op} label={op} value={op} />
        ))}
      </RadioButton.Group>
      <Text style={styles.label}>Technologie réseau</Text>
      <RadioButton.Group onValueChange={setNetworkTech} value={networkTech}>
        {NETWORK_TECH.map(tech => (
          <RadioButton.Item key={tech} label={tech} value={tech} />
        ))}
      </RadioButton.Group>
      <Text style={styles.label}>Force du signal</Text>
      <View style={styles.signalRow}>
        {[0, 1, 2, 3, 4].map(i => {
          const iconNames = [
            'signal-cellular-0-bar',
            'signal-cellular-1-bar',
            'signal-cellular-2-bar',
            'signal-cellular-3-bar',
            'signal-cellular-4-bar',
          ];
          return (
            <IconButton
              key={i}
              icon={iconNames[i]}
              color={i <= signalStrength ? theme.colors.primary : '#ccc'}
              size={32}
              onPress={() => setSignalStrength(i)}
            />
          );
        })}
      </View>
      <Text style={styles.label}>Localisation (optionnelle)</Text>
      <Button
        mode={location ? 'contained' : 'outlined'}
        icon="map-marker"
        onPress={requestLocation}
        style={{ marginBottom: 16 }}
      >
        {location ? 'Position enregistrée' : 'Utiliser ma position actuelle'}
      </Button>
      <Button
        mode="contained"
        onPress={handleSend}
        loading={loading}
        disabled={loading}
        style={styles.sendButton}
      >
        Envoyer
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2563eb',
    textAlign: 'center',
  },
  label: {
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
    color: '#222',
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sendButton: {
    marginTop: 24,
    borderRadius: 24,
    paddingVertical: 6,
  },
});

export default ReportScreen; 