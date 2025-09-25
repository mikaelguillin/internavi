// Mobile Navigation Toggle
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
});

// Close mobile menu when clicking on a link
document.querySelectorAll(".nav-link").forEach((n) =>
  n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  })
);

// Smooth scrolling functions
function scrollToCTA() {
  document.getElementById("cta").scrollIntoView({
    behavior: "smooth",
  });
}

function scrollToFeatures() {
  document.getElementById("features").scrollIntoView({
    behavior: "smooth",
  });
}

// Analytics tracking (placeholder - integrate with your analytics service)
function trackEvent(eventName, properties = {}) {
  // Example: Google Analytics 4
  if (typeof gtag !== "undefined") {
    gtag("event", eventName, properties);
  }

  // Example: Mixpanel
  if (typeof mixpanel !== "undefined") {
    mixpanel.track(eventName, properties);
  }

  // Example: Custom analytics
  console.log("Analytics Event:", eventName, properties);
}

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Observe elements for animation
document.addEventListener("DOMContentLoaded", () => {
  const animatedElements = document.querySelectorAll(
    ".feature-card, .step, .section-header"
  );

  animatedElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });
});

// Navbar background change on scroll
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 100) {
    navbar.style.background = "rgba(255, 255, 255, 0.98)";
    navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)";
  } else {
    navbar.style.background = "rgba(255, 255, 255, 0.95)";
    navbar.style.boxShadow = "none";
  }
});

// Add click tracking for CTA buttons
document.addEventListener("DOMContentLoaded", () => {
  const ctaButtons = document.querySelectorAll(".btn-primary, .cta-link");

  ctaButtons.forEach((button) => {
    button.addEventListener("click", () => {
      trackEvent("cta_click", {
        button_text: button.textContent.trim(),
        location: button.closest("section")?.id || "unknown",
      });
    });
  });
});

// Keyboard navigation support
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    // Close mobile menu on escape
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  }
});
