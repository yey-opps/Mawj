// ========================================
// FICHIER: src/screens/RegisterScreen.js
// INSCRIPTION - UTF-8
// ========================================

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { registerUser } from '../services/database';
import { useApp } from '../context/AppContext';

export default function RegisterScreen({ navigation }) {
    const [nom, setNom] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { setUser } = useApp();

    const handleRegister = async () => {
        if (!nom.trim()) {
            Alert.alert('Erreur', 'Veuillez entrer votre nom');
            return;
        }

        if (!email.trim()) {
            Alert.alert('Erreur', 'Veuillez entrer votre email');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Erreur', 'Email invalide');
            return;
        }

        if (!password) {
            Alert.alert('Erreur', 'Veuillez entrer un mot de passe');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
            return;
        }

        try {
            const userId = await registerUser(nom.trim(), email.trim(), password, 'casablanca');

            const utilisateur = {
                id: userId,
                nom: nom.trim(),
                email: email.trim(),
                ville_defaut: 'casablanca'
            };

            setUser(utilisateur);
            Alert.alert('Bienvenue!', 'Votre compte a ete cree avec succes!');
        } catch (error) {
            console.error('Erreur register:', error);

            if (error.message && error.message.includes('UNIQUE')) {
                Alert.alert('Erreur', 'Cet email est deja utilise');
            } else {
                Alert.alert('Erreur', 'Impossible de creer le compte');
            }
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.contenu}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>MAWJ</Text>
                        <Text style={styles.logoSubtext}>Vagues</Text>
                    </View>

                    <Text style={styles.titre}>Creer un compte</Text>
                    <Text style={styles.sousTitre}>
                        Rejoignez la communaute des pecheurs
                    </Text>

                    <View style={styles.formulaire}>
                        <View style={styles.champContainer}>
                            <Text style={styles.label}>Nom complet</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Ahmed El Fassi"
                                value={nom}
                                onChangeText={setNom}
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={styles.champContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: ahmed@example.com"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.champContainer}>
                            <Text style={styles.label}>Mot de passe</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Minimum 6 caracteres"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.champContainer}>
                            <Text style={styles.label}>Confirmer mot de passe</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Retapez votre mot de passe"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                autoCapitalize="none"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.bouton}
                            onPress={handleRegister}
                        >
                            <Text style={styles.texteBouton}>S'inscrire</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.lienContainer}>
                        <Text style={styles.lienTexte}>Deja un compte? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.lien}>Se connecter</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F9FF' },
    scrollContent: { flexGrow: 1 },
    contenu: { flex: 1, padding: 20, justifyContent: 'center' },
    logoContainer: { alignItems: 'center', marginBottom: 30 },
    logoText: { fontSize: 48, fontWeight: 'bold', color: '#0EA5E9', letterSpacing: 4 },
    logoSubtext: { fontSize: 16, color: '#64748B', marginTop: 4, fontStyle: 'italic' },
    titre: { fontSize: 28, fontWeight: 'bold', color: '#1E293B', textAlign: 'center', marginBottom: 8 },
    sousTitre: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 40 },
    formulaire: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    champContainer: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 8 },
    input: { backgroundColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, fontSize: 16, color: '#1E293B' },
    bouton: { backgroundColor: '#0EA5E9', paddingVertical: 16, borderRadius: 12, marginTop: 10 },
    texteBouton: { fontSize: 16, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
    lienContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    lienTexte: { fontSize: 14, color: '#64748B' },
    lien: { fontSize: 14, color: '#0EA5E9', fontWeight: '600' },
});