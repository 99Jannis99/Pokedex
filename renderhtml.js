// edit/use templates

async function fetchTemplate(templatePath) {
  try {
    const response = await fetch(
      templatePath + "?cache-bust=" + new Date().getTime()
    );
    if (!response.ok) {
      throw new Error("Fehler beim Laden des Templates");
    }
    return await response.text();
  } catch (error) {
    console.error("Fehler beim Laden des Templates:", error);
    return "";
  }
}

// das ist eine template version auch beim auslagern würden die zeilen nicht weniger

function fillTemplate(
  template,
  element,
  pokemon_details,
  typesString,
  abilities,
  moves,
  gameVersion,
  maleImage,
  femaleImage
) {
  return template
    .replace(/{pokemonName}/g, element.name)
    .replace(/{pokemonType}/g, pokemon_details.types[0].type.name)
    .replace(/{pokemonImage}/g, pokemon_details.sprites.front_default)
    .replace(/{pokemonTypes}/g, typesString)
    .replace(/{gameVersion}/g, gameVersion)
    .replace(/{pokemonId}/g, pokemon_details.id)
    .replace(/{pokemonSpecies}/g, pokemon_details.species.name)
    .replace(/{pokemonHeight}/g, pokemon_details.height)
    .replace(/{pokemonWeight}/g, (pokemon_details.weight / 10).toFixed(1))
    .replace(/{pokemonAbilities}/g, abilities)
    .replace(/{pokemonBaseExp}/g, pokemon_details.base_experience)
    .replace(/{pokemonHp}/g, pokemon_details.stats[0].base_stat)
    .replace(/{pokemonAttack}/g, pokemon_details.stats[1].base_stat)
    .replace(/{pokemonDefense}/g, pokemon_details.stats[2].base_stat)
    .replace(/{pokemonSpAtk}/g, pokemon_details.stats[3].base_stat)
    .replace(/{pokemonSpDef}/g, pokemon_details.stats[4].base_stat)
    .replace(/{pokemonSpeed}/g, pokemon_details.stats[5].base_stat)
    .replace(/{pokemonMaleImage}/g, maleImage)
    .replace(/{pokemonFemaleImage}/g, femaleImage)
    .replace(/{pokemonMoves}/g, moves);
}

// render details-slider

function initialSplide(element) {
  let splide = createSplideInstance(element);
  let themeLinks = getThemeLinks(element);

  addThemeLinkEventListeners(themeLinks, splide);
  addSplideMoveListener(splide, themeLinks);

  updateActiveTheme(0, themeLinks);
}

function createSplideInstance(element) {
  return new Splide(`#splide-${element.name}`, {
    pagination: false,
    arrows: false,
    drag: false,
  }).mount();
}

function getThemeLinks(element) {
  return document.querySelectorAll(
    `.pokemon_details.${element.name} .themes a`
  );
}

function addThemeLinkEventListeners(themeLinks, splide) {
  themeLinks.forEach((link, index) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      splide.go(index);
      updateActiveTheme(index, themeLinks);
    });
  });
}

function addSplideMoveListener(splide, themeLinks) {
  splide.on("move", function (newIndex) {
    updateActiveTheme(newIndex, themeLinks);
  });
}

function updateActiveTheme(activeIndex, links) {
  links.forEach((link, index) => {
    if (index === activeIndex) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// render html

// das ist eine template version auch beim auslagern würden die zeilen nicht weniger
async function renderCardHtml(element, pokemon_details) {
  const template = await fetchTemplate("./pokemon_card_template.html");
  if (!template) {
    console.error("Karten-Template konnte nicht geladen werden");
    return "";
  }

  let typesString = generateTypesString(pokemon_details);
  let gameVersion = await getGameVersion(pokemon_details);

  return template
    .replace(/{pokemonName}/g, element.name)
    .replace(/{pokemonType}/g, pokemon_details.types[0].type.name)
    .replace(
      /{pokemonImage}/g,
      pokemon_details.sprites.front_default
        ? pokemon_details.sprites.front_default
        : "./assets/icon/question.svg"
    )
    .replace(/{pokemonTypes}/g, typesString)
    .replace(/{gameVersion}/g, gameVersion);
}

// das ist eine template version auch beim auslagern würden die zeilen nicht weniger
async function renderDetailHtml(element, pokemon_details) {
  const template = await fetchTemplate("./pokemon_details_template.html");

  if (!template) {
    console.error("Detail-Template konnte nicht geladen werden");
    return "";
  }

  let typesString = generateTypesString(pokemon_details);
  let abilities = generateAbilitiesString(pokemon_details);
  let moves = generateMovesString(pokemon_details);
  let maleImage = getMaleImage(pokemon_details);
  let femaleImage = getFemaleImage(pokemon_details);

  return template
    .replace(/{pokemonName}/g, element.name)
    .replace(/{pokemonType}/g, pokemon_details.types[0].type.name)
    .replace(
      /{pokemonImage}/g,
      pokemon_details.sprites.front_default
        ? pokemon_details.sprites.front_default
        : "./assets/icon/question.svg"
    )
    .replace(/{pokemonTypes}/g, typesString)
    .replace(/{pokemonId}/g, pokemon_details.id)
    .replace(/{pokemonSpecies}/g, pokemon_details.species.name)
    .replace(/{pokemonHeight}/g, pokemon_details.height)
    .replace(/{pokemonWeight}/g, (pokemon_details.weight / 10).toFixed(1))
    .replace(/{pokemonAbilities}/g, abilities)
    .replace(/{pokemonBaseExp}/g, pokemon_details.base_experience)
    .replace(/{pokemonHp}/g, pokemon_details.stats[0].base_stat)
    .replace(/{pokemonAttack}/g, pokemon_details.stats[1].base_stat)
    .replace(/{pokemonDefense}/g, pokemon_details.stats[2].base_stat)
    .replace(/{pokemonSpAtk}/g, pokemon_details.stats[3].base_stat)
    .replace(/{pokemonSpDef}/g, pokemon_details.stats[4].base_stat)
    .replace(/{pokemonSpeed}/g, pokemon_details.stats[5].base_stat)
    .replace(
      /{pokemonMaleImage}/g,
      maleImage ? maleImage : "./assets/icon/question.svg"
    )
    .replace(
      /{pokemonFemaleImage}/g,
      femaleImage ? femaleImage : "./assets/icon/question.svg"
    )
    .replace(/{pokemonMoves}/g, moves);
}

function generateTypesString(pokemon_details) {
  return pokemon_details.types
    .map((typeElement) => `<p class="type">${typeElement.type.name}</p>`)
    .join("");
}

function generateAbilitiesString(pokemon_details) {
  return pokemon_details.abilities
    .map((abilitiesElement) => `<p>${abilitiesElement.ability.name},&nbsp</p>`)
    .join("");
}

function generateMovesString(pokemon_details) {
  return pokemon_details.moves
    .map((movesElement) => `<li><p>${movesElement.move.name}</p></li>`)
    .join("");
}

async function getGameVersion(pokemon_details) {
  try {
    const response = await fetch(pokemon_details.species.url);

    if (!response.ok) {
      throw new Error(`Fehler: ${response.status}`);
    }
    const data = await response.json();

    return data.generation.name;
  } catch (error) {
    console.error("Fehler beim Laden der Pokémon:", error);
  }
}

function getMaleImage(pokemon_details) {
  return pokemon_details.sprites.front_default;
}

function getFemaleImage(pokemon_details) {
  return pokemon_details.sprites.front_female
    ? pokemon_details.sprites.front_female
    : pokemon_details.sprites.front_default;
}
