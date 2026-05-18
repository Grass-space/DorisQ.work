const conversationLists = document.querySelectorAll("[data-conversation-list]");

async function loadConversation() {
  if (!conversationLists.length) {
    return;
  }

  try {
    const response = await fetch("conversation.json");

    if (!response.ok) {
      throw new Error(`Unable to load conversation data: ${response.status}`);
    }

    const data = await response.json();
    renderConversationCategory(data.projects, "talks");
    renderConversationCategory(data.projects, "interviews");
    renderConversationCategory(data.projects, "featured");
    renderConversationCategory(data.projects, "publication");
    updateConversationHeight("talks-interviews", data.projects, ["talks", "interviews"]);
    updateConversationHeight("featured-publication", data.projects, ["featured", "publication"]);
    bindPhotoPreview();
    bindProjectLinks();
  } catch (error) {
    console.error(error);
  }
}

function renderConversationCategory(projects, categoryId) {
  const list = document.querySelector(`[data-conversation-list="${categoryId}"]`);
  const entries = projects?.[categoryId] || [];

  if (!list) {
    return;
  }

  list.innerHTML = entries.map((entry) => createConversationEntry(entry, categoryId)).join("");
}

const colorMap = {
  blue: "#0070c0",
  "light blue": "#00bbff",
  red: "#ff0000"
};
let previewHideTimer;
let previewClearTimer;
let activePreviewEntry;

function createConversationEntry(entry, categoryId) {
  const colors = getEntryColors(entry.color);
  const swatchClass = colors.length > 1 ? "conversation-swatch--double" : "conversation-swatch--single";
  const colorA = colors[0] || "transparent";
  const colorB = colors[1] || "transparent";
  const typeColumns = getTypeColumns(entry.type, categoryId);
  const imagePath = getPrimaryImagePath(entry.imagePath);
  const imageAttribute = imagePath ? ` data-image-path="${escapeAttribute(imagePath)}"` : "";
  const sourceLink = entry.sourceLink || "";
  const linkAttribute = sourceLink ? ` data-source-link="${escapeAttribute(sourceLink)}"` : "";
  const interactiveAttributes = sourceLink ? ' role="link" tabindex="0"' : "";

  return `
    <article class="conversation-entry"${imageAttribute}${linkAttribute}>
      <div
        class="conversation-swatch ${swatchClass}"
        style="--conversation-color-a: ${colorA}; --conversation-color-b: ${colorB};"
        ${sourceLink ? interactiveAttributes : 'aria-hidden="true"'}
      >
        <span class="conversation-swatch__column">
          <span class="conversation-swatch__box"></span>
          <span class="conversation-type-list">${typeColumns[0].map(createTypeItem).join("")}</span>
        </span>
        <span class="conversation-swatch__column">
          <span class="conversation-swatch__box"></span>
          <span class="conversation-type-list">${typeColumns[1].map(createTypeItem).join("")}</span>
        </span>
      </div>
      <div class="conversation-text"${interactiveAttributes}>
        <span class="conversation-title">${escapeHtml(entry.title)}</span>
        <span class="conversation-media">${escapeHtml(entry.media)}</span>
        <strong class="conversation-source">${escapeHtml(entry.source)}</strong>
      </div>
    </article>
  `;
}

function getPrimaryImagePath(imagePath) {
  if (Array.isArray(imagePath)) {
    return imagePath[0] || "";
  }

  return imagePath || "";
}

function createTypeItem(type) {
  return `<span>${escapeHtml(type)}</span>`;
}

function getEntryColors(colorValue) {
  const colors = Array.isArray(colorValue) ? colorValue : [colorValue];

  return colors
    .map((color) => colorMap[String(color || "").trim().toLowerCase()])
    .filter(Boolean)
    .slice(0, 2);
}

function getTypeColumns(typeValue, categoryId) {
  const types = String(typeValue || "")
    .split(/\s+/)
    .map((type) => type.trim())
    .filter(Boolean);
  const centerTypes = types.slice(0, 2);
  const outerTypes = types.slice(2);

  return isLeftColumnCategory(categoryId) ? [outerTypes, centerTypes] : [centerTypes, outerTypes];
}

function isLeftColumnCategory(categoryId) {
  return categoryId === "talks" || categoryId === "featured";
}

function updateConversationHeight(layoutId, projects, categoryIds) {
  const layout = document.querySelector(`[data-conversation-layout="${layoutId}"]`);
  const rowCount = Math.max(...categoryIds.map((categoryId) => projects?.[categoryId]?.length || 0));

  if (!layout) {
    return;
  }

  layout.style.setProperty("--conversation-row-count", rowCount);
}

function bindPhotoPreview() {
  const preview = document.querySelector(".conversation-photo-preview");
  const previewImage = document.querySelector(".conversation-photo-preview__image");
  const hoverTargets = document.querySelectorAll(
    ".conversation-entry[data-image-path] .conversation-text, .conversation-entry[data-image-path] .conversation-swatch"
  );

  if (!preview || !previewImage) {
    return;
  }

  hoverTargets.forEach((target) => {
    target.addEventListener("mouseenter", () => {
      const entry = target.closest(".conversation-entry");
      const imagePath = entry?.dataset.imagePath;

      if (!imagePath) {
        return;
      }

      window.clearTimeout(previewHideTimer);
      window.clearTimeout(previewClearTimer);
      activePreviewEntry = entry;
      previewImage.src = new URL(imagePath, window.location.href).toString();
      preview.classList.add("is-active");
    });

    target.addEventListener("mouseleave", () => {
      const entry = target.closest(".conversation-entry");

      previewHideTimer = window.setTimeout(() => {
        if (activePreviewEntry === entry) {
          activePreviewEntry = null;
          preview.classList.remove("is-active");
          previewClearTimer = window.setTimeout(() => {
            if (!activePreviewEntry) {
              previewImage.removeAttribute("src");
            }
          }, 280);
        }
      }, 120);
    });
  });
}

function bindProjectLinks() {
  const linkTargets = document.querySelectorAll(
    ".conversation-entry[data-source-link] .conversation-text, .conversation-entry[data-source-link] .conversation-swatch"
  );

  linkTargets.forEach((target) => {
    target.addEventListener("click", () => {
      openProjectLink(target);
    });

    target.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      openProjectLink(target);
    });
  });
}

function openProjectLink(target) {
  const entry = target.closest(".conversation-entry");
  const sourceLink = entry?.dataset.sourceLink;

  if (!sourceLink) {
    return;
  }

  window.open(sourceLink, "_blank", "noopener");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

loadConversation();
