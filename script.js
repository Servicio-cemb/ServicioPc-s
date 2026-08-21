const FORMSPREE_ENDPOINT = "https://formspree.io/f/mdenjooa";

const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuButton.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("menu-open", isOpen);
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  });
});

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          currentObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

document.getElementById("current-year").textContent = new Date().getFullYear();

const form = document.getElementById("contact-form");
const emailButton = document.getElementById("email-button");
const statusMessage = document.getElementById("form-status");

function getFormData() {
  return {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    service: document.getElementById("service").value,
    message: document.getElementById("message").value.trim(),
    gotcha: document.getElementById("_gotcha").value.trim()
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm(data) {
  if (!data.name || !data.email || !data.service || !data.message) {
    statusMessage.textContent = "Completa todos los campos antes de enviar.";
    return false;
  }

  if (data.gotcha) {
    statusMessage.textContent = "No se pudo procesar la solicitud.";
    return false;
  }

  if (data.name.length < 2 || data.name.length > 80) {
    statusMessage.textContent = "Revisa el nombre introducido.";
    return false;
  }

  if (!isValidEmail(data.email) || data.email.length > 254) {
    statusMessage.textContent = "Introduce un correo electrónico válido.";
    return false;
  }

  if (data.message.length < 10 || data.message.length > 2000) {
    statusMessage.textContent = "La consulta debe tener entre 10 y 2000 caracteres.";
    return false;
  }

  statusMessage.textContent = "";
  return true;
}

function buildMessage(data) {
  return [
    "Hola Carlos,",
    "",
    `Mi nombre es ${data.name}.`,
    `Mi correo es ${data.email}.`,
    `Necesito información sobre: ${data.service}.`,
    "",
    "Problema o consulta:",
    data.message
  ].join("\n");
}

// WhatsApp: se mantiene como antes.
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = getFormData();

  if (!validateForm(data)) return;

  if (!CONTACT.phone) {
    statusMessage.textContent =
      "Configura tu número de WhatsApp en CONTACT.phone dentro de script.js.";
    return;
  }

  const url = `https://wa.me/${CONTACT.phone}?text=${encodeURIComponent(buildMessage(data))}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

// Correo: envío directo desde la web mediante Formspree.
// No depende de Gmail, Outlook ni de una app de correo instalada.
emailButton.addEventListener("click", async () => {
  const data = getFormData();

  if (!validateForm(data)) return;

  if (!/^https:\/\/formspree\.io\/f\/[A-Za-z0-9_-]+$/.test(FORMSPREE_ENDPOINT)) {
    statusMessage.textContent =
      "El formulario de correo todavía no está configurado correctamente.";
    return;
  }

  const originalText = emailButton.textContent;
  emailButton.disabled = true;
  emailButton.textContent = "Enviando...";
  statusMessage.textContent = "Enviando la consulta...";

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        service: data.service,
        message: data.message,
        _gotcha: data.gotcha,
        subject: `Consulta web: ${data.service}`
      })
    });

    if (!response.ok) {
      throw new Error("No se pudo enviar el formulario.");
    }

    statusMessage.textContent =
      "Consulta enviada correctamente. Te responderé al correo indicado.";
    form.reset();
  } catch (error) {
    console.error(error);
    statusMessage.textContent =
      "No se pudo enviar el correo. Puedes intentarlo de nuevo o usar WhatsApp.";
  } finally {
    emailButton.disabled = false;
    emailButton.textContent = originalText;
  }
});
