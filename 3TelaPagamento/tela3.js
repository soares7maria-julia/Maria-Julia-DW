 function obterParametro(nome) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(nome);
}
window.onload = function () {   
const valorCompra = obterParametro('valor');
if (valorCompra) {
  document.getElementById("valor-compra").textContent = `Valor da compra: R$${parseFloat(valorCompra).toFixed(2)}`;
} else {
  document.getElementById("valor-compra").textContent = "Valor da compra não encontrado.";
}
      
        // Atualizar valor da compra dinamicamente
        const params = new URLSearchParams(window.location.search);
        const valor = params.get("valor");
      
        if (valor) {
          document.getElementById("valor-compra").textContent = `Valor da compra: R$${parseFloat(valor).toFixed(2)}`;
        }   

        const voltarLink = document.getElementById("voltar-link");
const titulo = obterParametro("titulo");
const ano = obterParametro("ano");
const genero = obterParametro("genero");
const duracao = obterParametro("duracao");
const img = obterParametro("img");

voltarLink.href =
  `../2TelaInfoFilme/tela2.html?titulo=${encodeURIComponent(titulo)}` +
  `&ano=${encodeURIComponent(ano)}` +
  `&genero=${encodeURIComponent(genero)}` +
  `&duracao=${encodeURIComponent(duracao)}` +
  `&img=${encodeURIComponent(img)}` +
  `&valor=${encodeURIComponent(valorCompra)}`;
};

async function buscarLinkDoCSV(imagem) {
  try {
    const response = await fetch('../InfoFilmes.csv');
    const data = await response.text();
    const linhas = data.trim().split('\n');

    for (let i = 1; i < linhas.length; i++) { // pula cabeçalho
      const linha = linhas[i].trim();
      if (linha) {
        // separa respeitando vírgulas dentro de aspas
        const partes = linha.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const imgCSV = partes[4].replace(/^"|"$/g, '').trim();
        const linkCSV = partes[5].replace(/^"|"$/g, '').trim();

        if (imgCSV === imagem) {
          return linkCSV;
        }
      }
    }
    return null; // se não encontrar
  } catch (error) {
    console.error('Erro ao carregar CSV:', error);
    return null;
  }
}

function finalizarCompra() {
  const numero = document.getElementById("numero").value.trim();
  const nome = document.getElementById("nome").value.trim();
  const mes = document.querySelector(".expiracao-container select:nth-child(1)").value;
  const ano = document.querySelector(".expiracao-container select:nth-child(2)").value;
  const cvv = document.getElementById("cvv").value.trim();

  // Validação número do cartão (16 dígitos)
  if (!/^\d{16}$/.test(numero)) {
    alert("Número do cartão deve conter 16 dígitos numéricos.");
    return;
  }

  // Validação nome
  if (nome === "") {
    alert("Por favor, insira o nome do cartão.");
    return;
  }

  // Validação da expiração
  if (mes === "" || ano === "") {
    alert("Por favor, selecione o mês e o ano de expiração.");
    return;
  }

  // Validação do CVV (3 dígitos)
  if (!/^\d{3}$/.test(cvv)) {
    alert("O CVV deve conter 3 números.");
    return;
  }

  // Se tudo estiver válido
  alert("Compra finalizada com sucesso!");
 
  const linkFilmeDiv = document.getElementById("link-filme");
const linkAssistir = document.getElementById("link-assistir");

 const imagemFilme = obterParametro("img");
console.log("Imagem do filme:", imagemFilme);

buscarLinkDoCSV(imagemFilme).then(linkDoFilme => {
  if (linkDoFilme) {
    linkAssistir.href = linkDoFilme;
  } else {
    linkAssistir.href = "https://www.youtube.com";
  }
  linkFilmeDiv.style.display = "block";
});
}