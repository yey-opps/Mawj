// src/screens/WelcomeScreen.js
// Écran de bienvenue (Splash Screen)

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  // Naviguer automatiquement après 2 secondes (optionnel)
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     navigation.replace('Login');
  //   }, 2000);
  //   return () => clearTimeout(timer);
  // }, []);

  return (
    <View style={styles.container}>
      <View style={styles.contenu}>
        <Text style={styles.logo}>🌊</Text>
        <Text style={styles.titre}>Mawj</Text>
        <Text style={styles.sousTitre}>Conditions Marines en Temps Réel</Text>
        <Text style={styles.description}>
          Votre compagnon pour la pêche au Maroc
        </Text>

        <TouchableOpacity 
          style={styles.bouton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.texteBouton}>Commencer →</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Développé par: Votre Nom & MO.Rihab
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0EA5E9',
    justifyContent: 'space-between',
    padding: 20,
  },
  contenu: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 120,
    marginBottom: 20,
  },
  titre: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  sousTitre: {
    fontSize: 18,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 40,
  },
  bouton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  texteBouton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0EA5E9',
  },
  footer: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.7,
    textAlign: 'center',
    paddingBottom: 20,
  },
});
