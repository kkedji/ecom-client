# Exemples de Code - Ecom PWA

## Calcul des Crédits Carbone

### Algorithme de Calcul CO2 Évité

```javascript
// src/utils/carbonCalculator.js

/**
 * Facteurs d'émission CO2 (kg CO2/km par mode de transport)
 * Sources: ADEME, base carbone française
 */
const EMISSION_FACTORS = {
  car_gasoline: 0.195,      // Voiture essence
  car_diesel: 0.169,        // Voiture diesel  
  car_electric: 0.022,      // Voiture électrique (mix énergétique FR)
  bus: 0.103,               // Bus urbain
  metro: 0.006,             // Métro/RER
  bike: 0,                  // Vélo
  walking: 0,               // Marche
  motorbike: 0.113          // Moto
}

/**
 * Calcule les émissions CO2 évitées par un changement de mode de transport
 * @param {number} distance - Distance en kilomètres
 * @param {string} fromMode - Mode de transport habituel
 * @param {string} toMode - Nouveau mode de transport écologique
 * @returns {Object} - Résultat avec CO2 évité et crédit généré
 */
export function calculateCarbonSaved(distance, fromMode, toMode) {
  const originalEmissions = distance * (EMISSION_FACTORS[fromMode] || 0)
  const newEmissions = distance * (EMISSION_FACTORS[toMode] || 0)
  const co2SavedKg = Math.max(0, originalEmissions - newEmissions)
  
  // 1 crédit carbone = 1000 kg CO2 évité
  const carbonCredits = co2SavedKg / 1000
  
  return {
    co2SavedKg: Number(co2SavedKg.toFixed(3)),
    carbonCredits: Number(carbonCredits.toFixed(6)),
    originalEmissions: Number(originalEmissions.toFixed(3)),
    newEmissions: Number(newEmissions.toFixed(3)),
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h pour validation
  }
}

/**
 * Calcule les économies d'énergie en équivalent CO2
 * @param {number} energySavedKwh - Énergie économisée en kWh
 * @param {string} energyType - Type d'énergie (electricity, gas, heating)
 * @returns {Object} - CO2 évité et crédits
 */
export function calculateEnergySavings(energySavedKwh, energyType = 'electricity') {
  const energyFactors = {
    electricity: 0.057,  // kg CO2/kWh (mix énergétique français)
    gas: 0.234,         // kg CO2/kWh (gaz naturel)
    heating: 0.180      // kg CO2/kWh (chauffage moyen)
  }
  
  const co2SavedKg = energySavedKwh * (energyFactors[energyType] || energyFactors.electricity)
  const carbonCredits = co2SavedKg / 1000
  
  return {
    co2SavedKg: Number(co2SavedKg.toFixed(3)),
    carbonCredits: Number(carbonCredits.toFixed(6)),
    energySavedKwh,
    energyType
  }
}
```

### Validation des Preuves avec IA

```javascript
// src/services/proofValidation.js

/**
 * Service de validation automatique des preuves avec ML
 */
export class ProofValidationService {
  constructor(apiKey) {
    this.apiKey = apiKey
    this.baseURL = 'https://vision.googleapis.com/v1'
  }

  /**
   * Valide une preuve de trajet vélo via reconnaissance d'image
   * @param {File} imageFile - Photo du compteur vélo ou GPS
   * @returns {Promise<Object>} - Résultat de validation
   */
  async validateBikeProof(imageFile) {
    try {
      const base64Image = await this.fileToBase64(imageFile)
      
      const requestBody = {
        requests: [{
          image: { content: base64Image },
          features: [
            { type: 'TEXT_DETECTION' },
            { type: 'OBJECT_LOCALIZATION' }
          ]
        }]
      }
      
      const response = await fetch(`${this.baseURL}/images:annotate?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      const data = await response.json()
      
      return this.analyzeBikeImage(data)
    } catch (error) {
      return {
        isValid: false,
        confidence: 0,
        error: error.message,
        requiresManualReview: true
      }
    }
  }

  /**
   * Analyse les résultats de l'API Vision pour extraire les données vélo
   */
  analyzeBikeImage(visionData) {
    const textAnnotations = visionData.responses?.[0]?.textAnnotations || []
    const objects = visionData.responses?.[0]?.localizedObjectAnnotations || []
    
    // Recherche de patterns numériques (distance, vitesse)
    const numbers = this.extractNumbers(textAnnotations)
    
    // Détection d'objets liés au vélo
    const bikeRelated = objects.filter(obj => 
      ['Bicycle', 'Wheel', 'Vehicle registration plate'].includes(obj.name)
    )
    
    // Validation basée sur les critères
    const hasNumbers = numbers.length > 0
    const hasBikeElements = bikeRelated.length > 0
    const confidence = this.calculateConfidence(numbers, bikeRelated, textAnnotations)
    
    return {
      isValid: confidence > 0.7,
      confidence,
      extractedData: {
        distance: this.findDistanceInNumbers(numbers),
        detectedObjects: bikeRelated.map(obj => obj.name)
      },
      requiresManualReview: confidence < 0.8
    }
  }

  /**
   * Valide une facture d'électricité via OCR
   */
  async validateEnergyBill(imageFile) {
    try {
      const base64Image = await this.fileToBase64(imageFile)
      
      const requestBody = {
        requests: [{
          image: { content: base64Image },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
        }]
      }
      
      const response = await fetch(`${this.baseURL}/images:annotate?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      const data = await response.json()
      
      return this.analyzeEnergyBill(data)
    } catch (error) {
      return {
        isValid: false,
        confidence: 0,
        error: error.message,
        requiresManualReview: true
      }
    }
  }

  analyzeEnergyBill(visionData) {
    const fullText = visionData.responses?.[0]?.fullTextAnnotation?.text || ''
    
    // Patterns pour détecter les fournisseurs d'énergie français
    const energyProviders = ['EDF', 'Engie', 'Total', 'Eni', 'Planète OUI']
    const hasProvider = energyProviders.some(provider => 
      fullText.toUpperCase().includes(provider.toUpperCase())
    )
    
    // Extraction des consommations (kWh)
    const consumptionPattern = /(\d+(?:[\s,.]?\d+)*)\s*kWh/gi
    const consumptions = [...fullText.matchAll(consumptionPattern)]
    
    // Extraction des périodes de facturation
    const datePattern = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g
    const dates = [...fullText.matchAll(datePattern)]
    
    const confidence = this.calculateBillConfidence(hasProvider, consumptions, dates)
    
    return {
      isValid: confidence > 0.6,
      confidence,
      extractedData: {
        provider: hasProvider ? energyProviders.find(p => fullText.toUpperCase().includes(p.toUpperCase())) : null,
        consumptions: consumptions.map(match => match[1].replace(/[\s,]/g, '')),
        dates: dates.map(match => match[1])
      },
      requiresManualReview: confidence < 0.8
    }
  }

  // Méthodes utilitaires
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  extractNumbers(textAnnotations) {
    return textAnnotations
      .map(annotation => annotation.description)
      .filter(text => /\d+/.test(text))
      .map(text => parseFloat(text.replace(/[^\d.,]/g, '')))
      .filter(num => !isNaN(num))
  }

  findDistanceInNumbers(numbers) {
    // Heuristique: distance probable entre 0.1 et 200 km
    return numbers.find(num => num >= 0.1 && num <= 200) || null
  }

  calculateConfidence(numbers, objects, texts) {
    let score = 0
    if (numbers.length > 0) score += 0.3
    if (objects.length > 0) score += 0.4
    if (texts.length > 5) score += 0.2 // Image avec du contenu textuel
    if (this.findDistanceInNumbers(numbers)) score += 0.1
    return Math.min(score, 1)
  }

  calculateBillConfidence(hasProvider, consumptions, dates) {
    let score = 0
    if (hasProvider) score += 0.4
    if (consumptions.length > 0) score += 0.3
    if (dates.length >= 2) score += 0.2 // Période de facturation
    if (consumptions.length >= 2) score += 0.1 // Comparaison possible
    return Math.min(score, 1)
  }
}
```

## Optimisation des Itinéraires de Livraison

### Algorithme de Routage Écologique

```javascript
// src/services/routingService.js

/**
 * Service d'optimisation des itinéraires de livraison éco-responsable
 */
export class EcoRoutingService {
  constructor() {
    this.baseURL = 'https://router.project-osrm.org'
    this.vehicles = {
      bike: { speed: 15, co2Factor: 0, capacity: 20, range: 30 },
      eCar: { speed: 25, co2Factor: 0.022, capacity: 200, range: 300 },
      cargo: { speed: 12, co2Factor: 0, capacity: 50, range: 25 }
    }
  }

  /**
   * Calcule l'itinéraire optimal pour une livraison
   * @param {Object} pickup - Point de collecte {lat, lng, address}
   * @param {Object} delivery - Point de livraison {lat, lng, address}
   * @param {Object} options - Options {vehicleType, priority, timeWindow}
   * @returns {Promise<Object>} - Itinéraire optimisé
   */
  async calculateOptimalRoute(pickup, delivery, options = {}) {
    const { vehicleType = 'bike', priority = 'eco' } = options
    const vehicle = this.vehicles[vehicleType]

    try {
      // Appel à l'API OSRM pour le calcul d'itinéraire
      const coordinates = `${pickup.lng},${pickup.lat};${delivery.lng},${delivery.lat}`
      const url = `${this.baseURL}/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0]
        
        return this.processRoute(route, vehicle, priority)
      }
      
      throw new Error('Aucun itinéraire trouvé')
    } catch (error) {
      return this.handleRoutingError(error, pickup, delivery)
    }
  }

  /**
   * Traite et optimise l'itinéraire selon les critères écologiques
   */
  processRoute(route, vehicle, priority) {
    const distance = route.distance / 1000 // Conversion en km
    const duration = route.duration / 60    // Conversion en minutes
    
    // Calcul de l'empreinte carbone
    const co2Emissions = distance * vehicle.co2Factor
    const co2Saved = this.calculateCO2Saved(distance, 'car_gasoline', vehicle.co2Factor)
    
    // Calcul du coût selon le véhicule
    const cost = this.calculateDeliveryCost(distance, vehicle, priority)
    
    // Score écologique (0-100, 100 = le plus écologique)
    const ecoScore = this.calculateEcoScore(vehicle, distance, co2Saved)
    
    return {
      geometry: route.geometry,
      distance: Number(distance.toFixed(2)),
      duration: Math.round(duration),
      vehicleType: this.getVehicleKey(vehicle),
      cost: Number(cost.toFixed(2)),
      co2Emissions: Number(co2Emissions.toFixed(3)),
      co2Saved: Number(co2Saved.toFixed(3)),
      ecoScore,
      feasible: this.checkFeasibility(distance, vehicle),
      estimatedArrival: this.calculateArrivalTime(duration)
    }
  }

  /**
   * Optimisation multi-points pour tournées de livraison
   * @param {Array} deliveries - Liste des livraisons [{pickup, delivery, priority}]
   * @param {string} vehicleType - Type de véhicule
   * @returns {Promise<Object>} - Tournée optimisée
   */
  async optimizeDeliveryTour(deliveries, vehicleType = 'eCar') {
    const vehicle = this.vehicles[vehicleType]
    
    // Algorithme du plus proche voisin adapté pour l'écologie
    const optimizedRoute = this.nearestNeighborEco(deliveries, vehicle)
    
    let totalDistance = 0
    let totalCO2 = 0
    let totalDuration = 0
    const routeSegments = []

    // Calcul des segments d'itinéraire
    for (let i = 0; i < optimizedRoute.length - 1; i++) {
      const current = optimizedRoute[i]
      const next = optimizedRoute[i + 1]
      
      const segment = await this.calculateOptimalRoute(
        current.pickup || current.delivery, 
        next.pickup,
        { vehicleType }
      )
      
      routeSegments.push(segment)
      totalDistance += segment.distance
      totalCO2 += segment.co2Emissions
      totalDuration += segment.duration
    }

    return {
      deliveries: optimizedRoute,
      segments: routeSegments,
      summary: {
        totalDistance: Number(totalDistance.toFixed(2)),
        totalDuration: Math.round(totalDuration),
        totalCO2: Number(totalCO2.toFixed(3)),
        vehicleType,
        feasible: totalDistance <= vehicle.range,
        ecoScore: this.calculateTourEcoScore(totalCO2, deliveries.length)
      }
    }
  }

  // Algorithme du plus proche voisin avec priorité écologique
  nearestNeighborEco(deliveries, vehicle) {
    const remaining = [...deliveries]
    const route = []
    let currentPoint = remaining.shift() // Premier point

    route.push(currentPoint)

    while (remaining.length > 0) {
      let nearest = null
      let minScore = Infinity

      for (const delivery of remaining) {
        const distance = this.haversineDistance(
          currentPoint.delivery || currentPoint.pickup,
          delivery.pickup
        )
        
        // Score combiné: distance + priorité écologique + urgence
        const ecoWeight = delivery.priority === 'express' ? 0.5 : 1
        const score = distance / ecoWeight
        
        if (score < minScore) {
          minScore = score
          nearest = delivery
        }
      }

      route.push(nearest)
      remaining.splice(remaining.indexOf(nearest), 1)
      currentPoint = nearest
    }

    return route
  }

  // Méthodes utilitaires
  calculateCO2Saved(distance, fromTransport, toEmissionFactor) {
    const originalEmissions = distance * 0.195 // Voiture essence moyenne
    const newEmissions = distance * toEmissionFactor
    return Math.max(0, originalEmissions - newEmissions)
  }

  calculateDeliveryCost(distance, vehicle, priority) {
    const baseCost = vehicle.co2Factor === 0 ? 5 : 8 // Vélo moins cher
    const distanceCost = distance * (vehicle.co2Factor === 0 ? 0.8 : 1.2)
    const priorityMultiplier = priority === 'express' ? 1.5 : 1
    
    return (baseCost + distanceCost) * priorityMultiplier
  }

  calculateEcoScore(vehicle, distance, co2Saved) {
    let score = 50 // Score de base
    
    // Bonus pour véhicules zéro émission
    if (vehicle.co2Factor === 0) score += 30
    
    // Bonus pour CO2 économisé
    score += Math.min(co2Saved * 10, 20)
    
    // Malus pour longues distances (favorise le local)
    if (distance > 20) score -= (distance - 20) * 2
    
    return Math.max(0, Math.min(100, Math.round(score)))
  }

  calculateTourEcoScore(totalCO2, deliveryCount) {
    const co2PerDelivery = totalCO2 / deliveryCount
    return Math.max(0, Math.round(100 - co2PerDelivery * 50))
  }

  haversineDistance(point1, point2) {
    const R = 6371 // Rayon de la Terre en km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180
    const dLng = (point2.lng - point1.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  checkFeasibility(distance, vehicle) {
    return distance <= vehicle.range
  }

  calculateArrivalTime(durationMinutes) {
    const now = new Date()
    const arrivalTime = new Date(now.getTime() + durationMinutes * 60000)
    return arrivalTime.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  getVehicleKey(vehicle) {
    return Object.keys(this.vehicles).find(key => this.vehicles[key] === vehicle)
  }

  handleRoutingError(error, pickup, delivery) {
    console.error('Erreur de routage:', error)
    
    // Calcul approximatif en cas d'échec API
    const distance = this.haversineDistance(pickup, delivery)
    
    return {
      error: error.message,
      approximation: true,
      distance: Number(distance.toFixed(2)),
      duration: Math.round(distance / 15 * 60), // 15 km/h vitesse moyenne
      cost: this.calculateDeliveryCost(distance, this.vehicles.bike, 'normal'),
      ecoScore: 50
    }
  }
}

// Exemple d'utilisation
const routingService = new EcoRoutingService()

// Route simple
const route = await routingService.calculateOptimalRoute(
  { lat: 48.8566, lng: 2.3522, address: "Paris Centre" },
  { lat: 48.8738, lng: 2.2950, address: "Arc de Triomphe" },
  { vehicleType: 'bike', priority: 'eco' }
)

// Tournée multi-points
const deliveries = [
  { pickup: {lat: 48.8566, lng: 2.3522}, delivery: {lat: 48.8738, lng: 2.2950}, priority: 'normal' },
  { pickup: {lat: 48.8738, lng: 2.2950}, delivery: {lat: 48.8584, lng: 2.2945}, priority: 'express' }
]

const tour = await routingService.optimizeDeliveryTour(deliveries, 'eCar')
```

Ces exemples de code montrent l'implémentation concrète des fonctionnalités clés d'Ecom avec une approche basée sur les données réelles et les APIs modernes. L'accent est mis sur la précision des calculs écologiques et l'optimisation des performances.