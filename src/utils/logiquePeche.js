// src/utils/logiquePeche.js
// Logique pour déterminer les conditions de pêche

export function evaluerConditions(hauteurVagues, vitesseVent, temperatureMer) {
  if (hauteurVagues > 3.0 || vitesseVent > 40) {
    return {
      niveau: "mauvais",
      couleur: "#EF4444",
      icone: "🔴",
      message: "Mer agitée - Pêche déconseillée",
      details: "Conditions dangereuses pour la pêche"
    };
  }
  
  if (hauteurVagues < 1.5 && vitesseVent < 20 && temperatureMer >= 15 && temperatureMer <= 22) {
    return {
      niveau: "excellent",
      couleur: "#10B981",
      icone: "🟢",
      message: "Conditions excellentes!",
      details: "Mer calme, idéal pour la pêche"
    };
  }
  
  if (hauteurVagues < 2.5 && vitesseVent < 30) {
    return {
      niveau: "bon",
      couleur: "#F59E0B",
      icone: "🟡",
      message: "Bonnes conditions",
      details: "Mer praticable, bonne pêche possible"
    };
  }
  
  return {
    niveau: "moyen",
    couleur: "#FBBF24",
    icone: "🟡",
    message: "Conditions moyennes",
    details: "Pêche possible mais prudence recommandée"
  };
}

export function formaterDirection(degres) {
  const directions = [
    "Nord", "Nord-Est", "Est", "Sud-Est",
    "Sud", "Sud-Ouest", "Ouest", "Nord-Ouest"
  ];
  const index = Math.round(degres / 45) % 8;
  return directions[index];
}

export function formaterDate(dateString) {
  const date = new Date(dateString);
  const jours = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const mois = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", 
                "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  
  return `${jours[date.getDay()]} ${date.getDate()} ${mois[date.getMonth()]}`;
}

export function formaterHeure(dateString) {
  const date = new Date(dateString);
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
}

export function obtenirConseils(conditions) {
  const conseils = [];
  
  if (conditions.niveau === "excellent") {
    conseils.push("🎣 Parfait pour sortir en mer");
    conseils.push("⏰ Meilleures prises tôt le matin");
    conseils.push("🌊 Mer calme, idéale pour débutants");
  } else if (conditions.niveau === "bon") {
    conseils.push("✅ Bonnes conditions de pêche");
    conseils.push("⚠️ Surveiller l'évolution de la mer");
    conseils.push("🎣 Équipement standard recommandé");
  } else if (conditions.niveau === "moyen") {
    conseils.push("⚠️ Conditions acceptables");
    conseils.push("🧑‍🤝‍🧑 Pêche recommandée pour expérimentés");
    conseils.push("🦺 Gilet de sauvetage obligatoire");
  } else {
    conseils.push("❌ Pêche fortement déconseillée");
    conseils.push("🏠 Restez à terre");
    conseils.push("📅 Consultez les prévisions pour demain");
  }
  
  return conseils;
}
