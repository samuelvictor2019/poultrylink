const { prisma } = require('../../backend/src/config/dbHandler');

const CATEGORIES = [
    { name: 'Live Birds', slug: 'live-birds' },
    { name: 'Eggs', slug: 'eggs' },
    { name: 'Day-Old Chicks', slug: 'day-old-chicks' },
    { name: 'Feed', slug: 'feed' },
    { name: 'Drugs', slug: 'drugs' },
    { name: 'Equipment', slug: 'equipment' },
    { name: 'Manure', slug: 'manure' }
];

async function main() {
    for (const category of CATEGORIES) {
        await prisma.category.upsert({
            where: { slug: category.slug },
            update: {},
            create: category
        });
    }
    console.log(`Seeded ${CATEGORIES.length} categories`);
}

main()
    .catch((err) => {
        console.error('Seed failed:', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });