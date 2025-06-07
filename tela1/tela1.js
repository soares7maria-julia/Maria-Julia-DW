
const carousel = document.getElementById('carousel');
let currentIndex = 0;

setInterval(() => {
  const imgs = carousel.querySelectorAll('img');
  imgs.forEach((img, index) => {
    img.style.opacity = index === currentIndex ? '1' : '0';
  });
  currentIndex = (currentIndex + 1) % imgs.length;
}, 3000);

function carregarCSV(url) {
  return fetch(url)
    .then(response => response.text())
    .then(text => {
      const linhas = text.trim().split('\n');
      const dados = linhas.map((linha, index) => {
        if (index === 0) return null;
        const partes = linha.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const [titulo, ano, genero, duracao, img, link, categoria] = 
          partes.map(p => p.replace(/^"|"$/g, '').trim());
        return { titulo, ano, genero, duracao, img, link, categoria };
      }).filter(item => item !== null);
      return dados;
    });
}


function criarCard(filme) {
  const link = `../tela2/tela2.html?titulo=${encodeURIComponent(filme.titulo)}
  &ano=${filme.ano}&genero=${encodeURIComponent(filme.genero)
  }&duracao=${encodeURIComponent(filme.duracao)}
  &img=${filme.img}&link=${encodeURIComponent(filme.link)}`;


  const card = document.createElement('div');
  card.className = 'film-card';

  const a = document.createElement('a');
  a.href = link;

  const img = document.createElement('img');
  img.src = `../img/${filme.img}`;
  img.alt = filme.titulo;

  a.appendChild(img);
  card.appendChild(a);

  return card;
}

function exibirFilmes(dados) {
  const destaqueContainer = document.getElementById('em-destaque');
  const filmesContainer = document.getElementById('filmes');

  dados.forEach(filme => {
    const card = criarCard(filme);
    filmesParaPesquisa.push(card);  // adiciona para busca depois
    if (filme.categoria === 'EM DESTAQUE') {
      destaqueContainer.appendChild(card);
    } else if (filme.categoria === 'FILMES') {
      filmesContainer.appendChild(card);
    }
  });
}

// --- BARRA DE PESQUISA ---

const searchInput = document.getElementById('search-bar');
const filmesParaPesquisa = [];

searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.toLowerCase();

  filmesParaPesquisa.forEach(card => {
    const img = card.querySelector('img');
    const altText = img ? img.alt.toLowerCase() : '';

    if (altText.includes(searchTerm)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
});

// --- INICIAR ---
carregarCSV('../InfoFilmes.csv').then(exibirFilmes);
