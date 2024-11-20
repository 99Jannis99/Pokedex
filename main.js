// main.js

const Base_Url = "https://pokeapi.co/api/v2/pokemon";
let totalItemsCount = 0;
let scrollPosition;
let currentPage = 1;
let pokemonArrayGlobal = [];
let detailsSplide;

function init() {
  loadePokemon("?limit=20&offset=0", false);

  document
    .getElementById("search-button")
    .addEventListener("click", handleSearch);
  document.getElementById("search-input").addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  });

  window.addEventListener("resize", () => {
    renderPagination(totalItemsCount);
  });
}

// show deatils funktionen

function clickPokemon(name) {
  document.getElementById("pokemon-details-section").style.display = "flex";

  const pokemonIndex = pokemonArrayGlobal.findIndex(
    (pokemon) => pokemon.name === name
  );

  setTimeout(() => {
    detailsSplide.go(pokemonIndex);
  }, 50);

  scrollPosition = window.pageYOffset;

  const contentContainer = document.getElementById("content-container");
  contentContainer.style.position = "fixed";
  contentContainer.style.top = `-${scrollPosition}px`;
  contentContainer.style.width = "100%";
}

function disclickPokemon() {
  document.getElementById("pokemon-details-section").style.display = "none";

  const contentContainer = document.getElementById("content-container");
  contentContainer.style.position = "";
  contentContainer.style.top = "";

  window.scrollTo(0, scrollPosition);
}

function bubblingProtection(event) {
  event.stopPropagation();
}

// render Pokemon + Details

async function render(pokemon_Array) {
  let pokedex = document.getElementById("pokedex");
  let pokemonListString = await buildPokemonList(pokemon_Array);
  let pokemonDetailsString = await buildPokemonDetails(pokemon_Array);

  pokemonArrayGlobal = pokemon_Array;

  pokedex.innerHTML = pokemonListString;

  let detailsList = document.getElementById("pokemon-details-list");
  detailsList.innerHTML = pokemonDetailsString;

  document.getElementById("loading").classList.add("loading_deactive");

  initializeSplide();

  pokemon_Array.forEach((element) => {
    initialSplide(element);
  });
}

async function buildPokemonList(pokemon_Array) {
  let pokemonListString = "";
  for (let i = 0; i < pokemon_Array.length; i++) {
    const element = pokemon_Array[i];
    let pokemon_details = await loadePokemon("/" + element.name, true);
    pokemonListString += await renderCardHtml(element, pokemon_details);
  }
  return pokemonListString;
}

async function buildPokemonDetails(pokemon_Array) {
  let pokemonDetailsString = "";
  for (let i = 0; i < pokemon_Array.length; i++) {
    const element = pokemon_Array[i];
    let pokemon_details = await loadePokemon("/" + element.name, true);
    pokemonDetailsString += await renderDetailHtml(element, pokemon_details);
  }
  return pokemonDetailsString;
}

function initializeSplide() {
  detailsSplide = new Splide("#pokemon-details-slider", {
    type: "slide",
    pagination: false,
    arrows: true,
    perPage: 1,
    trimSpace: false,
    focus: "center",
  }).mount();
}

// fetch data from server

async function loadePokemon(path = "", lodaeDetails) {
  try {
    const response = await fetch(Base_Url + path);

    if (!response.ok) {
      throw new Error(`Fehler: ${response.status}`);
    }
    const data = await response.json();

    if (!lodaeDetails) {
      totalItemsCount = data.count;
      render(data.results);
      renderPagination(totalItemsCount);
    }

    return data;
  } catch (error) {
    console.error("Fehler beim Laden der Pokémon:", error);
  }
}

// render pagination

function renderPagination(count) {
  const totalPages = Math.ceil(count / 20);
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";

  appendFirstButton(paginationContainer, totalPages);
  appendMiddleButtons(paginationContainer, totalPages);
  appendLastButton(paginationContainer, totalPages);
}

function appendFirstButton(container, totalPages) {
  container.appendChild(createButton(1));
  if (currentPage > getStartPage() + 1) container.appendChild(createDots());
}

function appendMiddleButtons(container, totalPages) {
  for (let i = getStartPage(); i <= getEndPage(totalPages); i++) {
    container.appendChild(createButton(i));
  }
}

function appendLastButton(container, totalPages) {
  if (currentPage < totalPages - (window.innerWidth < 440 ? 2 : 3)) {
    container.appendChild(createDots());
  }
  container.appendChild(createButton(totalPages));
}

function getStartPage() {
  return Math.max(
    currentPage -
      (window.innerWidth < 440
        ? 1
        : window.innerWidth < 640
        ? 1
        : window.innerWidth < 1000
        ? 2
        : 5),
    2
  );
}

function getEndPage(totalPages) {
  return Math.min(
    currentPage +
      (window.innerWidth < 440
        ? 1
        : window.innerWidth < 640
        ? 1
        : window.innerWidth < 1000
        ? 2
        : 5),
    totalPages - 1
  );
}

function createButton(page) {
  const button = document.createElement("button");
  button.textContent = page;

  if (page === currentPage) {
    button.disabled = true;
  }

  button.onclick = () => loadPage(page);
  return button;
}

function createDots() {
  const dotsImage = document.createElement("img");
  dotsImage.src = "./assets/icon/dots.svg";
  dotsImage.alt = "Dots";
  dotsImage.style.width = "40px";
  dotsImage.style.margin = "0 10px";
  return dotsImage;
}

function loadPage(page) {
  currentPage = page;
  document.getElementById("loading").classList.remove("loading_deactive");
  const offset = (page - 1) * 20;
  loadePokemon(`?limit=20&offset=${offset}`, false);
}

// search input

async function handleSearch() {
  document.getElementById("loading").classList.remove("loading_deactive");
  const searchTerm = getSearchTerm();

  if (searchTerm === "") {
    resetToDefaultPokemonList();
    return;
  }
  await executeSearch(searchTerm);
}

async function executeSearch(searchTerm) {
  try {
    const allPokemonData = await loadePokemon("?limit=10000", true);
    const filteredPokemon = filterPokemonBySearchTerm(
      allPokemonData,
      searchTerm
    );
    render(filteredPokemon);
  } catch (error) {
    console.error("Fehler bei der Suche:", error);
  }
}

function getSearchTerm() {
  return document.getElementById("search-input").value.toLowerCase();
}

function resetToDefaultPokemonList() {
  loadePokemon("?limit=20&offset=0", false);
  currentPage = 1;
}

function filterPokemonBySearchTerm(allPokemonData, searchTerm) {
  return allPokemonData.results.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchTerm)
  );
}
