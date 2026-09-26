// Rebuild the database with sample data:  npm run seed
// WARNING: this deletes bloodbank.db and creates a fresh one.
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const file = path.join(__dirname, 'bloodbank.db');
for (const ext of ['', '-wal', '-shm']) if (fs.existsSync(file + ext)) fs.unlinkSync(file + ext);

const db = new Database(file);
db.pragma('foreign_keys = ON');
db.exec(fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8'));
db.exec(fs.readFileSync(path.join(__dirname, 'database', 'sample-data.sql'), 'utf8'));
console.log('Database ready with sample data. Start the app with: npm start');
