(function () {
  const scriptUrl = new URL(document.currentScript.src);
  const sectionDataUrl = new URL("section.json", scriptUrl);
  const pageRoot = document.querySelector("[data-project-page]");
  const statusRoot = document.querySelector("[data-project-status]");
  const configuredPath = document.body.dataset.projectPath;

  function setStatus(message) {
    if (statusRoot) {
      statusRoot.textContent = message;
    }
  }

  function getCurrentProjectPath() {
    if (configuredPath) {
      return configuredPath.replace(/^\/|\/$/g, "");
    }

    const match = window.location.pathname.match(/\/categories\/(.+)\/index\.html$/);

    if (match) {
      return match[1].replace(/\/$/g, "");
    }

    return "";
  }

  function createSectionWrapper(section, index) {
    const wrapper = document.createElement("article");
    const meta = document.createElement("div");

    wrapper.className = "project-page__section";
    wrapper.dataset.template = section.template;
    meta.className = "project-page__section-meta";
    meta.textContent = section.caption || `${index + 1}. ${section.template}`;
    wrapper.append(meta);

    return wrapper;
  }

  async function fetchText(url) {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Could not load ${url.pathname}`);
    }

    return response.text();
  }

  async function renderSection(section, index, templatesUrl) {
    const templateUrl = new URL(`${section.template}.html`, templatesUrl);
    const html = await fetchText(templateUrl);
    const wrapper = createSectionWrapper(section, index);

    wrapper.insertAdjacentHTML("beforeend", html);
    return wrapper;
  }

  async function initProjectPage() {
    if (!pageRoot) {
      return;
    }

    try {
      const sectionData = await fetch(sectionDataUrl).then((response) => {
        if (!response.ok) {
          throw new Error(`Could not load ${sectionDataUrl.pathname}`);
        }

        return response.json();
      });
      const projectPath = getCurrentProjectPath();
      const project = sectionData.projects.find((entry) => entry.path === projectPath);

      if (!project) {
        setStatus(`No section data found for ${projectPath}.`);
        return;
      }

      document.title = `${project.title} | Doris Q`;

      if (!project.sections.length) {
        setStatus(`${project.title} does not have sections yet.`);
        return;
      }

      const templatesUrl = new URL(sectionData.templatesPath || "template/", sectionDataUrl);
      const renderedSections = await Promise.all(
        project.sections.map((section, index) => renderSection(section, index, templatesUrl))
      );

      pageRoot.replaceChildren(...renderedSections);
    } catch (error) {
      console.error(error);
      setStatus("Project sections could not be loaded. Please view this page through the local server.");
    }
  }

  initProjectPage();
})();
