const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('./db'); // importa o banco de dados

const app = express();
const PORT = 3000;
const cors = require('cors');

app.use(cors()); // ← ATIVA o CORS aqui!
app.use(express.static('public'));
app.use(express.json({ limit: '10mb' }));

// Caminho do arquivo CSV
const CSV_PATH = path.join(__dirname, 'public', 'InfoFilmes.csv');

// ✅ ROTA: Login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Preencha todos os campos!' });
  }

  const sql = `SELECT * FROM usuarios WHERE email = ? AND senha = ?`;

  db.get(sql, [email, senha], (err, row) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro no login.' });
    }

    if (!row) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    res.json({
      sucesso: true,
      usuario: {
        id: row.id,
        nome: row.nome,
        email: row.email,
        tipo: row.tipo
      }
    });
  });
});



// ✅ ROTA: Cadastrar usuário comum
app.post('/cadastrar', (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Preencha todos os campos!' });
  }

  const sql = `INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`;

  db.run(sql, [nome, email, senha], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ erro: 'E-mail já cadastrado!' });
      }
      return res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
    }

    res.json({ sucesso: true, id: this.lastID });
  });
});


// ✅ ROTA: Cadastrar colaborador (só por você)
app.post('/cadastrar-colaborador', (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Preencha todos os campos!' });
  }

  const sql = `INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, 'colaborador')`;

  db.run(sql, [nome, email, senha], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ erro: 'E-mail já cadastrado!' });
      }
      return res.status(500).json({ erro: 'Erro ao cadastrar colaborador.' });
    }

    res.json({ sucesso: true, id: this.lastID });
  });
});


// ✅ ROTA: Adicionar novo filme (salva no CSV)
app.post('/adicionar-filme', (req, res) => {
  const filme = req.body;

  const linha = [
    `"${filme.titulo}"`,
    filme.ano,
    `"${filme.genero}"`,
    `"${filme.duracao}"`,
    `"${filme.capa}"`,
    `"${filme.link || ''}"`,
    filme.categoria
  ].join(',') + '\n';

  const cabecalho = 'titulo,ano,genero,duracao,img,link,categoria\n';

  // Se o arquivo CSV não existir, cria com cabeçalho
  if (!fs.existsSync(CSV_PATH)) {
    fs.writeFileSync(CSV_PATH, cabecalho, 'utf8');
  }

  // Adiciona a nova linha ao CSV
  fs.appendFile(CSV_PATH, linha, err => {
    if (err) {
      console.error('Erro ao salvar o filme:', err);
      return res.status(500).json({ erro: 'Erro ao salvar o filme' });
    }
    res.status(200).json({ mensagem: 'Filme salvo com sucesso!' });
  });
});

// ✅ ROTA: Listar todos os usuários cadastrados
app.get('/usuarios', (req, res) => {
  const sql = `SELECT id, nome, email, tipo FROM usuarios`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar usuários.' });
    }

    res.json(rows);
  });
});


// ✅ Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});