// ========================================
// FICHIER: src/screens/JournalScreen.js
// SANS EMOJI (TEXTE SIMPLE)
// ========================================

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import { getSorties, ajouterSortie, supprimerSortie, getStatistiques } from '../services/database';
import { VILLES_MAROC } from '../services/api';

export default function JournalScreen() {
    const { user } = useApp();
    const [sorties, setSorties] = useState([]);
    const [stats, setStats] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [nouvelleSortie, setNouvelleSortie] = useState({
        date: new Date().toISOString().split('T')[0],
        ville: 'casablanca',
        heureDebut: '',
        heureFin: '',
        poissonsAttrapes: '',
        notes: ''
    });

    useEffect(() => {
        if (user) {
            chargerDonnees();
        }
    }, [user]);

    const chargerDonnees = async () => {
        try {
            const sortiesData = await getSorties(user.id);
            setSorties(sortiesData);

            const statsData = await getStatistiques(user.id);
            setStats(statsData);
        } catch (err) {
            console.error('Erreur chargement journal:', err);
        }
    };

    const handleAjouterSortie = async () => {
        if (!nouvelleSortie.heureDebut) {
            Alert.alert('Erreur', 'Veuillez entrer l\'heure de debut');
            return;
        }

        try {
            await ajouterSortie(user.id, {
                date: nouvelleSortie.date,
                ville: nouvelleSortie.ville,
                heureDebut: nouvelleSortie.heureDebut,
                heureFin: nouvelleSortie.heureFin || null,
                vagues: 0,
                vent: 0,
                temperature: 0,
                poissonsAttrapes: nouvelleSortie.poissonsAttrapes,
                notes: nouvelleSortie.notes
            });

            setModalVisible(false);
            setNouvelleSortie({
                date: new Date().toISOString().split('T')[0],
                ville: 'casablanca',
                heureDebut: '',
                heureFin: '',
                poissonsAttrapes: '',
                notes: ''
            });

            chargerDonnees();
            Alert.alert('Succes', 'Sortie ajoutee au journal!');
        } catch (err) {
            Alert.alert('Erreur', 'Impossible d\'ajouter la sortie');
            console.error(err);
        }
    };

    const handleSupprimerSortie = (sortieId) => {
        Alert.alert(
            'Supprimer',
            'Voulez-vous vraiment supprimer cette sortie?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await supprimerSortie(sortieId);
                            chargerDonnees();
                        } catch (err) {
                            console.error(err);
                        }
                    }
                }
            ]
        );
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <View style={styles.entete}>
                    <Text style={styles.titre}>Journal de Peche</Text>
                </View>
                <View style={styles.centrer}>
                    <Text style={styles.texteCentre}>Connectez-vous pour acceder au journal</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.entete}>
                <Text style={styles.titre}>Journal de Peche</Text>
                <Text style={styles.sousTitre}>Mes sorties et prises</Text>
            </View>

            <ScrollView style={styles.contenu}>
                {stats && (
                    <View style={styles.carteStats}>
                        <Text style={styles.titreStats}>Mes Statistiques</Text>
                        <View style={styles.statsGrid}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValeur}>{stats.totalSorties}</Text>
                                <Text style={styles.statLabel}>Sorties</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statValeur}>{stats.totalPoissons}</Text>
                                <Text style={styles.statLabel}>Poissons</Text>
                            </View>
                            {stats.villeFavorite && (
                                <View style={styles.statItem}>
                                    <Text style={styles.statValeur}>TOP</Text>
                                    <Text style={styles.statLabel}>{stats.villeFavorite.ville}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                <TouchableOpacity
                    style={styles.boutonAjouter}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.texteBoutonAjouter}>+ Nouvelle Sortie</Text>
                </TouchableOpacity>

                <View style={styles.section}>
                    <Text style={styles.titreSection}>Mes Sorties Recentes</Text>

                    {sorties.length === 0 ? (
                        <View style={styles.aucuneSortie}>
                            <Text style={styles.texteAucuneSortie}>Aucune sortie enregistree</Text>
                            <Text style={styles.texteAucuneSortieDetail}>
                                Ajoutez votre premiere sortie de peche!
                            </Text>
                        </View>
                    ) : (
                        sorties.map((sortie) => (
                            <View key={sortie.id} style={styles.carteSortie}>
                                <View style={styles.sortieHeader}>
                                    <View style={styles.sortieInfo}>
                                        <Text style={styles.sortieDate}>
                                            {new Date(sortie.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </Text>
                                        <Text style={styles.sortieVille}>
                                            {VILLES_MAROC[sortie.ville]?.nom || sortie.ville}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleSupprimerSortie(sortie.id)}
                                        style={styles.boutonSupprimer}
                                    >
                                        <Text style={styles.texteSupprimer}>Supprimer</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.sortieDetails}>
                                    <Text style={styles.sortieHeure}>
                                        {sortie.heure_debut}{sortie.heure_fin && ` - ${sortie.heure_fin}`}
                                    </Text>
                                </View>

                                {sortie.poissons_attrapes && (
                                    <View style={styles.poissonsBadge}>
                                        <Text style={styles.poissonsIcone}>POISSONS:</Text>
                                        <Text style={styles.poissonsTexte}>{sortie.poissons_attrapes}</Text>
                                    </View>
                                )}

                                {sortie.notes && (
                                    <Text style={styles.sortieNotes}>{sortie.notes}</Text>
                                )}
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <ScrollView contentContainerStyle={styles.scrollModal}>
                        <View style={styles.modalContenu}>
                            <Text style={styles.modalTitre}>Nouvelle Sortie</Text>

                            <Text style={styles.label}>Date:</Text>
                            <TextInput
                                style={styles.input}
                                value={nouvelleSortie.date}
                                onChangeText={(text) => setNouvelleSortie({ ...nouvelleSortie, date: text })}
                                placeholder="YYYY-MM-DD"
                            />

                            <Text style={styles.label}>Heure debut: *</Text>
                            <TextInput
                                style={styles.input}
                                value={nouvelleSortie.heureDebut}
                                onChangeText={(text) => setNouvelleSortie({ ...nouvelleSortie, heureDebut: text })}
                                placeholder="06:00"
                            />

                            <Text style={styles.label}>Heure fin:</Text>
                            <TextInput
                                style={styles.input}
                                value={nouvelleSortie.heureFin}
                                onChangeText={(text) => setNouvelleSortie({ ...nouvelleSortie, heureFin: text })}
                                placeholder="12:00"
                            />

                            <Text style={styles.label}>Poissons attrapes:</Text>
                            <TextInput
                                style={styles.input}
                                value={nouvelleSortie.poissonsAttrapes}
                                onChangeText={(text) => setNouvelleSortie({ ...nouvelleSortie, poissonsAttrapes: text })}
                                placeholder="Ex: 3 sardines, 1 dorade"
                            />

                            <Text style={styles.label}>Notes:</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={nouvelleSortie.notes}
                                onChangeText={(text) => setNouvelleSortie({ ...nouvelleSortie, notes: text })}
                                placeholder="Notes de la sortie..."
                                multiline
                                numberOfLines={3}
                            />

                            <View style={styles.modalBoutons}>
                                <TouchableOpacity
                                    style={[styles.modalBouton, styles.boutonAnnuler]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.texteBoutonAnnuler}>Annuler</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalBouton, styles.boutonValider]}
                                    onPress={handleAjouterSortie}
                                >
                                    <Text style={styles.texteBoutonValider}>Ajouter</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F9FF' },
    centrer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    texteCentre: { fontSize: 16, color: '#64748B', textAlign: 'center' },
    entete: { padding: 20, paddingTop: 60, backgroundColor: '#0EA5E9' },
    titre: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
    sousTitre: { fontSize: 14, color: '#FFF', opacity: 0.9 },
    contenu: { flex: 1 },
    carteStats: { margin: 20, padding: 20, backgroundColor: '#FFF', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    titreStats: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
    statItem: { alignItems: 'center' },
    statValeur: { fontSize: 32, fontWeight: 'bold', color: '#0EA5E9', marginBottom: 4 },
    statLabel: { fontSize: 13, color: '#64748B' },
    boutonAjouter: { marginHorizontal: 20, marginBottom: 20, padding: 16, backgroundColor: '#0EA5E9', borderRadius: 12, alignItems: 'center' },
    texteBoutonAjouter: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
    section: { paddingHorizontal: 20, marginBottom: 20 },
    titreSection: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
    aucuneSortie: { backgroundColor: '#FFF', padding: 40, borderRadius: 12, alignItems: 'center' },
    texteAucuneSortie: { fontSize: 16, fontWeight: '600', color: '#64748B', marginBottom: 8 },
    texteAucuneSortieDetail: { fontSize: 14, color: '#94A3B8' },
    carteSortie: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
    sortieHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    sortieInfo: { flex: 1 },
    sortieDate: { fontSize: 15, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
    sortieVille: { fontSize: 13, color: '#64748B' },
    boutonSupprimer: { padding: 8, backgroundColor: '#FEE2E2', borderRadius: 6 },
    texteSupprimer: { fontSize: 12, color: '#EF4444', fontWeight: '600' },
    sortieDetails: { marginBottom: 8 },
    sortieHeure: { fontSize: 13, color: '#475569' },
    poissonsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DBEAFE', padding: 10, borderRadius: 8, marginTop: 8 },
    poissonsIcone: { fontSize: 12, fontWeight: 'bold', color: '#1E40AF', marginRight: 8 },
    poissonsTexte: { fontSize: 14, color: '#1E40AF', fontWeight: '600', flex: 1 },
    sortieNotes: { fontSize: 13, color: '#64748B', fontStyle: 'italic', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 6, marginTop: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' },
    scrollModal: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    modalContenu: { backgroundColor: '#FFF', borderRadius: 16, padding: 20 },
    modalTitre: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 8, marginTop: 12 },
    input: { backgroundColor: '#F1F5F9', padding: 12, borderRadius: 8, fontSize: 15, color: '#1E293B' },
    textArea: { height: 80, textAlignVertical: 'top' },
    modalBoutons: { flexDirection: 'row', gap: 12, marginTop: 20 },
    modalBouton: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
    boutonAnnuler: { backgroundColor: '#F1F5F9' },
    texteBoutonAnnuler: { fontSize: 15, fontWeight: '600', color: '#64748B' },
    boutonValider: { backgroundColor: '#0EA5E9' },
    texteBoutonValider: { fontSize: 15, fontWeight: '600', color: '#FFF' },
});