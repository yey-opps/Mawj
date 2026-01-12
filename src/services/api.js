// ========================================
// FICHIER: src/services/api.js
// API AVEC 27 VILLES CÔTIÈRES DU MAROC
// ========================================

const API_MARINE = "https://marine-api.open-meteo.com/v1/marine";
const API_METEO = "https://api.open-meteo.com/v1/forecast";

function calculerSoleil(latitude, longitude) {
    const maintenant = new Date();
    const jourAnnee = Math.floor((maintenant - new Date(maintenant.getFullYear(), 0, 0)) / 86400000);
    const declinaison = 23.45 * Math.sin((360 / 365) * (jourAnnee - 81) * Math.PI / 180);
    const latRad = latitude * Math.PI / 180;
    const declRad = declinaison * Math.PI / 180;
    const cosOmega = -Math.tan(latRad) * Math.tan(declRad);
    const omega = Math.acos(Math.max(-1, Math.min(1, cosOmega))) * 180 / Math.PI;
    const lever = 12 - omega / 15;
    const coucher = 12 + omega / 15;

    const formaterHeure = (h) => {
        const heures = Math.floor(h);
        const minutes = Math.floor((h - heures) * 60);
        return `${heures.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    return { lever: formaterHeure(lever), coucher: formaterHeure(coucher) };
}

function calculerToutesMarees() {
    const maintenant = new Date();
    const heureActuelle = maintenant.getHours() + maintenant.getMinutes() / 60;
    const cycleMaree = 12.42;

    let heureHaute1 = 6.5;
    let heureBasse1 = heureHaute1 + cycleMaree / 2;
    let heureHaute2 = heureHaute1 + cycleMaree;
    let heureBasse2 = heureBasse1 + cycleMaree;

    const jourMois = maintenant.getDate();
    const decalage = (jourMois * 50) / 60;
    heureHaute1 = (heureHaute1 + decalage) % 24;
    heureBasse1 = (heureBasse1 + decalage) % 24;
    heureHaute2 = (heureHaute2 + decalage) % 24;
    heureBasse2 = (heureBasse2 + decalage) % 24;

    const formaterHeure = (h) => {
        h = h % 24;
        const heures = Math.floor(h);
        const minutes = Math.floor((h - heures) * 60);
        return `${heures.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const hauteurHaute = (2.2 + Math.random() * 0.6).toFixed(1);
    const hauteurBasse = (0.5 + Math.random() * 0.4).toFixed(1);

    const getStatut = (heureMaree) => {
        const diff = heureMaree - heureActuelle;
        if (diff < 0) return 'Passée';
        if (diff < 1) return `Dans ${Math.round(diff * 60)} min`;
        if (diff < 3) return `Dans ${Math.floor(diff)}h${Math.round((diff % 1) * 60)}`;
        if (diff < 12) return 'Aujourd\'hui';
        return 'Ce soir';
    };

    const marees = [
        { type: 'haute', heure: formaterHeure(heureHaute1), hauteur: hauteurHaute, heureNum: heureHaute1 },
        { type: 'basse', heure: formaterHeure(heureBasse1), hauteur: hauteurBasse, heureNum: heureBasse1 },
        { type: 'haute', heure: formaterHeure(heureHaute2), hauteur: hauteurHaute, heureNum: heureHaute2 },
        { type: 'basse', heure: formaterHeure(heureBasse2), hauteur: hauteurBasse, heureNum: heureBasse2 },
    ];

    let prochaineIndex = -1;
    for (let i = 0; i < marees.length; i++) {
        if (marees[i].heureNum > heureActuelle) {
            prochaineIndex = i;
            break;
        }
    }

    const toutesMarees = marees.map((m, i) => ({
        ...m,
        statut: getStatut(m.heureNum),
        estProchaine: i === prochaineIndex
    }));

    const prochaineHaute = marees.find(m => m.type === 'haute' && m.heureNum > heureActuelle) || marees[0];
    const prochaineBasse = marees.find(m => m.type === 'basse' && m.heureNum > heureActuelle) || marees[1];

    return {
        haute: { heure: prochaineHaute.heure, hauteur: prochaineHaute.hauteur },
        basse: { heure: prochaineBasse.heure, hauteur: prochaineBasse.hauteur },
        toutesMarees
    };
}

function calculerMeilleursCreneaux(soleil, marees) {
    const creneaux = [];

    creneaux.push({
        icone: '🟢',
        horaire: `${soleil.lever.split(':')[0]}:00-08:00`,
        raison: 'Aube + Marée favorable'
    });

    const coucherHeure = parseInt(soleil.coucher.split(':')[0]);
    creneaux.push({
        icone: '🟢',
        horaire: `${coucherHeure - 1}:00-${coucherHeure + 1}:00`,
        raison: 'Crépuscule + Activité poissons'
    });

    const mareeHauteHeure = marees.haute.heure.split(':')[0];
    creneaux.push({
        icone: '🟡',
        horaire: `${mareeHauteHeure}:00-${parseInt(mareeHauteHeure) + 2}:00`,
        raison: 'Marée haute'
    });

    return creneaux;
}

function extraireEvolution24h(donneesHoraires, type) {
    const heures = [0, 3, 6, 9, 12, 15, 18, 21];
    const now = new Date();
    const heureActuelle = now.getHours();

    const formaterDirection = (deg) => {
        const directions = ['Nord', 'Nord-Est', 'Est', 'Sud-Est', 'Sud', 'Sud-Ouest', 'Ouest', 'Nord-Ouest'];
        return directions[Math.round(deg / 45) % 8];
    };

    return heures.map(h => {
        let index = h;
        if (h < heureActuelle) index = h + 24;

        const dataIndex = Math.min(index, donneesHoraires.time.length - 1);

        if (type === 'vent') {
            return {
                heure: h === heureActuelle ? 'Maintenant' : `${h}h`,
                vitesse: donneesHoraires.wind_speed_10m[dataIndex],
                direction: formaterDirection(donneesHoraires.wind_direction_10m[dataIndex])
            };
        } else if (type === 'vagues') {
            return {
                heure: `${h}h`,
                hauteur: donneesHoraires.wave_height[dataIndex]
            };
        } else if (type === 'temperatureMer') {
            return {
                heure: `${h}h`,
                temperature: donneesHoraires.sea_surface_temperature[dataIndex]
            };
        }
    }).filter(Boolean);
}

export const getDonneesCompletes = async (latitude, longitude) => {
    try {
        const urlMarine = `${API_MARINE}?latitude=${latitude}&longitude=${longitude}&hourly=wave_height,wave_direction,wave_period,sea_surface_temperature,ocean_current_velocity,ocean_current_direction&daily=wave_height_max&timezone=auto&forecast_days=7`;
        const urlMeteo = `${API_METEO}?latitude=${latitude}&longitude=${longitude}&hourly=wind_speed_10m,wind_direction_10m,wind_gusts_10m,temperature_2m,cloud_cover&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;

        const [reponseMarine, reponseMeteo] = await Promise.all([
            fetch(urlMarine),
            fetch(urlMeteo)
        ]);

        if (!reponseMarine.ok || !reponseMeteo.ok) {
            throw new Error('Erreur lors de la récupération des données');
        }

        const donneesMarine = await reponseMarine.json();
        const donneesMeteo = await reponseMeteo.json();

        const soleil = calculerSoleil(latitude, longitude);
        const marees = calculerToutesMarees();
        const meilleursCreneaux = calculerMeilleursCreneaux(soleil, marees);

        return {
            actuel: {
                vagues: donneesMarine.hourly.wave_height[0] || 0,
                directionVagues: donneesMarine.hourly.wave_direction[0] || 0,
                periodeVagues: donneesMarine.hourly.wave_period[0] || 0,
                temperatureMer: donneesMarine.hourly.sea_surface_temperature[0] || 18,
                vitesseCourant: donneesMarine.hourly.ocean_current_velocity[0] || 0,
                directionCourant: donneesMarine.hourly.ocean_current_direction[0] || 0,
                vent: donneesMeteo.hourly.wind_speed_10m[0] || 0,
                directionVent: donneesMeteo.hourly.wind_direction_10m[0] || 0,
                rafales: donneesMeteo.hourly.wind_gusts_10m[0] || 0,
                temperatureAir: donneesMeteo.hourly.temperature_2m[0] || 20,
                nuages: donneesMeteo.hourly.cloud_cover[0] || 0,
                heure: donneesMarine.hourly.time[0]
            },
            previsions: {
                jours: donneesMarine.daily.time,
                vaguesMax: donneesMarine.daily.wave_height_max,
                tempMax: donneesMeteo.daily.temperature_2m_max,
                tempMin: donneesMeteo.daily.temperature_2m_min
            },
            evolution: {
                vent: extraireEvolution24h({ ...donneesMeteo.hourly }, 'vent'),
                vagues: extraireEvolution24h({ ...donneesMarine.hourly }, 'vagues'),
                temperatureMer: extraireEvolution24h({ ...donneesMarine.hourly }, 'temperatureMer')
            },
            soleil,
            marees,
            meilleursCreneaux
        };
    } catch (erreur) {
        console.error('Erreur API:', erreur);
        throw erreur;
    }
};

// ============================================
// 27 VILLES CÔTIÈRES DU MAROC
// ============================================

export const VILLES_MAROC = {
    // CÔTE ATLANTIQUE (Nord → Sud)
    tanger: { nom: "Tanger", latitude: 35.7595, longitude: -5.8340, cote: "Atlantique" },
    asilah: { nom: "Asilah", latitude: 35.4653, longitude: -6.0356, cote: "Atlantique" },
    larache: { nom: "Larache", latitude: 35.1932, longitude: -6.1561, cote: "Atlantique" },
    kenitra: { nom: "Kénitra", latitude: 34.2610, longitude: -6.5802, cote: "Atlantique" },
    mehdia: { nom: "Mehdia", latitude: 34.2500, longitude: -6.6667, cote: "Atlantique" },
    sale: { nom: "Salé", latitude: 34.0531, longitude: -6.7985, cote: "Atlantique" },
    rabat: { nom: "Rabat", latitude: 34.0209, longitude: -6.8416, cote: "Atlantique" },
    temara: { nom: "Temara", latitude: 33.9278, longitude: -6.9063, cote: "Atlantique" },
    mohammedia: { nom: "Mohammedia", latitude: 33.6866, longitude: -7.3826, cote: "Atlantique" },
    casablanca: { nom: "Casablanca", latitude: 33.5731, longitude: -7.5898, cote: "Atlantique" },
    elJadida: { nom: "El Jadida", latitude: 33.2316, longitude: -8.5007, cote: "Atlantique" },
    oualidia: { nom: "Oualidia", latitude: 32.7333, longitude: -9.0333, cote: "Atlantique" },
    safi: { nom: "Safi", latitude: 32.2994, longitude: -9.2372, cote: "Atlantique" },
    essaouira: { nom: "Essaouira", latitude: 31.5085, longitude: -9.7595, cote: "Atlantique" },
    agadir: { nom: "Agadir", latitude: 30.4278, longitude: -9.5981, cote: "Atlantique" },
    sidiIfni: { nom: "Sidi Ifni", latitude: 29.3797, longitude: -10.1731, cote: "Atlantique" },
    tantan: { nom: "Tan-Tan", latitude: 28.4378, longitude: -11.1036, cote: "Atlantique" },
    laayoune: { nom: "Laâyoune", latitude: 27.1536, longitude: -13.1994, cote: "Atlantique" },
    dakhla: { nom: "Dakhla", latitude: 23.7148, longitude: -15.9370, cote: "Atlantique" },

    // CÔTE MÉDITERRANÉE (Ouest → Est)
    mdiq: { nom: "M'diq", latitude: 35.6850, longitude: -5.3264, cote: "Méditerranée" },
    fnideq: { nom: "Fnideq", latitude: 35.8494, longitude: -5.3544, cote: "Méditerranée" },
    tetouan: { nom: "Tétouan", latitude: 35.5889, longitude: -5.3626, cote: "Méditerranée" },
    martil: { nom: "Martil", latitude: 35.6167, longitude: -5.2667, cote: "Méditerranée" },
    restinga: { nom: "Restinga-Smir", latitude: 35.6667, longitude: -5.2833, cote: "Méditerranée" },
    alHoceima: { nom: "Al Hoceima", latitude: 35.2517, longitude: -3.9372, cote: "Méditerranée" },
    nador: { nom: "Nador", latitude: 35.1681, longitude: -2.9330, cote: "Méditerranée" },
    saidia: { nom: "Saïdia", latitude: 35.0894, longitude: -2.2317, cote: "Méditerranée" },
};

export const CASABLANCA = VILLES_MAROC.casablanca;

// Liste pour affichage (triée par région)
export const LISTE_VILLES_PAR_REGION = {
    "Atlantique Nord": [
        'tanger', 'asilah', 'larache', 'kenitra', 'mehdia', 'sale', 'rabat', 'temara'
    ],
    "Atlantique Centre": [
        'mohammedia', 'casablanca', 'elJadida', 'oualidia', 'safi', 'essaouira'
    ],
    "Atlantique Sud": [
        'agadir', 'sidiIfni', 'tantan', 'laayoune', 'dakhla'
    ],
    "Méditerranée": [
        'mdiq', 'fnideq', 'tetouan', 'martil', 'restinga', 'alHoceima', 'nador', 'saidia'
    ]
};