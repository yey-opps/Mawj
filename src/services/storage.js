// src/services/storage.js
// Service de gestion du stockage local (AsyncStorage = Base de données)

import AsyncStorage from '@react-native-async-storage/async-storage';

// Clés de stockage
const KEYS = {
  USER: '@mawj_user',
  FAVORITES: '@mawj_favorites',
  HISTORY: '@mawj_history',
  SETTINGS: '@mawj_settings',
};

/**
 * GESTION UTILISATEUR
 */

// Sauvegarder les infos utilisateur
export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    return true;
  } catch (error) {
    console.error('Erreur save user:', error);
    return false;
  }
};

// Récupérer les infos utilisateur
export const getUser = async () => {
  try {
    const user = await AsyncStorage.getItem(KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Erreur get user:', error);
    return null;
  }
};

// Déconnexion (supprimer utilisateur)
export const removeUser = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.USER);
    return true;
  } catch (error) {
    console.error('Erreur remove user:', error);
    return false;
  }
};

/**
 * GESTION VILLES FAVORITES
 */

// Récupérer les villes favorites
export const getFavorites = async () => {
  try {
    const favorites = await AsyncStorage.getItem(KEYS.FAVORITES);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Erreur get favorites:', error);
    return [];
  }
};

// Ajouter une ville aux favorites
export const addFavorite = async (ville) => {
  try {
    const favorites = await getFavorites();
    if (!favorites.includes(ville)) {
      favorites.push(ville);
      await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
    }
    return true;
  } catch (error) {
    console.error('Erreur add favorite:', error);
    return false;
  }
};

// Retirer une ville des favorites
export const removeFavorite = async (ville) => {
  try {
    const favorites = await getFavorites();
    const newFavorites = favorites.filter(f => f !== ville);
    await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(newFavorites));
    return true;
  } catch (error) {
    console.error('Erreur remove favorite:', error);
    return false;
  }
};

/**
 * GESTION HISTORIQUE
 */

// Récupérer l'historique
export const getHistory = async () => {
  try {
    const history = await AsyncStorage.getItem(KEYS.HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Erreur get history:', error);
    return [];
  }
};

// Ajouter une entrée à l'historique
export const addToHistory = async (entry) => {
  try {
    const history = await getHistory();
    // Garder seulement les 30 dernières entrées
    const newHistory = [entry, ...history].slice(0, 30);
    await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(newHistory));
    return true;
  } catch (error) {
    console.error('Erreur add history:', error);
    return false;
  }
};

// Effacer l'historique
export const clearHistory = async () => {
  try {
    await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify([]));
    return true;
  } catch (error) {
    console.error('Erreur clear history:', error);
    return false;
  }
};

/**
 * GESTION PARAMÈTRES
 */

// Paramètres par défaut
const DEFAULT_SETTINGS = {
  theme: 'clair',
  notifications: true,
  langue: 'fr',
  uniteTemp: 'celsius',
  uniteVent: 'kmh',
  uniteVagues: 'metres',
};

// Récupérer les paramètres
export const getSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Erreur get settings:', error);
    return DEFAULT_SETTINGS;
  }
};

// Sauvegarder les paramètres
export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Erreur save settings:', error);
    return false;
  }
};

// Mettre à jour un paramètre spécifique
export const updateSetting = async (key, value) => {
  try {
    const settings = await getSettings();
    settings[key] = value;
    await saveSettings(settings);
    return true;
  } catch (error) {
    console.error('Erreur update setting:', error);
    return false;
  }
};

/**
 * UTILITAIRES
 */

// Effacer toutes les données
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([
      KEYS.USER,
      KEYS.FAVORITES,
      KEYS.HISTORY,
      KEYS.SETTINGS,
    ]);
    return true;
  } catch (error) {
    console.error('Erreur clear all:', error);
    return false;
  }
};

// Vérifier si première utilisation
export const isFirstLaunch = async () => {
  try {
    const user = await getUser();
    return user === null;
  } catch (error) {
    return true;
  }
};
