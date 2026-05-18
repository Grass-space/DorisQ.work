async function loadHeader() {
  const headerRoot = document.querySelector("[data-header]");

  if (!headerRoot) {
    return;
  }

  try {
    const headerUrl = getHeaderUrl();
    const response = await fetch(headerUrl);

    if (!response.ok) {
      throw new Error(`Unable to load header: ${response.status}`);
    }

    headerRoot.innerHTML = await response.text();
    updateHeaderLinks();
  } catch (error) {
    console.error(error);
  }
}

function getHeaderUrl() {
  return new URL("header.html", document.currentScript.src);
}

function updateHeaderLinks() {
  const siteRootUrl = new URL("../", document.currentScript.src);
  const links = document.querySelectorAll(".site-nav a, .site-logo");

  links.forEach((link) => {
    const href = link.getAttribute("href");

    if (!href || href.startsWith("http") || href.startsWith("#")) {
      return;
    }

    link.setAttribute("href", new URL(href, siteRootUrl).toString());
  });
}

loadHeader();
