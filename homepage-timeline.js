(function () {
  const DATA_URL = "project-menu/projects.json";
  const timelineBody = document.querySelector("[data-timeline-body]");

  const timelineColumns = {
    green: "grassspace",
    "light-green": "grassspace",
    "dark-blue": "live-build",
    "medium-blue": "live-build",
    "light-blue": "curation",
    red: "arch-edu"
  };

  function createTimelineElement(tagName, className, text) {
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
    return `project-menu/${project.folderPath}index.html`;
  }

  function getTimelineColorGroup(colorGroup) {
    if (colorGroup === "medium-blue") {
      return "dark-blue";
    }

    if (colorGroup === "light-green") {
      return "green";
    }

    return colorGroup;
  }

  function collectTimelineProjects(data) {
    const projects = [];

    data.homeRows.forEach((row) => {
      row.projects.forEach((project) => {
        if (!project.year || project.timelineHidden) {
          return;
        }

        projects.push({
          ...project,
          sourceIndex: projects.length,
          timelineColumn: timelineColumns[project.colorGroup],
          timelineColorGroup: getTimelineColorGroup(project.colorGroup)
        });
      });
    });

    return projects.filter((project) => project.timelineColumn);
  }

  function groupProjectsByYear(projects) {
    return projects.reduce((groups, project) => {
      const year = Number(project.year);

      if (!groups.has(year)) {
        groups.set(year, []);
      }

      groups.get(year).push(project);
      return groups;
    }, new Map());
  }

  function sortTimelineProjects(projects) {
    return [...projects].sort((a, b) => {
      const aOrder = Number.isFinite(Number(a.timelineOrder)) ? Number(a.timelineOrder) : Infinity;
      const bOrder = Number.isFinite(Number(b.timelineOrder)) ? Number(b.timelineOrder) : Infinity;

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      return a.sourceIndex - b.sourceIndex;
    });
  }

  function createYearLabel(text) {
    const label = createTimelineElement("div", "timeline-year-label", text);
    label.style.gridColumn = "year";
    return label;
  }

  function createTimelineProject(project) {
    const link = createTimelineElement(
      "a",
      `timeline-project timeline-project--${project.timelineColumn}`
    );
    const marker = createTimelineElement(
      "span",
      `timeline-project__marker timeline-project__marker--${project.timelineColorGroup}`
    );
    const title = createTimelineElement("span", "timeline-project__title", project.title);

    link.href = getProjectHref(project);
    link.setAttribute("aria-label", project.title);

    if (project.timelineColumn === "grassspace" || project.timelineColumn === "live-build") {
      link.append(title, marker);
    } else {
      link.append(marker, title);
    }

    return link;
  }

  function createYearSegment(projects) {
    const segment = createTimelineElement("div", "timeline-year-segment");
    const line = createTimelineElement("span", "timeline-year-line");

    segment.append(line);

    projects.forEach((project) => {
      segment.append(createTimelineProject(project));
    });

    return segment;
  }

  function buildTimeline(projects) {
    const projectsByYear = groupProjectsByYear(projects);
    const years = [...projectsByYear.keys()].sort((a, b) => b - a);
    const fragment = document.createDocumentFragment();

    fragment.append(createYearLabel("Present"));

    years.forEach((year, index) => {
      fragment.append(createYearSegment(sortTimelineProjects(projectsByYear.get(year) || [])));

      if (index < years.length - 1) {
        fragment.append(createYearLabel(String(years[index + 1])));
      }
    });

    timelineBody.replaceChildren(fragment);
  }

  async function initTimeline() {
    if (!timelineBody) {
      return;
    }

    try {
      const response = await fetch(DATA_URL);

      if (!response.ok) {
        throw new Error(`Could not load ${DATA_URL}`);
      }

      const data = await response.json();
      const projects = collectTimelineProjects(data);

      if (!projects.length) {
        return;
      }

      buildTimeline(projects);
    } catch (error) {
      console.error(error);
    }
  }

  initTimeline();
})();
