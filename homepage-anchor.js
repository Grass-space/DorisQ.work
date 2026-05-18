(function () {
  const initialHash = window.homepageInitialHash;

  function smoothScrollToHash(hash) {
    const target = document.querySelector(hash);

    if (!target) {
      return;
    }

    window.history.replaceState(null, "", hash);
    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href$="#timeline"]');

    if (!link) {
      return;
    }

    const linkUrl = new URL(link.href, window.location.href);

    if (linkUrl.pathname !== window.location.pathname || linkUrl.origin !== window.location.origin) {
      return;
    }

    event.preventDefault();
    smoothScrollToHash("#timeline");
  });

  if (initialHash) {
    window.setTimeout(() => smoothScrollToHash(initialHash), 180);
  }
})();
