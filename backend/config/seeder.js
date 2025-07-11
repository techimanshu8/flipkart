const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flipkart-clone');

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@flipkart.com',
    password: 'password123',
    role: 'admin',
  },
  {
    name: 'Regular User',
    email: 'user@flipkart.com',
    password: 'password123',
    role: 'customer',
  },
];

const categories = [
  {
    name: 'Electronics',
    description: 'Electronic devices and gadgets',
    slug: 'electronics',
  },
  {
    name: 'Clothing',
    description: 'Fashion and apparel',
    slug: 'clothing',
  },
  {
    name: 'Home & Kitchen',
    description: 'Home appliances and kitchen items',
    slug: 'home-kitchen',
  },
  {
    name: 'Books',
    description: 'Books and literature',
    slug: 'books',
  },
  {
    name: 'Sports',
    description: 'Sports and fitness equipment',
    slug: 'sports',
  },
];

// Import data
const importData = async () => {
  try {
    //await User.deleteMany();
   // await Category.deleteMany();
    await Product.deleteMany();

    // Hash passwords for users
    //for (let user of users) {
      //const salt = await bcrypt.genSalt(10);
  //    user.password = await bcrypt.hash(user.password, salt);
   // }

   //const createdUsers = await User.insertMany(users);
   //const adminUser = createdUsers[0]._id;
   const adminUser = await User.findOne({email:"user@flipkart.com"});
    console.log(adminUser);
    //const createdCategories = await Category.find();
    const createdCategories = await Category.find({ isActive: true })
    // Sample products 
    const products = [
  // Electronics (20 products)
  {
    name: 'iPhone 15 Pro',      
    description: 'Latest iPhone with advanced features',
    price: 999,
    originalPrice: 1199,
    category: createdCategories[0]._id, // Electronics
    brand: 'Apple',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=iPhone+15+Pro',
        alt: 'iPhone 15 Pro',
      },
    ],
    stock: 50,
    sku: 'IPHONE15PRO001',
    rating: 4.8,
    numReviews: 150,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Flagship Android phone with stunning camera',
    price: 1099,
    originalPrice: 1299,
    category: createdCategories[0]._id, // Electronics
    brand: 'Samsung',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Galaxy+S24+Ultra',
        alt: 'Samsung Galaxy S24 Ultra',
      },
    ],
    stock: 45,
    sku: 'SAMSUNGS24U001',
    rating: 4.7,
    numReviews: 120,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Industry-leading noise cancelling headphones',
    price: 349,
    originalPrice: 399,
    category: createdCategories[0]._id, // Electronics
    brand: 'Sony',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Sony+Headphones',
        alt: 'Sony WH-1000XM5 Headphones',
      },
    ],
    stock: 70,
    sku: 'SONYWH1000XM5',
    rating: 4.9,
    numReviews: 200,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Dell XPS 15 Laptop',
    description: 'Powerful laptop for creative professionals',
    price: 1899,
    originalPrice: 2099,
    category: createdCategories[0]._id, // Electronics
    brand: 'Dell',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Dell+XPS+15',
        alt: 'Dell XPS 15 Laptop',
      },
    ],
    stock: 30,
    sku: 'DELLXPS15001',
    rating: 4.6,
    numReviews: 90,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: 'LG C3 OLED TV',
    description: 'Stunning 4K OLED TV for immersive viewing',
    price: 1499,
    originalPrice: 1799,
    category: createdCategories[0]._id, // Electronics
    brand: 'LG',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=LG+C3+OLED+TV',
        alt: 'LG C3 OLED TV',
      },
    ],
    stock: 25,
    sku: 'LGC3OLEDTV001',
    rating: 4.9,
    numReviews: 180,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: 'Apple Watch Series 9',
    description: 'Advanced smartwatch with health features',
    price: 399,
    originalPrice: 429,
    category: createdCategories[0]._id, // Electronics
    brand: 'Apple',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Apple+Watch+S9',
        alt: 'Apple Watch Series 9',
      },
    ],
    stock: 60,
    sku: 'APPLEWATCHS9',
    rating: 4.7,
    numReviews: 110,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Google Pixel 8 Pro',
    description: 'Smart and secure smartphone by Google',
    price: 899,
    originalPrice: 999,
    category: createdCategories[0]._id, // Electronics
    brand: 'Google',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Pixel+8+Pro',
        alt: 'Google Pixel 8 Pro',
      },
    ],
    stock: 40,
    sku: 'GOOGLEPIXEL8P',
    rating: 4.6,
    numReviews: 95,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Bose QuietComfort Earbuds II',
    description: 'Premium noise-cancelling earbuds',
    price: 279,
    originalPrice: 299,
    category: createdCategories[0]._id, // Electronics
    brand: 'Bose',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Bose+Earbuds',
        alt: 'Bose QuietComfort Earbuds II',
      },
    ],
    stock: 80,
    sku: 'BOSEQCBEII',
    rating: 4.5,
    numReviews: 130,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'HP Spectre x360',
    description: 'Convertible laptop with premium design',
    price: 1499,
    originalPrice: 1699,
    category: createdCategories[0]._id, // Electronics
    brand: 'HP',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=HP+Spectre+x360',
        alt: 'HP Spectre x360',
      },
    ],
    stock: 35,
    sku: 'HPSPECTREX360',
    rating: 4.7,
    numReviews: 85,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Samsung Neo QLED TV',
    description: 'Mini LED TV with incredible brightness',
    price: 1999,
    originalPrice: 2299,
    category: createdCategories[0]._id, // Electronics
    brand: 'Samsung',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Samsung+Neo+QLED',
        alt: 'Samsung Neo QLED TV',
      },
    ],
    stock: 20,
    sku: 'SAMSUNGNEOQLED',
    rating: 4.8,
    numReviews: 160,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: 'Amazon Echo Dot (5th Gen)',
    description: 'Smart speaker with Alexa',
    price: 49,
    originalPrice: 59,
    category: createdCategories[0]._id, // Electronics
    brand: 'Amazon',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Echo+Dot',
        alt: 'Amazon Echo Dot (5th Gen)',
      },
    ],
    stock: 200,
    sku: 'ECHODOT5THGEN',
    rating: 4.4,
    numReviews: 300,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Roku Streaming Stick 4K',
    description: 'Portable 4K streaming device',
    price: 39,
    originalPrice: 49,
    category: createdCategories[0]._id, // Electronics
    brand: 'Roku',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Roku+Stick',
        alt: 'Roku Streaming Stick 4K',
      },
    ],
    stock: 150,
    sku: 'ROKUSTREAM4K',
    rating: 4.5,
    numReviews: 180,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Nintendo Switch OLED',
    description: 'Hybrid gaming console with vibrant OLED screen',
    price: 349,
    originalPrice: 399,
    category: createdCategories[0]._id, // Electronics
    brand: 'Nintendo',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Nintendo+Switch+OLED',
        alt: 'Nintendo Switch OLED',
      },
    ],
    stock: 60,
    sku: 'NINTENDOSWITCHOL',
    rating: 4.8,
    numReviews: 220,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: 'GoPro HERO11 Black',
    description: 'Waterproof action camera with incredible video',
    price: 399,
    originalPrice: 499,
    category: createdCategories[0]._id, // Electronics
    brand: 'GoPro',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=GoPro+HERO11',
        alt: 'GoPro HERO11 Black',
      },
    ],
    stock: 40,
    sku: 'GOPROHERO11BLK',
    rating: 4.7,
    numReviews: 100,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'DJI Mini 3 Pro Drone',
    description: 'Compact and powerful mini drone with 4K camera',
    price: 759,
    originalPrice: 829,
    category: createdCategories[0]._id, // Electronics
    brand: 'DJI',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=DJI+Mini+3+Pro',
        alt: 'DJI Mini 3 Pro Drone',
      },
    ],
    stock: 25,
    sku: 'DJIMINI3PRO',
    rating: 4.9,
    numReviews: 70,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: 'Logitech MX Master 3S Mouse',
    description: 'Ergonomic wireless mouse for productivity',
    price: 99,
    originalPrice: 109,
    category: createdCategories[0]._id, // Electronics
    brand: 'Logitech',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Logitech+MX+Master',
        alt: 'Logitech MX Master 3S Mouse',
      },
    ],
    stock: 120,
    sku: 'LOGITECHMXM3S',
    rating: 4.8,
    numReviews: 140,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Samsung T7 Shield SSD',
    description: 'Rugged portable SSD for data storage',
    price: 129,
    originalPrice: 149,
    category: createdCategories[0]._id, // Electronics
    brand: 'Samsung',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Samsung+T7+Shield',
        alt: 'Samsung T7 Shield SSD',
      },
    ],
    stock: 90,
    sku: 'SAMT7SHIELD',
    rating: 4.6,
    numReviews: 80,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Anker PowerCore III Elite',
    description: 'High-capacity portable power bank',
    price: 79,
    originalPrice: 89,
    category: createdCategories[0]._id, // Electronics
    brand: 'Anker',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Anker+PowerCore',
        alt: 'Anker PowerCore III Elite',
      },
    ],
    stock: 110,
    sku: 'ANKERPC3E',
    rating: 4.5,
    numReviews: 100,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Philips Hue White and Color Ambiance Starter Kit',
    description: 'Smart lighting kit for your home',
    price: 199,
    originalPrice: 229,
    category: createdCategories[0]._id, // Electronics
    brand: 'Philips Hue',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Philips+Hue+Kit',
        alt: 'Philips Hue White and Color Ambiance Starter Kit',
      },
    ],
    stock: 50,
    sku: 'PHILIPSHUEKIT',
    rating: 4.7,
    numReviews: 90,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Netgear Nighthawk WiFi 6 Router',
    description: 'High-performance WiFi router for fast internet',
    price: 199,
    originalPrice: 249,
    category: createdCategories[0]._id, // Electronics
    brand: 'Netgear',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Netgear+Router',
        alt: 'Netgear Nighthawk WiFi 6 Router',
      },
    ],
    stock: 40,
    sku: 'NETGEARNIGHTHAWK',
    rating: 4.6,
    numReviews: 75,
    seller: adminUser,
    isFeatured: false,
  },

  // Clothing (20 products)
  {
    name: "Men's Classic Denim Jacket",
    description: 'Timeless denim jacket for everyday wear',
    price: 79,
    originalPrice: 99,
    category: createdCategories[1]._id, // Clothing
    brand: 'Levi\'s',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Denim+Jacket+Men',
        alt: "Men's Classic Denim Jacket",
      },
    ],
    stock: 120,
    sku: 'MENSCLADENIMJKT',
    rating: 4.5,
    numReviews: 80,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: "Women's High-Waisted Skinny Jeans",
    description: 'Comfortable and stylish skinny jeans',
    price: 59,
    originalPrice: 79,
    category: createdCategories[1]._id, // Clothing
    brand: 'Madewell',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Skinny+Jeans+Women',
        alt: "Women's High-Waisted Skinny Jeans",
      },
    ],
    stock: 150,
    sku: 'WOMENSHWSKINNYJNS',
    rating: 4.6,
    numReviews: 100,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: "Unisex Crewneck T-Shirt",
    description: 'Soft and breathable cotton t-shirt',
    price: 25,
    originalPrice: 30,
    category: createdCategories[1]._id, // Clothing
    brand: 'Gildan',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Crewneck+T-Shirt',
        alt: "Unisex Crewneck T-Shirt",
      },
    ],
    stock: 300,
    sku: 'UNISEXCREWNECKTEE',
    rating: 4.2,
    numReviews: 200,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: "Women's Floral Maxi Dress",
    description: 'Elegant maxi dress for summer',
    price: 65,
    originalPrice: 85,
    category: createdCategories[1]._id, // Clothing
    brand: 'Zara',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Floral+Maxi+Dress',
        alt: "Women's Floral Maxi Dress",
      },
    ],
    stock: 90,
    sku: 'WOMENSFLORALMAXI',
    rating: 4.7,
    numReviews: 70,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: "Men's Slim Fit Chinos",
    description: 'Versatile chinos for casual or semi-formal wear',
    price: 45,
    originalPrice: 55,
    category: createdCategories[1]._id, // Clothing
    brand: 'Dockers',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Slim+Fit+Chinos',
        alt: "Men's Slim Fit Chinos",
      },
    ],
    stock: 110,
    sku: 'MENSSLIMFITCHINO',
    rating: 4.4,
    numReviews: 60,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: "Women's Knitted Cardigan",
    description: 'Cozy and stylish knitted cardigan',
    price: 49,
    originalPrice: 60,
    category: createdCategories[1]._id, // Clothing
    brand: 'H&M',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Knitted+Cardigan',
        alt: "Women's Knitted Cardigan",
      },
    ],
    stock: 80,
    sku: 'WOMENSKNITTEDCARD',
    rating: 4.3,
    numReviews: 55,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: "Men's Athletic Shorts",
    description: 'Lightweight and comfortable shorts for sports',
    price: 30,
    originalPrice: 35,
    category: createdCategories[1]._id, // Clothing
    brand: 'Nike',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Athletic+Shorts+Men',
        alt: "Men's Athletic Shorts",
      },
    ],
    stock: 180,
    sku: 'MENSATHSHORTS',
    rating: 4.6,
    numReviews: 90,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: "Women's Yoga Leggings",
    description: 'High-quality leggings for yoga and workouts',
    price: 40,
    originalPrice: 50,
    category: createdCategories[1]._id, // Clothing
    brand: 'Lululemon',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Yoga+Leggings',
        alt: "Women's Yoga Leggings",
      },
    ],
    stock: 130,
    sku: 'WOMENSYOGALEGGS',
    rating: 4.8,
    numReviews: 110,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: "Unisex Hoodie",
    description: 'Warm and soft fleece hoodie',
    price: 55,
    originalPrice: 65,
    category: createdCategories[1]._id, // Clothing
    brand: 'Champion',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Unisex+Hoodie',
        alt: "Unisex Hoodie",
      },
    ],
    stock: 200,
    sku: 'UNISEXHOODIE',
    rating: 4.5,
    numReviews: 150,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: "Men's Formal Dress Shirt",
    description: 'Crisp cotton dress shirt for formal occasions',
    price: 60,
    originalPrice: 75,
    category: createdCategories[1]._id, // Clothing
    brand: 'Ralph Lauren',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Formal+Shirt+Men',
        alt: "Men's Formal Dress Shirt",
      },
    ],
    stock: 70,
    sku: 'MENSFORMALDRESSSHIRT',
    rating: 4.7,
    numReviews: 45,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: "Women's A-Line Skirt",
    description: 'Flattering A-line skirt for versatile styling',
    price: 35,
    originalPrice: 45,
    category: createdCategories[1]._id, // Clothing
    brand: 'ASOS',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=A-Line+Skirt',
        alt: "Women's A-Line Skirt",
      },
    ],
    stock: 100,
    sku: 'WOMENSALINESKIRT',
    rating: 4.3,
    numReviews: 65,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: "Men's Winter Coat",
    description: 'Warm and durable coat for cold weather',
    price: 120,
    originalPrice: 150,
    category: createdCategories[1]._id, // Clothing
    brand: 'Columbia',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Mens+Winter+Coat',
        alt: "Men's Winter Coat",
      },
    ],
    stock: 50,
    sku: 'MENSWINTERCOAT',
    rating: 4.8,
    numReviews: 70,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: "Women's Puffer Jacket",
    description: 'Stylish and insulated puffer jacket',
    price: 90,
    originalPrice: 110,
    category: createdCategories[1]._id, // Clothing
    brand: 'The North Face',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Womens+Puffer+Jacket',
        alt: "Women's Puffer Jacket",
      },
    ],
    stock: 60,
    sku: 'WOMENSPUFFERJKT',
    rating: 4.7,
    numReviews: 85,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: "Kids' Graphic T-Shirt",
    description: 'Fun and colorful graphic t-shirt for kids',
    price: 18,
    originalPrice: 22,
    category: createdCategories[1]._id, // Clothing
    brand: 'Carter\'s',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Kids+T-Shirt',
        alt: "Kids' Graphic T-Shirt",
      },
    ],
    stock: 250,
    sku: 'KIDSGRAPHICTEE',
    rating: 4.4,
    numReviews: 120,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: "Baby Bodysuit Set (3-Pack)",
    description: 'Soft cotton bodysuits for infants',
    price: 28,
    originalPrice: 35,
    category: createdCategories[1]._id, // Clothing
    brand: 'Gerber',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Baby+Bodysuit',
        alt: "Baby Bodysuit Set (3-Pack)",
      },
    ],
    stock: 180,
    sku: 'BABYBODYSUISET',
    rating: 4.6,
    numReviews: 95,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: "Men's Polo Shirt",
    description: 'Classic polo shirt for smart casual look',
    price: 40,
    originalPrice: 50,
    category: createdCategories[1]._id, // Clothing
    brand: 'Lacoste',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Mens+Polo+Shirt',
        alt: "Men's Polo Shirt",
      },
    ],
    stock: 140,
    sku: 'MENSPOLOSHIRT',
    rating: 4.5,
    numReviews: 75,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: "Women's Blazer",
    description: 'Structured blazer for professional and chic outfits',
    price: 85,
    originalPrice: 100,
    category: createdCategories[1]._id, // Clothing
    brand: 'Ann Taylor',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Womens+Blazer',
        alt: "Women's Blazer",
      },
    ],
    stock: 75,
    sku: 'WOMENSBLAZER',
    rating: 4.7,
    numReviews: 50,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: "Unisex Sweatpants",
    description: 'Comfortable sweatpants for lounging or activewear',
    price: 38,
    originalPrice: 45,
    category: createdCategories[1]._id, // Clothing
    brand: 'Adidas',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Unisex+Sweatpants',
        alt: "Unisex Sweatpants",
      },
    ],
    stock: 160,
    sku: 'UNISEXSWEATPANTS',
    rating: 4.3,
    numReviews: 90,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: "Men's Swim Trunks",
    description: 'Quick-drying swim trunks for beach or pool',
    price: 30,
    originalPrice: 38,
    category: createdCategories[1]._id, // Clothing
    brand: 'Speedo',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Mens+Swim+Trunks',
        alt: "Men's Swim Trunks",
      },
    ],
    stock: 90,
    sku: 'MENSSWIMTRUNKS',
    rating: 4.2,
    numReviews: 40,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: "Women's Summer Shorts",
    description: 'Lightweight shorts for warm weather',
    price: 28,
    originalPrice: 35,
    category: createdCategories[1]._id, // Clothing
    brand: 'Old Navy',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Womens+Summer+Shorts',
        alt: "Women's Summer Shorts",
      },
    ],
    stock: 120,
    sku: 'WOMENSSUMMERSHORTS',
    rating: 4.1,
    numReviews: 50,
    seller: adminUser,
    isFeatured: false,
  },

  // Home & Kitchen (20 products)
  {
    name: 'Instant Pot Duo 7-in-1',
    description: 'Multi-functional pressure cooker',
    price: 89,
    originalPrice: 119,
    category: createdCategories[2]._id, // Home & Kitchen
    brand: 'Instant Pot',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Instant+Pot',
        alt: 'Instant Pot Duo 7-in-1',
      },
    ],
    stock: 100,
    sku: 'INSTANTPOTDUO',
    rating: 4.8,
    numReviews: 250,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: 'Ninja Foodi 8-in-1 Air Fryer',
    description: 'Versatile air fryer with dehydrate function',
    price: 149,
    originalPrice: 179,
    category: createdCategories[2]._id, // Home & Kitchen
    brand: 'Ninja',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Ninja+Air+Fryer',
        alt: 'Ninja Foodi 8-in-1 Air Fryer',
      },
    ],
    stock: 80,
    sku: 'NINJAFOODI8IN1',
    rating: 4.7,
    numReviews: 180,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: 'Dyson V11 Animal Cordless Vacuum',
    description: 'Powerful cordless vacuum cleaner for pet hair',
    price: 499,
    originalPrice: 599,
    category: createdCategories[2]._id, // Home & Kitchen
    brand: 'Dyson',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Dyson+V11',
        alt: 'Dyson V11 Animal Cordless Vacuum',
      },
    ],
    stock: 40,
    sku: 'DYSV11ANIMAL',
    rating: 4.9,
    numReviews: 150,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: 'Keurig K-Elite Coffee Maker',
    description: 'Single-serve coffee maker with iced coffee setting',
    price: 129,
    originalPrice: 169,
    category: createdCategories[2]._id, // Home & Kitchen
    brand: 'Keurig',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Keurig+K-Elite',
        alt: 'Keurig K-Elite Coffee Maker',
      },
    ],
    stock: 90,
    sku: 'KEURIGKELITE',
    rating: 4.5,
    numReviews: 120,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'KitchenAid Stand Mixer',
    description: 'Classic stand mixer for baking enthusiasts',
    price: 299,
    originalPrice: 349,
    category: createdCategories[2]._id, // Home & Kitchen
    brand: 'KitchenAid',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=KitchenAid+Mixer',
        alt: 'KitchenAid Stand Mixer',
      },
    ],
    stock: 60,
    sku: 'KITCHENAIDMIXER',
    rating: 4.9,
    numReviews: 200,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: 'Echo Show 8 (2nd Gen)',
    description: 'Smart display with Alexa and video calling',
    price: 109,
    originalPrice: 129,
    category: createdCategories[2]._id, // Home & Kitchen
    brand: 'Amazon',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Echo+Show+8',
        alt: 'Echo Show 8 (2nd Gen)',
      },
    ],
    stock: 130,
    sku: 'ECHOSHOW8GEN2',
    rating: 4.6,
    numReviews: 160,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Cuisinart 14-Cup Food Processor',
    description: 'Large capacity food processor for meal prep',
    price: 179,
    originalPrice: 200,
    category: createdCategories[2]._id, // Home & Kitchen
    brand: 'Cuisinart',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Cuisinart+Food+Processor',
        alt: 'Cuisinart 14-Cup Food Processor',
      },
    ],
    stock: 70,
    sku: 'CUISINARTFPROC',
    rating: 4.7,
    numReviews: 90,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Casper Original Mattress (Queen)',
    description: 'Comfortable memory foam mattress for a good night sleep',
    price: 995,
    originalPrice: 1195,
    category: createdCategories[2]._id, // Home & Kitchen
    brand: 'Casper',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Casper+Mattress',
        alt: 'Casper Original Mattress (Queen)',
      },
    ],
    stock: 20,
    sku: 'CASPERMATTRESSQUEEN',
    rating: 4.6,
    numReviews: 110,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: 'iRobot Roomba i3 EVO Robot Vacuum',
    description: 'Smart robot vacuum with intelligent mapping',
    price: 299,
    originalPrice: 349,
    category: createdCategories[2]._id, // Home & Kitchen
    brand: 'iRobot',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Roomba+i3+EVO',
        alt: 'iRobot Roomba i3 EVO Robot Vacuum',
      },
    ],
    stock: 55,
    sku: 'IROOMBAI3EVO',
    rating: 4.4,
    numReviews: 130,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Philips SmartSleep Wake-up Light',
    description: 'Sunrise simulation alarm clock',
    price: 119,
    originalPrice: 139,
    category: createdCategories[2]._id, // Home & Kitchen
    brand: 'Philips',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Philips+Wake+Light',
        alt: 'Philips SmartSleep Wake-up Light',
      },
    ],
    stock: 85,
    sku: 'PHILIPSWAKELIGHT',
    rating: 4.3,
    numReviews: 60,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Brita Standard Water Filter Pitcher',
    description: 'Water filter pitcher for cleaner drinking water',
    price: 29,
    originalPrice: 35,
    category: createdCategories[2]._id, // Home & Kitchen
    brand: 'Brita',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Brita+Pitcher',
        alt: 'Brita Standard Water Filter Pitcher',
      },
    ],
    stock: 200,
    sku: 'BRITAPITCHER',
    rating: 4.5,
    numReviews: 180,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Lodge Cast Iron Skillet (10.25 Inch)',
    description: 'Pre-seasoned cast iron skillet for cooking',
    price: 24,
    originalPrice: 30,
    category: createdCategories[2]._id, // Home & Kitchen
    brand: 'Lodge',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Cast+Iron+Skillet',
        alt: 'Lodge Cast Iron Skillet (10.25 Inch)',
      },
    ],
    stock: 150,
    sku: 'LODGECASTIRON',
    rating: 4.8,
    numReviews: 220,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Simplehuman Rectangular Step Trash Can',
    description: 'Durable and stylish kitchen trash can',
    price: 99,
    originalPrice: 120,
    category: createdCategories[2]._id, // Home & Kitchen
    brand: 'Simplehuman',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Simplehuman+Trash+Can',
        alt: 'Simplehuman Rectangular Step Trash Can',
      },
    ],
    stock: 70,
    sku: 'SIMPLEHUMANTRASH',
    rating: 4.7,
    numReviews: 95,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'SodaStream Terra Sparkling Water Maker',
    description: 'Make sparkling water at home',
    price: 79,
    originalPrice: 99,
    category: createdCategories[2]._id, // Home & Kitchen
    brand: 'SodaStream',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=SodaStream',
        alt: 'SodaStream Terra Sparkling Water Maker',
      },
    ],
    stock: 80,
    sku: 'SODASTREAMTERRA',
    rating: 4.4,
    numReviews: 70,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Le Creuset Signature Round Dutch Oven (5.5 Qt)',
    description: 'Premium enameled cast iron dutch oven',
    price: 360,
    originalPrice: 400,
    category: createdCategories[2]._id, // Home & Kitchen
    brand: 'Le Creuset',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Le+Creuset+Dutch+Oven',
        alt: 'Le Creuset Signature Round Dutch Oven (5.5 Qt)',
      },
    ],
    stock: 30,
    sku: 'LECREUSETDUTCHOVEN',
    rating: 4.9,
    numReviews: 100,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: 'Vitamix Ascent Series A2500 Blender',
    description: 'High-performance blender for smoothies and more',
    price: 549,
    originalPrice: 599,
    category: createdCategories[2]._id, // Home & Kitchen
    brand: 'Vitamix',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Vitamix+Blender',
        alt: 'Vitamix Ascent Series A2500 Blender',
      },
    ],
    stock: 25,
    sku: 'VITAMIXA2500',
    rating: 4.8,
    numReviews: 80,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: 'Contigo Autoseal West Loop Travel Mug',
    description: 'Leak-proof travel mug for hot and cold beverages',
    price: 19,
    originalPrice: 25,
    category: createdCategories[2]._id, // Home & Kitchen
    brand: 'Contigo',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Contigo+Travel+Mug',
        alt: 'Contigo Autoseal West Loop Travel Mug',
      },
    ],
    stock: 180,
    sku: 'CONTIGOTRAVELMUG',
    rating: 4.6,
    numReviews: 140,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'OXO Good Grips Pop Containers (Set of 5)',
    description: 'Airtight food storage containers',
    price: 69,
    originalPrice: 80,
    category: createdCategories[2]._id, // Home & Kitchen
    brand: 'OXO',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=OXO+Pop+Containers',
        alt: 'OXO Good Grips Pop Containers (Set of 5)',
      },
    ],
    stock: 100,
    sku: 'OXOPOPCONTAINERS',
    rating: 4.7,
    numReviews: 110,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Fellow Stagg EKG Electric Pour-Over Kettle',
    description: 'Precision kettle for pour-over coffee',
    price: 159,
    originalPrice: 189,
    category: createdCategories[2]._id, // Home & Kitchen
    brand: 'Fellow',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Fellow+Stagg+Kettle',
        alt: 'Fellow Stagg EKG Electric Pour-Over Kettle',
      },
    ],
    stock: 45,
    sku: 'FELLOWSTAGGKETL',
    rating: 4.8,
    numReviews: 70,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Shark Navigator Lift-Away Upright Vacuum',
    description: 'Lightweight and powerful upright vacuum',
    price: 179,
    originalPrice: 200,
    category: createdCategories[2]._id, // Home & Kitchen
    brand: 'Shark',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Shark+Navigator',
        alt: 'Shark Navigator Lift-Away Upright Vacuum',
      },
    ],
    stock: 65,
    sku: 'SHARKNAVIGATOR',
    rating: 4.6,
    numReviews: 120,
    seller: adminUser,
    isFeatured: false,
  },

  // Books (20 products)
  {
    name: 'Dune',
    description: 'Science fiction classic by Frank Herbert',
    price: 12,
    originalPrice: 15,
    category: createdCategories[3]._id, // Books
    brand: 'Ace Books',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Dune+Book',
        alt: 'Dune',
      },
    ],
    stock: 200,
    sku: 'BOOKDUNE001',
    rating: 4.8,
    numReviews: 300,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: 'The Midnight Library',
    description: 'A captivating novel about choices and regrets',
    price: 10,
    originalPrice: 14,
    category: createdCategories[3]._id, // Books
    brand: 'Viking',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Midnight+Library',
        alt: 'The Midnight Library',
      },
    ],
    stock: 180,
    sku: 'BOOKMIDNIGHTLIB',
    rating: 4.7,
    numReviews: 250,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: 'Atomic Habits',
    description: 'An easy & proven way to build good habits & break bad ones',
    price: 15,
    originalPrice: 17,
    category: createdCategories[3]._id, // Books
    brand: 'Avery',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Atomic+Habits',
        alt: 'Atomic Habits',
      },
    ],
    stock: 250,
    sku: 'BOOKATOMICHABITS',
    rating: 4.9,
    numReviews: 350,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: 'The Lord of the Rings: Fellowship of the Ring',
    description: 'First book in the epic fantasy series',
    price: 14,
    originalPrice: 18,
    category: createdCategories[3]._id, // Books
    brand: 'Houghton Mifflin Harcourt',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=LOTR+Fellowship',
        alt: 'The Lord of the Rings: Fellowship of the Ring',
      },
    ],
    stock: 160,
    sku: 'BOOKLOTRFOTR',
    rating: 4.8,
    numReviews: 280,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Educated: A Memoir',
    description: 'A powerful memoir of a young woman’s quest for knowledge',
    price: 11,
    originalPrice: 16,
    category: createdCategories[3]._id, // Books
    brand: 'Random House',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Educated+Memoir',
        alt: 'Educated: A Memoir',
      },
    ],
    stock: 190,
    sku: 'BOOKEDUCATEDMEMOIR',
    rating: 4.6,
    numReviews: 200,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Sapiens: A Brief History of Humankind',
    description: 'A global bestseller exploring human history',
    price: 16,
    originalPrice: 20,
    category: createdCategories[3]._id, // Books
    brand: 'Harper Perennial',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Sapiens+Book',
        alt: 'Sapiens: A Brief History of Humankind',
      },
    ],
    stock: 140,
    sku: 'BOOKSAPIENS',
    rating: 4.7,
    numReviews: 210,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Where the Crawdads Sing',
    description: 'A heartbreaking and beautiful coming-of-age story',
    price: 10,
    originalPrice: 14,
    category: createdCategories[3]._id, // Books
    brand: 'G.P. Putnam\'s Sons',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Crawdads+Sing',
        alt: 'Where the Crawdads Sing',
      },
    ],
    stock: 220,
    sku: 'BOOKCRAWDADSING',
    rating: 4.5,
    numReviews: 190,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Project Hail Mary',
    description: 'An exciting new sci-fi adventure from Andy Weir',
    price: 13,
    originalPrice: 17,
    category: createdCategories[3]._id, // Books
    brand: 'Ballantine Books',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Project+Hail+Mary',
        alt: 'Project Hail Mary',
      },
    ],
    stock: 170,
    sku: 'BOOKPROJECTHAILM',
    rating: 4.9,
    numReviews: 260,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: 'The Great Gatsby',
    description: 'A classic novel of the Jazz Age',
    price: 8,
    originalPrice: 10,
    category: createdCategories[3]._id, // Books
    brand: 'Scribner',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Great+Gatsby',
        alt: 'The Great Gatsby',
      },
    ],
    stock: 300,
    sku: 'BOOKGREATGATSBY',
    rating: 4.5,
    numReviews: 150,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: '1984',
    description: 'Dystopian social science fiction novel by George Orwell',
    price: 9,
    originalPrice: 12,
    category: createdCategories[3]._id, // Books
    brand: 'Signet Classic',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=1984+Book',
        alt: '1984',
      },
    ],
    stock: 280,
    sku: 'BOOK1984',
    rating: 4.7,
    numReviews: 200,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'The Hobbit',
    description: 'Fantasy novel by J.R.R. Tolkien',
    price: 11,
    originalPrice: 14,
    category: createdCategories[3]._id, // Books
    brand: 'Houghton Mifflin Harcourt',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=The+Hobbit',
        alt: 'The Hobbit',
      },
    ],
    stock: 210,
    sku: 'BOOKTHEHOBBIT',
    rating: 4.6,
    numReviews: 180,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'To Kill a Mockingbird',
    description: 'Classic American novel by Harper Lee',
    price: 9,
    originalPrice: 13,
    category: createdCategories[3]._id, // Books
    brand: 'Grand Central Publishing',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Mockingbird',
        alt: 'To Kill a Mockingbird',
      },
    ],
    stock: 240,
    sku: 'BOOKMOCKINGBIRD',
    rating: 4.8,
    numReviews: 230,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Becoming',
    description: 'Memoir by former First Lady Michelle Obama',
    price: 15,
    originalPrice: 19,
    category: createdCategories[3]._id, // Books
    brand: 'Crown',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Becoming+Book',
        alt: 'Becoming',
      },
    ],
    stock: 130,
    sku: 'BOOKBECOMING',
    rating: 4.7,
    numReviews: 170,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'The Silent Patient',
    description: 'A gripping psychological thriller',
    price: 10,
    originalPrice: 14,
    category: createdCategories[3]._id, // Books
    brand: 'Celadon Books',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Silent+Patient',
        alt: 'The Silent Patient',
      },
    ],
    stock: 200,
    sku: 'BOOKSILENTPATIENT',
    rating: 4.4,
    numReviews: 160,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'The Alchemist',
    description: 'A philosophical novel by Paulo Coelho',
    price: 9,
    originalPrice: 11,
    category: createdCategories[3]._id, // Books
    brand: 'HarperOne',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=The+Alchemist',
        alt: 'The Alchemist',
      },
    ],
    stock: 260,
    sku: 'BOOKALCHEMIST',
    rating: 4.6,
    numReviews: 190,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Harry Potter and the Sorcerer\'s Stone',
    description: 'First book in the magical Harry Potter series',
    price: 10,
    originalPrice: 12,
    category: createdCategories[3]._id, // Books
    brand: 'Scholastic',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Harry+Potter+Book+1',
        alt: 'Harry Potter and the Sorcerer\'s Stone',
      },
    ],
    stock: 300,
    sku: 'BOOKHPSS',
    rating: 4.9,
    numReviews: 400,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: 'The Psychology of Money',
    description: 'Timeless lessons on wealth, greed, and happiness',
    price: 14,
    originalPrice: 18,
    category: createdCategories[3]._id, // Books
    brand: 'Harriman House',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Psychology+of+Money',
        alt: 'The Psychology of Money',
      },
    ],
    stock: 170,
    sku: 'BOOKPSYCHMONEY',
    rating: 4.7,
    numReviews: 210,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Verity',
    description: 'A thrilling and twisted psychological suspense novel',
    price: 12,
    originalPrice: 15,
    category: createdCategories[3]._id, // Books
    brand: 'Grand Central Publishing',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Verity+Book',
        alt: 'Verity',
      },
    ],
    stock: 190,
    sku: 'BOOKVERITY',
    rating: 4.6,
    numReviews: 180,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Circe',
    description: 'A bold and subversive retelling of the goddess Circe\'s story',
    price: 13,
    originalPrice: 17,
    category: createdCategories[3]._id, // Books
    brand: 'Little, Brown and Company',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Circe+Book',
        alt: 'Circe',
      },
    ],
    stock: 150,
    sku: 'BOOKCIRCE',
    rating: 4.8,
    numReviews: 160,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'The Lincoln Highway',
    description: 'A captivating story of brotherhood and adventure',
    price: 14,
    originalPrice: 18,
    category: createdCategories[3]._id, // Books
    brand: 'Viking',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Lincoln+Highway',
        alt: 'The Lincoln Highway',
      },
    ],
    stock: 160,
    sku: 'BOOKLINCOLNWAY',
    rating: 4.7,
    numReviews: 150,
    seller: adminUser,
    isFeatured: false,
  },

  // Sports (20 products)
  {
    name: 'Peloton Bike+',
    description: 'Premium indoor cycling bike with touchscreen',
    price: 2495,
    originalPrice: 2895,
    category: createdCategories[4]._id, // Sports
    brand: 'Peloton',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Peloton+Bike%2B',
        alt: 'Peloton Bike+',
      },
    ],
    stock: 15,
    sku: 'SPELOTONBIKEP',
    rating: 4.7,
    numReviews: 90,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: 'Adidas Ultraboost 23 Running Shoes (Men\'s)',
    description: 'Comfortable and responsive running shoes',
    price: 140,
    originalPrice: 180,
    category: createdCategories[4]._id, // Sports
    brand: 'Adidas',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Adidas+Ultraboost+23',
        alt: 'Adidas Ultraboost 23 Running Shoes (Men\'s)',
      },
    ],
    stock: 100,
    sku: 'SPADIDASULTRABOOST',
    rating: 4.6,
    numReviews: 120,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Nike Vaporfly 3 Running Shoes (Women\'s)',
    description: 'Lightweight racing shoes for speed',
    price: 200,
    originalPrice: 250,
    category: createdCategories[4]._id, // Sports
    brand: 'Nike',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Nike+Vaporfly+3',
        alt: 'Nike Vaporfly 3 Running Shoes (Women\'s)',
      },
    ],
    stock: 70,
    sku: 'SPNIKEVAPORFLY3',
    rating: 4.8,
    numReviews: 80,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: 'Bowflex SelectTech 552 Adjustable Dumbbells',
    description: 'Space-saving adjustable dumbbells',
    price: 349,
    originalPrice: 429,
    category: createdCategories[4]._id, // Sports
    brand: 'Bowflex',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Bowflex+Dumbbells',
        alt: 'Bowflex SelectTech 552 Adjustable Dumbbells',
      },
    ],
    stock: 40,
    sku: 'SPBOWFLEX552',
    rating: 4.7,
    numReviews: 100,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: 'Garmin Forerunner 965 Smartwatch',
    description: 'Advanced GPS running and triathlon smartwatch',
    price: 599,
    originalPrice: 649,
    category: createdCategories[4]._id, // Sports
    brand: 'Garmin',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Garmin+Forerunner+965',
        alt: 'Garmin Forerunner 965 Smartwatch',
      },
    ],
    stock: 30,
    sku: 'SPGARMINFR965',
    rating: 4.9,
    numReviews: 60,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: 'Hydro Flask 32 oz Wide Mouth Water Bottle',
    description: 'Insulated stainless steel water bottle',
    price: 49,
    originalPrice: 55,
    category: createdCategories[4]._id, // Sports
    brand: 'Hydro Flask',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Hydro+Flask',
        alt: 'Hydro Flask 32 oz Wide Mouth Water Bottle',
      },
    ],
    stock: 200,
    sku: 'SPHYDROFLASK32',
    rating: 4.8,
    numReviews: 150,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Yoga Mat (6mm thick)',
    description: 'Non-slip yoga mat for all types of yoga',
    price: 25,
    originalPrice: 30,
    category: createdCategories[4]._id, // Sports
    brand: 'Gaiam',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Yoga+Mat',
        alt: 'Yoga Mat (6mm thick)',
      },
    ],
    stock: 180,
    sku: 'SPYOGAMAT6MM',
    rating: 4.5,
    numReviews: 100,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Wilson NFL Duke Football',
    description: 'Official size and weight NFL football',
    price: 99,
    originalPrice: 120,
    category: createdCategories[4]._id, // Sports
    brand: 'Wilson',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=NFL+Football',
        alt: 'Wilson NFL Duke Football',
      },
    ],
    stock: 60,
    sku: 'SPWILSONNFLDUKE',
    rating: 4.7,
    numReviews: 70,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Franklin Sports Pro Hoops Basketball Goal',
    description: 'Adjustable height basketball hoop for home',
    price: 199,
    originalPrice: 250,
    category: createdCategories[4]._id, // Sports
    brand: 'Franklin Sports',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Basketball+Goal',
        alt: 'Franklin Sports Pro Hoops Basketball Goal',
      },
    ],
    stock: 25,
    sku: 'SPFRANKLINHOOPS',
    rating: 4.4,
    numReviews: 40,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Callaway Rogue ST Max Driver',
    description: 'Golf driver for maximum distance and forgiveness',
    price: 499,
    originalPrice: 549,
    category: createdCategories[4]._id, // Sports
    brand: 'Callaway',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Callaway+Driver',
        alt: 'Callaway Rogue ST Max Driver',
      },
    ],
    stock: 20,
    sku: 'SPCALLAWAYROGUEST',
    rating: 4.8,
    numReviews: 50,
    seller: adminUser,
    isFeatured: true,
  },
  {
    name: 'Schwinn IC4 Indoor Cycling Bike',
    description: 'Interactive indoor cycle with magnetic resistance',
    price: 799,
    originalPrice: 999,
    category: createdCategories[4]._id, // Sports
    brand: 'Schwinn',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Schwinn+IC4',
        alt: 'Schwinn IC4 Indoor Cycling Bike',
      },
    ],
    stock: 35,
    sku: 'SPSCHWINNIC4',
    rating: 4.6,
    numReviews: 70,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Under Armour Tech 2.0 Short Sleeve T-Shirt (Men\'s)',
    description: 'Lightweight and quick-drying athletic t-shirt',
    price: 25,
    originalPrice: 30,
    category: createdCategories[4]._id, // Sports
    brand: 'Under Armour',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=UA+Tech+T-Shirt',
        alt: 'Under Armour Tech 2.0 Short Sleeve T-Shirt (Men\'s)',
      },
    ],
    stock: 150,
    sku: 'SPUATECHTSHIRT',
    rating: 4.5,
    numReviews: 90,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Fitbit Charge 6 Fitness Tracker',
    description: 'Advanced fitness and health tracker',
    price: 159,
    originalPrice: 179,
    category: createdCategories[4]._id, // Sports
    brand: 'Fitbit',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Fitbit+Charge+6',
        alt: 'Fitbit Charge 6 Fitness Tracker',
      },
    ],
    stock: 80,
    sku: 'SPFITBITCHARGE6',
    rating: 4.4,
    numReviews: 110,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'GoSports Portable Cornhole Set',
    description: 'Foldable cornhole game set for outdoor fun',
    price: 69,
    originalPrice: 80,
    category: createdCategories[4]._id, // Sports
    brand: 'GoSports',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Cornhole+Set',
        alt: 'GoSports Portable Cornhole Set',
      },
    ],
    stock: 100,
    sku: 'SPGOSPORTSCORNHOLE',
    rating: 4.3,
    numReviews: 50,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Spalding NBA Official Game Ball',
    description: 'Official basketball of the NBA',
    price: 179,
    originalPrice: 200,
    category: createdCategories[4]._id, // Sports
    brand: 'Spalding',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=NBA+Game+Ball',
        alt: 'Spalding NBA Official Game Ball',
      },
    ],
    stock: 45,
    sku: 'SPSPALDINGNBABALL',
    rating: 4.7,
    numReviews: 65,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'CamelBak Hydration Pack (2.5L)',
    description: 'Hydration backpack for hiking and cycling',
    price: 85,
    originalPrice: 95,
    category: createdCategories[4]._id, // Sports
    brand: 'CamelBak',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=CamelBak+Hydration',
        alt: 'CamelBak Hydration Pack (2.5L)',
      },
    ],
    stock: 70,
    sku: 'SPCAMELBAKHYDR',
    rating: 4.6,
    numReviews: 55,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Speedo Vanquisher 2.0 Swim Goggles',
    description: 'Anti-fog swimming goggles for comfort and clarity',
    price: 20,
    originalPrice: 25,
    category: createdCategories[4]._id, // Sports
    brand: 'Speedo',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Swim+Goggles',
        alt: 'Speedo Vanquisher 2.0 Swim Goggles',
      },
    ],
    stock: 120,
    sku: 'SPSPEEDOGOGGLES',
    rating: 4.4,
    numReviews: 80,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'TRX All-in-One Suspension Training System',
    description: 'Portable full-body workout system',
    price: 169,
    originalPrice: 199,
    category: createdCategories[4]._id, // Sports
    brand: 'TRX',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=TRX+System',
        alt: 'TRX All-in-One Suspension Training System',
      },
    ],
    stock: 50,
    sku: 'SPTRXTRAINING',
    rating: 4.7,
    numReviews: 70,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'GripGrab Winter Cycling Gloves',
    description: 'Warm and windproof gloves for winter cycling',
    price: 55,
    originalPrice: 65,
    category: createdCategories[4]._id, // Sports
    brand: 'GripGrab',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Cycling+Gloves',
        alt: 'GripGrab Winter Cycling Gloves',
      },
    ],
    stock: 40,
    sku: 'SPGRIPGRABGLOVES',
    rating: 4.5,
    numReviews: 30,
    seller: adminUser,
    isFeatured: false,
  },
  {
    name: 'Coleman Sundome Tent (4-Person)',
    description: 'Easy set-up dome tent for camping',
    price: 99,
    originalPrice: 120,
    category: createdCategories[4]._id, // Sports
    brand: 'Coleman',
    images: [
      {
        url: 'https://via.placeholder.com/400x400?text=Coleman+Tent',
        alt: 'Coleman Sundome Tent (4-Person)',
      },
    ],
    stock: 30,
    sku: 'SPCOLEMANTENT4P',
    rating: 4.6,
    numReviews: 50,
    seller: adminUser,
    isFeatured: false,
  },
];

    await Product.insertMany(products);

    console.log('Data imported successfully');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();

    console.log('Data deleted successfully');
    process.exit();
  } catch (error) {
    console.error('Error deleting data:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  deleteData();
} else {
  importData();
}
