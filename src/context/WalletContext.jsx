import React, { createContext, useContext, useState, useEffect } from 'react'
import apiService from '../services/apiService'
import { useAuth } from './AuthContext'

const WalletContext = createContext()

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

export const WalletProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Charger le solde depuis le user au démarrage
  useEffect(() => {
    if (user?.wallet?.balance !== undefined) {
      setBalance(user.wallet.balance)
      setInitialized(true)
    } else if (user && !initialized) {
      // Si user existe mais pas de wallet, initialiser à 0
      setBalance(0)
      setInitialized(true)
    }
  }, [user, initialized])

  // Charger les données du portefeuille au démarrage (sans écraser le solde)
  useEffect(() => {
    if (isAuthenticated() && initialized) {
      loadTransactions()
    }
  }, [isAuthenticated, initialized])

  // Fonction pour charger uniquement les transactions
  const loadTransactions = async () => {
    try {
      const transactionsResult = await apiService.getTransactions()
      if (transactionsResult.success) {
        setTransactions(transactionsResult.data.transactions)
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    }
  }

  // Fonction pour charger les données du portefeuille (balance + transactions)
  const loadWalletData = async () => {
    setLoading(true)
    try {
      // Charger le solde
      const balanceResult = await apiService.getWalletBalance()
      if (balanceResult.success) {
        setBalance(balanceResult.data.balance)
      }

      // Charger les transactions
      await loadTransactions()
    } catch (error) {
      console.error('Error loading wallet data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour ajouter de l'argent au portefeuille
  const addFunds = async (amount, method, description = 'Rechargement') => {
    try {
      const result = await apiService.addFunds(
        Math.round(parseFloat(amount)),
        method,
        `${description} - ${method.toUpperCase()}`
      )
      
      if (result.success) {
        // Recharger les données du portefeuille
        await loadWalletData()
        return { success: true, transaction: result.data.transaction }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Error adding funds:', error)
      return { success: false, error: error.message }
    }
  }

  // Fonction pour débiter le portefeuille
  const debitFunds = async (amount, description, category = 'general') => {
    if (balance < amount) {
      return { success: false, error: 'Solde insuffisant' }
    }

    try {
      // TODO: Créer l'endpoint debitFunds dans l'API
      // Pour l'instant, on simule localement
      const newTransaction = {
        id: Date.now(),
        type: 'debit',
        amount: Math.round(parseFloat(amount)),
        description,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        status: 'completed',
        category
      }

      setTransactions(prev => [newTransaction, ...prev])
      setBalance(prev => prev - Math.round(parseFloat(amount)))
      
      return { success: true, transaction: newTransaction }
    } catch (error) {
      console.error('Error debiting funds:', error)
      return { success: false, error: error.message }
    }
  }

  // Fonction pour traiter un paiement
  const processPayment = (amount, description, category = 'general') => {
    return debitFunds(amount, description, category)
  }

  // Fonction pour obtenir l'historique par période
  const getTransactionsByPeriod = (period) => {
    const now = new Date()
    let startDate

    switch(period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default:
        return transactions
    }

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date)
      return transactionDate >= startDate
    })
  }

  // Fonction pour obtenir le résumé financier
  const getFinancialSummary = (period = 'all') => {
    const relevantTransactions = getTransactionsByPeriod(period)
    
    const totalCredits = relevantTransactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalDebits = relevantTransactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      totalCredits,
      totalDebits,
      netChange: totalCredits - totalDebits,
      currentBalance: balance,
      transactionCount: relevantTransactions.length
    }
  }

  const value = {
    balance,
    transactions,
    loading,
    addFunds,
    debitFunds,
    processPayment,
    getTransactionsByPeriod,
    getFinancialSummary,
    loadWalletData
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}