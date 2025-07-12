function lerCookie(nome) {
  const valor = `; ${document.cookie}`;
  const partes = valor.split(`; ${nome}=`);
  if (partes.length === 2) return decodeURIComponent(partes.pop().split(';').shift());
  return null;
}

// --- 1. PEGAR DADOS DO FILME DA URL ---
const params = new URLSearchParams(window.location.search);
const titulo = params.get("titulo");
const ano = params.get("ano");
const genero = params.get("genero");
const duracao = params.get("duracao");
const img = params.get("img");
const link = params.get("link");


// Preenche as informações do filme na página
document.getElementById("titulo-filme").textContent = `${titulo} (${ano})`;
document.getElementById("genero-filme").textContent = genero;
document.getElementById("duracao-filme").textContent = duracao;
document.getElementById("imagem-filme").src = img.startsWith('/img/')
  ? img
  : `../img/${img}`;


// --- 2. LÓGICA DE SELEÇÃO E ADIÇÃO AO CARRINHO ---
const botoesOpcao = document.querySelectorAll('.botao-opcao');
const secaoAdicionar = document.getElementById('secao-adicionar');
const textoConfirmacao = document.getElementById('texto-confirmacao');
const botaoAdicionar = document.getElementById('adicionar-carrinho-btn');

let opcaoSelecionada = null;

// Adiciona um evento de clique para os botões "Comprar" e "Alugar"
botoesOpcao.forEach(botao => {
    botao.addEventListener('click', () => {
        // Remove a seleção de qualquer outro botão
        botoesOpcao.forEach(b => b.classList.remove('selecionado'));
        // Adiciona a classe 'selecionado' ao botão clicado
        botao.classList.add('selecionado');

        // Guarda a opção escolhida
        opcaoSelecionada = {
            tipo: botao.dataset.tipo,
            valor: parseFloat(botao.dataset.valor),
            titulo: titulo,
            img: img,
            link: link 
        };

        // Mostra a seção para adicionar ao carrinho
        textoConfirmacao.textContent = `Você selecionou: ${opcaoSelecionada.tipo.toUpperCase()} por R$${opcaoSelecionada.valor.toFixed(2)}.`;
        secaoAdicionar.style.display = 'block';
    });
});

// Adiciona o evento de clique para o botão "Adicionar ao Carrinho"
botaoAdicionar.addEventListener('click', () => {
    if (!opcaoSelecionada) {
        alert("Por favor, selecione uma opção (Comprar ou Alugar).");
        return;
    }

    // Lê o cookie do carrinho
const carrinhoCookie = lerCookie('carrinho');
let carrinho = carrinhoCookie ? JSON.parse(carrinhoCookie) : [];

// Adiciona o novo item
carrinho.push(opcaoSelecionada);

// Salva o cookie atualizado (1 hora de validade)
document.cookie = `carrinho=${encodeURIComponent(JSON.stringify(carrinho))}; path=/; max-age=3600`;


    // Feedback para o usuário
    alert(`"${opcaoSelecionada.titulo}" foi adicionado ao seu carrinho!`);

    // Opcional: Desabilitar o botão para não adicionar de novo
    botaoAdicionar.disabled = true;
    botaoAdicionar.textContent = 'Adicionado!';
});
 