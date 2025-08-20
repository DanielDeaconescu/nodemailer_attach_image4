// Toast controller - a function that can display the toast with a given message and an error/success color

const showToast = (message, isError = false) => {
  const toast = document.getElementById("toast");
  toast.className = isError ? "toast-error" : "toast-success";
  toast.textContent = message;
  toast.classList.add("toast-visible");

  setTimeout(() => {
    toast.classList.remove("toast-visible");
  }, 3000);
};

// A function that takes the form and validates the inputs

const validateForm = (form) => {
  const errors = [];
  const fields = [
    { name: "name", label: "Full Name" },
    { name: "email", label: "Email" },
    { name: "message", label: "Message" },
  ];

  // If a field is missing, throw an appropriate error
  fields.forEach((field) => {
    if (!form.elements[field.name]) {
      errors.push(`${field.label} is required`);
    }
  });

  // Basic email validation
  const email = form.elements.email.value;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Please provide a valid email!");
  }

  // File format validation
  const attachment = form.elements.attachment;
  if (attachment && attachment.files > 0) {
    const allowedTypes = ["image/jpeg", "image/png"];
    const files = Array.from(attachment.files);

    files.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(
          `Invalid file type: ${file.name}. Only JPG and PNG files allowed!`
        );
      }
    });
  }

  return errors;
};

// Form submission
const form = document.getElementById("formAttachImage");

// Spinner controller
const showSpinner = (show) => {
  const spinner = document.querySelector(".spinner-border");
  if (show) {
    spinner.classList.remove("d-none");
  } else {
    spinner.classList.add("d-none");
  }
};

// Make sure to display the name of the uploaded image
const attachImageLabel = document.querySelector(".attach-image-label");

attachImageLabel.addEventListener("change", function () {
  const attachImageName = document.querySelector(".attach-image-name");
  const attachment = form.elements.attachment;
  if (attachment.files.length > 0) {
    attachImageName.textContent = attachment.files[0].name;
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  showSpinner(true);
  const formData = new FormData(form);

  // Verify that the Turnstile Token exists
  const turnstileToken = document.querySelector(
    'input[name="cf-turnstile-response"]'
  )?.value;

  if (!turnstileToken) {
    showToast("Please complete the CAPTCHA verification!", true);
    showSpinner(false);
    return;
  }

  // Validate
  const errors = validateForm(form);
  if (errors.length > 0) {
    showToast(errors.join(", "), true);
    showSpinner(false);
    return;
  }

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Request failed");
    }

    showToast("Message sent successfully!");
    form.reset();
    showSpinner(false);
    setTimeout(() => {
      window.location.href = "thank-you.html";
    }, 1500);
  } catch (error) {
    showToast(error.message || "Failed to send email", true);
    showSpinner(false);
  }
});
