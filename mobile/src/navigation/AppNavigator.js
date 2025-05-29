import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ReportScreen from '../screens/ReportScreen';
import MyReportsScreen from '../screens/MyReportsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ title: 'Inscription' }}
      />
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'NetAlerte' }}
      />
      <Stack.Screen 
        name="Report" 
        component={ReportScreen} 
        options={{ title: 'Nouveau Signalement' }}
      />
      <Stack.Screen 
        name="MyReports" 
        component={MyReportsScreen} 
        options={{ title: 'Mes Signalements' }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Mon Profil' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator; 