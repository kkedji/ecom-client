// Netlify Function - Marketplace
const express = require('express');
const serverless = require('serverless-http');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Middleware d'authentification
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'authentification requis' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
}

// GET /stores - Liste des boutiques
app.get('/stores', async (req, res) => {
  try {
    const { category, search, lat, lng, radius = 10 } = req.query;
    
    let where = { isActive: true };
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { storeName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const stores = await prisma.storeProfile.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true
          }
        },
        _count: {
          select: {
            products: { where: { isActive: true } }
          }
        }
      },
      orderBy: [
        { rating: 'desc' },
        { totalOrders: 'desc' }
      ]
    });

    // Si des coordonnées sont fournies, calculer la distance
    let storesWithDistance = stores;
    if (lat && lng) {
      storesWithDistance = stores.map(store => {
        const distance = calculateDistance(
          parseFloat(lat), 
          parseFloat(lng),
          store.latitude, 
          store.longitude
        );
        return { ...store, distance };
      }).filter(store => store.distance <= radius)
        .sort((a, b) => a.distance - b.distance);
    }

    res.json({
      stores: storesWithDistance,
      total: storesWithDistance.length
    });

  } catch (error) {
    console.error('Erreur liste boutiques:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des boutiques' });
  }
});

// GET /stores/:id - Détails d'une boutique
app.get('/stores/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const store = await prisma.storeProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true
          }
        },
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'Boutique non trouvée' });
    }

    res.json(store);

  } catch (error) {
    console.error('Erreur détails boutique:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la boutique' });
  }
});

// GET /products - Liste des produits
app.get('/products', async (req, res) => {
  try {
    const { 
      category, 
      search, 
      storeId, 
      minPrice, 
      maxPrice, 
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    let where = { isActive: true };

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (storeId) {
      where.storeId = storeId;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        store: {
          select: {
            storeName: true,
            rating: true,
            address: true
          }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    const total = await prisma.product.count({ where });

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erreur liste produits:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
  }
});

// GET /products/:id - Détails d'un produit
app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        store: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phoneNumber: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    res.json(product);

  } catch (error) {
    console.error('Erreur détails produit:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du produit' });
  }
});

// POST /orders - Créer une commande
app.post('/orders', authenticateToken, async (req, res) => {
  try {
    const { items, deliveryAddress, deliveryLat, deliveryLng, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Articles requis' });
    }

    if (!deliveryAddress || !deliveryLat || !deliveryLng) {
      return res.status(400).json({ error: 'Adresse de livraison complète requise' });
    }

    // Récupérer les détails des produits
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { store: true }
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: 'Certains produits sont introuvables' });
    }

    // Vérifier les stocks et calculer le total
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Stock insuffisant pour ${product.name}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal
      });
    }

    // Calculer les frais de livraison (simulation)
    const deliveryFee = calculateDeliveryFee(deliveryLat, deliveryLng);
    const total = subtotal + deliveryFee;

    // Vérifier le solde du portefeuille
    const wallet = await prisma.wallet.findFirst({
      where: { userId: req.user.userId }
    });

    if (!wallet || wallet.balance < total) {
      return res.status(400).json({ 
        error: 'Solde insuffisant',
        required: total,
        available: wallet?.balance || 0
      });
    }

    // Créer la commande dans une transaction
    const order = await prisma.$transaction(async (tx) => {
      // Créer la commande
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.userId,
          storeId: products[0].storeId, // Première boutique (simplification)
          subtotal,
          deliveryFee,
          total,
          deliveryAddress,
          deliveryLat,
          deliveryLng,
          notes,
          status: 'PENDING',
          items: {
            create: orderItems
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          store: true
        }
      });

      // Débiter le portefeuille
      await tx.wallet.update({
        where: { userId: req.user.userId },
        data: { balance: { decrement: total } }
      });

      // Créer la transaction
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'PAYMENT',
          amount: -total,
          paymentMethod: 'WALLET',
          status: 'COMPLETED',
          description: `Commande #${newOrder.orderNumber}`,
          processedAt: new Date()
        }
      });

      // Décrémenter les stocks
      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      return newOrder;
    });

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      order
    });

  } catch (error) {
    console.error('Erreur création commande:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la commande' });
  }
});

// GET /orders - Mes commandes
app.get('/orders', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let where = { userId: req.user.userId };
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true
              }
            }
          }
        },
        store: {
          select: {
            storeName: true,
            phoneNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    const total = await prisma.order.count({ where });

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erreur liste commandes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes' });
  }
});

// GET /orders/:id - Détails d'une commande
app.get('/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: { 
        id,
        userId: req.user.userId 
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        store: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phoneNumber: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    res.json(order);

  } catch (error) {
    console.error('Erreur détails commande:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la commande' });
  }
});

// Fonction utilitaire pour calculer la distance
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Fonction pour calculer les frais de livraison
function calculateDeliveryFee(lat, lng) {
  // Centre de Lomé (approximation)
  const LOME_CENTER_LAT = 6.1319;
  const LOME_CENTER_LNG = 1.2228;
  
  const distance = calculateDistance(LOME_CENTER_LAT, LOME_CENTER_LNG, lat, lng);
  
  // Tarif de base + distance
  const baseFee = 1000; // 1000 F CFA de base
  const distanceFee = Math.ceil(distance) * 200; // 200 F CFA par km
  
  return baseFee + distanceFee;
}

module.exports.handler = serverless(app);