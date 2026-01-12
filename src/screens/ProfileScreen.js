// ========================================
// FICHIER: src/screens/ProfileScreen.js
// AVEC DECONNEXION QUI EFFACE ASYNCSTORAGE
// ========================================

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';
import { useApp } from '../context/AppContext';
import { VILLES_MAROC, LISTE_VILLES_PAR_REGION } from '../services/api';
import { exportAllData, getAllUsersForExport } from '../services/database';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('mawj.db');

export default function ProfileScreen({ navigation }) {
    const { user, deconnecterUser, villeActuelle, setVilleActuelle } = useApp();
    const [exporting, setExporting] = useState(false);

    const handleDeconnexion = () => {
        Alert.alert(
            'Deconnexion',
            'Voulez-vous vraiment vous deconnecter?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Deconnexion',
                    style: 'destructive',
                    onPress: () => deconnecterUser()
                }
            ]
        );
    };

    const handleExportData = async () => {
        if (!user) return;

        setExporting(true);
        try {
            const data = await exportAllData(user.id);

            let exportText = `=== MAWJ - EXPORT DONNEES ===\n\n`;
            exportText += `Utilisateur: ${data.user.nom}\n`;
            exportText += `Email: ${data.user.email}\n`;
            exportText += `Date export: ${new Date(data.exportDate).toLocaleString('fr-FR')}\n\n`;

            exportText += `--- STATISTIQUES ---\n`;
            exportText += `Sorties: ${data.stats.totalSorties}\n`;
            exportText += `Poissons: ${data.stats.totalPoissons}\n\n`;

            exportText += `--- SORTIES DE PECHE (${data.sorties.length}) ---\n`;
            data.sorties.forEach((sortie, i) => {
                exportText += `\n${i + 1}. ${sortie.date} - ${sortie.ville}\n`;
                exportText += `   Heures: ${sortie.heure_debut}`;
                if (sortie.heure_fin) exportText += ` - ${sortie.heure_fin}`;
                exportText += `\n`;
                if (sortie.poissons_attrapes) exportText += `   Poissons: ${sortie.poissons_attrapes}\n`;
                if (sortie.notes) exportText += `   Notes: ${sortie.notes}\n`;
            });

            await Share.share({
                message: exportText,
                title: 'Export Mawj'
            });

            Alert.alert('Succes', 'Donnees exportees!');
        } catch (error) {
            console.error('Erreur export:', error);
            Alert.alert('Erreur', 'Impossible d\'exporter les donnees');
        } finally {
            setExporting(false);
        }
    };

    const voirBaseDeDonnees = async () => {
        try {
            const users = await db.getAllAsync('SELECT * FROM users');
            const sorties = await db.getAllAsync('SELECT * FROM sorties_peche');

            let dbText = `=== BASE DE DONNEES ===\n\n`;
            dbText += `UTILISATEURS (${users.length}):\n`;
            users.forEach(u => {
                dbText += `- ${u.nom} (${u.email})\n`;
            });

            dbText += `\nSORTIES (${sorties.length}):\n`;
            sorties.forEach(s => {
                dbText += `- ${s.date} a ${s.ville}\n`;
            });

            Alert.alert('Base de Donnees', dbText);
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de lire la DB');
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.entete}>
                <Text style={styles.titre}>Profil</Text>
                <Text style={styles.sousTitre}>Parametres de l'application</Text>
            </View>

            <ScrollView style={styles.contenu}>
                {user && (
                    <View style={styles.section}>
                        <Text style={styles.titreSection}>Bienvenue</Text>
                        <View style={styles.carteInfo}>
                            <Text style={styles.infoNom}>{user.nom}</Text>
                            <Text style={styles.infoEmail}>{user.email}</Text>
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.titreSection}>Ville ({VILLES_MAROC[villeActuelle]?.cote})</Text>

                    {Object.entries(LISTE_VILLES_PAR_REGION).map(([region, villesCodes]) => (
                        <View key={region}>
                            <Text style={styles.titreRegion}>{region}</Text>
                            <View style={styles.carteVilles}>
                                {villesCodes.map((villeCode) => {
                                    const ville = VILLES_MAROC[villeCode];
                                    if (!ville) return null;

                                    return (
                                        <TouchableOpacity
                                            key={villeCode}
                                            style={[
                                                styles.optionVille,
                                                villeActuelle === villeCode && styles.villeActive
                                            ]}
                                            onPress={() => setVilleActuelle(villeCode)}
                                        >
                                            <Text style={[
                                                styles.textVille,
                                                villeActuelle === villeCode && styles.textVilleActive
                                            ]}>
                                                {ville.nom}
                                            </Text>
                                            {villeActuelle === villeCode && (
                                                <Text style={styles.checkmark}>✓</Text>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.titreSection}>A propos</Text>
                    <View style={styles.carteApropos}>
                        <Text style={styles.aproposTitre}>MAWJ - Vagues</Text>
                        <Text style={styles.aproposVersion}>Version 1.0.0</Text>
                        <Text style={styles.aproposTexte}>
                            Application de conditions marines en temps reel pour les cotes marocaines.
                        </Text>
                        <Text style={[styles.aproposTexte, { marginTop: 8 }]}>
                            Donnees: Open-Meteo API • 27 villes cotieres
                        </Text>
                    </View>
                </View>

                {user && (
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={styles.boutonDebug}
                            onPress={voirBaseDeDonnees}
                        >
                            <Text style={styles.texteBoutonDebug}>Voir Base de Donnees</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.boutonExport}
                            onPress={handleExportData}
                            disabled={exporting}
                        >
                            <Text style={styles.texteBoutonExport}>
                                {exporting ? 'Export en cours...' : 'Exporter mes donnees'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.boutonDeconnexion}
                            onPress={handleDeconnexion}
                        >
                            <Text style={styles.texteBoutonDeconnexion}>Deconnexion</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.espaceFin} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F9FF' },
    entete: { padding: 20, paddingTop: 60, backgroundColor: '#0EA5E9' },
    titre: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
    sousTitre: { fontSize: 14, color: '#FFF', opacity: 0.9 },
    contenu: { flex: 1 },
    section: { padding: 16, paddingBottom: 8 },
    titreSection: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
    titreRegion: { fontSize: 14, fontWeight: '600', color: '#0EA5E9', marginTop: 12, marginBottom: 8, paddingHorizontal: 4 },
    carteInfo: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, marginBottom: 8 },
    infoNom: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
    infoEmail: { fontSize: 14, color: '#64748B' },
    carteVilles: { backgroundColor: '#FFF', borderRadius: 12, padding: 8, marginBottom: 12 },
    optionVille: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 8 },
    villeActive: { backgroundColor: '#E0F2FE' },
    textVille: { fontSize: 16, color: '#1E293B' },
    textVilleActive: { color: '#0EA5E9', fontWeight: '600' },
    checkmark: { fontSize: 18, color: '#0EA5E9', fontWeight: 'bold' },
    carteApropos: { backgroundColor: '#FFF', padding: 20, borderRadius: 12 },
    aproposTitre: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
    aproposVersion: { fontSize: 13, color: '#64748B', marginBottom: 12 },
    aproposTexte: { fontSize: 14, color: '#64748B', lineHeight: 20 },
    boutonDebug: { backgroundColor: '#8B5CF6', padding: 16, borderRadius: 12, marginBottom: 12 },
    texteBoutonDebug: { fontSize: 16, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
    boutonExport: { backgroundColor: '#10B981', padding: 16, borderRadius: 12, marginBottom: 12 },
    texteBoutonExport: { fontSize: 16, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
    boutonDeconnexion: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#EF4444' },
    texteBoutonDeconnexion: { fontSize: 16, fontWeight: 'bold', color: '#EF4444', textAlign: 'center' },
    espaceFin: { height: 60 },
});