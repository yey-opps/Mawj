// src/screens/ForecastScreen.js
// Écran des prévisions 7 jours

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getDonneesCompletes, VILLES_MAROC } from '../services/api';
import { evaluerConditions, formaterDate } from '../utils/logiquePeche';
import { useApp } from '../context/AppContext';

export default function ForecastScreen() {
    const { villeActuelle } = useApp();
    const [donnees, setDonnees] = useState(null);
    const [chargement, setChargement] = useState(true);

    useEffect(() => {
        chargerDonnees();
    }, [villeActuelle]);

    const chargerDonnees = async () => {
        try {
            const ville = VILLES_MAROC[villeActuelle] || VILLES_MAROC.casablanca;
            const data = await getDonneesCompletes(ville.latitude, ville.longitude);
            setDonnees(data);
        } catch (err) {
            console.error(err);
        } finally {
            setChargement(false);
        }
    };

    if (chargement) {
        return (
            <View style={styles.centrer}>
                <ActivityIndicator size="large" color="#0EA5E9" />
            </View>
        );
    }

    const { previsions } = donnees;
    const ville = VILLES_MAROC[villeActuelle] || VILLES_MAROC.casablanca;

    return (
        <View style={styles.container}>
            {/* En-tête */}
            <View style={styles.entete}>
                <Text style={styles.titre}>📅 Prévisions</Text>
                <Text style={styles.sousTitre}>7 jours - {ville.nom}</Text>
            </View>

            <ScrollView style={styles.liste}>
                {previsions.jours.map((jour, index) => {
                    const vaguesMoy = previsions.vaguesMax[index] * 0.7;
                    const conditions = evaluerConditions(vaguesMoy, 20, 18);
                    const isAujourdhui = index === 0;

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.carteJour,
                                isAujourdhui && styles.carteAujourdhui
                            ]}
                        >
                            <View style={styles.colonneGauche}>
                                <Text style={styles.dateJour}>
                                    {isAujourdhui ? "Aujourd'hui" : formaterDate(jour)}
                                </Text>
                                <Text style={styles.iconeCondition}>{conditions.icone}</Text>
                            </View>

                            <View style={styles.colonneCentre}>
                                <View style={styles.ligne}>
                                    <Text style={styles.label}>🌊 Vagues max:</Text>
                                    <Text style={styles.valeur}>{previsions.vaguesMax[index].toFixed(1)}m</Text>
                                </View>
                                <View style={styles.ligne}>
                                    <Text style={styles.label}>🌡️ Température:</Text>
                                    <Text style={styles.valeur}>
                                        {Math.round(previsions.tempMin[index])}° - {Math.round(previsions.tempMax[index])}°
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.colonneDroite}>
                                <Text style={[styles.badge, { backgroundColor: conditions.couleur }]}>
                                    {conditions.niveau}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}

                <View style={styles.espaceFin} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F9FF',
    },
    centrer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F9FF',
    },
    entete: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#0EA5E9',
    },
    titre: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 4,
    },
    sousTitre: {
        fontSize: 14,
        color: '#FFF',
        opacity: 0.9,
    },
    liste: {
        flex: 1,
        padding: 16,
    },
    carteJour: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    carteAujourdhui: {
        borderWidth: 2,
        borderColor: '#0EA5E9',
    },
    colonneGauche: {
        width: 100,
        alignItems: 'center',
    },
    dateJour: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    iconeCondition: {
        fontSize: 24,
    },
    colonneCentre: {
        flex: 1,
        paddingHorizontal: 12,
    },
    ligne: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    label: {
        fontSize: 13,
        color: '#64748B',
    },
    valeur: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1E293B',
    },
    colonneDroite: {
        alignItems: 'flex-end',
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        color: '#FFF',
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    espaceFin: {
        height: 40,
    },
});