const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Créez une instance de la base de données SQLite ou ouvrez-la si elle existe déjà.
const db = new sqlite3.Database('MontreDB.db');

// Lisez le fichier create_tables.sql et exécutez-le
const createTablesSQL = fs.readFileSync('Create_tables.sql', 'utf-8');
db.exec(createTablesSQL, (err) => {
  if (err) {
    console.error('Erreur lors de la création des tables :', err.message);
  } else {
    console.log('Tables créées avec succès.');
  }
});
