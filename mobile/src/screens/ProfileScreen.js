import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Avatar, List, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log('Erreur lors du chargement des données utilisateur:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      navigation.replace('Login');
    } catch (error) {
      console.log('Erreur lors de la déconnexion:', error);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={user.name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <Divider style={styles.divider} />

      <List.Section>
        <List.Item
          title="Mes signalements"
          left={(props) => <List.Icon {...props} icon="alert-circle" />}
          onPress={() => navigation.navigate('MyReports')}
        />
        <List.Item
          title="Nouveau signalement"
          left={(props) => <List.Icon {...props} icon="plus-circle" />}
          onPress={() => navigation.navigate('Report')}
        />
        <List.Item
          title="Statistiques"
          left={(props) => <List.Icon {...props} icon="chart-bar" />}
          onPress={() => navigation.navigate('Home')}
        />
      </List.Section>

      <Divider style={styles.divider} />

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          Se déconnecter
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
  header: {
    alignItems: 'center',
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  divider: {
    marginVertical: 10,
  },
  buttonContainer: {
    padding: 20,
  },
  logoutButton: {
    borderColor: '#B00020',
  },
});

export default ProfileScreen; 