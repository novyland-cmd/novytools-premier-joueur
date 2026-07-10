// Sélection des éléments principaux de l'interface.
const mainButton = document.querySelector('#mainButton');
const conditionElement = document.querySelector('#condition-text');
const conditionImageElement = document.querySelector('#condition-image');
const categoryChips = document.querySelectorAll('.category-chip');

// Images disponibles dans le dossier /images/.
// Important : un site statique ne peut pas lire automatiquement le contenu d'un dossier.
// Ajoute ici les noms réels de tes fichiers PNG.
const IMAGE_FOLDER = 'images/';
const imageFiles = [
  'meeple-couronne.png',
  'meeple-carte.png',
  'meeple-jumelles.png',
  'meeple-megaphone.png',
  'meeple-chef.png',
  'meeple-livre.png',
  'meeple-cles.png',
  'meeple-pomme.png',
  'meeple-tasse.png',
  'meeple-telephone.png',
  'meeple-tshirt.png',
  'meeple-chaussures.png'//,
  //'meeple-gateau.png',
  //'meeple-lunettes.png',
  //'meeple-casque.png',
  //'meeple-reveil.png'
];

// Banque de conditions chargée depuis le fichier JSON.
let conditions = [];

// Catégorie active pendant la session actuelle.
let selectedCategory = 'all';

// Dernière condition affichée pendant la session actuelle.
// Cette information est temporaire et disparaît au rechargement de la page.
let lastConditionId = null;

// Initialisation de l'application au chargement de la page.
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
  try {
    conditions = await loadConditions();

    setupCategoryChips();

    // Affiche automatiquement une première condition au chargement.
    handleNewCondition();
  } catch (error) {
    console.error('Erreur lors du chargement des conditions :', error);
    hideImage();
    displayCondition('Impossible de charger les conditions.');
  }
}

async function loadConditions() {
  const response = await fetch('conditions.json');

  if (!response.ok) {
    throw new Error('Le fichier conditions.json est introuvable.');
  }

  return await response.json();
}

function getSelectedCategory() {
  return selectedCategory;
}

function getFilteredConditions() {
  const activeCategory = getSelectedCategory();

  if (activeCategory === 'all') {
    return conditions;
  }

  return conditions.filter((condition) => condition.category === activeCategory);
}

function getRandomCondition(conditionList) {
  if (!Array.isArray(conditionList) || conditionList.length === 0) {
    return null;
  }

  // S'il n'y a qu'une seule condition, on la retourne directement.
  // Cela évite toute boucle inutile ou infinie.
  if (conditionList.length === 1) {
    return conditionList[0];
  }

  let selectedCondition;

  // Tant que la condition tirée est la même que la dernière affichée,
  // on effectue un nouveau tirage.
  do {
    const randomIndex = Math.floor(Math.random() * conditionList.length);
    selectedCondition = conditionList[randomIndex];
  } while (selectedCondition.id === lastConditionId);

  return selectedCondition;
}

function getRandomImage() {
  if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * imageFiles.length);
  return `${IMAGE_FOLDER}${imageFiles[randomIndex]}`;
}

function getImageForCondition(condition) {
  // Évolution future : remplacer la ligne suivante par :
  // return condition.image ? `${IMAGE_FOLDER}${condition.image}` : null;
  // La logique d'affichage restera ensuite identique.
  return getRandomImage();
}

function hideImage() {
  if (!conditionImageElement) {
    return;
  }

  conditionImageElement.hidden = true;
  conditionImageElement.removeAttribute('src');
}

function animateImageChange() {
  if (!conditionImageElement) {
    return;
  }

  conditionImageElement.classList.remove('is-changing');

  // Force le redémarrage de l'animation CSS à chaque nouveau tirage.
  void conditionImageElement.offsetWidth;

  conditionImageElement.classList.add('is-changing');
}

function displayImage(imagePath) {
  if (!conditionImageElement || !imagePath) {
    hideImage();
    return;
  }

  conditionImageElement.hidden = false;
  conditionImageElement.src = imagePath;
  animateImageChange();
}

if (conditionImageElement) {
  // Si le fichier image est absent ou mal nommé, on masque simplement l'image.
  // La condition demeure affichée et l'application continue de fonctionner.
  conditionImageElement.addEventListener('error', hideImage);
}

function animateConditionChange() {
  if (!conditionElement) {
    return;
  }

  conditionElement.classList.remove('is-changing');

  // Force le redémarrage de l'animation CSS à chaque nouveau tirage.
  void conditionElement.offsetWidth;

  conditionElement.classList.add('is-changing');
}

function displayCondition(text) {
  if (!conditionElement) {
    throw new Error("L'élément d'affichage de la condition est introuvable.");
  }

  conditionElement.textContent = text;
  animateConditionChange();
}

function handleNewCondition() {
  const filteredConditions = getFilteredConditions();
  const randomCondition = getRandomCondition(filteredConditions);

  if (!randomCondition) {
    hideImage();
    displayCondition('Aucune condition disponible dans cette catégorie.');
    lastConditionId = null;
    return;
  }

  const image = getImageForCondition(randomCondition);

  displayImage(image);
  displayCondition(randomCondition.text);
  lastConditionId = randomCondition.id;
}

function setActiveCategoryChip(activeChip) {
  categoryChips.forEach((chip) => {
    const isActive = chip === activeChip;

    chip.classList.toggle('active', isActive);
    chip.setAttribute('aria-pressed', String(isActive));
  });
}

function handleCategoryClick(event) {
  const clickedChip = event.currentTarget;
  const newCategory = clickedChip.dataset.category || 'all';

  selectedCategory = newCategory;
  setActiveCategoryChip(clickedChip);
  handleNewCondition();
}

function setupCategoryChips() {
  categoryChips.forEach((chip) => {
    chip.addEventListener('click', handleCategoryClick);
  });
}

function animateButtonClick() {
  if (!mainButton) {
    return;
  }

  mainButton.classList.remove('is-pressed');
  void mainButton.offsetWidth;
  mainButton.classList.add('is-pressed');
}

// Le bouton principal affiche une nouvelle condition dans la catégorie active.
if (mainButton) {
  mainButton.textContent = 'Nouvelle condition';
  mainButton.addEventListener('click', () => {
    animateButtonClick();
    handleNewCondition();
  });
}
