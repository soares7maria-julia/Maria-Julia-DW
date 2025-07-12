const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const parse = require('csv-parse');

const db = new sqlite3.Database('./usuarios.db'); // ajuste o nome do seu arquivo SQLite

const CSV_PATH = path.join(__dirname, 'InfoFilmes.csv'); // caminho para seu CSV antigo

// Função para importar CSV
function importarCsv() {
  const parser = parse({
    columns: true, // usa primeira linha como cabeçalho
    skip_empty_lines: true,
    trim: true
  });

  const filmes = [];

  fs.createReadStream(CSV_PATH)
    .pipe(parser)
    .on('data', (row) => {
      filmes.push(row);
    })
    .on('end', () => {
      console.log(`CSV carregado. ${filmes.length} filmes encontrados.`);

      filmes.forEach(filme => {
        // Ajuste os nomes das colunas conforme seu CSV
        const titulo = filme.titulo || filme.Titulo || '';
        const ano = parseInt(filme.ano || filme.Ano) || null;
        const genero = filme.genero || filme.Gênero || '';
        const duracao = filme.duracao || '';
        const capa = filme.img || filme.capa || '';
        const linkFilme = filme.link || filme.linkFilme || '';
        const categoria = filme.categoria || '';

        if (!titulo || !ano) {
          console.log(`Filme com dados inválidos ignorado: ${JSON.stringify(filme)}`);
          return;
        }

        // Inserir no banco, ignorando se o título já existir
        const sql = `
          INSERT OR IGNORE INTO filmes 
          (titulo, ano, genero, duracao, capa, linkFilme, categoria, dataAdicao) 
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `;

        db.run(sql, [titulo, ano, genero, duracao, capa, linkFilme, categoria], function(err) {
          if (err) {
            console.error(`Erro ao inserir filme "${titulo}":`, err.message);
          } else if (this.changes > 0) {
            console.log(`Filme "${titulo}" inserido com sucesso.`);
          } else {
            console.log(`Filme "${titulo}" já existia no banco.`);
          }
        });
      });
    })
    .on('error', (err) => {
      console.error('Erro ao ler o CSV:', err);
    });
}

importarCsv();
