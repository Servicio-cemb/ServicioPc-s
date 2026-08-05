const CONTACT = {
  phone: "625993218",
  email: "carlose.moreno594@gmail.com"
};

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
    service: document.getElementById("service").value,
    message: document.getElementById("message").value.trim()
  };
}

function validateForm(data) {
  if (!data.name || !data.service || !data.message) {
    statusMessage.textContent = "Completa todos los campos antes de enviar.";
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
    `Necesito información sobre: ${data.service}.`,
    "",
    "Problema o consulta:",
    data.message
  ].join("\n");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = getFormData();

  if (!validateForm(data)) return;

  if (!CONTACT.phone) {
    statusMessage.textContent = "Añade tu teléfono de WhatsApp en la constante CONTACT del archivo script.js.";
    return;
  }

  const url = `https://wa.me/${CONTACT.phone}?text=${encodeURIComponent(buildMessage(data))}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

emailButton.addEventListener("click", () => {
  const data = getFormData();

  if (!validateForm(data)) return;

  if (!CONTACT.email) {
    statusMessage.textContent = "Añade tu correo electrónico en la constante CONTACT del archivo script.js.";
    return;
  }

  const subject = encodeURIComponent(`Consulta: ${data.service}`);
  const body = encodeURIComponent(buildMessage(data));
  const recipient = encodeURIComponent(CONTACT.email);

  // Abrimos directamente el redactor web de Gmail. Esto evita depender de
  // que el visitante tenga una aplicación de correo configurada en Windows.
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}&body=${body}`;
  const emailWindow = window.open(gmailUrl, "_blank", "noopener,noreferrer");

  if (!emailWindow) {
    statusMessage.textContent = "El navegador ha bloqueado la ventana. Permite las ventanas emergentes e inténtalo de nuevo.";
  }
});
