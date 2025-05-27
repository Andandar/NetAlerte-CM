import React from 'react';
import { View, StyleSheet, Image, Linking, TouchableOpacity } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

const SplashScreen = ({ navigation }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {/* Remplacez par votre logo si besoin */}
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>NetAlerte CM</Text>
        <Text style={styles.slogan}>
          Signalez les problèmes de réseau, aidez à améliorer la qualité
        </Text>
      </View>
      <Button
        mode="contained"
        onPress={() => navigation.replace('Report')}
        style={styles.button}
        labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
        contentStyle={{ paddingVertical: 6 }}
      >
        COMMENCER
      </Button>
      <View style={styles.linksContainer}>
        <TouchableOpacity onPress={() => Linking.openURL('https://votre-cgu.com')}>
          <Text style={styles.link}>Conditions Générales à Utilisation</Text>
        </TouchableOpacity>
        <Text style={{ color: '#aaa', marginHorizontal: 8 }}>|</Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://votre-confidentialite.com')}>
          <Text style={styles.link}>Politique de confidentialité</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  slogan: {
    color: '#e0e7ef',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  button: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: '#fff',
    marginBottom: 32,
  },
  linksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    justifyContent: 'center',
  },
  link: {
    color: '#fff',
    textDecorationLine: 'underline',
    fontSize: 13,
  },
});

export default SplashScreen; 