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
        senha: row.senha,
        tipo: row.tipo
      }
    });
  });
});



// ✅ ROTA: Cadastrar usuário comum
app.post('/cadastrar', (req, res) => {
const { nome, email, senha } = req.body;
const tipo = 'normal'; // ← tipo padrão

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Preencha todos os campos!' });
  }

const sql = `INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)`;

db.run(sql, [nome, email, senha, tipo], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ erro: 'E-mail já cadastrado!' });
      }
      return res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
    }


    // Após cadastro, atualiza o CSV com todos os usuários
db.all("SELECT id, nome, email, senha, tipo FROM usuarios", [], (err, rows) => {
  if (err) {
    console.error("Erro ao ler usuários para o CSV:", err);
    return res.status(500).json({ erro: 'Erro ao atualizar CSV.' });
  }

  const csvHeader = 'id,nome,email,senha,tipo\n';
  const csvData = rows.map(u =>
    `${u.id},"${u.nome}",${u.email},${u.senha},${u.tipo}`
  ).join('\n');

  const caminhoCSV = path.join(__dirname, 'usuarios.csv');


  try {
    fs.writeFileSync(caminhoCSV, csvHeader + csvData, 'utf8');
    res.json({ sucesso: true, id: this.lastID });
  } catch (err) {
    console.error('Erro ao salvar CSV:', err);
    res.status(500).json({ erro: 'Usuário cadastrado, mas não foi possível atualizar o CSV.' });
  }
});

  });
});


// ✅ ROTA: Cadastrar colaborador (só por você)
app.post('/cadastrar-colaborador', (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  if (!nome || !email || !senha || !tipo) {
    return res.status(400).json({ erro: 'Preencha todos os campos!' });
  }

  const sql = `INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)`;

  db.run(sql, [nome, email, senha, tipo], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ erro: 'E-mail já cadastrado!' });
      }
      return res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
    }

    // 🔁 Atualiza o CSV com todos os usuários após o cadastro
    db.all("SELECT id, nome, email, senha, tipo FROM usuarios", [], (err, rows) => {
      if (err) {
        console.error("Erro ao ler usuários para o CSV:", err);
        return res.status(500).json({ erro: 'Erro ao atualizar CSV.' });
      }

      const csvHeader = 'id,nome,email,senha,tipo\n';
      const csvData = rows.map(u =>
  `${u.id},"${u.nome}","${u.email}","${u.senha}","${u.tipo}"`
).join('\n');

      const caminhoCSV = path.join(__dirname, 'usuarios.csv');


      try {
        fs.writeFileSync(caminhoCSV, csvHeader + csvData, 'utf8');
        res.json({ sucesso: true, id: this.lastID });
      } catch (err) {
        console.error('Erro ao salvar CSV:', err);
        res.status(500).json({ erro: 'Usuário cadastrado, mas não foi possível atualizar o CSV.' });
      }
    });
  });
});


// ✅ ROTA: Listar todos os usuários cadastrados
app.get('/usuarios', (req, res) => {
  const sql = `SELECT id, nome, email, senha, tipo FROM usuarios`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar usuários.' });
    }

    res.json(rows);
  });
});
// ✅ ROTA: Editar um usuário (nome, email, tipo, senha)
app.put('/editar-colaborador/:id', (req, res) => {
  const id = req.params.id;
  const { nome, email, senha, tipo } = req.body;

  if (!nome && !email && !senha && !tipo) {
    return res.status(400).json({ erro: 'Nenhum campo para atualizar foi enviado.' });
  }

  // Monta a query dinamicamente com os campos enviados
  let campos = [];
  let valores = [];

  if (nome) {
    campos.push('nome = ?');
    valores.push(nome);
  }
  if (email) {
    campos.push('email = ?');
    valores.push(email);
  }
  if (senha) {
    campos.push('senha = ?');
    valores.push(senha);
  }
  if (tipo) {
    campos.push('tipo = ?');
    valores.push(tipo);
  }

  valores.push(id); // ID no final para o WHERE

  const sql = `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`;

  db.run(sql, valores, function (err) {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao atualizar o usuário.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    res.json({ sucesso: true, mensagem: 'Usuário atualizado com sucesso.' });
  });
  // Atualiza o CSV após edição ou exclusão
db.all("SELECT id, nome, email, senha, tipo FROM usuarios", [], (err, rows) => {
  if (err) {
    console.error("Erro ao ler usuários para o CSV:", err);
    return;
  }

  const csvHeader = 'id,nome,email,senha,tipo\n';
  const csvData = rows.map(u =>
    `${u.id},"${u.nome}",${u.email},${u.senha},${u.tipo}`
  ).join('\n');

  const caminhoCSV = path.join(__dirname, 'usuarios.csv');
  fs.writeFileSync(caminhoCSV, csvHeader + csvData, 'utf8');
});

});

// ✅ ROTA: Excluir usuário
app.delete('/excluir-colaborador/:id', (req, res) => {
  const id = req.params.id;

  const sql = `DELETE FROM usuarios WHERE id = ?`;

  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao excluir o usuário.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    res.json({ sucesso: true, mensagem: 'Usuário excluído com sucesso.' });
  });
  // Atualiza o CSV após edição ou exclusão
db.all("SELECT id, nome, email, senha, tipo FROM usuarios", [], (err, rows) => {
  if (err) {
    console.error("Erro ao ler usuários para o CSV:", err);
    return;
  }

  const csvHeader = 'id,nome,email,senha,tipo\n';
  const csvData = rows.map(u =>
    `${u.id},"${u.nome}",${u.email},${u.senha},${u.tipo}`
  ).join('\n');

  const caminhoCSV = path.join(__dirname, 'usuarios.csv');
  fs.writeFileSync(caminhoCSV, csvHeader + csvData, 'utf8');
});

});


// ✅ Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});


// Teste para verificar se a tabela de usuários está acessível
db.all('SELECT * FROM usuarios', [], (err, rows) => {
  if (err) {
    console.error('Erro ao acessar a tabela de usuários:', err.message);
  } else {
    console.log('Usuários cadastrados no banco:');
    console.log(rows);
  }
});


// Depois da configuração do banco de dados e do app Express...

db.run(`
  CREATE TABLE IF NOT EXISTS filmes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL UNIQUE,
    genero TEXT,
    duracao TEXT,
    ano INTEGER,
    categoria TEXT,
    capa TEXT,
    nomeArquivoCapa TEXT,
    linkFilme TEXT,
    dataAdicao TEXT
  )
`, (err) => {
  if (err) console.error('Erro criando tabela filmes:', err);
  else console.log('Tabela filmes criada ou já existente');
});

app.post('/adicionar-filme', (req, res) => {
  const {
    titulo,
    genero,
    duracao,
    ano,
    categoria,
    capa,
    nomeArquivoCapa,
    linkFilme,
    dataAdicao
  } = req.body;

  if (!titulo || !genero || !duracao || !ano || !categoria || !capa || !nomeArquivoCapa) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  const sql = `
    INSERT INTO filmes (titulo, genero, duracao, ano, categoria, capa, nomeArquivoCapa, linkFilme, dataAdicao)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [titulo, genero, duracao, ano, categoria, capa, nomeArquivoCapa, linkFilme, dataAdicao], function(err) {
    if (err) {
      console.error('Erro ao inserir filme:', err);
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Filme com este título já existe' });
      }
      return res.status(500).json({ error: 'Erro no servidor' });
    }
    res.json({ message: 'Filme adicionado com sucesso', id: this.lastID });
  });
});

// ✅ ROTA: Comprar um filme
app.post('/comprar', (req, res) => {
  const { idUsuario, idFilme } = req.body;

  if (!idUsuario || !idFilme) {
    return res.status(400).json({ erro: 'Informe o id do usuário e do filme!' });
  }

  const precoCompra = 10.00;

  // Aqui poderia salvar em um histórico no banco, se desejar
  res.json({
    sucesso: true,
    mensagem: `Compra realizada com sucesso! Valor: R$ ${precoCompra.toFixed(2)}`,
    valor: precoCompra
  });
});


// ✅ ROTA: Alugar um filme
app.post('/alugar', (req, res) => {
  const { idUsuario, idFilme } = req.body;

  if (!idUsuario || !idFilme) {
    return res.status(400).json({ erro: 'Informe o id do usuário e do filme!' });
  }

  const precoAluguel = 4.00;

  // Aqui também poderia salvar em um histórico no banco
  res.json({
    sucesso: true,
    mensagem: `Aluguel realizado com sucesso! Valor: R$ ${precoAluguel.toFixed(2)}`,
    valor: precoAluguel
  });
});
