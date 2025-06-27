const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json({ limit: '10mb' })); // aceita imagens base64 grandes

// Caminho do arquivo CSV
const CSV_PATH = path.join(__dirname, 'public', 'filmecs.csv');

// Rota para adicionar um novo filme
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

  // Se o arquivo não existe, cria com cabeçalho
  if (!fs.existsSync(CSV_PATH)) {
    fs.writeFileSync(CSV_PATH, cabecalho, 'utf8');
  }

  // Adiciona a nova linha ao arquivo
  fs.appendFile(CSV_PATH, linha, err => {
    if (err) {
      console.error('Erro ao salvar o filme:', err);
      return res.status(500).json({ erro: 'Erro ao salvar o filme' });
    }
    res.status(200).json({ mensagem: 'Filme salvo com sucesso!' });
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

