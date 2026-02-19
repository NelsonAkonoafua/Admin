require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');

const connectDB = require('../config/database');

// Seed data
const categories = [
  { name: 'Dresses', description: 'Elegant dresses for every occasion', displayOrder: 1, isActive: true },
  { name: 'Tops', description: 'Stylish tops and blouses', displayOrder: 2, isActive: true },
  { name: 'Bottoms', description: 'Skirts, pants, and more', displayOrder: 3, isActive: true },
  { name: 'Outerwear', description: 'Jackets, coats, and blazers', displayOrder: 4, isActive: true },
  { name: 'Accessories', description: 'Complete your look', displayOrder: 5, isActive: true },
  { name: 'Loungewear', description: 'Comfortable everyday styles', displayOrder: 6, isActive: true }
];

const generateVariants = (colors, sizes) => {
  const variants = [];
  colors.forEach(({ color, colorCode }) => {
    sizes.forEach(size => {
      variants.push({
        size,
        color,
        colorCode,
        stock: Math.floor(Math.random() * 20) + 5,
        sku: `SKU-${color.toUpperCase()}-${size}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
      });
    });
  });
  return variants;
};

const fashionImages = [
  'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600',
  'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?w=600',
  'https://images.unsplash.com/photo-1583744946564-b52d01a7a37f?w=600',
  'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600',
  'https://images.unsplash.com/photo-1551803091-e20673f15770?w=600',
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600',
  'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600',
  'https://images.unsplash.com/photo-1562572159-4efd90232463?w=600',
  'https://images.unsplash.com/photo-1590086782957-93c06ef21604?w=600'
];

const seedProducts = (categoryMap) => [
  {
    name: 'Silk Slip Dress',
    shortDescription: 'Luxurious silk slip dress with delicate spaghetti straps',
    description: 'Elevate your wardrobe with this stunning silk slip dress. The fluid silhouette drapes beautifully on all body types. Perfect for evening events or styled casually with a blazer for the office.',
    price: 189.00,
    compareAtPrice: 240.00,
    category: categoryMap['Dresses'],
    images: [
      { url: fashionImages[0], alt: 'Silk Slip Dress - Front', isPrimary: true },
      { url: fashionImages[1], alt: 'Silk Slip Dress - Back' }
    ],
    variants: generateVariants(
      [{ color: 'Champagne', colorCode: '#F7E7CE' }, { color: 'Ivory', colorCode: '#FFFFF0' }, { color: 'Black', colorCode: '#000000' }],
      ['XS', 'S', 'M', 'L', 'XL']
    ),
    material: '100% Silk',
    tags: ['silk', 'dress', 'evening', 'luxury'],
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false
  },
  {
    name: 'Wrap Midi Dress',
    shortDescription: 'Flattering wrap-style midi dress in floral print',
    description: 'This beautifully draped wrap midi dress features a figure-flattering silhouette with a versatile tie waist. The soft, flowing fabric moves elegantly with you.',
    price: 145.00,
    compareAtPrice: 185.00,
    category: categoryMap['Dresses'],
    images: [
      { url: fashionImages[2], alt: 'Wrap Midi Dress', isPrimary: true },
      { url: fashionImages[3], alt: 'Wrap Midi Dress - Detail' }
    ],
    variants: generateVariants(
      [{ color: 'Floral Pink', colorCode: '#FFB6C1' }, { color: 'Navy Blue', colorCode: '#000080' }],
      ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    ),
    material: '95% Viscose, 5% Elastane',
    tags: ['wrap', 'midi', 'floral', 'summer'],
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true
  },
  {
    name: 'Cashmere Crewneck',
    shortDescription: 'Premium cashmere crewneck sweater in classic styles',
    description: 'Indulge in the ultimate softness of our 100% cashmere crewneck. A wardrobe essential that transitions seamlessly from season to season. Timeless elegance meets everyday comfort.',
    price: 225.00,
    compareAtPrice: 280.00,
    category: categoryMap['Tops'],
    images: [
      { url: fashionImages[4], alt: 'Cashmere Crewneck', isPrimary: true }
    ],
    variants: generateVariants(
      [{ color: 'Oatmeal', colorCode: '#F5DEB3' }, { color: 'Dusty Rose', colorCode: '#DCAE96' }, { color: 'Sage', colorCode: '#77B28C' }, { color: 'Black', colorCode: '#000000' }],
      ['XS', 'S', 'M', 'L', 'XL']
    ),
    material: '100% Cashmere',
    tags: ['cashmere', 'sweater', 'luxury', 'winter'],
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true
  },
  {
    name: 'Linen Wide-Leg Trousers',
    shortDescription: 'Relaxed linen wide-leg trousers for effortless style',
    description: 'These beautifully tailored wide-leg trousers are crafted from premium linen for a breathable, elegant look. The high waist and wide silhouette create a sophisticated, elongating effect.',
    price: 135.00,
    compareAtPrice: null,
    category: categoryMap['Bottoms'],
    images: [
      { url: fashionImages[5], alt: 'Linen Wide-Leg Trousers', isPrimary: true }
    ],
    variants: generateVariants(
      [{ color: 'Natural', colorCode: '#F5DEB3' }, { color: 'White', colorCode: '#FFFFFF' }, { color: 'Black', colorCode: '#000000' }, { color: 'Tan', colorCode: '#D2B48C' }],
      ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    ),
    material: '100% Linen',
    tags: ['linen', 'trousers', 'wide-leg', 'summer'],
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false
  },
  {
    name: 'Oversized Blazer',
    shortDescription: 'Structured oversized blazer for polished looks',
    description: 'The ultimate power piece. This oversized blazer is crafted with premium suiting fabric and features a beautifully structured silhouette. Style over a slip dress or tailored trousers.',
    price: 265.00,
    compareAtPrice: 320.00,
    category: categoryMap['Outerwear'],
    images: [
      { url: fashionImages[6], alt: 'Oversized Blazer', isPrimary: true },
      { url: fashionImages[7], alt: 'Oversized Blazer - Detail' }
    ],
    variants: generateVariants(
      [{ color: 'Camel', colorCode: '#C19A6B' }, { color: 'Black', colorCode: '#000000' }, { color: 'Ecru', colorCode: '#F2ECD8' }],
      ['XS', 'S', 'M', 'L', 'XL']
    ),
    material: '70% Wool, 30% Polyester',
    tags: ['blazer', 'outerwear', 'professional', 'fall'],
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: false
  },
  {
    name: 'Ribbed Knit Set',
    shortDescription: 'Matching ribbed knit top and shorts co-ord set',
    description: 'A relaxed yet effortlessly chic co-ord set in premium ribbed knit. The matching top and shorts can be worn together or separately for versatile styling options.',
    price: 165.00,
    compareAtPrice: null,
    category: categoryMap['Loungewear'],
    images: [
      { url: fashionImages[8], alt: 'Ribbed Knit Set', isPrimary: true }
    ],
    variants: generateVariants(
      [{ color: 'Stone', colorCode: '#928E85' }, { color: 'Taupe', colorCode: '#483C32' }, { color: 'Blush', colorCode: '#DE9BA0' }],
      ['XS', 'S', 'M', 'L', 'XL']
    ),
    material: '92% Cotton, 8% Elastane',
    tags: ['knit', 'set', 'loungewear', 'casual'],
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: true
  },
  {
    name: 'Pleated Mini Skirt',
    shortDescription: 'Elegant pleated mini skirt in premium suiting fabric',
    description: 'A modern take on a classic silhouette. This pleated mini skirt features beautiful knife pleats in a premium fabric that drapes perfectly. Style with a tucked-in blouse or knitwear.',
    price: 98.00,
    compareAtPrice: 125.00,
    category: categoryMap['Bottoms'],
    images: [
      { url: fashionImages[9], alt: 'Pleated Mini Skirt', isPrimary: true }
    ],
    variants: generateVariants(
      [{ color: 'Cream', colorCode: '#FFF8DC' }, { color: 'Black', colorCode: '#000000' }, { color: 'Burgundy', colorCode: '#800020' }],
      ['XS', 'S', 'M', 'L', 'XL']
    ),
    material: '60% Polyester, 40% Viscose',
    tags: ['skirt', 'mini', 'pleated', 'elegant'],
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true
  },
  {
    name: 'Off-Shoulder Blouse',
    shortDescription: 'Romantic off-shoulder blouse with delicate ruffle detail',
    description: 'Effortlessly romantic, this off-shoulder blouse features delicate ruffles and a relaxed fit. The gathered neckline creates a feminine silhouette that\'s perfect for any occasion.',
    price: 88.00,
    compareAtPrice: 110.00,
    category: categoryMap['Tops'],
    images: [
      { url: fashionImages[10], alt: 'Off-Shoulder Blouse', isPrimary: true }
    ],
    variants: generateVariants(
      [{ color: 'White', colorCode: '#FFFFFF' }, { color: 'Blush', colorCode: '#FFB6C1' }, { color: 'Sky Blue', colorCode: '#87CEEB' }],
      ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    ),
    material: '100% Cotton',
    tags: ['blouse', 'off-shoulder', 'romantic', 'summer'],
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false
  },
  {
    name: 'Trench Coat',
    shortDescription: 'Classic double-breasted trench coat in premium cotton',
    description: 'A timeless wardrobe investment. This classic trench coat is crafted from premium cotton gabardine and features all the hallmarks of the iconic style: double-breasted buttons, belted waist, and storm flap.',
    price: 385.00,
    compareAtPrice: 450.00,
    category: categoryMap['Outerwear'],
    images: [
      { url: fashionImages[11], alt: 'Trench Coat', isPrimary: true }
    ],
    variants: generateVariants(
      [{ color: 'Classic Beige', colorCode: '#C19A6B' }, { color: 'Black', colorCode: '#000000' }],
      ['XS', 'S', 'M', 'L', 'XL']
    ),
    material: '100% Cotton Gabardine',
    tags: ['trench', 'coat', 'classic', 'outerwear'],
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: false
  },
  {
    name: 'Satin Cami Top',
    shortDescription: 'Silky satin camisole with adjustable straps',
    description: 'Versatile and luxurious, this satin cami top can be dressed up or down for any occasion. The adjustable straps and V-neckline create a flattering look, while the fluid satin drapes beautifully.',
    price: 68.00,
    compareAtPrice: null,
    category: categoryMap['Tops'],
    images: [
      { url: fashionImages[0], alt: 'Satin Cami Top', isPrimary: true }
    ],
    variants: generateVariants(
      [{ color: 'Gold', colorCode: '#FFD700' }, { color: 'Black', colorCode: '#000000' }, { color: 'Blush Pink', colorCode: '#FFB6C1' }, { color: 'Ivory', colorCode: '#FFFFF0' }],
      ['XS', 'S', 'M', 'L', 'XL']
    ),
    material: '100% Polyester Satin',
    tags: ['satin', 'cami', 'versatile', 'evening'],
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false
  },
  {
    name: 'Maxi Floral Dress',
    shortDescription: 'Flowing maxi dress in a vibrant floral print',
    description: 'Make a statement in this stunning floral maxi dress. The flowing silhouette and vibrant print make it perfect for summer events, beach holidays, or outdoor gatherings.',
    price: 168.00,
    compareAtPrice: 210.00,
    category: categoryMap['Dresses'],
    images: [
      { url: fashionImages[3], alt: 'Maxi Floral Dress', isPrimary: true }
    ],
    variants: generateVariants(
      [{ color: 'Garden Print', colorCode: '#90EE90' }, { color: 'Sunset Print', colorCode: '#FF7F50' }],
      ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    ),
    material: '100% Viscose',
    tags: ['maxi', 'floral', 'summer', 'print'],
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false
  },
  {
    name: 'Pearl Hair Clip Set',
    shortDescription: 'Set of 3 elegant pearl-embellished hair clips',
    description: 'Add a touch of elegance to any hairstyle with these beautiful pearl-embellished hair clips. Set of 3 clips in varying sizes, perfect for everyday wear or special occasions.',
    price: 42.00,
    compareAtPrice: null,
    category: categoryMap['Accessories'],
    images: [
      { url: fashionImages[2], alt: 'Pearl Hair Clip Set', isPrimary: true }
    ],
    variants: [
      { size: 'One Size', color: 'Gold/Pearl', colorCode: '#FFD700', stock: 30, sku: 'ACC-PEARL-GOLD-001' },
      { size: 'One Size', color: 'Silver/Pearl', colorCode: '#C0C0C0', stock: 25, sku: 'ACC-PEARL-SILV-001' }
    ],
    tags: ['accessories', 'hair', 'pearl', 'elegant'],
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false
  }
];

const seedReviews = (users, products) => [
  {
    product: products[0]._id,
    user: users[1]._id,
    rating: 5,
    title: 'Absolutely stunning dress',
    comment: 'The quality of this silk slip dress is exceptional. It drapes beautifully and the champagne color is even more gorgeous in person. Received so many compliments!',
    isVerifiedPurchase: true
  },
  {
    product: products[0]._id,
    user: users[2]._id,
    rating: 4,
    title: 'Beautiful but runs small',
    comment: 'Gorgeous dress with excellent fabric quality. I would recommend sizing up. The length is perfect for my 5\'7" frame.',
    isVerifiedPurchase: true
  },
  {
    product: products[2]._id,
    user: users[1]._id,
    rating: 5,
    title: 'Worth every penny',
    comment: 'This cashmere is the softest I\'ve ever felt. It\'s become my go-to for cool evenings. The oatmeal color is beautiful and versatile.',
    isVerifiedPurchase: false
  },
  {
    product: products[4]._id,
    user: users[2]._id,
    rating: 5,
    title: 'Perfect blazer',
    comment: 'This blazer elevates everything I wear it with. The camel color is chef\'s kiss. Excellent construction and fits perfectly.',
    isVerifiedPurchase: true
  }
];

const seedCoupons = () => [
  {
    code: 'WELCOME20',
    description: '20% off for new customers',
    discountType: 'percentage',
    discountValue: 20,
    minimumOrderAmount: 50,
    maximumDiscount: 100,
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
  },
  {
    code: 'SUMMER15',
    description: '15% off summer collection',
    discountType: 'percentage',
    discountValue: 15,
    minimumOrderAmount: 80,
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
  },
  {
    code: 'FREESHIP',
    description: '$10 off (covers standard shipping)',
    discountType: 'fixed',
    discountValue: 10,
    minimumOrderAmount: 0,
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Review.deleteMany({}),
      Coupon.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      firstName: 'Abby',
      lastName: 'Admin',
      email: 'admin@forabby.com',
      password: 'Admin@123456',
      role: 'admin',
      isEmailVerified: true,
      isActive: true
    });

    // Create regular users
    const user1 = await User.create({
      firstName: 'Emma',
      lastName: 'Johnson',
      email: 'emma@example.com',
      password: 'User@123456',
      role: 'user',
      isEmailVerified: true,
      isActive: true
    });

    const user2 = await User.create({
      firstName: 'Sofia',
      lastName: 'Martinez',
      email: 'sofia@example.com',
      password: 'User@123456',
      role: 'user',
      isEmailVerified: true,
      isActive: true
    });

    const users = [adminUser, user1, user2];
    console.log('👤 Created users');

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    const categoryMap = createdCategories.reduce((acc, cat) => {
      acc[cat.name] = cat._id;
      return acc;
    }, {});
    console.log('📂 Created categories');

    // Create products
    const productsData = seedProducts(categoryMap);
    const createdProducts = await Product.insertMany(productsData);
    console.log('👗 Created products');

    // Create reviews
    const reviewsData = seedReviews(users, createdProducts);
    await Review.insertMany(reviewsData);

    // Update product ratings
    for (const product of createdProducts) {
      await Review.updateProductRating(product._id);
    }
    console.log('⭐ Created reviews');

    // Create coupons
    await Coupon.insertMany(seedCoupons());
    console.log('🎟️  Created coupons');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login credentials:');
    console.log('   Admin: admin@forabby.com / Admin@123456');
    console.log('   User:  emma@example.com / User@123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
