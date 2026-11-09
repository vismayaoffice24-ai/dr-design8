/**
 * Dr. Anil Kumar – Nephrology Clinic (Main JavaScript)
 * Handles mobile navigation, scroll animations, counters, and WhatsApp appointment booking.
 */

(function () {
  "use strict";

  var CLINIC_PHONE = "+91 97458 66333";
  var CLINIC_WA_NUMBER = "919745866333";

  // Initialize UI controls when DOM is ready
  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initScrollAnimations();
    initCounters();
    initAppointmentForms();
    highlightCurrentNav();
  });

  // Mobile Navigation
  function initMobileNav() {
    var mb = document.getElementById("mb");
    var links = document.getElementById("links");

    if (mb && links) {
      mb.addEventListener("click", function (e) {
        e.stopPropagation();
        var isOpen = links.classList.toggle("open");
        mb.setAttribute("aria-expanded", isOpen ? "true" : "false");
        mb.textContent = isOpen ? "✕" : "☰";
      });

      // Close when clicking outside
      document.addEventListener("click", function (e) {
        if (!links.contains(e.target) && !mb.contains(e.target) && links.classList.contains("open")) {
          links.classList.remove("open");
          mb.setAttribute("aria-expanded", "false");
          mb.textContent = "☰";
        }
      });

      // Close on escape key
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && links.classList.contains("open")) {
          links.classList.remove("open");
          mb.setAttribute("aria-expanded", "false");
          mb.textContent = "☰";
        }
      });
    }
  }

  // Highlight Current Nav Item
  function highlightCurrentNav() {
    var currentPath = window.location.pathname.split("/").pop() || "index.html";
    if (currentPath === "") currentPath = "index.html";

    var navLinks = document.querySelectorAll(".links a");
    navLinks.forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href) return;
      var linkPath = href.split("/").pop().split("#")[0];
      
      // Match index.html or service sub-pages to services nav
      if (linkPath === currentPath) {
        link.classList.add("active");
      } else if (currentPath.indexOf("service-") === 0 && (linkPath === "services.html" || link.getAttribute("data-page") === "services")) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  // Scroll Reveal Animations
  function initScrollAnimations() {
    var revealElements = document.querySelectorAll(
      ".card, section h2, .sub, .urgent, details, ul.tick li, .hero-actions, .stats"
    );

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
      );

      revealElements.forEach(function (el, index) {
        el.classList.add("reveal");
        el.style.transitionDelay = ((index % 5) * 60) + "ms";
        observer.observe(el);
      });
    } else {
      revealElements.forEach(function (el) {
        el.classList.add("in");
      });
    }
  }

  // Counter Number Up
  function initCounters() {
    var statNumbers = document.querySelectorAll(".stats b");
    if (!statNumbers.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    statNumbers.forEach(function (num) {
      observer.observe(num);
    });

    function runCounter(b) {
      var match = b.textContent.match(/^([\d,.]+)(.*)$/);
      if (!match) return;
      var end = parseFloat(match[1].replace(/,/g, ""));
      var dec = match[1].indexOf(".") > -1 ? 1 : 0;
      var comma = match[1].indexOf(",") > -1;
      var suffix = match[2];
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / 1600, 1);
        var easeOut = 1 - Math.pow(1 - progress, 3);
        var current = (end * easeOut).toFixed(dec);
        b.textContent = (comma ? Number(current).toLocaleString("en-IN") : current) + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }
      requestAnimationFrame(step);
    }
  }

  // WhatsApp Appointment Booking Logic
  function initAppointmentForms() {
    var form = document.getElementById("appointment-form");
    var waBtn = document.getElementById("wa-submit");
    var previewBox = document.getElementById("wa-preview-text");

    // Support query parameter ?service=ckd, stones, diabetic-kidney, proteinuria, etc.
    var urlParams = new URLSearchParams(window.location.search);
    var preselectedService = urlParams.get("service");
    var serviceSelect = document.getElementById("appt-concern");
    if (serviceSelect && preselectedService) {
      var query = preselectedService.toLowerCase().replace(/[^a-z0-9]/g, "");
      var serviceMap = {
        ckd: "Chronic Kidney Disease",
        dialysis: "Dialysis Planning",
        stone: "Kidney Stones",
        stones: "Kidney Stones",
        kidneystone: "Kidney Stones",
        kidneystones: "Kidney Stones",
        hypertension: "Hypertension",
        bp: "Hypertension",
        diabetic: "Diabetic Kidney Disease",
        diabetickidney: "Diabetic Kidney Disease",
        transplant: "Kidney Transplant",
        protein: "Protein or Blood",
        proteinuria: "Protein or Blood",
        hematuria: "Protein or Blood"
      };

      var targetKeyword = serviceMap[query] || query;
      for (var i = 0; i < serviceSelect.options.length; i++) {
        var optVal = serviceSelect.options[i].value;
        if (optVal.toLowerCase().indexOf(targetKeyword.toLowerCase()) > -1) {
          serviceSelect.selectedIndex = i;
          break;
        }
      }
    }

    function buildWhatsAppText() {
      var name = (document.getElementById("appt-name") ? document.getElementById("appt-name").value.trim() : "") || "Not specified";
      var phone = (document.getElementById("appt-phone") ? document.getElementById("appt-phone").value.trim() : "") || "Not specified";
      var concern = (document.getElementById("appt-concern") ? document.getElementById("appt-concern").value : "") || "General Kidney Consultation";
      var date = (document.getElementById("appt-date") ? document.getElementById("appt-date").value : "") || "Earliest available";
      var time = (document.getElementById("appt-time") ? document.getElementById("appt-time").value : "") || "Any suitable slot";
      var notes = (document.getElementById("appt-notes") ? document.getElementById("appt-notes").value.trim() : "") || "None";

      var text = "🏥 *Appointment Request – Anil Kumar Kidney Clinic*\n\n"
        + "👤 *Patient Name:* " + name + "\n"
        + "📞 *Contact Phone:* " + phone + "\n"
        + "🩺 *Primary Concern:* " + concern + "\n"
        + "📅 *Preferred Date:* " + date + "\n"
        + "⏰ *Preferred Time:* " + time + "\n"
        + "📝 *Symptoms / Medical Notes:* " + notes + "\n\n"
        + "_Request submitted via clinic website for Dr. Anil Kumar, Edappally, Kochi._";

      return text;
    }

    function updatePreview() {
      if (previewBox) {
        var nameInput = document.getElementById("appt-name");
        if (nameInput && nameInput.value.trim()) {
          previewBox.textContent = buildWhatsAppText();
        } else {
          previewBox.textContent = "Fill in your details above to preview your WhatsApp booking message.";
        }
      }
    }

    if (form) {
      form.addEventListener("input", updatePreview);
      form.addEventListener("change", updatePreview);
      updatePreview();
    }

    if (waBtn) {
      waBtn.addEventListener("click", function (e) {
        var nameInput = document.getElementById("appt-name");
        var phoneInput = document.getElementById("appt-phone");

        if (nameInput && !nameInput.value.trim()) {
          alert("Please enter the patient's full name.");
          nameInput.focus();
          e.preventDefault();
          return;
        }

        var text = buildWhatsAppText();
        var waUrl = "https://wa.me/" + CLINIC_WA_NUMBER + "?text=" + encodeURIComponent(text);
        waBtn.setAttribute("href", waUrl);
      });
    }

    // Set minimum date for appointment to today
    var dateInput = document.getElementById("appt-date");
    if (dateInput) {
      var today = new Date().toISOString().split("T")[0];
      dateInput.setAttribute("min", today);
    }
  }
})();
