const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Seed de la base de données Ecom...');

    // Créer des utilisateurs de test
    const users = await Promise.all([
      // Client normal
      prisma.user.upsert({
        where: { phoneNumber: '+22812345678' },
        update: {},
        create: {
          phoneNumber: '+22812345678',
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@example.tg',
          isVerified: true,
          isActive: true,
          role: 'CLIENT',
          wallet: {
            create: {
              balance: 50000 // 50,000 F CFA
            }
          }
        }
      }),

      // Chauffeur
      prisma.user.upsert({
        where: { phoneNumber: '+22812345679' },
        update: {},
        create: {
          phoneNumber: '+22812345679',
          firstName: 'Kofi',
          lastName: 'Mensah',
          email: 'kofi.mensah@example.tg',
          isVerified: true,
          isActive: true,
          role: 'DRIVER',
          wallet: {
            create: {
              balance: 25000 // 25,000 F CFA
            }
          },
          driverProfile: {
            create: {
              licenseNumber: 'TG2024001',
              vehicleType: 'TAXI',
              vehicleBrand: 'Toyota',
              vehicleModel: 'Yaris',
              vehicleYear: 2020,
              vehicleColor: 'Blanc',
              plateNumber: 'TG-001-AA',
              insuranceNumber: 'INS2024001',
              isOnline: true,
              isAvailable: true,
              status: 'ACTIVE',
              currentLat: 6.1319,  // Lomé centre
              currentLng: 1.2228,
              rating: 4.8,
              totalRides: 150
            }
          }
        }
      }),

      // Propriétaire de boutique
      prisma.user.upsert({
        where: { phoneNumber: '+22812345680' },
        update: {},
        create: {
          phoneNumber: '+22812345680',
          firstName: 'Ama',
          lastName: 'Koffi',
          email: 'ama.koffi@example.tg',
          isVerified: true,
          isActive: true,
          role: 'STORE_OWNER',
          wallet: {
            create: {
              balance: 100000 // 100,000 F CFA
            }
          },
          storeProfile: {
            create: {
              storeName: 'Boutique Ama Fashion',
              description: 'Vêtements et accessoires de mode africaine',
              category: 'FASHION',
              address: 'Marché de Tokoin, Lomé',
              latitude: 6.1375,
              longitude: 1.2123,
              phoneNumber: '+22812345680',
              email: 'boutique@amafashion.tg',
              isActive: true,
              rating: 4.5,
              totalOrders: 89
            }
          }
        }
      })
    ]);

    console.log('✅ Utilisateurs créés');

    // Créer des produits pour la boutique
    const storeProfile = await prisma.storeProfile.findFirst({
      where: { storeName: 'Boutique Ama Fashion' }
    });

    if (storeProfile) {
      await Promise.all([
        prisma.product.upsert({
          where: { id: 'prod-001' },
          update: {},
          create: {
            id: 'prod-001',
            storeId: storeProfile.id,
            name: 'Pagne Kente Traditionnel',
            description: 'Authentique pagne Kente tissé à la main, 100% coton',
            price: 25000,
            category: 'Textiles Traditionnels',
            images: [
              'https://images.unsplash.com/photo-1594736797933-d0401ba942fe?w=400',
              'https://images.unsplash.com/photo-1583306958754-82d61a82b0e4?w=400'
            ],
            stock: 15,
            weight: 0.5
          }
        }),

        prisma.product.upsert({
          where: { id: 'prod-002' },
          update: {},
          create: {
            id: 'prod-002',
            storeId: storeProfile.id,
            name: 'Robe Africaine Moderne',
            description: 'Robe élégante avec motifs africains contemporains',
            price: 35000,
            category: 'Vêtements Femme',
            images: [
              'https://images.unsplash.com/photo-1554213353-370c228b2c9e?w=400'
            ],
            stock: 8,
            weight: 0.3
          }
        }),

        prisma.product.upsert({
          where: { id: 'prod-003' },
          update: {},
          create: {
            id: 'prod-003',
            storeId: storeProfile.id,
            name: 'Bijoux en Perles Africaines',
            description: 'Collier et bracelet assortis en perles traditionnelles',
            price: 15000,
            category: 'Accessoires',
            images: [
              'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'
            ],
            stock: 20,
            weight: 0.1
          }
        })
      ]);

      console.log('✅ Produits créés');
    }

    // Créer quelques transactions d'exemple
    const clientWallet = await prisma.wallet.findFirst({
      where: { user: { phoneNumber: '+22812345678' } }
    });

    if (clientWallet) {
      await Promise.all([
        prisma.transaction.create({
          data: {
            walletId: clientWallet.id,
            type: 'DEPOSIT',
            amount: 30000,
            paymentMethod: 'YAS',
            status: 'COMPLETED',
            description: 'Recharge via YAS Mobile Money',
            externalRef: 'YAS_TX_001',
            processedAt: new Date(Date.now() - 86400000) // Hier
          }
        }),

        prisma.transaction.create({
          data: {
            walletId: clientWallet.id,
            type: 'PAYMENT',
            amount: -5000,
            paymentMethod: 'WALLET',
            status: 'COMPLETED',
            description: 'Course Taxi - Tokoin vers Aéroport',
            processedAt: new Date(Date.now() - 3600000) // Il y a 1 heure
          }
        })
      ]);

      console.log('✅ Transactions créées');
    }

    // Créer quelques notifications
    const allUsers = await prisma.user.findMany({
      select: { id: true }
    });

    for (const user of allUsers) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Bienvenue sur Ecom!',
          message: 'Découvrez toutes les fonctionnalités de votre nouvelle app de transport et marketplace',
          type: 'GENERAL'
        }
      });
    }

    console.log('✅ Notifications créées');

    console.log('🎉 Seed terminé avec succès!');
    console.log('');
    console.log('📱 Comptes de test créés:');
    console.log('  - Client: +22812345678 (50,000 F CFA)');
    console.log('  - Chauffeur: +22812345679 (25,000 F CFA)');
    console.log('  - Boutique: +22812345680 (100,000 F CFA)');
    console.log('');
    console.log('🏪 Boutique "Ama Fashion" avec 3 produits');
    console.log('💰 Transactions et notifications d\'exemple créées');

  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le seed si appelé directement
if (require.main === module) {
  seed();
}

module.exports = seed;