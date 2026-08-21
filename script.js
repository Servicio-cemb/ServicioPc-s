const CONTACT = {
  phone: "34625993218"
};

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mdenjooa";

const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");

    menuButton.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    document.body.classList.toggle(
      "menu-open",
      isOpen
    );
  });

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");

      menuButton.setAttribute(
        "aria-expanded",
        "false"
      );

      document.body.classList.remove("menu-open");
    });
  });
}


const revealElements =
  document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {

      entries.forEach((entry) => {

        if (entry.isIntersecting) {

          entry.target.classList.add("visible");

          currentObserver.unobserve(
            entry.target
          );

        }

      });

    },
    {
      threshold: 0.12
    }
  );

  revealElements.forEach((element) => {
    observer.observe(element);
  });

} else {

  revealElements.forEach((element) => {
    element.classList.add("visible");
  });

}


const yearElement =
  document.getElementById("current-year");

if (yearElement) {
  yearElement.textContent =
    new Date().getFullYear();
}


const form =
  document.getElementById("contact-form");

const whatsappButton =
  document.getElementById("whatsapp-button");

const emailButton =
  document.getElementById("email-button");

const statusMessage =
  document.getElementById("form-status");



function getFormData() {

  const nameElement =
    document.getElementById("name");

  const emailElement =
    document.getElementById("email");

  const serviceElement =
    document.getElementById("service");

  const messageElement =
    document.getElementById("message");

  const gotchaElement =
    document.getElementById("_gotcha");

  return {

    name:
      nameElement
        ? nameElement.value.trim()
        : "",

    email:
      emailElement
        ? emailElement.value.trim()
        : "",

    service:
      serviceElement
        ? serviceElement.value
        : "",

    message:
      messageElement
        ? messageElement.value.trim()
        : "",

    gotcha:
      gotchaElement
        ? gotchaElement.value.trim()
        : ""

  };
}


function isValidEmail(email) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );

}


function validateCommonFields(data) {

  if (
    !data.name ||
    !data.service ||
    !data.message
  ) {

    statusMessage.textContent =
      "Completa el nombre, el tipo de servicio y la descripción del problema.";

    return false;

  }


  if (data.gotcha) {

    statusMessage.textContent =
      "No se pudo procesar la solicitud.";

    return false;

  }


  if (
    data.name.length < 2 ||
    data.name.length > 80
  ) {

    statusMessage.textContent =
      "Revisa el nombre introducido.";

    return false;

  }


  if (
    data.message.length < 10 ||
    data.message.length > 2000
  ) {

    statusMessage.textContent =
      "La consulta debe tener entre 10 y 2000 caracteres.";

    return false;

  }


  return true;

}


function validateWhatsApp(data) {

  if (!validateCommonFields(data)) {
    return false;
  }

  statusMessage.textContent = "";

  return true;

}


function validateEmail(data) {

  if (!validateCommonFields(data)) {
    return false;
  }


  if (!data.email) {

    statusMessage.textContent =
      "Introduce tu correo electrónico para solicitar contacto por correo.";

    return false;

  }


  if (
    !isValidEmail(data.email) ||
    data.email.length > 254
  ) {

    statusMessage.textContent =
      "Introduce un correo electrónico válido.";

    return false;

  }


  statusMessage.textContent = "";

  return true;

}

function buildWhatsAppMessage(data) {

  const lines = [

    "Hola Carlos,",

    "",

    `Mi nombre es ${data.name}.`,

    `Necesito información sobre: ${data.service}.`

  ];


  if (data.email) {

    lines.push(
      `Mi correo es ${data.email}.`
    );

  }


  lines.push(

    "",

    "Problema o consulta:",

    data.message

  );


  return lines.join("\n");

}



if (whatsappButton) {

  whatsappButton.addEventListener(
    "click",
    () => {

      const data = getFormData();

      if (!validateWhatsApp(data)) {
        return;
      }


      if (!CONTACT.phone) {

        statusMessage.textContent =
          "El contacto por WhatsApp todavía no está configurado.";

        return;

      }


      const cleanPhone =
        CONTACT.phone.replace(/\D/g, "");

      if (!/^\d{8,15}$/.test(cleanPhone)) {

        statusMessage.textContent =
          "El número de WhatsApp configurado no es válido.";

        return;

      }


      const message =
        buildWhatsAppMessage(data);


      const whatsappURL =
        `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;



      window.location.href =
        whatsappURL;

    }
  );

}



if (emailButton) {

  emailButton.addEventListener(
    "click",
    async () => {

      const data = getFormData();


      if (!validateEmail(data)) {
        return;
      }


      if (
        !/^https:\/\/formspree\.io\/f\/[A-Za-z0-9_-]+$/
          .test(FORMSPREE_ENDPOINT)
      ) {

        statusMessage.textContent =
          "El formulario de correo todavía no está configurado correctamente.";

        return;

      }


      const originalText =
        emailButton.textContent;


      emailButton.disabled = true;

      emailButton.textContent =
        "Enviando...";

      statusMessage.textContent =
        "Enviando la consulta...";


      try {

        const response = await fetch(
          FORMSPREE_ENDPOINT,
          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

              "Accept":
                "application/json"

            },

            body: JSON.stringify({

              name:
                data.name,

              email:
                data.email,

              service:
                data.service,

              message:
                data.message,

              _gotcha:
                data.gotcha,

              subject:
                `Consulta web: ${data.service}`

            })

          }
        );


        if (!response.ok) {

          throw new Error(
            "No se pudo enviar el formulario."
          );

        }


        statusMessage.textContent =
          "Consulta enviada correctamente. Te responderé al correo indicado.";

        if (form) {
          form.reset();
        }


      } catch (error) {

        console.error(
          "Error enviando formulario:",
          error
        );


        statusMessage.textContent =
          "No se pudo enviar el correo. Puedes intentarlo de nuevo o usar WhatsApp.";


      } finally {


        emailButton.disabled = false;

        emailButton.textContent =
          originalText;

      }

    }
  );

}
