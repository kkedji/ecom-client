/**
 * Formatte un montant en devise locale togolaise
 * Utilise l'espace comme séparateur de milliers et supprime les décimales .00
 * @param {number} amount - Le montant à formatter
 * @returns {string} - Le montant formatté (ex: "2 500" au lieu de "2500.00")
 */
export const formatCurrency = (amount) => {
  // Convertir en nombre si c'est une chaîne
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  // Arrondir à l'entier le plus proche
  const roundedAmount = Math.round(numAmount)
  
  // Formatter avec espace comme séparateur de milliers
  return roundedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/**
 * Formatte un montant avec la devise
 * @param {number} amount - Le montant à formatter
 * @param {string} currency - La devise (défaut: "F")
 * @returns {string} - Le montant formatté avec devise (ex: "2 500 F")
 */
export const formatAmount = (amount, currency = 'F') => {
  return `${formatCurrency(amount)} ${currency}`
}
