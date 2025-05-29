import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  PermissionsAndroid,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Button,
  Card,
  Title,
  Paragraph,
  Text,
  ActivityIndicator,
  RadioButton,
  List,
  Portal,
  Modal,
  FAB,
} from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

const OPERATORS = ['Orange', 'MTN', 'Nexttel', 'Camtel', 'Autre'];
const PROBLEM_TYPES = [
  'Appel impossible',
  'SMS non reçu ou envoyé',
  'Internet lent ou indisponible',
  'Coupure réseau',
];

const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [location, setLocation] = useState(null);
  const [offlineReports, setOfflineReports] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState('');
  const [selectedProblemType, setSelectedProblemType] = useState('');
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [showProblemTypeModal, setShowProblemTypeModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkNetworkInfo();
    loadOfflineReports();
    fetchData();
  }, []);

  const checkNetworkInfo = async () => {
    const state = await NetInfo.fetch();
    setNetworkInfo({
      type: state.type,
      isConnected: state.isConnected,
      strength: state.strength,
      details: state.details,
    });
  };

  const loadOfflineReports = async () => {
    try {
      const reports = await AsyncStorage.getItem('offlineReports');
      if (reports) {
        setOfflineReports(JSON.parse(reports));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des signalements hors ligne:', error);
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Permission de localisation',
          message: 'NetAlerte a besoin de votre position pour améliorer la précision des signalements.',
          buttonNeutral: 'Demander plus tard',
          buttonNegative: 'Annuler',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => resolve(position),
        error => reject(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  };

  const handleReport = async () => {
    if (!selectedOperator || !selectedProblemType) {
      Alert.alert('Erreur', 'Veuillez sélectionner un opérateur et un type de problème');
      return;
    }

    setLoading(true);
    try {
      const hasLocationPermission = await requestLocationPermission();
      let locationData = null;

      if (hasLocationPermission) {
        try {
          const position = await getCurrentLocation();
          locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        } catch (error) {
          console.warn('Erreur de localisation:', error);
        }
      }

      const reportData = {
        operator: selectedOperator,
        problem_type: selectedProblemType,
        signal_strength: networkInfo?.strength || 0,
        network_type: networkInfo?.type || 'unknown',
        ...locationData,
      };

      if (networkInfo?.isConnected) {
        try {
          await axios.post('http://localhost:3000/api/reports', reportData);
          Alert.alert('Succès', 'Signalement envoyé avec succès!');
          setSelectedOperator('');
          setSelectedProblemType('');
        } catch (error) {
          console.error('Erreur lors de l\'envoi du signalement:', error);
          await saveOfflineReport(reportData);
        }
      } else {
        await saveOfflineReport(reportData);
      }
    } catch (error) {
      console.error('Erreur lors du signalement:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du signalement.');
    } finally {
      setLoading(false);
    }
  };

  const saveOfflineReport = async (reportData) => {
    try {
      const newReports = [...offlineReports, { ...reportData, timestamp: new Date().toISOString() }];
      await AsyncStorage.setItem('offlineReports', JSON.stringify(newReports));
      setOfflineReports(newReports);
      Alert.alert('Hors ligne', 'Signalement sauvegardé localement.');
      setSelectedOperator('');
      setSelectedProblemType('');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde hors ligne:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [statsResponse, reportsResponse] = await Promise.all([
        api.get('/reports/stats'),
        api.get('/reports/recent'),
      ]);

      setStats(statsResponse.data.data);
      setRecentReports(reportsResponse.data.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des données');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const renderOperatorModal = () => (
    <Portal>
      <Modal
        visible={showOperatorModal}
        onDismiss={() => setShowOperatorModal(false)}
        contentContainerStyle={styles.modal}
      >
        <ScrollView>
          <RadioButton.Group
            onValueChange={value => {
              setSelectedOperator(value);
              setShowOperatorModal(false);
            }}
            value={selectedOperator}
          >
            {OPERATORS.map(operator => (
              <RadioButton.Item
                key={operator}
                label={operator}
                value={operator}
              />
            ))}
          </RadioButton.Group>
        </ScrollView>
      </Modal>
    </Portal>
  );

  const renderProblemTypeModal = () => (
    <Portal>
      <Modal
        visible={showProblemTypeModal}
        onDismiss={() => setShowProblemTypeModal(false)}
        contentContainerStyle={styles.modal}
      >
        <ScrollView>
          <RadioButton.Group
            onValueChange={value => {
              setSelectedProblemType(value);
              setShowProblemTypeModal(false);
            }}
            value={selectedProblemType}
          >
            {PROBLEM_TYPES.map(type => (
              <RadioButton.Item
                key={type}
                label={type}
                value={type}
              />
            ))}
          </RadioButton.Group>
        </ScrollView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <Title>NetAlerte CM</Title>
                <Paragraph>
                  Signalez rapidement les problèmes de réseau mobile au Cameroun
                </Paragraph>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title>État du réseau</Title>
                <Paragraph>
                  Type: {networkInfo?.type || 'Inconnu'}
                </Paragraph>
                <Paragraph>
                  Force du signal: {networkInfo?.strength || 'N/A'}
                </Paragraph>
                <Paragraph>
                  Opérateur: {networkInfo?.details?.carrier || 'Inconnu'}
                </Paragraph>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title>Sélection</Title>
                <Button
                  mode="outlined"
                  onPress={() => setShowOperatorModal(true)}
                  style={styles.selectionButton}
                >
                  {selectedOperator || 'Sélectionner un opérateur'}
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => setShowProblemTypeModal(true)}
                  style={styles.selectionButton}
                >
                  {selectedProblemType || 'Sélectionner un type de problème'}
                </Button>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title>Statistiques</Title>
                {stats && (
                  <>
                    <Paragraph>Total des signalements: {stats.total}</Paragraph>
                    <Paragraph>
                      En attente: {stats.byStatus?.pending || 0}
                    </Paragraph>
                    <Paragraph>
                      Résolus: {stats.byStatus?.resolved || 0}
                    </Paragraph>
                  </>
                )}
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title>Signalements récents</Title>
                {recentReports.map((report) => (
                  <Card key={report.id} style={styles.reportCard}>
                    <Card.Content>
                      <Title>{report.operator}</Title>
                      <Paragraph>Type: {report.problem_type}</Paragraph>
                      <Paragraph>Statut: {report.status}</Paragraph>
                      <Paragraph>
                        Date: {new Date(report.created_at).toLocaleDateString()}
                      </Paragraph>
                    </Card.Content>
                  </Card>
                ))}
              </Card.Content>
            </Card>

            <Button
              mode="contained"
              onPress={handleReport}
              loading={loading}
              disabled={loading || !selectedOperator || !selectedProblemType}
              style={styles.button}
            >
              Faire un signalement
            </Button>

            {offlineReports.length > 0 && (
              <Card style={styles.card}>
                <Card.Content>
                  <Title>Signalements en attente</Title>
                  <Paragraph>
                    {offlineReports.length} signalement(s) en attente d'envoi
                  </Paragraph>
                </Card.Content>
              </Card>
            )}
          </>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('Report')}
        label="Nouveau signalement"
      />

      {renderOperatorModal()}
      {renderProblemTypeModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  button: {
    marginTop: 16,
    padding: 8,
  },
  selectionButton: {
    marginVertical: 8,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    maxHeight: '80%',
  },
  reportCard: {
    marginVertical: 5,
    backgroundColor: '#fff',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
  error: {
    color: '#B00020',
    textAlign: 'center',
    margin: 20,
  },
});

export default HomeScreen; 