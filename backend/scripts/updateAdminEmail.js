/**
 * Script pour mettre à jour l'email du SUPER_ADMIN
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateAdminEmail() {
  try {
    console.log('🔄 Mise à jour de l\'email du SUPER_ADMIN...\n')

    const updated = await prisma.user.update({
      where: { phoneNumber: '+22890139364' },
      data: { email: 'bbruce@ecomapp.io' }
    })

    console.log('✅ Email mis à jour avec succès!')
    console.log(`   Téléphone: ${updated.phoneNumber}`)
    console.log(`   Ancien email: admin@ecom-platform.tg`)
    console.log(`   Nouveau email: ${updated.email}`)
    console.log('\n✨ Terminé!\n')

  } catch (error) {
    console.error('\n❌ Erreur:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateAdminEmail()
  .catch((error) => {
    console.error('Échec:', error)
    process.exit(1)
  })
