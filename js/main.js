// ---------- Scroll-linked readability veil over the live 3D background ----------
const bgVeil = document.getElementById("bg-veil");
if (bgVeil) {
  const heroEl = document.querySelector(".hero");
  const applyVeil = () => {
    const heroHeight = heroEl ? heroEl.offsetHeight : window.innerHeight;
    const progress = Math.min(window.scrollY / (heroHeight * 0.9), 1);
    bgVeil.style.opacity = (progress * 0.88).toFixed(2);
  };
  applyVeil();
  window.addEventListener("scroll", applyVeil, { passive: true });
  window.addEventListener("resize", applyVeil);
}

// ---------- Get a Quote form ----------
const quoteForm = document.getElementById("quote-form");
if (quoteForm) {
  const successBox = document.getElementById("quote-success");
  quoteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!quoteForm.checkValidity()) {
      quoteForm.reportValidity();
      return;
    }
    quoteForm.style.display = "none";
    if (successBox) successBox.style.display = "block";
  });
}

// ---------- Mobile nav toggle ----------
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.textContent = isOpen ? "×" : "≡";
    navLinks.style.cssText = isOpen
      ? "display:flex; flex-direction:column; position:absolute; top:76px; left:0; right:0; background:#1B1F26; padding:24px 32px; border-bottom:1px solid rgba(237,234,228,0.2); gap:20px;"
      : "";
  });
}

// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && revealEls.length) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in-view"));
}

// ---------- Animated stat counters ----------
const counters = document.querySelectorAll("[data-count]");
if ("IntersectionObserver" in window && counters.length) {
  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const duration = 1400;
        const start = performance.now();

        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = Math.round(target * eased);
          el.textContent = value + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        counterIO.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((el) => counterIO.observe(el));
}

// ---------- Active nav link highlighting on details page ----------
const sections = document.querySelectorAll("main section[id]");
const navAnchors = document.querySelectorAll(".nav-links a[href^='#']");
if ("IntersectionObserver" in window && sections.length && navAnchors.length) {
  const navIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navAnchors.forEach((a) => a.classList.remove("active"));
          const match = document.querySelector(
            `.nav-links a[href="#${entry.target.id}"]`
          );
          if (match) match.classList.add("active");
        }
      });
    },
    { rootMargin: "-40% 0px -50% 0px" }
  );
  sections.forEach((s) => navIO.observe(s));
}
