const PROJECT_DATA_URL = "projects.json";
const THUMBNAIL_PATH = "thumbnails/";

const menuText = {
  "creative-archival": "Creative archival meticulously documents and preserves the living cultural heritage of places through various creative means, including writing, illustration, comics/posters, videography, and collaborations with multidisciplinary artists such as dancers and sound artists. These efforts culminate in on-site exhibitions or immersive live-build experiences, reinterpreting and reimagining cultural narratives. This approach can transform operational heritage sites into vibrant exhibitions or museums, fostering deeper appreciation and sustainable preservation of these cultural landscapes. Doris Q explores archival endeavours varying from short-term studio projects spanning months to intensive few-day curatorial workshops with the public. These outcomes are often displayed in on-site exhibitions, transforming these sites into instant exhibition spaces or permanent living museums.",
  "literary-adaptation": "Literary adaptation reinterprets and reimagines written works into various artistic forms, experiences, and spatial designs. This process transforms literary themes, characters, and narratives into tangible expressions such as toys, illustrations, videos, and architectural spaces. By creatively engaging with the source material, literary adaptation captures the essence and significance of the original text while offering new perspectives and interpretations. It serves as a bridge between literature and other artistic disciplines, enriching cultural discourse and fostering interdisciplinary creativity, thus creating a dynamic interplay between text and tangible art.",
  "modular-joinery": "Modular // Joinery explores diverse materials, construction methods, and joinery techniques to craft adaptable frameworks and structures. This practice includes experimental design and build projects as well as commissioned design projects. Modularity extends to spatial modules for parks and versatile wheel carts to accommodate changing social gatherings. These initiatives serve as hubs for innovation, facilitating the development of versatile, sustainable solutions across various scales and applications, ensuring adaptability and responsiveness to different environmental and social contexts.",
  "place-activation": "Place Activation converts neglected urban spaces into experimental hubs for community engagement and creativity. By repurposing car parks, abandoned factories, and unused market areas, this practice encourages innovative use of space. Doris Q's endeavours tested guerilla and tactical urbanism, involving small-scale, temporary, and unauthorized transformations of public spaces in cities. These efforts test new ideas, challenge existing norms, provoke discussion about urban planning, or gather data for potential permanent change. Through temporary occupations, multidisciplinary exhibitions, or shared artist hubs, Place Activation fosters vibrant activities and events, catalysing urban revitalization.",
  "participatory-design": "Participatory Projects involve collaborative endeavours that engage multiple stakeholders, including organizers, communities, participants, and strategic partners, in workshop-based design and build activities, particularly in architecture. These projects emphasize active involvement, discussion, and input from all parties to shape the final outcomes. Through workshops, discussions, and hands-on activities, Participatory Projects foster a sense of ownership, inclusivity, and co-creation, leading to meaningful architectural solutions reflecting the needs and aspirations of the community, enhancing the relevance and impact of the projects.",
  "play": "Play Category encompasses initiatives that infuse playful elements into diverse activities, fostering creativity, imagination, and exploration. These projects include constructing play structures for children, organizing workshops with artists to create life-size toys inspired by literary adaptations, and facilitating interactive experiences where participants engage in playful experimentation. Through these interventions, design thinking processes are sparked by play, enriching experiences and interactions for participants and users alike. This approach promotes joy, spontaneity, and collaborative engagement, ultimately enhancing the overall impact of the initiatives, encouraging a dynamic and participatory environment.",
  "red": "xxxxxxx",
  "dark-blue": "xxxxxxx",
  "light-blue": "xxxxxxx",
  "green": "xxxxxxx"
};

const menuHeadingText = {
  red: "Architecture Education"
};

const colorFilterIds = new Set(["red", "dark-blue", "light-blue", "green"]);
const colorFilterGroups = {
  "dark-blue": new Set(["dark-blue", "medium-blue"]),
  green: new Set(["green", "light-green"])
};
const colorValues = {
  red: "#ff0000",
  "dark-blue": "#0070c0",
  "medium-blue": "#0070c0",
  "light-blue": "#00bbff",
  green: "#00b050",
  "light-green": "#00b050"
};
const menuSpecificExclusions = {
  "place-activation": new Set(["Bamboo Joinery", "Wooden Joinery"]),
  "participatory-design": new Set(["Bamboo Joinery", "Wooden Joinery"])
};
const duplicateProjectExclusions = new Set([
  "wooden-joinery-new-vernacular-ground::Wooden Joinery::red"
]);
const imageNameOverrides = {
  "acrylic-tubes-noodle": "acrylic_tube_noodle",
  "arcylic-tubes-noodle": "acrylic_tube_noodle",
  "bamboo-dog-house": "bamboo_doghouse",
  "bamboo-doghouse": "bamboo_doghouse",
  "casa-tayton": "casa_tayton",
  "cosmicomic-toyscape": "cosmicomic_playscape",
  "living-museum": "living_muesum",
  "modular-blocks-tittar": "modular_block_tittar",
  "paper-reciprocal": "paper_reciproco",
  "rice-lightbox-noodle": "rice_lightbox_noodlle"
};

const copyRoot = document.querySelector("[data-project-copy]");
const galleryRoot = document.querySelector("[data-project-gallery]");
const headingRoot = document.querySelector("[data-project-heading]");
const listRoot = document.querySelector("[data-project-list]");
const contentRoot = document.querySelector(".project-content");
const menuButtons = document.querySelectorAll("[data-menu-id]");

let allProjects = [];
let currentMenuId = "";
let pendingMenuId = "";
let transitionTimer = null;

function flattenProjects(data) {
  const seenProjects = new Set();

  return data.homeRows.flatMap((row) => {
    return row.projects.map((project) => ({
      ...project,
      sourceRowId: row.id
    }));
  }).filter((project) => {
    const duplicateKey = `${project.sourceRowId}::${project.title}::${project.colorGroup}`;
    const projectKey = `${project.title}::${project.colorGroup}`;

    if (duplicateProjectExclusions.has(duplicateKey)) {
      return false;
    }

    if (seenProjects.has(projectKey)) {
      return false;
    }

    seenProjects.add(projectKey);
    return true;
  });
}

function getProjectsForMenu(menuId) {
  const excludedTitles = menuSpecificExclusions[menuId] || new Set();

  if (colorFilterIds.has(menuId)) {
    const colorGroups = colorFilterGroups[menuId] || new Set([menuId]);

    return allProjects.filter((project) => {
      return colorGroups.has(project.colorGroup) && !excludedTitles.has(project.title);
    });
  }

  return allProjects.filter((project) => {
    return project.tags.includes(menuId) && !excludedTitles.has(project.title);
  });
}

function renderProjectMenu(menuId) {
  const projects = getProjectsForMenu(menuId);
  const text = menuText[menuId] || "";

  currentMenuId = menuId;
  headingRoot.textContent = getMenuHeading(menuId);
  headingRoot.classList.toggle("is-two-line", menuId === "red");
  copyRoot.replaceChildren(...createParagraphs(text));
  listRoot.replaceChildren(...projects.map(createProjectListItem));
  galleryRoot.replaceChildren(...projects.map(createProjectCard));
  updateActiveMenu(menuId);
}

function requestProjectMenu(menuId) {
  if (menuId === currentMenuId && !transitionTimer) {
    return;
  }

  pendingMenuId = menuId;
  updateActiveMenu(menuId);
  contentRoot.classList.add("is-transitioning");

  if (transitionTimer) {
    window.clearTimeout(transitionTimer);
  }

  transitionTimer = window.setTimeout(() => {
    renderProjectMenu(pendingMenuId);
    pendingMenuId = "";
    transitionTimer = null;
    window.requestAnimationFrame(() => {
      contentRoot.classList.remove("is-transitioning");
    });
  }, 180);
}

function createParagraph(text) {
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  return paragraph;
}

function createParagraphs(text) {
  if (!text) {
    return [document.createTextNode("")];
  }

  return text.split(/\n{2,}/).map(createParagraph);
}

function createProjectCard(project) {
  const card = document.createElement("a");
  const defaultImage = document.createElement("img");
  const hoverImage = document.createElement("img");
  const title = document.createElement("span");
  const baseName = getProjectImageBaseName(project);
  const defaultSrc = `${THUMBNAIL_PATH}${baseName}_a.jpg`;
  const hoverSrc = `${THUMBNAIL_PATH}${baseName}_b.jpg`;

  card.className = "project-card";
  card.href = getProjectHref(project);
  card.setAttribute("aria-label", project.title);
  defaultImage.className = "project-card-image";
  defaultImage.src = defaultSrc;
  defaultImage.alt = project.title;
  defaultImage.loading = "lazy";
  hoverImage.className = "project-card-image project-card-image-hover";
  hoverImage.src = hoverSrc;
  hoverImage.alt = "";
  hoverImage.loading = "lazy";
  title.className = "project-card-title";
  title.textContent = project.title;

  card.append(defaultImage, hoverImage, title);
  defaultImage.addEventListener("error", () => {
    card.classList.add("is-missing");
    card.dataset.title = project.title;
  });

  return card;
}

function createProjectListItem(project) {
  const item = document.createElement("li");
  const title = document.createElement("a");
  const marker = document.createElement("span");

  item.className = "project-list-item";
  title.className = "project-list-title";
  title.href = getProjectHref(project);
  title.textContent = project.title;
  marker.className = "project-list-marker";
  marker.style.backgroundColor = colorValues[project.colorGroup] || "#111111";
  marker.setAttribute("aria-hidden", "true");

  item.append(title, marker);
  return item;
}

function getProjectHref(project) {
  return `../${project.folderPath}index.html`;
}

function getProjectImageBaseName(project) {
  const titleSlug = slugify(project.title);
  const folderSlug = slugify(project.folder);

  return imageNameOverrides[folderSlug] || imageNameOverrides[titleSlug] || titleSlug;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/_{3}/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function updateActiveMenu(menuId) {
  menuButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.menuId === menuId);
  });
}

function getMenuLabel(menuId) {
  const button = document.querySelector(`[data-menu-id="${menuId}"]`);

  return button?.getAttribute("aria-label") || "";
}

function getMenuHeading(menuId) {
  return menuHeadingText[menuId] || getMenuLabel(menuId);
}

function setupMenuButtons() {
  menuButtons.forEach((button) => {
    button.addEventListener("click", () => {
      requestProjectMenu(button.dataset.menuId);
    });
  });
}

async function initProjectMenu() {
  try {
    const response = await fetch(PROJECT_DATA_URL);

    if (!response.ok) {
      throw new Error(`Could not load ${PROJECT_DATA_URL}`);
    }

    const data = await response.json();

    allProjects = flattenProjects(data);
    setupMenuButtons();
    renderProjectMenu("creative-archival");
  } catch (error) {
    console.error(error);
    copyRoot.textContent = "Project menu data could not be loaded. Please view this page through a local server.";
  }
}

initProjectMenu();
