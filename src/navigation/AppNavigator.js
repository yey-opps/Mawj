// ========================================
// FICHIER: src/navigation/AppNavigator.js
// NAVIGATION AVEC LOGIN/REGISTER SÉPARÉS
// ========================================

import React from 'react';
import { Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useApp } from '../context/AppContext';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ForecastScreen from '../screens/ForecastScreen';
import FishScreen from '../screens/FishScreen';
import JournalScreen from '../screens/JournalScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#0EA5E9',
                tabBarInactiveTintColor: '#94A3B8',
                tabBarStyle: {
                    backgroundColor: '#FFF',
                    borderTopWidth: 1,
                    borderTopColor: '#E2E8F0',
                    height: 65,
                    paddingBottom: 10,
                    paddingTop: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Accueil',
                    tabBarIcon: () => <TabIcon>🏠</TabIcon>,
                }}
            />
            <Tab.Screen
                name="Forecast"
                component={ForecastScreen}
                options={{
                    title: 'Prévisions',
                    tabBarIcon: () => <TabIcon>📅</TabIcon>,
                }}
            />
            <Tab.Screen
                name="Fish"
                component={FishScreen}
                options={{
                    title: 'Poissons',
                    tabBarIcon: () => <TabIcon>🐟</TabIcon>,
                }}
            />
            <Tab.Screen
                name="Journal"
                component={JournalScreen}
                options={{
                    title: 'Journal',
                    tabBarIcon: () => <TabIcon>📓</TabIcon>,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'Profil',
                    tabBarIcon: () => <TabIcon>👤</TabIcon>,
                }}
            />
        </Tab.Navigator>
    );
}

function TabIcon({ children }) {
    return <Text style={{ fontSize: 24 }}>{children}</Text>;
}

export default function AppNavigator() {
    const { user, loading } = useApp();

    if (loading) return null;

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user === null ? (
                <>
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </>
            ) : (
                <Stack.Screen name="Main" component={TabNavigator} />
            )}
        </Stack.Navigator>
    );
}