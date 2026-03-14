require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const User = require('./models/user.model');
const Service = require('./models/service.model');
const Booking = require('./models/booking.model');
const Review = require('./models/review.model');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear
    await Promise.all([
      User.deleteMany({}),
      Service.deleteMany({}),
      Booking.deleteMany({}),
      Review.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Admin
    const admin = await User.create({
      full_name: 'Super Admin',
      email: 'admin@shadiseva.com',
      phone: '9180100001',
      password: 'Admin@123',
      role: 'admin',
      verified: true,
    });

    // Vendors (verified)
    const vendorData = [
      {
        full_name: 'Rajesh Photography Studio',
        email: 'rajesh@vendor.com',
        phone: '9180111111',
        business_name: 'Rajesh Photography',
        business_description: 'Award-winning wedding photography with 10+ years of experience capturing love stories across India.',
        years_experience: 10,
      },
      {
        full_name: 'Priya Catering Services',
        email: 'priya@vendor.com',
        phone: '9180122222',
        business_name: 'Priya Catering',
        business_description: 'Authentic Indian cuisine for weddings. Specializing in North and South Indian thalis with live counters.',
        years_experience: 8,
      },
      {
        full_name: 'Arjun Decoration House',
        email: 'arjun@vendor.com',
        phone: '9180133333',
        business_name: 'Arjun Decor',
        business_description: 'Luxury floral and theme decorations for grand weddings. Specializing in mandap, stage, and entrance décor.',
        years_experience: 6,
      },
    ];

    const vendors = await User.create(
      vendorData.map(v => ({
        ...v,
        password: 'Vendor@123',
        role: 'vendor',
        verified: true,
      }))
    );

    // Unverified vendor
    await User.create({
      full_name: 'Meera Events',
      email: 'meera@vendor.com',
      phone: '9180144444',
      password: 'Vendor@123',
      role: 'vendor',
      verified: false,
      business_name: 'Meera Events & Mehendi',
      business_description: 'Traditional mehendi artist with 5 years of experience in bridal and party designs.',
    });

    // Clients
    const clientData = [
      { full_name: 'Aarav Sharma', email: 'aarav@client.com', phone: '9180211111' },
      { full_name: 'Kavya Patel', email: 'kavya@client.com', phone: '9180222222' },
      { full_name: 'Rohan Gupta', email: 'rohan@client.com', phone: '9180233333' },
    ];
    const clients = await User.create(
      clientData.map(c => ({
        ...c,
        password: 'Client@123',
        role: 'client',
        verified: true,
      }))
    );

    // Services
    const services = await Service.create([
      {
        title: 'Premium Wedding Photography Package',
        description: 'Complete wedding photography coverage including pre-wedding shoot, ceremony, and reception. Candid + traditional photography by a team of 3 photographers. 1000+ edited photos delivered within 30 days.',
        price: 85000,
        category: 'photography',
        status: 'active',
        vendor: vendors[0]._id,
        location: 'Mumbai, Maharashtra',
        avg_rating: 4.8,
        review_count: 2,
      },
      {
        title: 'Traditional Indian Wedding Catering',
        description: 'Complete catering for 200–500 guests. Menu includes North Indian and South Indian cuisines with live counters for chaat, desserts, and beverages. Professional catering staff included.',
        price: 120000,
        category: 'catering',
        status: 'active',
        vendor: vendors[1]._id,
        location: 'Delhi, NCR',
        avg_rating: 4.9,
        review_count: 2,
      },
      {
        title: 'Grand Floral Mandap & Stage Decoration',
        description: 'Luxurious floral decoration for mandap, stage, entrance gate, and dining area. Customized themes available — Rajasthani, Mughal, Contemporary, and Floral. Includes centerpieces and welcome board.',
        price: 95000,
        category: 'decoration',
        status: 'active',
        vendor: vendors[2]._id,
        location: 'Bangalore, Karnataka',
        avg_rating: 4.7,
        review_count: 2,
      },
      {
        title: 'Candid & Cinematic Wedding Photography',
        description: 'Cinematic wedding film + candid photography. Includes drone shots, 4K video highlight reel, and 500+ edited photos. Delivered on premium USB drive with printed album.',
        price: 110000,
        category: 'photography',
        status: 'active',
        vendor: vendors[0]._id,
        location: 'Jaipur, Rajasthan',
        avg_rating: 4.6,
        review_count: 1,
      },
      {
        title: 'Royal Buffet for Wedding Functions',
        description: 'Elaborate wedding buffet with 80+ dishes. Live counters for pasta, biryani, desserts, and juices. Hygiene-certified kitchen staff. Complete setup and takedown service.',
        price: 75000,
        category: 'catering',
        status: 'active',
        vendor: vendors[1]._id,
        location: 'Chennai, Tamil Nadu',
        avg_rating: 0,
        review_count: 0,
      },
      {
        title: 'Intimate Wedding Decoration Package',
        description: 'Beautiful and elegant decoration for intimate weddings up to 100 guests. Includes floral arch, table centerpieces, fairy lights, and photo backdrop. Perfect for garden and farmhouse weddings.',
        price: 45000,
        category: 'decoration',
        status: 'active',
        vendor: vendors[2]._id,
        location: 'Pune, Maharashtra',
        avg_rating: 0,
        review_count: 0,
      },
    ]);

    // Completed past bookings (use native driver to bypass future-date validator)
    const pastDate1 = new Date('2024-11-15');
    const pastDate2 = new Date('2024-12-01');
    const pastDate3 = new Date('2025-01-20');
    const pastDate4 = new Date('2025-02-10');

    const completedBookings = await Booking.collection.insertMany([
      {
        _id: new mongoose.Types.ObjectId(),
        client: clients[0]._id, vendor: vendors[0]._id, service: services[0]._id,
        booking_date: pastDate1, status: 'completed', total_amount: 85000, notes: '',
        createdAt: new Date(), updatedAt: new Date(),
      },
      {
        _id: new mongoose.Types.ObjectId(),
        client: clients[1]._id, vendor: vendors[1]._id, service: services[1]._id,
        booking_date: pastDate2, status: 'completed', total_amount: 120000, notes: '',
        createdAt: new Date(), updatedAt: new Date(),
      },
      {
        _id: new mongoose.Types.ObjectId(),
        client: clients[2]._id, vendor: vendors[2]._id, service: services[2]._id,
        booking_date: pastDate3, status: 'completed', total_amount: 95000, notes: 'Rajasthani theme please',
        createdAt: new Date(), updatedAt: new Date(),
      },
      {
        _id: new mongoose.Types.ObjectId(),
        client: clients[0]._id, vendor: vendors[1]._id, service: services[1]._id,
        booking_date: pastDate4, status: 'completed', total_amount: 75000, notes: '',
        createdAt: new Date(), updatedAt: new Date(),
      },
    ]);

    const bookingIds = completedBookings.insertedIds;

    // Upcoming / active bookings
    const futureDate1 = new Date();
    futureDate1.setMonth(futureDate1.getMonth() + 1);
    const futureDate2 = new Date();
    futureDate2.setMonth(futureDate2.getMonth() + 2);

    await Booking.create([
      {
        client: clients[1]._id, vendor: vendors[0]._id, service: services[3]._id,
        booking_date: futureDate1, status: 'confirmed', total_amount: 110000, notes: 'Please include drone shots',
      },
      {
        client: clients[2]._id, vendor: vendors[2]._id, service: services[5]._id,
        booking_date: futureDate2, status: 'pending', total_amount: 45000, notes: 'Garden theme wedding',
      },
    ]);

    // Reviews for completed bookings
    const reviews = [
      {
        client: clients[0]._id, service: services[0]._id, vendor: vendors[0]._id,
        booking: Object.values(bookingIds)[0],
        rating: 5, comment: 'Absolutely stunning photos! Rajesh captured every emotional moment beautifully. The editing was top-notch. Highly recommend!'
      },
      {
        client: clients[1]._id, service: services[1]._id, vendor: vendors[1]._id,
        booking: Object.values(bookingIds)[1],
        rating: 5, comment: 'Priya Catering delivered exceptional food for our 300-guest wedding. Every dish was delicious and guests couldn\'t stop complimenting!'
      },
      {
        client: clients[2]._id, service: services[2]._id, vendor: vendors[2]._id,
        booking: Object.values(bookingIds)[2],
        rating: 4, comment: 'Beautiful Rajasthani theme decoration! The mandap looked royal. Minor delay in setup but overall a wonderful experience.'
      },
      {
        client: clients[0]._id, service: services[1]._id, vendor: vendors[1]._id,
        booking: Object.values(bookingIds)[3],
        rating: 5, comment: 'Second time using Priya Catering and they never disappoint. Live counters were a huge hit with the guests!'
      },
      {
        client: clients[2]._id, service: services[3]._id, vendor: vendors[0]._id,
        rating: 5, comment: 'The cinematic video was like a Bollywood film! Every relative is asking for the videographer contact. Worth every rupee!'
      },
    ];

    await Review.insertMany(reviews.slice(0, 4));

    // Update ratings
    await Service.findByIdAndUpdate(services[0]._id, { avg_rating: 4.8, review_count: 2 });
    await Service.findByIdAndUpdate(services[1]._id, { avg_rating: 4.9, review_count: 2 });
    await Service.findByIdAndUpdate(services[2]._id, { avg_rating: 4.7, review_count: 1 });
    await Service.findByIdAndUpdate(services[3]._id, { avg_rating: 4.6, review_count: 1 });

    console.log('\n✅ Seed completed successfully!\n');
    console.log('='.repeat(50));
    console.log('CREDENTIALS');
    console.log('='.repeat(50));
    console.log('Admin:   admin@shadiseva.com    / Admin@123');
    console.log('Vendor:  rajesh@vendor.com      / Vendor@123');
    console.log('Vendor:  priya@vendor.com       / Vendor@123');
    console.log('Vendor:  arjun@vendor.com       / Vendor@123');
    console.log('Client:  aarav@client.com       / Client@123');
    console.log('Client:  kavya@client.com       / Client@123');
    console.log('Client:  rohan@client.com       / Client@123');
    console.log('='.repeat(50));
  } catch (err) {
    console.error('Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
