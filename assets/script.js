const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Mobile nav toggle
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");

if (toggle && links) {
  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Keep footer year current
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Light / dark theme toggle (initial theme is set inline in <head>)
const themeBtn = document.querySelector(".theme-toggle");
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const current = root.dataset.theme ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });
}

// Scroll progress bar + nav shadow
const nav = document.querySelector(".site-nav");
const progress = document.createElement("div");
progress.className = "scroll-progress";
document.body.prepend(progress);

let ticking = false;
function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  if (nav) nav.classList.toggle("scrolled", window.scrollY > 8);
  updateActiveLink();
  updateTimeline();
  ticking = false;
}
window.addEventListener("scroll", () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(onScroll);
  }
}, { passive: true });

// Scrollspy: highlight the section in view with a sliding glass pill
const spyLinks = links ? [...links.querySelectorAll('a[href^="#"]')] : [];
const spyTargets = spyLinks
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);
let indicator = null;
if (spyLinks.length) {
  indicator = document.createElement("span");
  indicator.className = "nav-indicator";
  links.prepend(indicator);
}

function updateActiveLink() {
  if (!spyLinks.length) return;
  const line = window.innerHeight * 0.35;
  let active = null;
  spyTargets.forEach((target, i) => {
    if (target.getBoundingClientRect().top <= line) active = spyLinks[i];
  });
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
    active = spyLinks[spyLinks.length - 1];
  }
  spyLinks.forEach((a) => a.classList.toggle("active", a === active));
  if (active) {
    indicator.style.width = `${active.offsetWidth}px`;
    indicator.style.transform = `translateX(${active.offsetLeft}px)`;
    indicator.style.opacity = "1";
  } else {
    indicator.style.opacity = "0";
  }
}
window.addEventListener("resize", updateActiveLink);

// Timeline: light up the one entry that has reached the middle of the viewport
const timelineItems = [...document.querySelectorAll(".timeline > li")];
function updateTimeline() {
  const mid = window.innerHeight * 0.5;
  let current = null;
  timelineItems.forEach((li) => {
    const r = li.getBoundingClientRect();
    if (r.top <= mid && r.bottom > window.innerHeight * 0.15) current = li;
  });
  timelineItems.forEach((li) => li.classList.toggle("current", li === current));
}
onScroll();

// Liquid glass: soft highlight follows the pointer
document.addEventListener("pointermove", (e) => {
  const el = e.target.closest && e.target.closest(".hero-links a, .lb-btn");
  if (!el) return;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
});

// Reveal content as it scrolls into view (staggered per batch)
const revealSelector = [
  ".section-head", ".section > p", ".section > h3", ".timeline > li",
  ".interest-list > li", ".pub-list > li", ".skill-list > li",
  ".section > .timeline-media", ".figure-row > div", ".process-step",
  ".stage-item", ".evidence-note", ".resource-list > li",
  ".contact-email", ".section > .hero-links",
].join(",");

if ("IntersectionObserver" in window && !reduceMotion) {
  root.classList.add("js");
  const revealIO = new IntersectionObserver((entries) => {
    entries.filter((e) => e.isIntersecting).forEach((entry, i) => {
      const el = entry.target;
      el.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
      el.classList.add("in");
      revealIO.unobserve(el);
      setTimeout(() => { el.style.transitionDelay = ""; }, 1200);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  document.querySelectorAll(revealSelector).forEach((el) => {
    el.classList.add("reveal");
    revealIO.observe(el);
  });
}


// Lightbox: images zoom out of the page; arrows browse the same section
const icon = (d) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;

const lb = document.createElement("div");
lb.className = "lightbox";
lb.setAttribute("role", "dialog");
lb.setAttribute("aria-modal", "true");
lb.setAttribute("aria-label", "Image viewer");
lb.innerHTML = `
  <button class="lb-btn lb-close" aria-label="Close">${icon("M6 6l12 12M18 6L6 18")}</button>
  <button class="lb-btn lb-prev" aria-label="Previous image">${icon("M15 6l-6 6 6 6")}</button>
  <button class="lb-btn lb-next" aria-label="Next image">${icon("M9 6l6 6-6 6")}</button>
  <figure><img alt=""><figcaption></figcaption></figure>`;
document.body.append(lb);

const lbImg = lb.querySelector("img");
const lbCap = lb.querySelector("figcaption");
let group = [];
let index = 0;
let opener = null;

function flipFrom(thumb) {
  if (reduceMotion || !thumb) return;
  const from = thumb.getBoundingClientRect();
  const to = lbImg.getBoundingClientRect();
  if (!to.width) return;
  lbImg.style.transition = "none";
  lbImg.style.transform =
    `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`;
  lbImg.getBoundingClientRect();
  lbImg.style.transition = "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)";
  lbImg.style.transform = "";
}

function show(i, animateFrom) {
  index = (i + group.length) % group.length;
  const thumb = group[index];
  lbImg.src = thumb.currentSrc || thumb.src;
  lbImg.alt = thumb.alt;
  lbCap.innerHTML = "";
  lbCap.textContent = thumb.alt;
  if (group.length > 1) {
    const count = document.createElement("span");
    count.textContent = `${index + 1} / ${group.length}`;
    lbCap.append(count);
  }
  const run = () => {
    if (animateFrom) return flipFrom(thumb);
    if (!reduceMotion) {
      lbImg.animate(
        [{ opacity: 0, transform: "scale(0.97)" }, { opacity: 1, transform: "none" }],
        { duration: 380, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
      );
    }
  };
  if (lbImg.complete) run(); else lbImg.onload = run;
}

function openLightbox(img) {
  const section = img.closest("section") || document.body;
  group = [...section.querySelectorAll(".timeline-media img")];
  lb.classList.toggle("single", group.length < 2);
  opener = img;
  root.style.overflow = "hidden";
  lb.classList.add("open");
  show(group.indexOf(img), true);
  setTimeout(() => lb.classList.add("ready"), 200);
  lb.querySelector(".lb-close").focus({ preventScroll: true });
}

function closeLightbox() {
  if (!lb.classList.contains("open")) return;
  const thumb = group[index];
  const finish = () => {
    lb.classList.remove("open", "ready");
    lbImg.style.transition = "none";
    lbImg.style.transform = "";
    root.style.overflow = "";
    if (opener) opener.focus({ preventScroll: true });
  };
  if (reduceMotion || !thumb) return finish();
  const from = lbImg.getBoundingClientRect();
  const to = thumb.getBoundingClientRect();
  lbImg.style.transition = "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)";
  lbImg.style.transform =
    `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width}, ${to.height / from.height})`;
  lb.classList.remove("ready");
  lb.style.opacity = "0";
  setTimeout(() => { lb.style.opacity = ""; finish(); }, 420);
}

document.querySelectorAll(".timeline-media img").forEach((img) => {
  img.tabIndex = 0;
  img.setAttribute("role", "button");
  img.addEventListener("click", () => openLightbox(img));
  img.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openLightbox(img);
    }
  });
});

lb.querySelector(".lb-close").addEventListener("click", closeLightbox);
lb.querySelector(".lb-prev").addEventListener("click", () => show(index - 1));
lb.querySelector(".lb-next").addEventListener("click", () => show(index + 1));
lb.addEventListener("click", (e) => {
  if (e.target === lb || e.target.tagName === "FIGURE") closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (!lb.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft" && group.length > 1) show(index - 1);
  if (e.key === "ArrowRight" && group.length > 1) show(index + 1);
});

let touchX = null;
lb.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener("touchend", (e) => {
  if (touchX === null || group.length < 2) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  touchX = null;
});
