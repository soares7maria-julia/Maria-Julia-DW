const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('usuarios.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      tipo TEXT DEFAULT 'normal'
    )
  `);

  // Insere um chefe padrão, se não existir
  db.get("SELECT * FROM usuarios WHERE tipo = 'chefe'", (err, row) => {
    if (!row) {
      db.run(`INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)`,
        ['Admin Chefe', 'chefe@admin.com', 'admin123', 'chefe']);
    }
  });
});

module.exports = db;