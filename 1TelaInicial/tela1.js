function lerCookie(nome) {
  const valor = `; ${document.cookie}`;
  const partes = valor.split(`; ${nome}=`);
  if (partes.length === 2) return decodeURIComponent(partes.pop().split(';').shift());
  return null;
}

function obterCarrinho() {
  const carrinhoStr = lerCookie('carrinho');
  if (!carrinhoStr) {
    const vazio = [];
    document.cookie = `carrinho=${encodeURIComponent(JSON.stringify(vazio))}; path=/; max-age=3600`;
    return vazio;
  }
  try {
    return JSON.parse(carrinhoStr);
  } catch {
    return [];
  }
}

const carouselElement = document.getElementById('single-carousel');
const imagens = carouselElement.querySelectorAll('img');
let index = 0;

function mostrarImagem(i) {
  imagens.forEach((img, idx) => {
    img.classList.toggle('active', idx === i);
  });
}

mostrarImagem(index);

setInterval(() => {
  index = (index + 1) % imagens.length;
  mostrarImagem(index);
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
  if (!filme.titulo || !filme.img) return null; // evita filmes incompletos

  const link = '../2TelaInfoFilme/tela2.html?' +
    `titulo=${encodeURIComponent(filme.titulo)}` +
    `&ano=${filme.ano}` +
    `&genero=${encodeURIComponent(filme.genero)}` +
    `&duracao=${encodeURIComponent(filme.duracao)}` +
    `&img=${encodeURIComponent(filme.img)}` +
    `&link=${encodeURIComponent(filme.link)}`;

  const card = document.createElement('div');
  card.className = 'film-card';

  const a = document.createElement('a');
  a.href = link;

  const img = document.createElement('img');

  if (filme.img && filme.img.startsWith('/img/')) {
    img.src = filme.img;
  } else if (filme.img) {
    img.src = `/img/${filme.img}`;
  } else {
    img.src = '/img/imgsAdicionais/padraoCapa.jpg';
  }

  img.alt = filme.titulo;

  a.appendChild(img);
  card.appendChild(a);

  const titulo = document.createElement('h3');
  titulo.textContent = filme.titulo;
  card.appendChild(titulo);

  const genero = document.createElement('p');
  genero.textContent = filme.genero;
  card.appendChild(genero);

  return card;
}


function exibirFilmes(dados) {
  const destaqueContainer = document.getElementById('em-destaque');
  const filmesContainer = document.getElementById('filmes');

  dados.forEach(filme => {
    const card = criarCard(filme);
    filmesParaPesquisa.push(card);
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

    card.style.display = altText.includes(searchTerm) ? 'block' : 'none';
  });
});

// --- CLIQUE NA IMAGEM DE LOGIN ---

const loginCircle = document.getElementById('login-circle');

loginCircle.addEventListener('click', () => {
  window.location.href = '../4TelaLogin/login.html'; 
});

// --- INICIALIZAÇÃO APÓS CARREGAR O DOM ---

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal-carrinho');
const fecharModalBtn = document.getElementById('fechar-modal-btn');
const carrinhoIcone = document.querySelector('.carrinho-container');
const listaItensCarrinho = document.getElementById('lista-itens-carrinho');
const totalCarrinhoEl = document.getElementById('total-carrinho');
const contadorCarrinhoEl = document.querySelector('.carrinho-contador');
const finalizarCompraBtn = document.getElementById('finalizar-compra-btn');
const btnAreaRestrita = document.getElementById("btnAreaRestrita");
  const btnLogout = document.getElementById("btnLogout");
  const usuarioLogadoStr = lerCookie("usuarioLogado");
  const spanLogin = document.getElementById("nome-usuario");


  if (usuarioLogadoStr && spanLogin) {
    const usuario = JSON.parse(usuarioLogadoStr);
    spanLogin.textContent = usuario.nome || "Login";
  }

  if (usuarioLogadoStr && spanLogin && btnLogout) {
    btnLogout.addEventListener("click", () => {
      document.cookie = "usuarioLogado=; path=/; max-age=0";
      location.reload();
    });
  }

  // Evento que limpa o carrinho no cookie quando a página for fechada,
  // mas só se não estiver logado
  window.addEventListener('beforeunload', () => {
    const usuarioLogadoStr = lerCookie('usuarioLogado');
    if (!usuarioLogadoStr) {
      document.cookie = 'carrinho=; path=/; max-age=0';
    }
  });

   btnAreaRestrita.addEventListener("click", (e) => {
  e.preventDefault();

   const usuarioStr = lerCookie("usuarioLogado");
  if (!usuarioStr) {
    alert("Você precisa estar logado para acessar esta área.");
    return;
  }

  const usuario = JSON.parse(usuarioStr);
  if (usuario.tipo === "colaborador" || usuario.tipo === "chefe") {
    window.location.href = "../TelaChefe/TelaDChefe.html";
  } else {
    alert("Você não tem permissão para acessar esta área.");
  }
});

  // Função para abrir o modal
  function abrirModal() {
    popularModalCarrinho();
    modal.style.display = 'flex';
  }

  // Função para fechar o modal
  function fecharModal() {
    modal.style.display = 'none';
  }

  // Atualiza contador de itens no header
  function atualizarContadorHeader() {
    const carrinho = obterCarrinho();
    contadorCarrinhoEl.textContent = carrinho.length;

  }

  // Preenche o modal com os itens do carrinho
  function popularModalCarrinho() {
    const carrinho = obterCarrinho();
    listaItensCarrinho.innerHTML = '';
    let total = 0;

    if (carrinho.length === 0) {
      listaItensCarrinho.innerHTML = '<p>Seu carrinho está vazio.</p>';
      finalizarCompraBtn.style.display = 'none';
    } else {
      finalizarCompraBtn.style.display = 'inline-block';
      carrinho.forEach((item, index) => {
        const itemHTML = `
          <div class="item-carrinho">
            <img src="${item.img}" alt="${item.titulo}">
            <div class="item-carrinho-info">
              <h4>${item.titulo}</h4>
              <p>${item.tipo}</p>
            </div>
            <span class="item-carrinho-preco">R$ ${item.valor.toFixed(2)}</span>
            <button class="item-carrinho-remover" data-index="${index}">&times;</button>
          </div>`;
        listaItensCarrinho.innerHTML += itemHTML;
        total += item.valor;
      });

    }

    totalCarrinhoEl.textContent = `R$ ${total.toFixed(2)}`;
    adicionarEventosRemover();
  }

  // Adiciona evento para remover item
  function adicionarEventosRemover() {
    document.querySelectorAll('.item-carrinho-remover').forEach(botao => {
      botao.addEventListener('click', (e) => {
        const index = e.target.dataset.index;
        removerItemDoCarrinho(index);
      });
    });
  }

  // Remove item do carrinho
  function removerItemDoCarrinho(index) {
    let carrinho = JSON.parse(lerCookie('carrinho')) || [];
    carrinho.splice(index, 1);
    document.cookie = `carrinho=${encodeURIComponent(JSON.stringify(carrinho))}; path=/; max-age=3600`;
    popularModalCarrinho();
    atualizarContadorHeader();
  }

  // Eventos para abrir e fechar modal
  carrinhoIcone.addEventListener('click', abrirModal);
  fecharModalBtn.addEventListener('click', fecharModal);
  modal.addEventListener('click', e => {
    if (e.target === modal) fecharModal();
  });

  // Evento para finalizar compra
  finalizarCompraBtn.addEventListener('click', () => {
  const usuario = JSON.parse(lerCookie('usuarioLogado'));
  const carrinho = obterCarrinho();
  const total = carrinho.reduce((acc, item) => acc + item.valor, 0);

  if (!usuario) {
    alert("Você precisa estar logado para finalizar a compra.");
    window.location.href = "../4TelaLogin/login.html";
    return;
  }

  if (total > 0) {
    const valores = carrinho.map(item => item.valor);
    const valoresParam = encodeURIComponent(JSON.stringify(valores));
    window.location.href = `../3TelaPagamento/tela3.html?valores=${valoresParam}&total=${total.toFixed(2)}`;
  } else {
    alert("Seu carrinho está vazio!");
  }
});

  // Se a URL tem parâmetro mostrarCarrinho=true, abre o modal
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('mostrarCarrinho') === 'true') {
    abrirModal();
  }

  // Atualiza contador no header ao carregar
  atualizarContadorHeader();

});

function adicionarAoCarrinho(filme) {
  const carrinho = obterCarrinho();

  // Garante que o link seja gerado corretamente mesmo se vier vazio do CSV
  console.log("Filme adicionado:", filme)
  const linkFinal = filme.link || `/filmes/${filme.titulo.toLowerCase().replace(/\s+/g, '-')}.html`;
  const novoItem = {
    titulo: filme.titulo,
    img: filme.img,
    link: linkFinal,
    tipo: "Compra",
    valor: 10
  };

  carrinho.push(novoItem);
  document.cookie = `carrinho=${encodeURIComponent(JSON.stringify(carrinho))}; path=/; max-age=3600`;
}


// Carrega o CSV e exibe os filmes
const csvTimestamp = Date.now(); // força nova versão
carregarCSV(`../InfoFilmes.csv?t=${csvTimestamp}`).then(exibirFilmes);

// Também exibe os filmes adicionados via cookie
const filmesCookieStr = lerCookie('filmesAdicionados');
if (filmesCookieStr) {
  try {
    const filmesDoCookie = JSON.parse(filmesCookieStr);
    exibirFilmes(filmesDoCookie);
  } catch (err) {
    console.error('Erro ao ler filmes do cookie:', err);
  }
}
