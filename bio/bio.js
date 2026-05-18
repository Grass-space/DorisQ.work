const bioContent = {
  en: {
    title: "Doris Quek Shu Han",
    paragraphs: [
      "Doris Q (b. 1987, Kota Kinabalu) is an architecture-based cultural worker, curator, and educator dedicated to revitalizing urban spaces and preserving cultural heritage through innovative endeavors. Her practice includes creative archival, literary adaptation, modular joinery exploration, and participatory architecture, all driven by a commitment to sustainability and community engagement. Doris's projects often focus on transforming neglected urban spaces into community art hubs, such as KongsiKL and PJ6 Park, repurposing these areas into shared art spaces. In her creative archival work, she collaborates with multi-disciplinary artists and institutions to preserve cultural narratives. Notable projects include 'WhereAs Old Klang Road,' which archived local stories, especially on Market bt.4.5, and showcased on-site exhibitions like 'Pasal Pasar' and 'Temu Tamu Timun,' while exploring the potential coexistence of the market and other activities to sustain the market as a public space.",
      "In 2020, Doris founded Colllab 社计手, an organization dedicated to participatory architectural construction and public space activation. Projects such as the Keramat Library and Public Plays in Kg Belemang exemplify her dedication to inclusive architecture and community-driven initiatives. Recently, she launched 'Reel Life Pangkor,' merging curatorial expertise with architectural design to create living museums that promote cultural preservation in collaboration with stakeholders. Doris Q's approach combines playfulness in place activation with cultural revitalization, inspiring sustainable art and architectural solutions while fostering dynamic community participation across her diverse projects."
    ]
  },
  zh: {
    title: "郭舒涵",
    paragraphs: [
      "Doris Q 是一位毕业于建筑系的文化工作者、策展人和教育家，致力于通过趣味性活动振兴城市空间并创意性地保护文化遗产和社区建筑。她的实践涵盖创意档案、文学再创作、模块化榫卯探索和参与式建筑。她的项目如 KongsiKL、Sasaran 和 PJ6 公园，涉及将被忽视的城市空间转变为社区艺术和共享中心。在创意档案工作中，她尝试与跨学科艺术家合作，以创新和多方面切入的方式记录地方叙事。在‘河去何从旧巴生路’中，艺术家与团体共同记录了旧巴生路四石半巴杀的叙事，并在市集内展示成品，探讨市集空间与时间分配使用和共存于巴杀永续的可能性。",
      "2020年，她创立了 Colllab 社计手，一个致力于倡导参与式建筑建设和激活公共空间的非政府组织。Keramat 图书馆和 Kg Belemang 的公共游乐项目展示了她对合作性建筑和社区驱动型项目的共创地方精神。近年来，她发起了‘Reel Life Pangkor’项目，将策展、社区与建筑设计结合，建立活态博物馆，与社区和地方产业相关者合作，促进有形文化保护。Doris Q 的实践方式体现了在地激活与文化复兴的趣味性，尝试可持续地方建筑解决方案，并在她的多样化项目中促进了动态的社区参与。"
    ]
  }
};

const bioTitle = document.querySelector("[data-bio-title]");
const bioText = document.querySelector("[data-bio-text]");
const bioCopy = document.querySelector(".bio-copy");
const languageButtons = document.querySelectorAll("[data-bio-lang]");

function setBioLanguage(language) {
  const content = bioContent[language];

  if (!content || !bioTitle || !bioText) {
    return;
  }

  bioTitle.textContent = content.title;
  bioText.replaceChildren(
    ...content.paragraphs.map((paragraph) => {
      const element = document.createElement("p");
      element.textContent = paragraph;
      return element;
    })
  );

  languageButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.bioLang === language);
  });

  bioCopy?.classList.toggle("is-zh", language === "zh");
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setBioLanguage(button.dataset.bioLang);
  });
});

setBioLanguage("en");
