const DATA_URL = "project-menu/projects.json";

const categoryAxis = document.querySelector("[data-category-axis]");
const projectRows = document.querySelector("[data-project-rows]");

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function getProjectHref(project) {
  return `${project.folderPath}index.html`;
}

function getColor(data, colorGroup) {
  return data.colorGroups[colorGroup]?.hex || "#111111";
}

function getOverlayColor(data, colorGroup) {
  return data.colorGroups[colorGroup]?.overlay || "rgba(0, 0, 0, 0.35)";
}

function buildCategoryAxis(categories) {
  const grid = createElement("div", "category-grid");

  categories.forEach((category) => {
    const link = createElement("a", "category-link");
    link.href = `categories/${category.id}/`;
    link.setAttribute("aria-label", category.title);

    const categoryContent = createElement("div", "category");
    const label = createElement("div", "category-label", category.title);
    const symbol = createElement("div", "category-symbol", category.symbol);

    categoryContent.append(label, symbol);
    link.append(categoryContent);
    grid.append(link);
  });

  categoryAxis.replaceChildren(grid);
}

function startCategorySymbolLoop() {
  const symbols = document.querySelectorAll(".category-symbol");
  let current = 0;

  if (!symbols.length) {
    return;
  }

  function highlightNextSymbol() {
    symbols.forEach((symbol, index) => {
      symbol.classList.toggle("is-active", index === current);
    });

    current = (current + 1) % symbols.length;
  }

  highlightNextSymbol();
  window.setInterval(highlightNextSymbol, 800);
}

function getRowTags(row) {
  const tags = new Set();

  row.projects.forEach((project) => {
    project.tags.forEach((tag) => tags.add(tag));
  });

  return tags;
}

function buildMatrix(row, categories) {
  const matrix = createElement("div", "matrix");
  const rowTags = getRowTags(row);

  categories.forEach((category, index) => {
    const isTagged = rowTags.has(category.id);
    const cell = createElement(
      "div",
      isTagged ? "cell" : "cell is-block"
    );

    if (isTagged) {
      cell.append(createElement("span", "cell-symbol", category.symbol));
    }

    cell.dataset.col = String(index + 1);
    matrix.append(cell);
  });

  return matrix;
}

function buildProjectTitle(project, data, overlayId) {
  const link = createElement("a", `project-title is-${project.side}`);
  link.href = getProjectHref(project);
  link.dataset.overlayId = overlayId;
  link.dataset.colorGroup = project.colorGroup;
  link.style.setProperty("--project-color", getColor(data, project.colorGroup));

  const name = createElement("span", "project-name", project.title);
  const marker = createElement("span", "project-marker");
  marker.setAttribute("aria-hidden", "true");

  link.append(name, marker);
  return link;
}

function buildProjectOverlay(project, data, overlayId) {
  const overlay = createElement("span", `project-hover-overlay is-${project.side}`);
  overlay.dataset.overlayId = overlayId;
  overlay.dataset.tags = project.tags.join(" ");
  overlay.style.setProperty("--project-overlay", getOverlayColor(data, project.colorGroup));
  overlay.setAttribute("aria-hidden", "true");
  return overlay;
}

function buildProjectRows(data) {
  const fragment = document.createDocumentFragment();

  data.homeRows.forEach((row, rowIndex) => {
    const rowElement = createElement("div", `project-row is-${row.type}`);

    row.projects.forEach((project, projectIndex) => {
      const overlayId = `${rowIndex}-${projectIndex}`;
      rowElement.append(buildProjectOverlay(project, data, overlayId));
    });

    row.projects
      .filter((project) => project.side === "left")
      .forEach((project, projectIndex) => {
        const originalIndex = row.projects.indexOf(project);
        rowElement.append(buildProjectTitle(project, data, `${rowIndex}-${originalIndex}`));
      });

    rowElement.append(buildMatrix(row, data.categories));

    row.projects
      .filter((project) => project.side === "right")
      .forEach((project) => {
        const originalIndex = row.projects.indexOf(project);
        rowElement.append(buildProjectTitle(project, data, `${rowIndex}-${originalIndex}`));
      });

    fragment.append(rowElement);
  });

  projectRows.replaceChildren(fragment);
}

function setupProjectTitleHover() {
  const titles = document.querySelectorAll(".project-title[data-overlay-id]");

  titles.forEach((title) => {
    const row = title.closest(".project-row");
    const overlay = row?.querySelector(
      `.project-hover-overlay[data-overlay-id="${title.dataset.overlayId}"]`
    );

    if (!overlay) {
      return;
    }

    title.addEventListener("mouseenter", () => {
      overlay.classList.add("is-visible");
    });

    title.addEventListener("mouseleave", () => {
      overlay.classList.remove("is-visible");
    });
  });
}

function setupColumnHover(categories) {
  let activeColumn = null;

  function setActiveColumn(column) {
    const category = categories[column - 1];

    if (!category || activeColumn === column) {
      return;
    }

    clearActiveColumn();
    activeColumn = column;

    document.querySelectorAll(`.cell[data-col="${column}"]`).forEach((cell) => {
      cell.classList.add("is-column-active");
    });

    document.querySelectorAll(".project-hover-overlay[data-tags]").forEach((overlay) => {
      const tags = overlay.dataset.tags.split(" ").filter(Boolean);

      if (tags.includes(category.id)) {
        overlay.classList.add("is-column-visible");
      }
    });
  }

  function clearActiveColumn() {
    if (activeColumn === null) {
      return;
    }

    document.querySelectorAll(".cell.is-column-active").forEach((cell) => {
      cell.classList.remove("is-column-active");
    });

    document.querySelectorAll(".project-hover-overlay.is-column-visible").forEach((overlay) => {
      overlay.classList.remove("is-column-visible");
    });

    activeColumn = null;
  }

  projectRows.addEventListener("mouseover", (event) => {
    const cell = event.target.closest(".cell[data-col]");

    if (!cell) {
      clearActiveColumn();
      return;
    }

    if (!projectRows.contains(cell)) {
      return;
    }

    setActiveColumn(Number(cell.dataset.col));
  });

  projectRows.addEventListener("mouseleave", clearActiveColumn);
}

function runIntroAnimation(onComplete) {
  document.documentElement.classList.add("is-intro-running");
  document.body.classList.add("is-intro-running");

  const categories = document.querySelectorAll(".category");
  const titleGroups = [
    '.project-title.is-right[data-color-group="red"]',
    '.project-title.is-left[data-color-group="dark-blue"], .project-title.is-left[data-color-group="medium-blue"]',
    '.project-title.is-right[data-color-group="light-blue"]',
    '.project-title.is-left[data-color-group="green"], .project-title.is-left[data-color-group="light-green"]'
  ];

  categories.forEach((category, index) => {
    window.setTimeout(() => {
      category.classList.add("is-entered");
    }, 120 + index * 90);
  });

  for (let column = 1; column <= 6; column += 1) {
    window.setTimeout(() => {
      document.querySelectorAll(`.cell[data-col="${column}"]`).forEach((cell) => {
        cell.classList.add("is-entered");
      });
    }, 760 + column * 150);
  }

  titleGroups.forEach((selector, groupIndex) => {
    window.setTimeout(() => {
      document.querySelectorAll(selector).forEach((title) => {
        title.classList.add("is-entered");
      });
    }, 2500 + groupIndex * 440);
  });

  window.setTimeout(() => {
    document.documentElement.classList.remove("is-intro-running");
    document.body.classList.remove("is-intro-running");
    onComplete?.();
  }, 4500);
}

async function initHomepage() {
  try {
    const response = await fetch(DATA_URL);

    if (!response.ok) {
      throw new Error(`Could not load ${DATA_URL}`);
    }

    const data = await response.json();

    buildCategoryAxis(data.categories);
    buildProjectRows(data);
    startCategorySymbolLoop();
    runIntroAnimation(() => {
      setupProjectTitleHover();
      setupColumnHover(data.categories);
    });
  } catch (error) {
    console.error(error);
    document.documentElement.classList.remove("is-intro-running");
    document.body.classList.remove("is-intro-running");

    const message = createElement(
      "p",
      "load-error",
      "Project index data could not be loaded. Please view this page through a local server."
    );

    document.querySelector(".home-index").replaceChildren(message);
  }
}

initHomepage();
