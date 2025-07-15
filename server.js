const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('./db');
const cors = require('cors');
const multer = require('multer');

// multer config
const uploadPath = path.join(__dirname, 'img');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const nomeFinal = Date.now() + '-' + file.originalname;
    cb(null, nomeFinal);
  }
});
const upload = multer({ storage });

const app = express();
const PORT = 3000;

app.use(cors());
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use(express.json({ limit: '10mb' }));


// Caminho do arquivo CSV
const CSV_PATH = path.join(__dirname, 'InfoFilmes.csv');

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
    res.json({
  sucesso: true,
  usuario: {
    id: this.lastID,
    nome,
    email,
    senha,
    tipo
  }
});

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

    // Atualiza o CSV após edição
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

    res.json({ sucesso: true, mensagem: 'Usuário atualizado com sucesso.' });
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

    // Atualiza o CSV após exclusão
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

    res.json({ sucesso: true, mensagem: 'Usuário excluído com sucesso.' });
  });
});

// ✅ FUNÇÃO: Atualizar CSV de filmes
function atualizarCSVFilmes() {
  db.all("SELECT titulo, ano, genero, duracao, capa, linkFilme, categoria FROM filmes", [], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar filmes para o CSV:", err);
      return;
    }

    const csvHeader = 'titulo,ano,genero,duracao,img,link,categoria\n';

    const csvData = rows.map(filme => {
      // Função para escapar aspas duplas e envolver em aspas
      function escapaCSV(valor) {
        if (!valor) return '""';
        return `"${valor.replace(/"/g, '""')}"`;
      }

      return [
        escapaCSV(filme.titulo),
        filme.ano,
        escapaCSV(filme.genero),
        escapaCSV(filme.duracao),
        escapaCSV(filme.capa),
        escapaCSV(filme.linkFilme),
        escapaCSV(filme.categoria)
      ].join(',');
    }).join('\n');

    try {
      fs.writeFileSync(CSV_PATH, csvHeader + csvData, 'utf8');
      console.log('Arquivo InfoFilmes.csv atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao escrever no arquivo CSV de filmes:', err);
    }
  });
}

// ✅ Criação da tabela filmes
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


// ✅ ROTA: Listar todos os filmes (para a tela inicial)
app.get('/filmes', (req, res) => {
  const sql = `SELECT id, titulo, ano, genero, duracao, capa, linkFilme, categoria, dataAdicao FROM filmes ORDER BY dataAdicao DESC`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar filmes:', err);
      return res.status(500).json({ erro: 'Erro ao buscar filmes.' });
    }

    res.json(rows);
  });
});

// ✅ ROTA: Adicionar filme - CORRIGIDA COM LOGS
app.post('/adicionar-filme', upload.single('capa'), (req, res) => {
  console.log('Recebendo requisição para adicionar filme...');
  console.log('Body:', req.body);
  console.log('File:', req.file);

  const {
    titulo,
    genero,
    duracao,
    ano,
    categoria,
    link,
    dataAdicao
  } = req.body;

  if (!req.file) {
    console.log('Erro: Nenhum arquivo enviado');
    return res.status(400).json({ error: 'Nenhum arquivo de capa enviado' });
  }

  const nomeArquivoCapa = req.file.filename;
  const caminhoCapa = `/img/${nomeArquivoCapa}`;

  console.log('Nome do arquivo:', nomeArquivoCapa);
  console.log('Caminho da capa:', caminhoCapa);

  if (!titulo || !genero || !duracao || !ano || !categoria || !nomeArquivoCapa) {
    console.log('Erro: Dados incompletos');
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  const sql = `
    INSERT INTO filmes (titulo, genero, duracao, ano, categoria, capa, nomeArquivoCapa, linkFilme, dataAdicao)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [titulo, genero, duracao, ano, categoria, caminhoCapa, nomeArquivoCapa, link, dataAdicao],
    function(err) {
      if (err) {
        console.error('Erro ao inserir filme:', err);
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'Filme com este título já existe' });
        }
        return res.status(500).json({ error: 'Erro no servidor' });
      }

      console.log('Filme inserido com sucesso! ID:', this.lastID);
      
      // ✅ Atualiza o CSV após inserir o filme
      setTimeout(() => {
        atualizarCSVFilmes();
      }, 100); // Pequeno delay para garantir que a transação foi commitada
      
      res.json({ 
        message: 'Filme adicionado com sucesso', 
        id: this.lastID,
        filme: {
          id: this.lastID,
          titulo,
          genero,
          duracao,
          ano,
          categoria,
          capa: caminhoCapa,
          linkFilme: link
        }
      });
    });
});

// ✅ ROTA: Forçar atualização do CSV (para debug)
app.post('/atualizar-csv', (req, res) => {
  console.log('Forçando atualização do CSV...');
  atualizarCSVFilmes();
  res.json({ message: 'CSV atualizado' });
});

// ✅ ROTA: Verificar conteúdo do banco
app.get('/debug-filmes', (req, res) => {
  db.all("SELECT * FROM filmes", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar filmes' });
    }
    res.json({ 
      total: rows.length,
      filmes: rows 
    });
  });
});

// ✅ ROTA: Comprar um filme
app.post('/comprar', (req, res) => {
  const { idUsuario, idFilme } = req.body;

  if (!idUsuario || !idFilme) {
    return res.status(400).json({ erro: 'Informe o id do usuário e do filme!' });
  }

  const precoCompra = 10.00;

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

  res.json({
    sucesso: true,
    mensagem: `Aluguel realizado com sucesso! Valor: R$ ${precoAluguel.toFixed(2)}`,
    valor: precoAluguel
  });
});

// ✅ Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  atualizarCSVFilmes();

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

app.put('/editar-filme/:id', upload.single('capa'), (req, res) => {
  const id = req.params.id;
  const {
    titulo,
    genero,
    duracao,
    ano,
    categoria,
    link,
    dataAdicao
  } = req.body;

  const atualizacoes = [];
  const valores = [];

  if (titulo) { atualizacoes.push("titulo = ?"); valores.push(titulo); }
  if (genero) { atualizacoes.push("genero = ?"); valores.push(genero); }
  if (duracao) { atualizacoes.push("duracao = ?"); valores.push(duracao); }
  if (ano) { atualizacoes.push("ano = ?"); valores.push(ano); }
  if (categoria) { atualizacoes.push("categoria = ?"); valores.push(categoria); }
  if (link) { atualizacoes.push("linkFilme = ?"); valores.push(link); }
  if (dataAdicao) { atualizacoes.push("dataAdicao = ?"); valores.push(dataAdicao); }

  if (req.file) {
    const caminhoCapa = `/img/${req.file.filename}`;
    atualizacoes.push("capa = ?", "nomeArquivoCapa = ?");
    valores.push(caminhoCapa, req.file.filename);
  }

  if (atualizacoes.length === 0) {
    return res.status(400).json({ erro: 'Nenhum campo enviado para atualizar.' });
  }

  valores.push(id);

  const sql = `UPDATE filmes SET ${atualizacoes.join(', ')} WHERE id = ?`;

  db.run(sql, valores, function (err) {
    if (err) {
      console.error('Erro ao editar filme:', err.message);
      return res.status(500).json({ erro: 'Erro ao editar o filme.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ erro: 'Filme não encontrado.' });
    }

    atualizarCSVFilmes();
    res.json({ sucesso: true, mensagem: 'Filme atualizado com sucesso.' });
  });
});
