// ========================================
// FICHIER: src/screens/LoginScreen.js
// CONNEXION - UTF-8
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
    Platform
} from 'react-native';
import { loginUser } from '../services/database';
import { useApp } from '../context/AppContext';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setUser } = useApp();

    const handleLogin = async () => {
        if (!email.trim()) {
            Alert.alert('Erreur', 'Veuillez entrer votre email');
            return;
        }

        if (!password) {
            Alert.alert('Erreur', 'Veuillez entrer votre mot de passe');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Erreur', 'Email invalide');
            return;
        }

        try {
            const utilisateur = await loginUser(email.trim(), password);

            if (!utilisateur) {
                Alert.alert('Erreur', 'Email ou mot de passe incorrect');
                return;
            }

            const { password: _, ...userSansPassword } = utilisateur;
            setUser(userSansPassword);
            Alert.alert('Bienvenue!', `Content de vous revoir ${utilisateur.nom}!`);
        } catch (error) {
            console.error('Erreur login:', error);
            Alert.alert('Erreur', 'Impossible de se connecter');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.contenu}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>MAWJ</Text>
                    <Text style={styles.logoSubtext}>Vagues</Text>
                </View>

                <Text style={styles.titre}>Connexion</Text>
                <Text style={styles.sousTitre}>
                    Connectez-vous a votre compte
                </Text>

                <View style={styles.formulaire}>
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
                            placeholder="Entrez votre mot de passe"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.bouton}
                        onPress={handleLogin}
                    >
                        <Text style={styles.texteBouton}>Se connecter</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.lienContainer}>
                    <Text style={styles.lienTexte}>Pas encore de compte? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.lien}>S'inscrire</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F9FF' },
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