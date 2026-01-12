// ========================================
// FICHIER: src/context/AppContext.js
// AVEC ASYNCSTORAGE - SE SOUVENIR
// ========================================

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initDatabase } from '../services/database';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [villeActuelle, setVilleActuelle] = useState('casablanca');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        initialiserApp();
    }, []);

    const initialiserApp = async () => {
        try {
            // Initialiser SQLite
            await initDatabase();
            console.log('✅ Base de données initialisée');

            // Récupérer l'utilisateur sauvegardé
            const userSauvegarde = await AsyncStorage.getItem('user');
            if (userSauvegarde) {
                setUser(JSON.parse(userSauvegarde));
                console.log('✅ Utilisateur récupéré');
            }

            setLoading(false);
        } catch (error) {
            console.error('❌ Erreur initialisation:', error);
            setLoading(false);
        }
    };

    // Fonction pour sauvegarder l'utilisateur
    const sauvegarderUser = async (userData) => {
        try {
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            console.log('✅ Utilisateur sauvegardé');
        } catch (error) {
            console.error('❌ Erreur sauvegarde user:', error);
        }
    };

    // Fonction pour déconnexion
    const deconnecterUser = async () => {
        try {
            await AsyncStorage.removeItem('user');
            setUser(null);
            console.log('✅ Utilisateur déconnecté');
        } catch (error) {
            console.error('❌ Erreur déconnexion:', error);
        }
    };

    const value = {
        user,
        setUser: sauvegarderUser,
        deconnecterUser,
        villeActuelle,
        setVilleActuelle,
        loading
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp doit être utilisé dans AppProvider');
    }
    return context;
};