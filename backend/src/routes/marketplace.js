const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { optionalAuth, requireStoreProfile } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Schémas de validation
const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(1000).optional(),
  price: Joi.number().positive().max(10000000).required(),
  category: Joi.string().min(2).max(50).required(),
  images: Joi.array().items(Joi.string().uri()).max(5).optional(),
  stock: Joi.number().integer().min(0).optional().default(0),
  weight: Joi.number().positive().optional(),
  dimensions: Joi.string().optional()
});

const orderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required()
    })
  ).min(1).required(),
  deliveryAddress: Joi.string().min(10).max(255).required(),
  deliveryLat: Joi.number().min(-90).max(90).optional(),
  deliveryLng: Joi.number().min(-180).max(180).optional(),
  phoneNumber: Joi.string().pattern(/^(?:\+228|228)?[0-9]{8}$/).required(),
  notes: Joi.string().max(500).optional(),
  paymentMethod: Joi.string().valid('WALLET', 'YAS', 'FLOOZ', 'VISA', 'MASTERCARD', 'PI_SPI_BCEAO').required()
});

/**
 * @swagger
 * /api/marketplace/stores:
 *   get:
 *     summary: Obtenir la liste des boutiques
 *     tags: [Marketplace]
 */
router.get('/stores', optionalAuth, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const category = req.query.category;
  const search = req.query.search;
  const sortBy = req.query.sortBy || 'rating'; // rating, name, totalOrders
  
  const skip = (page - 1) * limit;

  const where = { isActive: true };
  
  if (category) {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { storeName: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  const orderBy = {};
  switch (sortBy) {
    case 'name':
      orderBy.storeName = 'asc';
      break;
    case 'totalOrders':
      orderBy.totalOrders = 'desc';
      break;
    default:
      orderBy.rating = 'desc';
  }

  const [stores, total] = await Promise.all([
    prisma.storeProfile.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        storeName: true,
        description: true,
        category: true,
        address: true,
        logo: true,
        banner: true,
        rating: true,
        totalOrders: true,
        createdAt: true,
        _count: {
          select: { products: true }
        }
      }
    }),
    prisma.storeProfile.count({ where })
  ]);

  const formattedStores = stores.map(store => ({
    id: store.id,
    name: store.storeName,
    description: store.description,
    category: store.category,
    address: store.address,
    logo: store.logo,
    banner: store.banner,
    rating: parseFloat(store.rating),
    totalOrders: store.totalOrders,
    totalProducts: store._count.products,
    createdAt: store.createdAt
  }));

  res.json({
    success: true,
    stores: formattedStores,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

/**
 * @swagger
 * /api/marketplace/stores/{id}:
 *   get:
 *     summary: Obtenir les détails d'une boutique
 *     tags: [Marketplace]
 */
router.get('/stores/:id', optionalAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const store = await prisma.storeProfile.findUnique({
    where: { id, isActive: true },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          createdAt: true
        }
      },
      products: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 20
      },
      _count: {
        select: {
          products: true,
          orders: true
        }
      }
    }
  });

  if (!store) {
    throw new AppError('Boutique non trouvée', 404);
  }

  const formattedStore = {
    id: store.id,
    name: store.storeName,
    description: store.description,
    category: store.category,
    address: store.address,
    location: store.latitude && store.longitude ? {
      lat: parseFloat(store.latitude),
      lng: parseFloat(store.longitude)
    } : null,
    phoneNumber: store.phoneNumber,
    email: store.email,
    logo: store.logo,
    banner: store.banner,
    rating: parseFloat(store.rating),
    totalOrders: store.totalOrders,
    owner: store.user,
    stats: {
      totalProducts: store._count.products,
      totalOrders: store._count.orders
    },
    products: store.products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      category: product.category,
      images: product.images,
      stock: product.stock,
      weight: product.weight ? parseFloat(product.weight) : null,
      dimensions: product.dimensions,
      isActive: product.isActive,
      createdAt: product.createdAt
    })),
    createdAt: store.createdAt
  };

  res.json({
    success: true,
    store: formattedStore
  });
}));

/**
 * @swagger
 * /api/marketplace/products:
 *   get:
 *     summary: Rechercher des produits
 *     tags: [Marketplace]
 */
router.get('/products', optionalAuth, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const category = req.query.category;
  const search = req.query.search;
  const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : undefined;
  const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined;
  const storeId = req.query.storeId;
  const sortBy = req.query.sortBy || 'createdAt'; // createdAt, price, name
  const sortOrder = req.query.sortOrder || 'desc'; // asc, desc
  
  const skip = (page - 1) * limit;

  const where = {
    isActive: true,
    store: { isActive: true }
  };

  if (category) {
    where.category = category;
  }

  if (storeId) {
    where.storeId = storeId;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  const orderBy = {};
  orderBy[sortBy] = sortOrder;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        store: {
          select: {
            id: true,
            storeName: true,
            logo: true,
            rating: true
          }
        }
      }
    }),
    prisma.product.count({ where })
  ]);

  const formattedProducts = products.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: parseFloat(product.price),
    category: product.category,
    images: product.images,
    stock: product.stock,
    weight: product.weight ? parseFloat(product.weight) : null,
    dimensions: product.dimensions,
    store: {
      id: product.store.id,
      name: product.store.storeName,
      logo: product.store.logo,
      rating: parseFloat(product.store.rating)
    },
    createdAt: product.createdAt
  }));

  res.json({
    success: true,
    products: formattedProducts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

/**
 * @swagger
 * /api/marketplace/products/{id}:
 *   get:
 *     summary: Obtenir les détails d'un produit
 *     tags: [Marketplace]
 */
router.get('/products/:id', optionalAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id, isActive: true },
    include: {
      store: {
        select: {
          id: true,
          storeName: true,
          description: true,
          address: true,
          phoneNumber: true,
          logo: true,
          banner: true,
          rating: true,
          totalOrders: true
        }
      }
    }
  });

  if (!product || !product.store.isActive) {
    throw new AppError('Produit non trouvé', 404);
  }

  const formattedProduct = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: parseFloat(product.price),
    category: product.category,
    images: product.images,
    stock: product.stock,
    weight: product.weight ? parseFloat(product.weight) : null,
    dimensions: product.dimensions,
    store: {
      id: product.store.id,
      name: product.store.storeName,
      description: product.store.description,
      address: product.store.address,
      phoneNumber: product.store.phoneNumber,
      logo: product.store.logo,
      banner: product.store.banner,
      rating: parseFloat(product.store.rating),
      totalOrders: product.store.totalOrders
    },
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };

  res.json({
    success: true,
    product: formattedProduct
  });
}));

/**
 * @swagger
 * /api/marketplace/products:
 *   post:
 *     summary: Créer un nouveau produit (propriétaire de boutique)
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 */
router.post('/products', requireStoreProfile, asyncHandler(async (req, res) => {
  const { error, value } = productSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const storeId = req.user.storeProfile.id;

  const product = await prisma.product.create({
    data: {
      storeId,
      ...value
    }
  });

  res.status(201).json({
    success: true,
    message: 'Produit créé avec succès',
    product: {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      category: product.category,
      images: product.images,
      stock: product.stock,
      weight: product.weight ? parseFloat(product.weight) : null,
      dimensions: product.dimensions,
      isActive: product.isActive,
      createdAt: product.createdAt
    }
  });
}));

/**
 * @swagger
 * /api/marketplace/orders:
 *   post:
 *     summary: Passer une commande
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 */
router.post('/orders', asyncHandler(async (req, res) => {
  const { error, value } = orderSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const { items, deliveryAddress, deliveryLat, deliveryLng, phoneNumber, notes, paymentMethod } = value;
  const userId = req.userId;

  // Vérifier que tous les produits existent et calculer le total
  const productIds = items.map(item => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      isActive: true
    },
    include: {
      store: {
        select: {
          id: true,
          storeName: true,
          isActive: true
        }
      }
    }
  });

  if (products.length !== productIds.length) {
    throw new AppError('Un ou plusieurs produits sont introuvables', 400);
  }

  // Vérifier que tous les produits appartiennent à la même boutique
  const storeIds = [...new Set(products.map(p => p.storeId))];
  if (storeIds.length > 1) {
    throw new AppError('Tous les produits doivent provenir de la même boutique', 400);
  }

  const store = products[0].store;
  if (!store.isActive) {
    throw new AppError('Cette boutique n\'est plus active', 400);
  }

  // Vérifier le stock et calculer le total
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    
    if (product.stock < item.quantity) {
      throw new AppError(`Stock insuffisant pour ${product.name}. Stock disponible: ${product.stock}`, 400);
    }

    const itemTotal = parseFloat(product.price) * item.quantity;
    totalAmount += itemTotal;

    orderItems.push({
      productId: product.id,
      quantity: item.quantity,
      price: product.price
    });
  }

  // Calculer les frais de livraison (exemple simple)
  const deliveryFee = totalAmount > 10000 ? 0 : 1500; // Livraison gratuite > 10,000 F CFA
  const finalAmount = totalAmount + deliveryFee;

  // Vérifier le solde pour paiement wallet
  if (paymentMethod === 'WALLET') {
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      throw new AppError('Portefeuille non trouvé', 400);
    }

    const availableBalance = parseFloat(wallet.balance) - parseFloat(wallet.blockedAmount);
    if (availableBalance < finalAmount) {
      throw new AppError('Solde insuffisant', 400);
    }
  }

  // Créer la commande
  const orderNumber = `ECM${Date.now()}${Math.floor(Math.random() * 1000)}`;
  
  const order = await prisma.$transaction(async (tx) => {
    // Créer la commande
    const newOrder = await tx.order.create({
      data: {
        userId,
        storeId: store.id,
        orderNumber,
        totalAmount: finalAmount,
        deliveryFee,
        deliveryAddress,
        deliveryLat,
        deliveryLng,
        phoneNumber,
        notes,
        paymentMethod,
        status: paymentMethod === 'WALLET' ? 'CONFIRMED' : 'PENDING'
      }
    });

    // Créer les items de la commande
    await tx.orderItem.createMany({
      data: orderItems.map(item => ({
        orderId: newOrder.id,
        ...item
      }))
    });

    // Mettre à jour le stock des produits
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity }
        }
      });
    }

    // Traitement du paiement wallet
    if (paymentMethod === 'WALLET') {
      await tx.wallet.update({
        where: { userId },
        data: {
          balance: { decrement: finalAmount }
        }
      });

      await tx.transaction.create({
        data: {
          walletId: req.user.wallet.id,
          type: 'PAYMENT',
          amount: -finalAmount,
          paymentMethod: 'WALLET',
          status: 'COMPLETED',
          description: `Commande ${orderNumber} - ${store.storeName}`,
          orderId: newOrder.id,
          processedAt: new Date()
        }
      });

      await tx.order.update({
        where: { id: newOrder.id },
        data: {
          paidAt: new Date(),
          confirmedAt: new Date()
        }
      });
    }

    return newOrder;
  });

  res.status(201).json({
    success: true,
    message: 'Commande créée avec succès',
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: parseFloat(order.totalAmount),
      deliveryFee: parseFloat(order.deliveryFee),
      paymentMethod: order.paymentMethod,
      items: orderItems,
      store: {
        id: store.id,
        name: store.storeName
      }
    }
  });
}));

/**
 * @swagger
 * /api/marketplace/categories:
 *   get:
 *     summary: Obtenir les catégories disponibles
 *     tags: [Marketplace]
 */
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await prisma.product.groupBy({
    by: ['category'],
    where: {
      isActive: true,
      store: { isActive: true }
    },
    _count: {
      category: true
    },
    orderBy: {
      _count: {
        category: 'desc'
      }
    }
  });

  res.json({
    success: true,
    categories: categories.map(cat => ({
      name: cat.category,
      productCount: cat._count.category
    }))
  });
}));

module.exports = router;