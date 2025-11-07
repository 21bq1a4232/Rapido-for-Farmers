const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Tractor = require('./src/models/Tractor');
const Booking = require('./src/models/Booking');

// Load environment variables
dotenv.config();

// Sample data generation helpers
const generateRandomLocation = (baseLat, baseLng, radiusKm) => {
  // Generate random point within radius
  const radiusInDegrees = radiusKm / 111; // Rough conversion
  const u = Math.random();
  const v = Math.random();
  const w = radiusInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);

  return {
    type: 'Point',
    coordinates: [
      baseLng + x / Math.cos(baseLat * (Math.PI / 180)),
      baseLat + y
    ]
  };
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Tractor.deleteMany({});
    await Booking.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Base location (e.g., somewhere in Punjab, India)
    const BASE_LAT = 30.9010;
    const BASE_LNG = 75.8573;

    // Sample villages
    const villages = [
      'Khanna',
      'Samrala',
      'Raikot',
      'Payal',
      'Doraha',
      'Machhiwara',
      'Sidhwan Bet',
      'Sahnewal'
    ];

    // Create 5 tractor owners
    const owners = [];
    for (let i = 0; i < 5; i++) {
      const owner = new User({
        phone: `987654321${i}`,
        name: `Owner ${i + 1}`,
        role: ['owner'],
        village: villages[i],
        location: generateRandomLocation(BASE_LAT, BASE_LNG, 15),
        language: 'hi',
        wallet: Math.floor(Math.random() * 5000),
        rating: 3 + Math.random() * 2, // 3-5 rating
        totalRatings: Math.floor(Math.random() * 20) + 5,
        isVerified: true
      });
      await owner.save();
      owners.push(owner);
    }
    console.log(`✅ Created ${owners.length} tractor owners`);

    // Create 5 farmers
    const farmers = [];
    for (let i = 0; i < 5; i++) {
      const farmer = new User({
        phone: `876543210${i}`,
        name: `Farmer ${i + 1}`,
        role: ['farmer'],
        village: villages[i + 3],
        location: generateRandomLocation(BASE_LAT, BASE_LNG, 15),
        language: i % 2 === 0 ? 'hi' : 'en',
        wallet: Math.floor(Math.random() * 2000),
        rating: 3.5 + Math.random() * 1.5,
        totalRatings: Math.floor(Math.random() * 15) + 3,
        isVerified: true
      });
      await farmer.save();
      farmers.push(farmer);
    }
    console.log(`✅ Created ${farmers.length} farmers`);

    // Tractor brands and models
    const tractorData = [
      { brand: 'Mahindra', model: '575 DI', hp: 50 },
      { brand: 'John Deere', model: '5050 D', hp: 55 },
      { brand: 'Swaraj', model: '855 FE', hp: 58 },
      { brand: 'Sonalika', model: 'DI 750 III', hp: 60 },
      { brand: 'Mahindra', model: 'Arjun 605', hp: 65 },
      { brand: 'New Holland', model: '3630 TX', hp: 55 },
      { brand: 'Massey Ferguson', model: '9500', hp: 50 },
      { brand: 'Farmtrac', model: '60 Classic', hp: 60 },
      { brand: 'John Deere', model: '5310', hp: 70 },
      { brand: 'Eicher', model: '380', hp: 45 }
    ];

    const attachmentOptions = ['plow', 'harrow', 'cultivator', 'seeder', 'rotavator', 'trailer'];

    // Create 10 tractors
    const tractors = [];
    for (let i = 0; i < 10; i++) {
      const data = tractorData[i];
      const owner = owners[i % owners.length];
      const location = generateRandomLocation(BASE_LAT, BASE_LNG, 10);

      const tractor = new Tractor({
        owner: owner._id,
        model: data.model,
        brand: data.brand,
        horsepower: data.hp,
        pricePerHour: 300 + (data.hp * 5) + Math.floor(Math.random() * 100),
        pricePerAcre: 600 + (data.hp * 10) + Math.floor(Math.random() * 200),
        images: [],
        location,
        address: `Near ${villages[i % villages.length]}`,
        attachments: [
          attachmentOptions[i % attachmentOptions.length],
          attachmentOptions[(i + 1) % attachmentOptions.length]
        ],
        rating: 3 + Math.random() * 2,
        totalRatings: Math.floor(Math.random() * 30) + 5,
        totalBookings: Math.floor(Math.random() * 50) + 10,
        isActive: true,
        isVerified: true,
        yearOfManufacture: 2015 + Math.floor(Math.random() * 9),
        fuelType: 'diesel',
        description: `Well-maintained ${data.brand} ${data.model} tractor with ${data.hp} HP. Perfect for all farming needs.`
      });

      await tractor.save();
      tractors.push(tractor);
    }
    console.log(`✅ Created ${tractors.length} tractors`);

    // Create 5 sample bookings (mix of statuses)
    const bookingStatuses = ['completed', 'in-progress', 'accepted', 'pending', 'cancelled'];
    const paymentStatuses = ['released', 'held', 'paid', 'pending', 'refunded'];
    const workTypes = ['plowing', 'sowing', 'harvesting', 'spraying', 'transportation'];

    const bookings = [];
    for (let i = 0; i < 5; i++) {
      const farmer = farmers[i];
      const tractor = tractors[i * 2];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + i - 2); // Mix of past and future

      const booking = new Booking({
        farmer: farmer._id,
        tractor: tractor._id,
        owner: tractor.owner,
        startTime: startDate,
        duration: 4 + Math.floor(Math.random() * 4), // 4-8 hours
        acres: 2 + Math.floor(Math.random() * 3), // 2-5 acres
        workType: workTypes[i],
        totalAmount: tractor.pricePerHour * (4 + Math.floor(Math.random() * 4)),
        status: bookingStatuses[i],
        paymentStatus: paymentStatuses[i],
        location: farmer.location,
        farmAddress: `Farm near ${farmer.village}`,
        workDescription: `${workTypes[i]} work for ${2 + Math.floor(Math.random() * 3)} acres`
      });

      // Add ratings for completed bookings
      if (booking.status === 'completed') {
        booking.ratings = {
          farmerRating: 4 + Math.random(),
          ownerRating: 4 + Math.random(),
          farmerReview: 'Good service, tractor worked well!',
          ownerReview: 'Professional farmer, recommend!'
        };
        booking.actualStartTime = startDate;
        booking.actualEndTime = new Date(startDate.getTime() + booking.duration * 60 * 60 * 1000);
      }

      await booking.save();
      bookings.push(booking);
    }
    console.log(`✅ Created ${bookings.length} sample bookings`);

    // Display summary
    console.log('\n📊 Seed Summary:');
    console.log('================');
    console.log(`👥 Users: ${owners.length + farmers.length}`);
    console.log(`   - Owners: ${owners.length}`);
    console.log(`   - Farmers: ${farmers.length}`);
    console.log(`🚜 Tractors: ${tractors.length}`);
    console.log(`📅 Bookings: ${bookings.length}`);
    console.log('\n📍 Base Location (Punjab):');
    console.log(`   Latitude: ${BASE_LAT}`);
    console.log(`   Longitude: ${BASE_LNG}`);
    console.log('\n🧪 Test Credentials (OTP: 123456 in development):');
    owners.forEach((owner, i) => {
      console.log(`   Owner ${i + 1}: ${owner.phone} - ${owner.village}`);
    });
    farmers.forEach((farmer, i) => {
      console.log(`   Farmer ${i + 1}: ${farmer.phone} - ${farmer.village}`);
    });

    console.log('\n✅ Database seeding completed successfully!');
    console.log('🚀 You can now start the server with: npm run dev\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  }
};

// Run seed function
seedDatabase();
