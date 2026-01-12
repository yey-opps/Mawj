// ========================================
// FICHIER: src/screens/FishScreen.js
// GUIDE DES POISSONS DU MAROC
// ========================================

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { POISSONS_MAROC } from '../data/poissons';

export default function FishScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.entete}>
                <Text style={styles.titre}>🐟 Guide des Poissons</Text>
                <Text style={styles.sousTitre}>Espèces du Maroc</Text>
            </View>

            <ScrollView style={styles.liste}>
                {Object.values(POISSONS_MAROC).map((poisson, index) => (
                    <View key={index} style={styles.cartePoisson}>
                        <View style={styles.enTetePoisson}>
                            <Text style={styles.iconePoisson}>{poisson.icone}</Text>
                            <View style={styles.titrePoisson}>
                                <Text style={styles.nomPoisson}>{poisson.nom}</Text>
                                <Text style={styles.nomArabe}>{poisson.nomArabe}</Text>
                            </View>
                        </View>

                        <Text style={styles.description}>{poisson.description}</Text>

                        <View style={styles.details}>
                            <View style={styles.detailLigne}>
                                <Text style={styles.labelDetail}>🌊 Saisons:</Text>
                                <Text style={styles.valeurDetail}>
                                    {poisson.saisons.includes('toute')
                                        ? 'Toute l\'année'
                                        : poisson.saisons.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')
                                    }
                                </Text>
                            </View>

                            <View style={styles.detailLigne}>
                                <Text style={styles.labelDetail}>🌡️ Température:</Text>
                                <Text style={styles.valeurDetail}>{poisson.temperatureMin}°C - {poisson.temperatureMax}°C</Text>
                            </View>

                            <View style={styles.detailLigne}>
                                <Text style={styles.labelDetail}>🌊 Vagues max:</Text>
                                <Text style={styles.valeurDetail}>{poisson.vaguesMax}m</Text>
                            </View>

                            <View style={styles.detailLigne}>
                                <Text style={styles.labelDetail}>📍 Profondeur:</Text>
                                <Text style={styles.valeurDetail}>{poisson.profondeur}</Text>
                            </View>
                        </View>

                        <View style={styles.conseilsBox}>
                            <Text style={styles.conseilsLabel}>💡 Conseils:</Text>
                            <Text style={styles.conseilsTexte}>{poisson.conseils}</Text>
                        </View>
                    </View>
                ))}
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
    liste: { flex: 1, padding: 16 },
    cartePoisson: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
    enTetePoisson: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    iconePoisson: { fontSize: 48, marginRight: 16 },
    titrePoisson: { flex: 1 },
    nomPoisson: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
    nomArabe: { fontSize: 16, color: '#64748B', marginTop: 2 },
    description: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 16 },
    details: { backgroundColor: '#F1F5F9', padding: 12, borderRadius: 8, marginBottom: 12 },
    detailLigne: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
    labelDetail: { fontSize: 13, color: '#64748B' },
    valeurDetail: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
    conseilsBox: { backgroundColor: '#DBEAFE', padding: 12, borderRadius: 8 },
    conseilsLabel: { fontSize: 13, fontWeight: '600', color: '#0EA5E9', marginBottom: 4 },
    conseilsTexte: { fontSize: 13, color: '#1E40AF', lineHeight: 18 },
    espaceFin: { height: 40 },
});