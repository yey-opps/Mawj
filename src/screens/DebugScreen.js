// ========================================
// FICHIER: src/screens/DebugScreen.js
// ÉCRAN DEBUG - VISUALISER LA BASE DE DONNÉES
// ========================================

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('mawj.db');

export default function DebugScreen({ navigation }) {
    const [users, setUsers] = useState([]);
    const [sorties, setSorties] = useState([]);
    const [prises, setPrises] = useState([]);
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        chargerDonnees();
    }, []);

    const chargerDonnees = async () => {
        try {
            const usersData = await db.getAllAsync('SELECT * FROM users');
            const sortiesData = await db.getAllAsync('SELECT * FROM sorties_peche');
            const prisesData = await db.getAllAsync('SELECT * FROM prises');
            const favoritesData = await db.getAllAsync('SELECT * FROM villes_favorites');

            setUsers(usersData);
            setSorties(sortiesData);
            setPrises(prisesData);
            setFavorites(favoritesData);
        } catch (error) {
            console.error('Erreur chargement DB:', error);
        }
    };

    const effacerDB = () => {
        Alert.alert(
            'Attention!',
            'Voulez-vous vraiment effacer TOUTE la base de données?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Effacer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await db.execAsync('DELETE FROM users');
                            await db.execAsync('DELETE FROM sorties_peche');
                            await db.execAsync('DELETE FROM prises');
                            await db.execAsync('DELETE FROM villes_favorites');

                            Alert.alert('Succès', 'Base de données effacée!');
                            chargerDonnees();
                        } catch (error) {
                            Alert.alert('Erreur', 'Impossible d\'effacer la DB');
                            console.error(error);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* En-tête */}
            <View style={styles.entete}>
                <TouchableOpacity
                    style={styles.boutonRetour}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.texteRetour}>? Retour</Text>
                </TouchableOpacity>
                <Text style={styles.titre}>Debug Base de Données</Text>
            </View>

            <ScrollView style={styles.contenu}>
                {/* Statistiques générales */}
                <View style={styles.section}>
                    <Text style={styles.titreSection}>Statistiques Générales</Text>
                    <View style={styles.carte}>
                        <View style={styles.stat}>
                            <Text style={styles.statLabel}>Utilisateurs:</Text>
                            <Text style={styles.statValeur}>{users.length}</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={styles.statLabel}>Sorties:</Text>
                            <Text style={styles.statValeur}>{sorties.length}</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={styles.statLabel}>Prises:</Text>
                            <Text style={styles.statValeur}>{prises.length}</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={styles.statLabel}>Villes favorites:</Text>
                            <Text style={styles.statValeur}>{favorites.length}</Text>
                        </View>
                    </View>
                </View>

                {/* Utilisateurs */}
                <View style={styles.section}>
                    <Text style={styles.titreSection}>Utilisateurs ({users.length})</Text>
                    {users.map((user, index) => (
                        <View key={index} style={styles.carte}>
                            <Text style={styles.itemTitre}>ID: {user.id}</Text>
                            <Text style={styles.itemTexte}>Nom: {user.nom}</Text>
                            <Text style={styles.itemTexte}>Email: {user.email}</Text>
                            <Text style={styles.itemTexte}>Ville: {user.ville_defaut}</Text>
                            <Text style={styles.itemTexte}>Créé: {user.date_creation}</Text>
                        </View>
                    ))}
                </View>

                {/* Sorties */}
                <View style={styles.section}>
                    <Text style={styles.titreSection}>Sorties de Pêche ({sorties.length})</Text>
                    {sorties.map((sortie, index) => (
                        <View key={index} style={styles.carte}>
                            <Text style={styles.itemTitre}>ID: {sortie.id} (User {sortie.user_id})</Text>
                            <Text style={styles.itemTexte}>Date: {sortie.date}</Text>
                            <Text style={styles.itemTexte}>Ville: {sortie.ville}</Text>
                            <Text style={styles.itemTexte}>Heures: {sortie.heure_debut} - {sortie.heure_fin || 'N/A'}</Text>
                            {sortie.notes && <Text style={styles.itemTexte}>Notes: {sortie.notes}</Text>}
                        </View>
                    ))}
                </View>

                {/* Prises */}
                <View style={styles.section}>
                    <Text style={styles.titreSection}>Prises ({prises.length})</Text>
                    {prises.map((prise, index) => (
                        <View key={index} style={styles.carte}>
                            <Text style={styles.itemTitre}>ID: {prise.id} (Sortie {prise.sortie_id})</Text>
                            <Text style={styles.itemTexte}>Poisson: {prise.poisson}</Text>
                            <Text style={styles.itemTexte}>Quantité: {prise.quantite}</Text>
                            {prise.taille && <Text style={styles.itemTexte}>Taille: {prise.taille}cm</Text>}
                            {prise.poids && <Text style={styles.itemTexte}>Poids: {prise.poids}kg</Text>}
                        </View>
                    ))}
                </View>

                {/* Villes favorites */}
                <View style={styles.section}>
                    <Text style={styles.titreSection}>Villes Favorites ({favorites.length})</Text>
                    {favorites.map((fav, index) => (
                        <View key={index} style={styles.carte}>
                            <Text style={styles.itemTexte}>User {fav.user_id}: {fav.ville_code}</Text>
                        </View>
                    ))}
                </View>

                {/* Boutons d'action */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.boutonRafraichir}
                        onPress={chargerDonnees}
                    >
                        <Text style={styles.texteBouton}>Rafraîchir</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.boutonEffacer}
                        onPress={effacerDB}
                    >
                        <Text style={styles.texteBouton}>Effacer toute la DB</Text>
                    </TouchableOpacity>
                </View>

                {/* Instructions export */}
                <View style={styles.section}>
                    <View style={styles.carteInfo}>
                        <Text style={styles.infoTitre}>Exporter la base de données</Text>
                        <Text style={styles.infoTexte}>
                            Pour visualiser avec DB Browser for SQLite:
                        </Text>
                        <Text style={styles.infoTexte}>
                            1. Fichier DB: mawj.db{'\n'}
                            2. Emplacement sur Android: /data/data/[app]/databases/{'\n'}
                            3. Emplacement sur iOS: App Container/Documents/{'\n'}
                            4. Nécessite root/jailbreak ou adb pour extraire
                        </Text>
                    </View>
                </View>

                <View style={styles.espaceFin} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F9FF' },
    entete: { padding: 20, paddingTop: 60, backgroundColor: '#8B5CF6' },
    boutonRetour: { marginBottom: 12 },
    texteRetour: { fontSize: 16, color: '#FFF', fontWeight: '600' },
    titre: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
    contenu: { flex: 1 },

    section: { padding: 20, paddingBottom: 0 },
    titreSection: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },

    carte: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },

    stat: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    statLabel: { fontSize: 14, color: '#64748B' },
    statValeur: { fontSize: 14, fontWeight: 'bold', color: '#8B5CF6' },

    itemTitre: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
    itemTexte: { fontSize: 13, color: '#64748B', marginBottom: 4 },

    boutonRafraichir: { backgroundColor: '#10B981', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
    boutonEffacer: { backgroundColor: '#EF4444', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
    texteBouton: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },

    carteInfo: { backgroundColor: '#FEF3C7', padding: 16, borderRadius: 12, marginBottom: 12 },
    infoTitre: { fontSize: 16, fontWeight: 'bold', color: '#92400E', marginBottom: 8 },
    infoTexte: { fontSize: 13, color: '#78350F', lineHeight: 20, marginBottom: 8 },

    espaceFin: { height: 40 },
});