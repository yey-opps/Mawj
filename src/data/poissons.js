// src/data/poissons.js
// Base de données des poissons du Maroc

export const POISSONS_MAROC = {
    sardine: {
        nom: "Sardine",
        nomArabe: "سردين",
        icone: "🐟",
        saisons: ["printemps", "été", "automne"],
        temperatureMin: 15,
        temperatureMax: 22,
        vaguesMax: 2.0,
        profondeur: "Surface et moyenne profondeur",
        description: "Très commune sur les côtes marocaines. Pêche idéale tôt le matin.",
        conseils: "Meilleures prises à l'aube avec des eaux calmes"
    },
    dorade: {
        nom: "Dorade",
        nomArabe: "دنيس",
        icone: "🐠",
        saisons: ["printemps", "été"],
        temperatureMin: 18,
        temperatureMax: 25,
        vaguesMax: 1.5,
        profondeur: "Moyenne profondeur",
        description: "Poisson noble apprécié. Préfère les eaux chaudes et calmes.",
        conseils: "Pêche optimale pendant les journées ensoleillées"
    },
    bar: {
        nom: "Bar (Loup de mer)",
        nomArabe: "قاروص",
        icone: "🐟",
        saisons: ["toute"],
        temperatureMin: 12,
        temperatureMax: 20,
        vaguesMax: 2.5,
        profondeur: "Surface à moyenne profondeur",
        description: "Présent toute l'année. Résistant aux conditions variées.",
        conseils: "Actif même par temps couvert"
    },
    maquereau: {
        nom: "Maquereau",
        nomArabe: "الاسقمري",
        icone: "🐟",
        saisons: ["printemps", "automne"],
        temperatureMin: 14,
        temperatureMax: 20,
        vaguesMax: 2.0,
        profondeur: "Surface",
        description: "Poisson migrateur très actif. Bancs importants au printemps.",
        conseils: "Chercher les bancs en surface"
    },
    thon: {
        nom: "Thon",
        nomArabe: "تونة",
        icone: "🐟",
        saisons: ["été"],
        temperatureMin: 20,
        temperatureMax: 26,
        vaguesMax: 3.0,
        profondeur: "Haute mer",
        description: "Pêche sportive en haute mer. Nécessite des conditions optimales.",
        conseils: "Pêche en pleine mer, équipement robuste nécessaire"
    },
    mulet: {
        nom: "Mulet",
        nomArabe: "البوري",
        icone: "🐟",
        saisons: ["toute"],
        temperatureMin: 12,
        temperatureMax: 24,
        vaguesMax: 1.5,
        profondeur: "Côtière peu profonde",
        description: "Très adaptable. Présent près des côtes toute l'année.",
        conseils: "Pêche côtière facile, bon pour débutants"
    }
};

export function obtenirSaison(mois) {
    if (mois >= 3 && mois <= 5) return "printemps";
    if (mois >= 6 && mois <= 8) return "été";
    if (mois >= 9 && mois <= 11) return "automne";
    return "hiver";
}

export function obtenirPoissonsDisponibles(temperatureMer, hauteurVagues, mois) {
    const saisonActuelle = obtenirSaison(mois);
    const disponibles = [];

    Object.entries(POISSONS_MAROC).forEach(([cle, poisson]) => {
        const bonSaison = poisson.saisons.includes("toute") ||
            poisson.saisons.includes(saisonActuelle);

        if (!bonSaison) return;

        if (temperatureMer < poisson.temperatureMin ||
            temperatureMer > poisson.temperatureMax) return;

        if (hauteurVagues > poisson.vaguesMax) return;

        const confiance = calculerConfiance(temperatureMer, hauteurVagues, poisson);

        disponibles.push({
            ...poisson,
            cle,
            confiance: Math.round(confiance)
        });
    });

    return disponibles.sort((a, b) => b.confiance - a.confiance);
}

function calculerConfiance(temperatureMer, hauteurVagues, poisson) {
    let score = 100;

    const tempIdeale = (poisson.temperatureMin + poisson.temperatureMax) / 2;
    const ecartTemp = Math.abs(temperatureMer - tempIdeale);
    score -= ecartTemp * 3;

    const ratioVagues = hauteurVagues / poisson.vaguesMax;
    if (ratioVagues > 0.8) score -= 20;
    else if (ratioVagues > 0.5) score -= 10;

    return Math.max(0, Math.min(100, score));
}