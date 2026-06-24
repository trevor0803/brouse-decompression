/* ============================================================
   Brouse Chiropractic — Landing page interactions
   - Mobile nav toggle
   - Lead form: inline validation + success state
   - Meta Pixel "Lead" event on successful submit
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Close the menu when a nav link is tapped
    document.querySelectorAll("#mainNav a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Lead form validation ---------- */
  var form = document.getElementById("leadForm");
  if (!form) return;

  var successEl = document.getElementById("formSuccess");
  var submitBtn = document.getElementById("submitBtn");

  var validators = {
    name: function (v) {
      if (!v.trim()) return "Please enter your name.";
      if (v.trim().length < 2) return "That name looks too short.";
      return "";
    },
    email: function (v) {
      if (!v.trim()) return "Please enter your email.";
      // Simple, permissive email check
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return "Please enter a valid email address.";
      return "";
    },
    phone: function (v) {
      var digits = v.replace(/\D/g, "");
      if (!digits) return "Please enter your phone number.";
      if (digits.length < 10) return "Please enter a 10-digit phone number.";
      return "";
    },
    besttime: function (v) {
      if (!v) return "Please choose a time.";
      return "";
    },
    consent: function (v, el) {
      if (!el.checked) return "Please check this box so we can contact you.";
      return "";
    }
  };

  function fieldWrap(el) {
    return el.closest(".field");
  }

  function setError(name, message) {
    var input = form.elements[name];
    var wrap = fieldWrap(input);
    var errSpan = form.querySelector('[data-error="' + name + '"]');
    if (message) {
      if (wrap) wrap.classList.add("invalid");
      if (errSpan) errSpan.textContent = message;
    } else {
      if (wrap) wrap.classList.remove("invalid");
      if (errSpan) errSpan.textContent = "";
    }
    return !message;
  }

  function validateField(name) {
    var input = form.elements[name];
    if (!input) return true;
    var val = input.type === "checkbox" ? input.checked : input.value;
    var msg = validators[name](typeof val === "string" ? val : "", input);
    return setError(name, msg);
  }

  // Live re-validation once a field has been touched/errored
  Object.keys(validators).forEach(function (name) {
    var input = form.elements[name];
    if (!input) return;
    var evt = input.type === "checkbox" || input.tagName === "SELECT" ? "change" : "input";
    input.addEventListener(evt, function () {
      if (fieldWrap(input) && fieldWrap(input).classList.contains("invalid")) {
        validateField(name);
      }
    });
    input.addEventListener("blur", function () {
      validateField(name);
    });
  });

  /* ---------- Phone auto-format (US) ---------- */
  var phoneInput = form.elements["phone"];
  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      var d = phoneInput.value.replace(/\D/g, "").slice(0, 10);
      var out = d;
      if (d.length > 6) out = "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
      else if (d.length > 3) out = "(" + d.slice(0, 3) + ") " + d.slice(3);
      else if (d.length > 0) out = "(" + d;
      phoneInput.value = out;
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var allValid = true;
    Object.keys(validators).forEach(function (name) {
      if (!validateField(name)) allValid = false;
    });

    if (!allValid) {
      // Focus the first invalid field
      var firstInvalid = form.querySelector(".field.invalid input, .field.invalid select");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // ----- Simulate submission (demo: no backend) -----
    var originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    var payload = {
      name: form.elements["name"].value.trim(),
      email: form.elements["email"].value.trim(),
      phone: form.elements["phone"].value.trim(),
      besttime: form.elements["besttime"].value,
      consent: form.elements["consent"].checked
    };

    // Placeholder for a real endpoint, e.g.:
    //   fetch("/api/lead", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) })
    // For this demo we just resolve after a short delay.
    setTimeout(function () {
      // ----- Meta Pixel: Lead event -----
      if (typeof window.fbq === "function") {
        window.fbq("track", "Lead", {
          content_name: "$49 New Patient Exam",
          content_category: "Spinal Decompression",
          value: 49.00,
          currency: "USD"
        });
      }

      // ----- Success state -----
      var nameSpan = document.getElementById("successName");
      if (nameSpan && payload.name) nameSpan.textContent = payload.name.split(" ")[0];

      form.hidden = true;
      if (successEl) {
        successEl.hidden = false;
        successEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;

      // Expose the captured lead for debugging / demo
      console.log("[Brouse demo] Lead captured:", payload);
    }, 700);
  });
})();
