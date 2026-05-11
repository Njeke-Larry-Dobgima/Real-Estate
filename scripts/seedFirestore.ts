/**
 * Firestore Seed Script
 * Run with: npm run seed
 *
 * Seeds the Firestore database with sample agents and property listings
 * for testing and development purposes.
 */

import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, GeoPoint, Timestamp } from 'firebase-admin/firestore';

// Note: For this script to work, you need to:
// 1. Download your Firebase service account key from Firebase Console
// 2. Save it as 'serviceAccountKey.json' in the scripts folder
// 3. OR set the GOOGLE_APPLICATION_CREDENTIALS environment variable

// Try to load service account from environment or file
let serviceAccount: ServiceAccount | undefined;

try {
  // Try to load from file
  serviceAccount = require('./serviceAccountKey.json');
} catch (e) {
  console.log('No serviceAccountKey.json found. Using GOOGLE_APPLICATION_CREDENTIALS environment variable.');
}

// Initialize Firebase Admin
if (serviceAccount) {
  initializeApp({
    credential: cert(serviceAccount),
  });
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  initializeApp();
} else {
  console.error('Error: No Firebase credentials found.');
  console.error('Please either:');
  console.error('1. Place serviceAccountKey.json in the scripts folder');
  console.error('2. Set GOOGLE_APPLICATION_CREDENTIALS environment variable');
  process.exit(1);
}

const db = getFirestore();

/**
 * Agent data to seed
 */
const agents = [
  {
    name: 'Jean-Pierre Mbarga',
    phone: '+237691234567',
    whatsapp: '+237691234567',
    email: 'jpmbarga@doualarealestate.cm',
    agency_name: 'Douala Real Estate Pro',
    avatar_url: 'https://picsum.photos/seed/agent1/200/200',
    verified: true,
  },
  {
    name: 'Marie-Claire Fongang',
    phone: '+237677889900',
    whatsapp: '+237677889900',
    email: 'mcfongang@cameroonhomes.cm',
    agency_name: 'Cameroon Homes Agency',
    avatar_url: 'https://picsum.photos/seed/agent2/200/200',
    verified: true,
  },
  {
    name: 'Emmanuel Tchamba',
    phone: '+237655443322',
    whatsapp: '+237655443322',
    email: 'etchamba@littoralproperty.cm',
    agency_name: 'Littoral Property Services',
    avatar_url: 'https://picsum.photos/seed/agent3/200/200',
    verified: false,
  },
];

/**
 * Listing data to seed
 * Coordinates are within Douala city bounds
 */
const getListings = (agentIds: string[]) => [
  // Apartments
  {
    title: 'Modern 3-Bedroom Apartment in Bonapriso',
    description:
      'Stunning modern apartment with panoramic city views. Features include a spacious living room, fully equipped kitchen, and private balcony. Located in the heart of Bonapriso with easy access to shopping and restaurants.',
    price: 45000000,
    price_period: 'sale',
    type: 'apartment',
    bedrooms: 3,
    bathrooms: 2,
    area_sqm: 120,
    address: '15 Rue de Joss, Bonapriso',
    city: 'Douala',
    neighborhood: 'Bonapriso',
    coordinates: new GeoPoint(4.0167, 9.7000),
    images: [
      'https://picsum.photos/seed/listing1a/800/600',
      'https://picsum.photos/seed/listing1b/800/600',
      'https://picsum.photos/seed/listing1c/800/600',
    ],
    is_available: true,
    is_featured: true,
    agent_id: agentIds[0],
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  },
  {
    title: 'Cozy Studio Apartment in Akwa',
    description:
      'Perfect starter home or investment property. This well-maintained studio offers efficient living space with modern finishes. Walking distance to Akwa commercial district.',
    price: 75000,
    price_period: 'rent/month',
    type: 'apartment',
    bedrooms: 0,
    bathrooms: 1,
    area_sqm: 35,
    address: '23 Boulevard de la Liberté, Akwa',
    city: 'Douala',
    neighborhood: 'Akwa',
    coordinates: new GeoPoint(4.0488, 9.7043),
    images: [
      'https://picsum.photos/seed/listing2a/800/600',
      'https://picsum.photos/seed/listing2b/800/600',
    ],
    is_available: true,
    is_featured: false,
    agent_id: agentIds[1],
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  },
  {
    title: 'Luxury 4-Bedroom Penthouse in Bonanjo',
    description:
      'Exclusive penthouse living in the prestigious Bonanjo district. This stunning property features floor-to-ceiling windows, a private rooftop terrace, and premium finishes throughout.',
    price: 120000000,
    price_period: 'sale',
    type: 'apartment',
    bedrooms: 4,
    bathrooms: 3,
    area_sqm: 250,
    address: '8 Avenue de Gaulle, Bonanjo',
    city: 'Douala',
    neighborhood: 'Bonanjo',
    coordinates: new GeoPoint(4.0404, 9.6939),
    images: [
      'https://picsum.photos/seed/listing3a/800/600',
      'https://picsum.photos/seed/listing3b/800/600',
      'https://picsum.photos/seed/listing3c/800/600',
      'https://picsum.photos/seed/listing3d/800/600',
    ],
    is_available: true,
    is_featured: true,
    agent_id: agentIds[0],
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  },
  {
    title: '2-Bedroom Apartment in Bali',
    description:
      'Comfortable family apartment in the peaceful Bali neighborhood. Features include a large kitchen, two bedrooms with built-in closets, and a covered parking space.',
    price: 150000,
    price_period: 'rent/month',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    area_sqm: 85,
    address: '45 Rue de Bali, Bali',
    city: 'Douala',
    neighborhood: 'Bali',
    coordinates: new GeoPoint(4.0556, 9.7156),
    images: [
      'https://picsum.photos/seed/listing4a/800/600',
      'https://picsum.photos/seed/listing4b/800/600',
    ],
    is_available: true,
    is_featured: false,
    agent_id: agentIds[2],
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  },
  {
    title: 'New Construction 2-Bed in Makepe',
    description:
      'Brand new apartment in a modern complex. Open floor plan with contemporary design, secure parking, and 24-hour security. Great investment opportunity in a growing area.',
    price: 28000000,
    price_period: 'sale',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    area_sqm: 95,
    address: '12 Rue Makepe Missoke',
    city: 'Douala',
    neighborhood: 'Makepe',
    coordinates: new GeoPoint(4.0722, 9.7256),
    images: [
      'https://picsum.photos/seed/listing5a/800/600',
      'https://picsum.photos/seed/listing5b/800/600',
      'https://picsum.photos/seed/listing5c/800/600',
    ],
    is_available: true,
    is_featured: false,
    agent_id: agentIds[1],
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  },
  {
    title: 'Renovated 1-Bedroom in Deido',
    description:
      'Recently renovated apartment with modern amenities. New kitchen appliances, updated bathroom, and fresh paint throughout. Close to markets and public transportation.',
    price: 8500000,
    price_period: 'sale',
    type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    area_sqm: 55,
    address: '78 Rue Deido Centre',
    city: 'Douala',
    neighborhood: 'Deido',
    coordinates: new GeoPoint(4.0639, 9.7033),
    images: [
      'https://picsum.photos/seed/listing6a/800/600',
      'https://picsum.photos/seed/listing6b/800/600',
    ],
    is_available: true,
    is_featured: false,
    agent_id: agentIds[2],
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  },

  // Houses
  {
    title: 'Spacious 5-Bedroom Villa in Bonapriso',
    description:
      'Magnificent family villa with swimming pool and landscaped garden. Features include a spacious living area, modern kitchen, staff quarters, and double garage. Prime location in Bonapriso.',
    price: 350000000,
    price_period: 'sale',
    type: 'house',
    bedrooms: 5,
    bathrooms: 4,
    area_sqm: 450,
    address: '3 Rue des Palmiers, Bonapriso',
    city: 'Douala',
    neighborhood: 'Bonapriso',
    coordinates: new GeoPoint(4.0189, 9.7067),
    images: [
      'https://picsum.photos/seed/listing7a/800/600',
      'https://picsum.photos/seed/listing7b/800/600',
      'https://picsum.photos/seed/listing7c/800/600',
      'https://picsum.photos/seed/listing7d/800/600',
      'https://picsum.photos/seed/listing7e/800/600',
    ],
    is_available: true,
    is_featured: true,
    agent_id: agentIds[0],
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  },
  {
    title: 'Traditional 3-Bedroom House in Akwa',
    description:
      'Charming traditional-style house in the heart of Akwa. Well-maintained property with mature garden and fruit trees. Perfect for a growing family.',
    price: 65000000,
    price_period: 'sale',
    type: 'house',
    bedrooms: 3,
    bathrooms: 2,
    area_sqm: 180,
    address: '56 Rue Gallieni, Akwa',
    city: 'Douala',
    neighborhood: 'Akwa',
    coordinates: new GeoPoint(4.0511, 9.7100),
    images: [
      'https://picsum.photos/seed/listing8a/800/600',
      'https://picsum.photos/seed/listing8b/800/600',
      'https://picsum.photos/seed/listing8c/800/600',
    ],
    is_available: true,
    is_featured: false,
    agent_id: agentIds[1],
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  },
  {
    title: 'Modern 4-Bedroom House in Makepe',
    description:
      'Contemporary family home with open-plan living. Features include a gourmet kitchen, home office, covered patio, and secure compound with electric gate.',
    price: 500000,
    price_period: 'rent/month',
    type: 'house',
    bedrooms: 4,
    bathrooms: 3,
    area_sqm: 280,
    address: '22 Rue Makepe BM',
    city: 'Douala',
    neighborhood: 'Makepe',
    coordinates: new GeoPoint(4.0689, 9.7311),
    images: [
      'https://picsum.photos/seed/listing9a/800/600',
      'https://picsum.photos/seed/listing9b/800/600',
      'https://picsum.photos/seed/listing9c/800/600',
    ],
    is_available: true,
    is_featured: false,
    agent_id: agentIds[2],
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  },

  // Land
  {
    title: 'Building Plot in Bonanjo',
    description:
      'Prime building land in the prestigious Bonanjo district. Flat terrain with all utilities available. Ideal for commercial or residential development. Title deed available.',
    price: 180000000,
    price_period: 'sale',
    type: 'land',
    bedrooms: 0,
    bathrooms: 0,
    area_sqm: 800,
    address: 'Off Avenue de Gaulle, Bonanjo',
    city: 'Douala',
    neighborhood: 'Bonanjo',
    coordinates: new GeoPoint(4.0378, 9.6889),
    images: [
      'https://picsum.photos/seed/listing10a/800/600',
      'https://picsum.photos/seed/listing10b/800/600',
    ],
    is_available: true,
    is_featured: true,
    agent_id: agentIds[0],
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  },
  {
    title: 'Residential Plot in Bali',
    description:
      'Excellent opportunity to build your dream home. Corner lot in a quiet residential area with good road access. Partially fenced with mature trees.',
    price: 25000000,
    price_period: 'sale',
    type: 'land',
    bedrooms: 0,
    bathrooms: 0,
    area_sqm: 500,
    address: 'Rue de Bali Extension',
    city: 'Douala',
    neighborhood: 'Bali',
    coordinates: new GeoPoint(4.0589, 9.7200),
    images: [
      'https://picsum.photos/seed/listing11a/800/600',
    ],
    is_available: true,
    is_featured: false,
    agent_id: agentIds[1],
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  },

  // Commercial
  {
    title: 'Prime Commercial Space in Akwa',
    description:
      'Strategically located commercial property on Boulevard de la Liberté. High foot traffic area ideal for retail, restaurant, or office use. Large display windows and ample storage.',
    price: 850000,
    price_period: 'rent/month',
    type: 'commercial',
    bedrooms: 0,
    bathrooms: 2,
    area_sqm: 200,
    address: '100 Boulevard de la Liberté, Akwa',
    city: 'Douala',
    neighborhood: 'Akwa',
    coordinates: new GeoPoint(4.0467, 9.7011),
    images: [
      'https://picsum.photos/seed/listing12a/800/600',
      'https://picsum.photos/seed/listing12b/800/600',
      'https://picsum.photos/seed/listing12c/800/600',
    ],
    is_available: true,
    is_featured: false,
    agent_id: agentIds[2],
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  },
];

/**
 * Main seed function
 */
async function seedDatabase() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');

    const agentsSnapshot = await db.collection('agents').get();
    const listingsSnapshot = await db.collection('listings').get();

    const batch1 = db.batch();
    agentsSnapshot.docs.forEach((doc) => batch1.delete(doc.ref));
    listingsSnapshot.docs.forEach((doc) => batch1.delete(doc.ref));
    await batch1.commit();

    console.log('✅ Cleared existing data\n');

    // Seed agents
    console.log('👥 Seeding agents...');
    const agentIds: string[] = [];

    for (const agent of agents) {
      const docRef = await db.collection('agents').add(agent);
      agentIds.push(docRef.id);
      console.log(`   ✅ Created agent: ${agent.name} (${docRef.id})`);
    }

    console.log(`\n✅ Created ${agents.length} agents\n`);

    // Seed listings
    console.log('🏠 Seeding listings...');
    const listings = getListings(agentIds);

    for (const listing of listings) {
      const docRef = await db.collection('listings').add(listing);
      console.log(`   ✅ Created listing: ${listing.title.substring(0, 40)}... (${docRef.id})`);
    }

    console.log(`\n✅ Created ${listings.length} listings\n`);

    console.log('🎉 Database seed completed successfully!');
    console.log('\nSummary:');
    console.log(`   - ${agents.length} agents`);
    console.log(`   - ${listings.length} listings`);
    console.log('     - 6 apartments');
    console.log('     - 3 houses');
    console.log('     - 2 land plots');
    console.log('     - 1 commercial space');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed
seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
