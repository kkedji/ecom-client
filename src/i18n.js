// Système d'internationalisation simple pour FR/EN
export const translations = {
  fr: {
    // Navigation
    home: "Accueil",
    transport: "Transport",
    delivery: "Livraisons", 
    marketplace: "Marketplace",
    carbon: "Profil Carbone",
    
    // Page d'accueil
    appSubtitle: "Mobilité durable • Marketplace • Empreinte carbone",
    getStarted: "Commencer",
    getStartedDesc: "Choisissez un module: Transport, Livraison, Marketplace, Profil Carbone.",
    
    // Transport
    sustainableTransport: "Transport durable",
    people: "Personnes",
    bikeRoutes: "Itinéraires vélo & pistes cyclables (prototype)",
    virtualPedometer: "Podomètre virtuel", 
    walkingSuggestions: "Suggestions d'itinéraires pour la marche",
    goods: "Biens (Fret écologique)",
    goodsDesc: "Formulaire de demande & calcul d'itinéraire écologique (à implémenter)",
    
    // Livraisons
    ecoDelivery: "Livraisons éco-responsables",
    orderDelivery: "Commander une livraison",
    vehicleChoice: "Choisir type de véhicule: vélo-cargo, véhicule électrique, etc. (prototype)",
    tracking: "Suivi",
    realTimeTracking: "Suivi en temps réel (prototype)",
    
    // Marketplace
    productsServices: "Produits & Services",
    renewableProducts: "Catalogue de produits liés aux énergies renouvelables (prototype)",
    
    // Profil carbone
    carbonProfile: "Profil Carbone",
    myActions: "Mes actions",
    submitProofs: "Soumettre des preuves (photos, factures) et suivre les crédits carbone (prototype)"
  },
  
  en: {
    // Navigation
    home: "Home",
    transport: "Transport", 
    delivery: "Delivery",
    marketplace: "Marketplace",
    carbon: "Carbon Profile",
    
    // Page d'accueil
    appSubtitle: "Sustainable mobility • Marketplace • Carbon footprint",
    getStarted: "Get Started",
    getStartedDesc: "Choose a module: Transport, Delivery, Marketplace, Carbon Profile.",
    
    // Transport
    sustainableTransport: "Sustainable Transport",
    people: "People",
    bikeRoutes: "Bike routes & cycle lanes (prototype)",
    virtualPedometer: "Virtual pedometer",
    walkingSuggestions: "Walking route suggestions", 
    goods: "Goods (Eco freight)",
    goodsDesc: "Request form & eco-friendly route calculation (to be implemented)",
    
    // Livraisons
    ecoDelivery: "Eco-responsible deliveries",
    orderDelivery: "Order a delivery",
    vehicleChoice: "Choose vehicle type: cargo bike, electric vehicle, etc. (prototype)",
    tracking: "Tracking",
    realTimeTracking: "Real-time tracking (prototype)",
    
    // Marketplace
    productsServices: "Products & Services", 
    renewableProducts: "Catalog of renewable energy products (prototype)",
    
    // Profil carbone
    carbonProfile: "Carbon Profile",
    myActions: "My Actions",
    submitProofs: "Submit proofs (photos, invoices) and track carbon credits (prototype)"
  }
}

export function useTranslation(lang = 'fr') {
  return translations[lang] || translations.fr
}