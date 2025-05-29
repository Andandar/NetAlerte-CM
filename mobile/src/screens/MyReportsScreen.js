import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Chip, Text } from 'react-native-paper';
import api from '../config/api';

const STATUS_COLORS = {
  pending: '#FFC107',
  in_progress: '#2196F3',
  resolved: '#4CAF50',
  rejected: '#F44336',
};

const STATUS_LABELS = {
  pending: 'En attente',
  in_progress: 'En cours',
  resolved: 'Résolu',
  rejected: 'Rejeté',
};

const MyReportsScreen = () => {
  const [reports, setReports] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports/my-reports');
      setReports(response.data.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des signalements');
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : reports.length === 0 ? (
        <Text style={styles.emptyText}>Aucun signalement</Text>
      ) : (
        reports.map((report) => (
          <Card key={report.id} style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <Title>{report.operator}</Title>
                <Chip
                  mode="outlined"
                  style={[
                    styles.statusChip,
                    { borderColor: STATUS_COLORS[report.status] },
                  ]}
                  textStyle={{ color: STATUS_COLORS[report.status] }}
                >
                  {STATUS_LABELS[report.status]}
                </Chip>
              </View>

              <Paragraph style={styles.type}>
                Type: {report.problem_type}
              </Paragraph>

              {report.description && (
                <Paragraph style={styles.description}>
                  {report.description}
                </Paragraph>
              )}

              {report.resolution_notes && (
                <Paragraph style={styles.resolution}>
                  Résolution: {report.resolution_notes}
                </Paragraph>
              )}

              <Paragraph style={styles.date}>
                Date: {new Date(report.created_at).toLocaleDateString()}
              </Paragraph>
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 10,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusChip: {
    height: 24,
  },
  type: {
    fontSize: 16,
    marginBottom: 5,
  },
  description: {
    marginTop: 10,
    color: '#666',
  },
  resolution: {
    marginTop: 10,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  date: {
    marginTop: 10,
    fontSize: 12,
    color: '#999',
  },
  error: {
    color: '#B00020',
    textAlign: 'center',
    margin: 20,
  },
  emptyText: {
    textAlign: 'center',
    margin: 20,
    color: '#666',
  },
});

export default MyReportsScreen; 