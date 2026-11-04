const mapPage = new URL("../map.html", import.meta.url);

document.addEventListener(
  "click",
  (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const mapTab = target.closest(".tab-map,[aria-label='园区地图']");
    const featureCard = target.closest(".feature-small");
    const mapFeature = featureCard && /感官地图/.test(featureCard.textContent ?? "");
    if (!mapTab && !mapFeature) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign(mapPage.href);
  },
  true
);
