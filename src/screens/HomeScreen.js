// ========================================
// FICHIER: src/screens/HomeScreen.js
// ACCUEIL AVEC EVOLUTION 24H
// ========================================

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { getDonneesCompletes, VILLES_MAROC } from '../services/api';
import { obtenirPoissonsDisponibles } from '../data/poissons';
import { useApp } from '../context/AppContext';

export default function HomeScreen() {
    const { villeActuelle } = useApp();
    const [donnees, setDonnees] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [rafraichissement, setRafraichissement] = useState(false);

    const chargerDonnees = async () => {
        try {
            const ville = VILLES_MAROC[villeActuelle] || VILLES_MAROC.casablanca;
            const data = await getDonneesCompletes(ville.latitude, ville.longitude);
            setDonnees(data);
        } catch (err) {
            console.error(err);
        } finally {
            setChargement(false);
            setRafraichissement(false);
        }
    };

    useEffect(() => {
        chargerDonnees();
    }, [villeActuelle]);

    if (chargement) {
        return (
            <View style={styles.centrer}>
                <ActivityIndicator size="large" color="#0EA5E9" />
            </View>
        );
    }

    const { actuel, soleil, marees, evolution } = donnees;
    const ville = VILLES_MAROC[villeActuelle] || VILLES_MAROC.casablanca;

    const calculerVerdict = () => {
        let score = 100;

        if (actuel.vagues > 3) score -= 50;
        else if (actuel.vagues > 2) score -= 30;
        else if (actuel.vagues > 1.5) score -= 15;

        if (actuel.vent > 35) score -= 40;
        else if (actuel.vent > 25) score -= 25;
        else if (actuel.vent > 15) score -= 10;

        if (actuel.temperatureMer < 12 || actuel.temperatureMer > 28) score -= 20;
        else if (actuel.temperatureMer < 15 || actuel.temperatureMer > 25) score -= 10;

        if (score >= 70) {
            return {
                favorable: true,
                icone: '🟢',
                titre: 'CONDITIONS FAVORABLES',
                message: 'Ideal pour la peche!',
                color: '#10B981',
                bgColor: '#D1FAE5'
            };
        } else if (score >= 40) {
            return {
                favorable: true,
                icone: '🟡',
                titre: 'CONDITIONS ACCEPTABLES',
                message: 'Peche possible avec precautions',
                color: '#F59E0B',
                bgColor: '#FEF3C7'
            };
        } else {
            return {
                favorable: false,
                icone: '🔴',
                titre: 'CONDITIONS DIFFICILES',
                message: 'Peche deconseillee',
                color: '#EF4444',
                bgColor: '#FEE2E2'
            };
        }
    };

    const verdict = calculerVerdict();
    const poissons = obtenirPoissonsDisponibles(actuel.temperatureMer, actuel.vagues, new Date().getMonth());

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={rafraichissement} onRefresh={() => { setRafraichissement(true); chargerDonnees(); }} />}
        >
            <View style={styles.entete}>
                <Text style={styles.titre}>MAWJ</Text>
                <Text style={styles.ville}>{ville.nom} • {ville.cote}</Text>
                <Text style={styles.date}>
                    {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} • {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>

            {/* VERDICT */}
            <View style={[styles.carteVerdict, { backgroundColor: verdict.bgColor, borderColor: verdict.color }]}>
                <Text style={styles.verdictIcone}>{verdict.icone}</Text>
                <Text style={[styles.verdictTitre, { color: verdict.color }]}>{verdict.titre}</Text>
                <Text style={[styles.verdictMessage, { color: verdict.color }]}>{verdict.message}</Text>
            </View>

            {/* CONDITIONS ACTUELLES - FOND BLEU */}
            <View style={styles.section}>
                <Text style={styles.titreSection}>CONDITIONS ACTUELLES</Text>
                <View style={styles.carteBleu}>
                    <View style={styles.statRow}>
                        <View style={styles.statBleuItem}>
                            <Text style={styles.statBleuIcone}>🌊</Text>
                            <View>
                                <Text style={styles.statBleuLabel}>Vagues</Text>
                                <Text style={styles.statBleuValeur}>{actuel.vagues.toFixed(1)}m</Text>
                            </View>
                        </View>
                        <View style={styles.statBleuItem}>
                            <Text style={styles.statBleuIcone}>💨</Text>
                            <View>
                                <Text style={styles.statBleuLabel}>Vent</Text>
                                <Text style={styles.statBleuValeur}>{Math.round(actuel.vent)} km/h</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.separateurBleu} />
                    <View style={styles.statRow}>
                        <View style={styles.statBleuItem}>
                            <Text style={styles.statBleuIcone}>🌡️</Text>
                            <View>
                                <Text style={styles.statBleuLabel}>Temp. mer</Text>
                                <Text style={styles.statBleuValeur}>{Math.round(actuel.temperatureMer)}°C</Text>
                            </View>
                        </View>
                        <View style={styles.statBleuItem}>
                            <Text style={styles.statBleuIcone}>🌤️</Text>
                            <View>
                                <Text style={styles.statBleuLabel}>Temp. air</Text>
                                <Text style={styles.statBleuValeur}>{Math.round(actuel.temperatureAir)}°C</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* MAREES */}
            <View style={styles.section}>
                <Text style={styles.titreSection}>MAREES DU JOUR</Text>
                <View style={styles.carte}>
                    {marees.toutesMarees.map((maree, index) => (
                        <View key={index} style={[styles.mareeItem, index > 0 && styles.mareeItemBordure]}>
                            <Text style={styles.mareeIcone}>{maree.type === 'haute' ? '⬆️' : '⬇️'}</Text>
                            <View style={styles.mareeInfo}>
                                <Text style={styles.mareeHeure}>{maree.heure}</Text>
                                <Text style={styles.mareeType}>
                                    {maree.type === 'haute' ? 'Haute' : 'Basse'} {maree.hauteur}m
                                </Text>
                            </View>
                            <Text style={[styles.mareeStatut, maree.estProchaine && styles.mareeProchaine]}>
                                {maree.statut}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* VENT 24H */}
            <View style={styles.section}>
                <Text style={styles.titreSection}>VENT - EVOLUTION 24H</Text>
                <View style={styles.carte}>
                    {evolution.vent.slice(0, 5).map((point, index) => (
                        <View key={index} style={[styles.evolutionItem, index > 0 && styles.evolutionBordure]}>
                            <Text style={styles.evolutionHeure}>{point.heure}</Text>
                            <Text style={styles.evolutionValeur}>{Math.round(point.vitesse)} km/h</Text>
                            <Text style={styles.evolutionDirection}>→ {point.direction}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* VAGUES GRAPHIQUE */}
            <View style={styles.section}>
                <Text style={styles.titreSection}>VAGUES - AUJOURD'HUI</Text>
                <View style={styles.carte}>
                    <View style={styles.graphiqueSimple}>
                        {evolution.vagues.slice(0, 6).map((point, index) => (
                            <View key={index} style={styles.barreContainer}>
                                <Text style={styles.barreValeur}>{point.hauteur.toFixed(1)}</Text>
                                <View style={[styles.barre, { height: Math.max(20, point.hauteur * 40) }]} />
                                <Text style={styles.barreHeure}>{point.heure}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            {/* SOLEIL */}
            <View style={styles.carteSpeciale}>
                <Text style={styles.titreSectionSpecial}>SOLEIL</Text>
                <View style={styles.soleilRow}>
                    <View style={styles.soleilItem}>
                        <Text style={styles.soleilIcone}>🌅</Text>
                        <Text style={styles.soleilLabel}>Lever</Text>
                        <Text style={styles.soleilHeure}>{soleil.lever}</Text>
                    </View>
                    <View style={styles.soleilItem}>
                        <Text style={styles.soleilIcone}>🌇</Text>
                        <Text style={styles.soleilLabel}>Coucher</Text>
                        <Text style={styles.soleilHeure}>{soleil.coucher}</Text>
                    </View>
                </View>
            </View>

            {/* POISSONS */}
            <View style={styles.section}>
                <Text style={styles.titreSection}>POISSONS DISPONIBLES</Text>
                {poissons.length > 0 ? (
                    poissons.slice(0, 3).map((poisson, index) => (
                        <View key={index} style={styles.cartePoisson}>
                            <View style={styles.poissonHeader}>
                                <Text style={styles.poissonIcone}>🐟</Text>
                                <View style={styles.poissonInfo}>
                                    <Text style={styles.poissonNom}>{poisson.nom}</Text>
                                </View>
                                <Text style={styles.poissonBadge}>
                                    {poisson.confiance > 75 ? '🟢' : poisson.confiance > 50 ? '🟡' : '🔴'} {poisson.confiance}%
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={styles.aucunPoisson}>Conditions difficiles aujourd'hui</Text>
                )}
            </View>

            <View style={styles.espaceFin} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F9FF' },
    centrer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F9FF' },
    entete: { padding: 20, paddingTop: 60, backgroundColor: '#0EA5E9' },
    titre: { fontSize: 32, fontWeight: 'bold', color: '#FFF', marginBottom: 4, letterSpacing: 2 },
    ville: { fontSize: 14, color: '#FFF', opacity: 0.9 },
    date: { fontSize: 12, color: '#FFF', opacity: 0.8, marginTop: 4 },

    carteVerdict: { margin: 20, padding: 32, borderRadius: 20, alignItems: 'center', borderWidth: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 },
    verdictIcone: { fontSize: 80, marginBottom: 16 },
    verdictTitre: { fontSize: 22, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8, textAlign: 'center' },
    verdictMessage: { fontSize: 16, fontWeight: '600' },

    section: { paddingHorizontal: 20, marginBottom: 16 },
    titreSection: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 12, letterSpacing: 0.5 },
    carte: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },

    carteBleu: { backgroundColor: '#DBEAFE', borderRadius: 12, padding: 20, borderWidth: 2, borderColor: '#0EA5E9' },
    statRow: { flexDirection: 'row', justifyContent: 'space-around' },
    statBleuItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    statBleuIcone: { fontSize: 32 },
    statBleuLabel: { fontSize: 12, color: '#0369A1', fontWeight: '600', marginBottom: 4 },
    statBleuValeur: { fontSize: 20, fontWeight: 'bold', color: '#0C4A6E' },
    separateurBleu: { height: 1, backgroundColor: '#BAE6FD', marginVertical: 16 },

    mareeItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    mareeItemBordure: { borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    mareeIcone: { fontSize: 24, marginRight: 12 },
    mareeInfo: { flex: 1 },
    mareeHeure: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
    mareeType: { fontSize: 13, color: '#64748B', marginTop: 2 },
    mareeStatut: { fontSize: 12, color: '#94A3B8' },
    mareeProchaine: { color: '#0EA5E9', fontWeight: '600' },

    evolutionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
    evolutionBordure: { borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    evolutionHeure: { fontSize: 14, color: '#64748B', width: 80 },
    evolutionValeur: { fontSize: 15, fontWeight: '600', color: '#1E293B', flex: 1 },
    evolutionDirection: { fontSize: 13, color: '#64748B' },

    graphiqueSimple: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 120, paddingTop: 20 },
    barreContainer: { alignItems: 'center', flex: 1 },
    barreValeur: { fontSize: 11, color: '#64748B', marginBottom: 4 },
    barre: { width: 30, backgroundColor: '#0EA5E9', borderRadius: 4 },
    barreHeure: { fontSize: 10, color: '#94A3B8', marginTop: 8 },

    carteSpeciale: { margin: 20, marginTop: 0, padding: 20, backgroundColor: '#FFF', borderRadius: 16, borderWidth: 2, borderColor: '#0EA5E9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    titreSectionSpecial: { fontSize: 14, fontWeight: 'bold', color: '#0EA5E9', marginBottom: 16, letterSpacing: 0.5 },
    soleilRow: { flexDirection: 'row', gap: 12 },
    soleilItem: { flex: 1, alignItems: 'center', padding: 12, backgroundColor: '#F0F9FF', borderRadius: 8 },
    soleilIcone: { fontSize: 32, marginBottom: 8 },
    soleilLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
    soleilHeure: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },

    cartePoisson: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
    poissonHeader: { flexDirection: 'row', alignItems: 'center' },
    poissonIcone: { fontSize: 36, marginRight: 12 },
    poissonInfo: { flex: 1 },
    poissonNom: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
    poissonBadge: { fontSize: 14, fontWeight: '600', color: '#64748B' },
    aucunPoisson: { fontSize: 14, color: '#94A3B8', textAlign: 'center', padding: 20, fontStyle: 'italic' },

    espaceFin: { height: 40 },
});