// CARROSSEL AUTOMÁTICO
const carousel = document.getElementById('carousel');
let currentIndex = 0;

setInterval(() => {
  const imgs = carousel.querySelectorAll('img');
  imgs.forEach((img, index) => {
    img.style.opacity = index === currentIndex ? '1' : '0';
  });
  currentIndex = (currentIndex + 1) % imgs.length;
}, 3000);

// BARRA DE PESQUISA
const searchInput = document.getElementById('search-bar');
const filmCards = document.querySelectorAll('.film-card');

searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.toLowerCase();

  filmCards.forEach(card => {
    const img = card.querySelector('img');
    const altText = img ? img.alt.toLowerCase() : '';

    if (altText.includes(searchTerm)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
});
