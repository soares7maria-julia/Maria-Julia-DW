const params = new URLSearchParams(window.location.search);
const titulo = params.get("titulo");
const ano = params.get("ano");
const genero = params.get("genero");
const duracao = params.get("duracao");
const img = params.get("img");

document.getElementById("titulo-filme").textContent = `${titulo} (${ano})`;
document.getElementById("genero-filme").textContent = genero;
document.getElementById("duracao-filme").textContent = duracao;
document.getElementById("imagem-filme").src = `../img/${img}`;

// Montar os parâmetros para passar à tela 3
const queryString = `?titulo=${encodeURIComponent(titulo)}&ano=${encodeURIComponent(ano)}&genero=${encodeURIComponent(genero)}&duracao=${encodeURIComponent(duracao)}&img=${encodeURIComponent(img)}`;

document.getElementById("comprar-btn").addEventListener("click", () => {
  window.location.href = `../tela3/tela3.html${queryString}&valor=10.00`;
});

document.getElementById("alugar-btn").addEventListener("click", () => {
  window.location.href = `../tela3/tela3.html${queryString}&valor=4.00`;
});
