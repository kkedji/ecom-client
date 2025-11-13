/**
 * Script pour créer le premier administrateur SUPER_ADMIN
 * 
 * Usage:
 * node backend/scripts/createFirstAdmin.js
 * 
 * IMPORTANT: Ce script doit être exécuté UNE SEULE FOIS pour créer
 * le premier compte administrateur. Les comptes suivants doivent être
 * créés via l'interface admin par le SUPER_ADMIN.
 * 
 * Identifiants par défaut:
 * - Téléphone: +22890000000
 * - Mot de passe: AdminSecure2025!
 * 
 * ⚠️ PENSEZ À CHANGER LE MOT DE PASSE APRÈS LA PREMIÈRE CONNEXION ⚠️
 */

const bcrypt = require('bcrypt')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createFirstAdmin() {
  try {
    console.log('🔐 Création du premier compte SUPER_ADMIN...\n')

    // Identifiants par défaut
    const adminData = {
      phoneNumber: '+22890139364',
      password: 'AdminSecure2025!',
      firstName: 'Super',
      lastName: 'Admin',
      nickname: 'SuperAdmin',
      email: 'bbruce@ecomapp.io',
      role: 'SUPER_ADMIN',
      isAdmin: true
    }

    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { phoneNumber: adminData.phoneNumber }
    })

    if (existingAdmin) {
      console.log('⚠️  Un utilisateur avec ce numéro existe déjà.')
      console.log(`   Role actuel: ${existingAdmin.role}`)
      console.log(`   Est admin: ${existingAdmin.isAdmin}`)
      
      // Proposer de mettre à jour
      if (existingAdmin.role !== 'SUPER_ADMIN' || !existingAdmin.isAdmin) {
        console.log('\n🔄 Mise à jour en SUPER_ADMIN...')
        
        const updated = await prisma.user.update({
          where: { phoneNumber: adminData.phoneNumber },
          data: {
            role: 'SUPER_ADMIN',
            isAdmin: true
          }
        })

        console.log('\n✅ Utilisateur mis à jour avec succès!')
        console.log(`   ID: ${updated.id}`)
        console.log(`   Nom: ${updated.firstName} ${updated.lastName}`)
        console.log(`   Téléphone: ${updated.phoneNumber}`)
        console.log(`   Role: ${updated.role}`)
        console.log(`   Est admin: ${updated.isAdmin}`)
      } else {
        console.log('\n✓ Cet utilisateur est déjà SUPER_ADMIN.')
      }
      
      return
    }

    // Hasher le mot de passe
    console.log('🔒 Hashage du mot de passe...')
    const hashedPassword = await bcrypt.hash(adminData.password, 10)

    // Créer l'admin
    console.log('👤 Création du compte...')
    const admin = await prisma.user.create({
      data: {
        phoneNumber: adminData.phoneNumber,
        password: hashedPassword,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        nickname: adminData.nickname,
        email: adminData.email,
        role: adminData.role,
        isAdmin: adminData.isAdmin
      }
    })

    console.log('\n🎉 Compte SUPER_ADMIN créé avec succès!')
    console.log('\n📋 Informations du compte:')
    console.log(`   ID: ${admin.id}`)
    console.log(`   Nom: ${admin.firstName} ${admin.lastName}`)
    console.log(`   Téléphone: ${admin.phoneNumber}`)
    console.log(`   Email: ${admin.email}`)
    console.log(`   Nickname: ${admin.nickname}`)
    console.log(`   Role: ${admin.role}`)
    console.log(`   Est admin: ${admin.isAdmin}`)

    console.log('\n🔐 Identifiants de connexion:')
    console.log(`   Téléphone: ${adminData.phoneNumber}`)
    console.log(`   Mot de passe: ${adminData.password}`)
    
    console.log('\n⚠️  IMPORTANT:')
    console.log('   - Notez ces identifiants en lieu sûr')
    console.log('   - Changez le mot de passe après la première connexion')
    console.log('   - Connectez-vous sur /admin/login')
    
    console.log('\n✨ Script terminé avec succès!\n')

  } catch (error) {
    console.error('\n❌ Erreur lors de la création:', error.message)
    
    if (error.code === 'P2002') {
      console.error('   Un utilisateur avec cet email ou téléphone existe déjà.')
    }
    
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
createFirstAdmin()
  .catch((error) => {
    console.error('Échec du script:', error)
    process.exit(1)
  })
