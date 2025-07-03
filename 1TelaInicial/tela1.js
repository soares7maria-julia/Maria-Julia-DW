
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
  const link = `../2TelaInfoFilme/tela2.html?titulo=${encodeURIComponent(filme.titulo)}
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

  // 👇 Adiciona título e gênero (ou outras infos) no card
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

// --- CLIQUE NA IMAGEM DE LOGIN ---
const loginCircle = document.getElementById('login-circle');

loginCircle.addEventListener('click', () => {
  window.location.href = '../4TelaLogin/login.html'; 
});

// --- INICIAR ---
carregarCSV('../InfoFilmes.csv').then(exibirFilmes);

// ADICIONE ESTE CÓDIGO COMPLETO AO FINAL DE tela1.js

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal-carrinho');
    const fecharModalBtn = document.getElementById('fechar-modal-btn');
    const carrinhoIcone = document.querySelector('.carrinho-container'); // Ícone do carrinho no header
    const listaItensCarrinho = document.getElementById('lista-itens-carrinho');
    const totalCarrinhoEl = document.getElementById('total-carrinho');
    const contadorCarrinhoEl = document.querySelector('.carrinho-contador');
    const finalizarCompraBtn = document.getElementById('finalizar-compra-btn');

    // Função para abrir o modal
    function abrirModal() {
        popularModalCarrinho();
        modal.style.display = 'flex';
    }

    // Função para fechar o modal
    function fecharModal() {
        modal.style.display = 'none';
    }

    // Função para atualizar o contador de itens no ícone do header
    function atualizarContadorHeader() {
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        contadorCarrinhoEl.textContent = carrinho.length;
    }

    // Função principal: lê o localStorage e preenche o modal com os itens
    function popularModalCarrinho() {
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        listaItensCarrinho.innerHTML = ''; // Limpa a lista antes de adicionar os itens
        let total = 0;

        if (carrinho.length === 0) {
            listaItensCarrinho.innerHTML = '<p>Seu carrinho está vazio.</p>';
            finalizarCompraBtn.style.display = 'none'; // Esconde o botão se não houver itens
        } else {
            finalizarCompraBtn.style.display = 'inline-block'; // Mostra o botão
            carrinho.forEach((item, index) => {
                const itemHTML = `
                    <div class="item-carrinho">
                        <img src="../img/${item.img}" alt="${item.titulo}">
                        <div class="item-carrinho-info">
                            <h4>${item.titulo}</h4>
                            <p>${item.tipo}</p>
                        </div>
                        <span class="item-carrinho-preco">R$ ${item.valor.toFixed(2)}</span>
                        <button class="item-carrinho-remover" data-index="${index}">&times;</button>
                    </div>
                `;
                listaItensCarrinho.innerHTML += itemHTML;
                total += item.valor;
            });
        }

        totalCarrinhoEl.textContent = `R$ ${total.toFixed(2)}`;
        adicionarEventosRemover();
    }

    // Função para adicionar o evento de clique nos botões de remover item
    function adicionarEventosRemover() {
        document.querySelectorAll('.item-carrinho-remover').forEach(botao => {
            botao.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                removerItemDoCarrinho(index);
            });
        });
    }

    // Função para remover um item do carrinho
    function removerItemDoCarrinho(index) {
        let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        carrinho.splice(index, 1); // Remove o item do array
        localStorage.setItem('carrinho', JSON.stringify(carrinho)); // Atualiza o localStorage
        popularModalCarrinho(); // Repopula o modal com a lista atualizada
        atualizarContadorHeader(); // Atualiza o contador no header
    }

    // ... (código anterior do modal) ...

    // --- EVENTOS DE CLIQUE ---
    carrinhoIcone.addEventListener('click', abrirModal); // Clicar no ícone do carrinho abre o modal
    fecharModalBtn.addEventListener('click', fecharModal); // Clicar no "X" fecha o modal

    // Fecha o modal se o usuário clicar fora da janela de conteúdo
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            fecharModal();
        }
    });

    // ******** ADICIONE ESTE NOVO EVENTO AQUI ********
    finalizarCompraBtn.addEventListener('click', () => {
        // Pega o carrinho do localStorage para calcular o total
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const total = carrinho.reduce((acc, item) => acc + item.valor, 0);

        if (total > 0) {
            // Limpa o carrinho após ir para o pagamento (opcional, mas recomendado)
            // localStorage.removeItem('carrinho'); 
            
            // Redireciona para a tela de pagamento, passando o valor total na URL
            window.location.href = `../3TelaPagamento/tela3.html?valor=${total.toFixed(2)}`;
        } else {
            alert("Seu carrinho está vazio!");
        }
    });
    // ******** FIM DO NOVO CÓDIGO ********


    // --- LÓGICA INICIAL ---
    // Verifica se a URL tem o parâmetro para mostrar o carrinho
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mostrarCarrinho') === 'true') {
        abrirModal();
    }

    // Atualiza o contador no header assim que a página carrega
    atualizarContadorHeader();
});
