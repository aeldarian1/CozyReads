const Database = require('better-sqlite3');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient();

async function migrateData() {
  try {
    console.log('🚀 Starting data migration from Flask to Next.js...\n');

    // Connect to old Flask database
    const oldDbPath = path.join(
      __dirname,
      '../../Virtual Library/library.db'
    );
    console.log(`📂 Reading from: ${oldDbPath}`);

    const oldDb = new Database(oldDbPath, { readonly: true });

    // Get all books from Flask database
    const flaskBooks = oldDb.prepare('SELECT * FROM books').all();

    console.log(`📚 Found ${flaskBooks.length} books in Flask database\n`);

    if (flaskBooks.length === 0) {
      console.log('✨ No books to migrate. Exiting.');
      oldDb.close();
      await prisma.$disconnect();
      return;
    }

    let migrated = 0;
    let skipped = 0;

    // Migrate each book
    for (const book of flaskBooks) {
      try {
        await prisma.book.create({
          data: {
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            genre: book.genre,
            description: book.description,
            coverUrl: book.cover_url,
            readingStatus: book.reading_status,
            rating: book.rating,
            review: book.review,
            dateAdded: book.date_added
              ? new Date(book.date_added)
              : new Date(),
            dateFinished: book.date_finished
              ? new Date(book.date_finished)
              : null,
          },
        });

        migrated++;
        console.log(`✅ Migrated: "${book.title}" by ${book.author}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⏭️  Skipped (already exists): "${book.title}"`);
          skipped++;
        } else {
          console.error(
            `❌ Error migrating "${book.title}":`,
            error.message
          );
        }
      }
    }

    oldDb.close();
    await prisma.$disconnect();

    console.log('\n✨ Migration Complete!\n');
    console.log(`📊 Statistics:`);
    console.log(`   - Total books in Flask: ${flaskBooks.length}`);
    console.log(`   - Successfully migrated: ${migrated}`);
    console.log(`   - Skipped (duplicates): ${skipped}`);
    console.log(`\n🎉 Your data is now in Next.js!`);
    console.log(`\nRefresh http://localhost:3000 to see your books!`);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

migrateData();
