// ========================================
// FICHIER: src/services/database.js
// DATABASE SIMPLIFIEE - SANS TABLE PRISES
// ========================================

import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('mawj.db');

export const initDatabase = async () => {
    try {
        // Supprimer anciennes tables
        await db.execAsync('DROP TABLE IF EXISTS users');
        await db.execAsync('DROP TABLE IF EXISTS sorties_peche');
        await db.execAsync('DROP TABLE IF EXISTS prises');
        await db.execAsync('DROP TABLE IF EXISTS villes_favorites');

        // Table users avec password
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        ville_defaut TEXT,
        date_creation TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Table sorties - AVEC poissons directement!
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sorties_peche (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        ville TEXT NOT NULL,
        heure_debut TEXT,
        heure_fin TEXT,
        conditions_vagues REAL,
        conditions_vent REAL,
        conditions_temp REAL,
        poissons_attrapes TEXT,
        notes TEXT,
        date_creation TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Table villes favorites
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS villes_favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        ville_code TEXT NOT NULL,
        date_ajout TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, ville_code)
      );
    `);

        console.log("? Base de données initialisée");
    } catch (error) {
        console.error("? Erreur init DB:", error);
        throw error;
    }
};

// ============================================
// UTILISATEURS
// ============================================

export const registerUser = async (nom, email, password, villeDefaut) => {
    const hashedPassword = btoa(password);
    const result = await db.runAsync(
        `INSERT INTO users (nom, email, password, ville_defaut) VALUES (?, ?, ?, ?)`,
        [nom, email, hashedPassword, villeDefaut]
    );
    return result.lastInsertRowId;
};

export const loginUser = async (email, password) => {
    const hashedPassword = btoa(password);
    const user = await db.getFirstAsync(
        `SELECT * FROM users WHERE email = ? AND password = ?`,
        [email, hashedPassword]
    );
    return user;
};

export const getUser = async (email) => {
    return await db.getFirstAsync(
        `SELECT id, nom, email, ville_defaut, date_creation FROM users WHERE email = ?`,
        [email]
    );
};

export const updateUserVille = async (userId, ville) => {
    await db.runAsync(
        `UPDATE users SET ville_defaut = ? WHERE id = ?`,
        [ville, userId]
    );
};

// ============================================
// SORTIES DE PECHE - SIMPLIFIE
// ============================================

export const ajouterSortie = async (userId, sortie) => {
    const result = await db.runAsync(
        `INSERT INTO sorties_peche
     (user_id, date, ville, heure_debut, heure_fin, 
      conditions_vagues, conditions_vent, conditions_temp, 
      poissons_attrapes, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            userId,
            sortie.date,
            sortie.ville,
            sortie.heureDebut,
            sortie.heureFin,
            sortie.vagues || 0,
            sortie.vent || 0,
            sortie.temperature || 0,
            sortie.poissonsAttrapes || '',
            sortie.notes || ''
        ]
    );
    return result.lastInsertRowId;
};

export const getSorties = async (userId) => {
    return await db.getAllAsync(
        `SELECT * FROM sorties_peche
     WHERE user_id = ?
     ORDER BY date DESC, heure_debut DESC`,
        [userId]
    );
};

export const getSortie = async (sortieId) => {
    return await db.getFirstAsync(
        `SELECT * FROM sorties_peche WHERE id = ?`,
        [sortieId]
    );
};

export const supprimerSortie = async (sortieId) => {
    await db.runAsync(
        `DELETE FROM sorties_peche WHERE id = ?`,
        [sortieId]
    );
};

// ============================================
// STATISTIQUES - SIMPLIFIE
// ============================================

export const getStatistiques = async (userId) => {
    const totalSorties = await db.getFirstAsync(
        `SELECT COUNT(*) as total FROM sorties_peche WHERE user_id = ?`,
        [userId]
    );

    // Compter le nombre total de poissons
    const sorties = await getSorties(userId);
    let totalPoissons = 0;
    sorties.forEach(sortie => {
        if (sortie.poissons_attrapes) {
            // Compter les virgules + 1
            const count = (sortie.poissons_attrapes.match(/,/g) || []).length + 1;
            totalPoissons += count;
        }
    });

    const villeFavorite = await db.getFirstAsync(
        `SELECT ville, COUNT(*) as total
     FROM sorties_peche
     WHERE user_id = ?
     GROUP BY ville
     ORDER BY total DESC
     LIMIT 1`,
        [userId]
    );

    return {
        totalSorties: totalSorties?.total ?? 0,
        totalPoissons: totalPoissons,
        villeFavorite: villeFavorite ?? null
    };
};

// ============================================
// VILLES FAVORITES
// ============================================

export const ajouterVilleFavorite = async (userId, villeCode) => {
    await db.runAsync(
        `INSERT OR IGNORE INTO villes_favorites (user_id, ville_code) VALUES (?, ?)`,
        [userId, villeCode]
    );
};

export const getVillesFavorites = async (userId) => {
    return await db.getAllAsync(
        `SELECT * FROM villes_favorites WHERE user_id = ? ORDER BY date_ajout DESC`,
        [userId]
    );
};

export const supprimerVilleFavorite = async (userId, villeCode) => {
    await db.runAsync(
        `DELETE FROM villes_favorites WHERE user_id = ? AND ville_code = ?`,
        [userId, villeCode]
    );
};

// ============================================
// EXPORT DONNEES
// ============================================

export const exportAllData = async (userId) => {
    const user = await db.getFirstAsync(
        `SELECT id, nom, email, ville_defaut FROM users WHERE id = ?`,
        [userId]
    );

    const sorties = await getSorties(userId);
    const stats = await getStatistiques(userId);

    return {
        user,
        sorties,
        stats,
        exportDate: new Date().toISOString()
    };
};