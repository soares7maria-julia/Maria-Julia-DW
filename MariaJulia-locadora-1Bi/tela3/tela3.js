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
  `../tela2/tela2.html?titulo=${encodeURIComponent(titulo)}` +
  `&ano=${encodeURIComponent(ano)}` +
  `&genero=${encodeURIComponent(genero)}` +
  `&duracao=${encodeURIComponent(duracao)}` +
  `&img=${encodeURIComponent(img)}` +
  `&valor=${encodeURIComponent(valorCompra)}`;
};

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

// Objeto com as imagens e links
const links = {
  //top 7
"EstouAqui.jpg": "https://youtu.be/_NzqP0jmk3o",
"AutoDaC2.jpg": "https://youtu.be/ke4x5ywVhiw",
"sonic3.jpg": "https://youtu.be/xjbxG5VEo4M",
"MINECRAFTimagem.webp": "https://youtu.be/EVKYAAES6JQ",
"flow.jpg": "https://youtu.be/82WW9dVbglI",
"furisosOne.webp": "https://youtu.be/g5_iHh2owEc",
"furiososSeven.webp": "https://youtu.be/hujU0dw6Erk",
//linha 1
"UmSonhoDeLiberdade.webp": "https://youtu.be/Y22NgkErOAk",
"AutoDaC1.jpg": "https://youtu.be/XPuMu_ENzlg",
"Jurassic1.jpg": "https://youtu.be/RFinNxS5KN4",
"Jurassic2.jpg": "https://youtu.be/u2WuN96DSkY",
"Jurassic3.jpg": "https://youtu.be/zC8Vc8rMOdk",
"furiososFive.jpg": "https://youtu.be/e4tEwEZYELc",
"DoPijamaListrado.jpg": "https://youtu.be/aqwTw9qX1k4",
//linha 2
"farofeiros1.jpg": "https://youtu.be/MM-VGhfzNYQ",
"farofeiros2.jng": "https://youtu.be/LZNW4vrK-7c",
"MMEUmaPeça1.jpg": "https://youtu.be/mCbnq53iK3U",
"MMEUmaPeça2.jpg": "https://youtu.be/9hyLbCV0Dxo",
"MMEUmaPeça3.jpg": "https://youtu.be/8z9UHTvAwJY",
"jumanji1.jpg": "https://youtu.be/tnpV3q8Q3gg",
"Jumanji2.jpg": "https://youtu.be/PEuMN4_lnPs",


};

// Pega o link do filme ou um genérico se não encontrar
const linkDoFilme = links[imagemFilme] || "https://www.youtube.com";

linkAssistir.href = linkDoFilme;
linkFilmeDiv.style.display = "block";
}