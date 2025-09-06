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

// Email collection form handling
const earlyAccessForm = document.getElementById("early-access-form");
const emailInput = document.getElementById("email-input");

earlyAccessForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();

  if (!email) {
    showMessage("Please enter a valid email address.", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showMessage("Please enter a valid email address.", "error");
    return;
  }

  // Show loading state
  const submitButton = earlyAccessForm.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = "Submitting...";
  submitButton.disabled = true;
  earlyAccessForm.classList.add("loading");

  try {
    // Simulate API call (replace with actual endpoint)
    await submitEmail(email);

    showMessage("Thank you! You'll be notified when we launch.", "success");
    emailInput.value = "";

    // Track successful signup (you can integrate with analytics here)
    trackEvent("early_access_signup", { email: email });
  } catch (error) {
    console.error("Error submitting email:", error);
    showMessage("Something went wrong. Please try again.", "error");
  } finally {
    // Reset button state
    submitButton.textContent = originalText;
    submitButton.disabled = false;
    earlyAccessForm.classList.remove("loading");
  }
});

// Email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Simulate API call (replace with actual implementation)
async function submitEmail(email) {
  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      // In a real implementation, you would make an API call here
      // For now, we'll just simulate success
      console.log("Email submitted:", email);
      resolve({ success: true });
    }, 1500);
  });
}

// Show success/error messages
function showMessage(message, type) {
  // Remove existing messages
  const existingMessage = document.querySelector(".form-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create new message element
  const messageElement = document.createElement("div");
  messageElement.className = `form-message ${type}`;
  messageElement.textContent = message;

  // Style the message
  messageElement.style.cssText = `
        margin-top: 1rem;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        font-weight: 500;
        text-align: center;
        ${
          type === "success"
            ? "background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;"
            : "background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;"
        }
    `;

  // Insert after the form
  earlyAccessForm.parentNode.insertBefore(
    messageElement,
    earlyAccessForm.nextSibling
  );

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (messageElement.parentNode) {
      messageElement.remove();
    }
  }, 5000);
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

// Form accessibility improvements
emailInput.addEventListener("focus", () => {
  emailInput.parentElement.style.transform = "scale(1.02)";
});

emailInput.addEventListener("blur", () => {
  emailInput.parentElement.style.transform = "scale(1)";
});

// Prevent form submission on Enter if email is invalid
emailInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    earlyAccessForm.dispatchEvent(new Event("submit"));
  }
});
