/* ==========================================================================
   SONU SINGH PORTFOLIO — INTERACTIVE MOTION, 3D WEBGL, CURSOR & ACCESSIBILITY
   Progressive enhancement: all content remains visible even without JS.
   ========================================================================== */

(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ------------------------------------------------------------------------
     1. Scroll Progress Bar & Sticky Header State
     ------------------------------------------------------------------------ */
  const header = document.querySelector(".site-header");
  const progressBar = document.querySelector(".scroll-progress__bar");

  let scrollTicking = false;
  const updateScrollUI = () => {
    const scrollY = window.scrollY;
    if (header) {
      header.classList.toggle("is-scrolled", scrollY > 24);
    }
    if (progressBar) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0;
      progressBar.style.transform = `scaleX(${ratio})`;
    }
    scrollTicking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollTicking) {
        scrollTicking = true;
        window.requestAnimationFrame(updateScrollUI);
      }
    },
    { passive: true }
  );
  updateScrollUI();

  /* ------------------------------------------------------------------------
     2. Accessible Mobile Navigation Drawer
     ------------------------------------------------------------------------ */
  const navToggle = document.querySelector(".nav-toggle");
  const mobileDrawer = document.querySelector(".mobile-drawer");

  if (navToggle && mobileDrawer) {
    const setDrawer = (open) => {
      navToggle.setAttribute("aria-expanded", String(open));
      mobileDrawer.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };

    navToggle.addEventListener("click", () => {
      const currentlyOpen = navToggle.getAttribute("aria-expanded") === "true";
      setDrawer(!currentlyOpen);
    });

    mobileDrawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setDrawer(false));
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setDrawer(false);
    });
  }

  /* ------------------------------------------------------------------------
     3. Active Section Highlight on Homepage
     ------------------------------------------------------------------------ */
  const anchorNavLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  if (anchorNavLinks.length > 0 && "IntersectionObserver" in window) {
    const sections = anchorNavLinks
      .map((a) => document.querySelector(a.getAttribute("href")))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const activeId = "#" + visible[0].target.id;
          anchorNavLinks.forEach((a) => {
            a.classList.toggle("is-active", a.getAttribute("href") === activeId);
          });
        }
      },
      { rootMargin: "-28% 0px -52% 0px", threshold: [0.15, 0.4] }
    );

    sections.forEach((sec) => observer.observe(sec));
  }

  /* ------------------------------------------------------------------------
     4. Back-to-Top Smooth Button
     ------------------------------------------------------------------------ */
  document.querySelectorAll("[data-back-to-top]").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    });
  });

  /* ------------------------------------------------------------------------
     5. Desktop Pointer Effects (Hero Light, Spotlight Cards, Magnetic CTAs, Custom Cursor)
     ------------------------------------------------------------------------ */
  if (finePointer && !reducedMotion) {
    // Hero ambient light follow
    const hero = document.querySelector(".hero");
    if (hero) {
      hero.addEventListener(
        "mousemove",
        (e) => {
          const rect = hero.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          hero.style.setProperty("--hx", `${x.toFixed(1)}%`);
          hero.style.setProperty("--hy", `${y.toFixed(1)}%`);
        },
        { passive: true }
      );
    }

    // Spotlight cards
    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener(
        "mousemove",
        (e) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
          card.style.setProperty("--my", `${e.clientY - rect.top}px`);
        },
        { passive: true }
      );
    });

    // Subtle magnetic pull on hero / contact CTA buttons
    document.querySelectorAll("[data-magnetic]").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = (e.clientX - rect.left - rect.width / 2) * 0.2;
        const dy = (e.clientY - rect.top - rect.height / 2) * 0.2;
        btn.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate3d(0, 0, 0)";
      });
    });

    // Custom interactive cursor
    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    dot.setAttribute("aria-hidden", "true");

    const ring = document.createElement("div");
    ring.className = "cursor-ring";
    ring.setAttribute("aria-hidden", "true");

    document.body.append(ring, dot);

    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;

    window.addEventListener(
      "mousemove",
      (e) => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
        dot.classList.add("is-visible");
        ring.classList.add("is-visible");

        const target = e.target;
        const isAction = target && target.closest("a, button");
        const isCard = target && target.closest(".card");
        const isInput = target && target.closest("input, textarea");

        ring.classList.toggle("is-hover", Boolean(isAction && !isInput));
        ring.classList.toggle("is-card", Boolean(!isAction && isCard && !isInput));
      },
      { passive: true }
    );

    document.addEventListener("mouseleave", () => {
      dot.classList.remove("is-visible");
      ring.classList.remove("is-visible");
    });

    const animateCursor = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      window.requestAnimationFrame(animateCursor);
    };
    window.requestAnimationFrame(animateCursor);
  }

  /* ------------------------------------------------------------------------
     6. Category Filters (Featured Work & Tools Ecosystem)
     ------------------------------------------------------------------------ */
  document.querySelectorAll("[data-filter-group]").forEach((bar) => {
    const groupName = bar.getAttribute("data-filter-group");
    const buttons = bar.querySelectorAll("[data-filter]");
    const items = document.querySelectorAll(`[data-filter-item="${groupName}"]`);

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const value = btn.getAttribute("data-filter");
        buttons.forEach((b) => {
          const active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-selected", String(active));
        });

        items.forEach((item) => {
          const cat = item.getAttribute("data-category");
          const show = value === "all" || cat === value;
          item.classList.toggle("is-hidden", !show);
        });
      });
    });
  });

  /* ------------------------------------------------------------------------
     7. Accessible FAQ Accordion + Expand/Collapse All
     ------------------------------------------------------------------------ */
  const faqItems = Array.from(document.querySelectorAll(".faq-item"));
  faqItems.forEach((item) => {
    const trigger = item.querySelector(".faq-trigger");
    if (!trigger) return;
    trigger.addEventListener("click", () => {
      const nextOpen = !item.classList.contains("is-open");
      item.classList.toggle("is-open", nextOpen);
      trigger.setAttribute("aria-expanded", String(nextOpen));
    });
  });

  const faqToggleAll = document.querySelector("[data-faq-toggle-all]");
  if (faqToggleAll && faqItems.length > 0) {
    faqToggleAll.addEventListener("click", () => {
      const allOpen = faqItems.every((item) => item.classList.contains("is-open"));
      faqItems.forEach((item) => {
        item.classList.toggle("is-open", !allOpen);
        const btn = item.querySelector(".faq-trigger");
        if (btn) btn.setAttribute("aria-expanded", String(!allOpen));
      });
      faqToggleAll.textContent = allOpen ? "Expand All" : "Collapse All";
    });
  }

  /* ------------------------------------------------------------------------
     8. Copy Email Button
     ------------------------------------------------------------------------ */
  document.querySelectorAll("[data-copy-email]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const email = btn.getAttribute("data-copy-email") || "singh1998sonu@gmail.com";
      try {
        await navigator.clipboard.writeText(email);
        const original = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(() => {
          btn.textContent = original;
        }, 2000);
      } catch {
        window.location.href = `mailto:${email}`;
      }
    });
  });

  /* ------------------------------------------------------------------------
     9. Contact Form Validation, Spam Protection & Real Delivery / Fallback
     Optional Formspree support: set data-endpoint="https://formspree.io/f/YOUR_ID"
     on the <form> element once you create a free Formspree form.
     ------------------------------------------------------------------------ */
  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    const loadedAt = Date.now();
    const feedback = contactForm.querySelector("[data-form-feedback]");

    const showFeedback = (variant, html) => {
      if (!feedback) return;
      feedback.className = `form-feedback is-visible form-feedback--${variant}`;
      feedback.innerHTML = html;
    };

    const setFieldError = (fieldName, message) => {
      const input = contactForm.querySelector(`[name="${fieldName}"]`);
      const errorEl = contactForm.querySelector(`[data-error="${fieldName}"]`);
      if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
      if (errorEl) errorEl.textContent = message || "";
    };

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const subject = String(formData.get("subject") || "").trim();
      const message = String(formData.get("message") || "").trim();
      const honeypot = String(formData.get("company_website") || "").trim();

      if (honeypot.length > 0 || Date.now() - loadedAt < 1200) {
        showFeedback("error", "Submission blocked by spam protection. Please try again.");
        return;
      }

      let valid = true;
      if (name.length < 2) {
        setFieldError("name", "Please enter your name (at least 2 characters).");
        valid = false;
      } else {
        setFieldError("name", "");
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFieldError("email", "Please enter a valid email address.");
        valid = false;
      } else {
        setFieldError("email", "");
      }

      if (subject.length < 3) {
        setFieldError("subject", "Please enter a brief subject (at least 3 characters).");
        valid = false;
      } else {
        setFieldError("subject", "");
      }

      if (message.length < 15) {
        setFieldError("message", "Please share a few details (at least 15 characters).");
        valid = false;
      } else {
        setFieldError("message", "");
      }

      if (!valid) {
        showFeedback("error", "Please review the highlighted fields before submitting.");
        return;
      }

      const endpoint = (contactForm.getAttribute("data-endpoint") || "").trim();
      if (endpoint) {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ name, email, subject, message }),
          });
          if (res.ok) {
            contactForm.reset();
            showFeedback(
              "success",
              "Thank you! Your message has been delivered directly to Sonu Singh."
            );
            return;
          }
        } catch {
          // Fall through cleanly to working mailto fallback
        }
      }

      const mailto = `mailto:singh1998sonu@gmail.com?subject=${encodeURIComponent(
        `[Portfolio] ${subject}`
      )}&body=${encodeURIComponent(
        `Hi Sonu,\n\n${message}\n\nBest regards,\n${name}\n${email}`
      )}`;

      showFeedback(
        "gold",
        `Your inquiry passed validation! Static GitHub Pages hosting requires either a Formspree endpoint (add <code>data-endpoint</code> on the form) or direct email dispatch. Click below to send your pre-filled email right now:<div style="margin-top:14px"><a class="btn btn--primary btn--sm" href="${mailto}">Open Pre-Filled Email to singh1998sonu@gmail.com →</a></div>`
      );
    });
  }

  /* ------------------------------------------------------------------------
     10. GSAP ScrollTrigger Progressive Reveals & Timeline Beam
     ------------------------------------------------------------------------ */
  const initGsapAnimations = () => {
    if (reducedMotion || typeof window.gsap === "undefined") return;
    const gsap = window.gsap;
    if (window.ScrollTrigger) {
      gsap.registerPlugin(window.ScrollTrigger);
    }

    document.querySelectorAll("[data-reveal]").forEach((el) => {
      gsap.from(el, {
        y: 26,
        opacity: 0,
        duration: 0.85,
        ease: "power3.out",
        clearProps: "transform,opacity",
        scrollTrigger: window.ScrollTrigger
          ? { trigger: el, start: "top 88%", once: true }
          : undefined,
      });
    });

    const timeline = document.querySelector(".timeline");
    const timelineFill = document.querySelector(".timeline__fill");
    if (timeline && timelineFill && window.ScrollTrigger) {
      gsap.fromTo(
        timelineFill,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: timeline,
            start: "top 75%",
            end: "bottom 65%",
            scrub: 0.4,
          },
        }
      );
    }
  };

  /* ------------------------------------------------------------------------
     11. Interactive Three.js 3D Marketing Constellation (with SVG Fallback)
     ------------------------------------------------------------------------ */
  const initHeroWebGL = () => {
    const visualWrap = document.querySelector(".hero__visual");
    const canvasHost = document.querySelector(".hero__canvas");
    if (!visualWrap || !canvasHost || reducedMotion) return;
    if (typeof window.THREE === "undefined") return;

    const saveData = navigator.connection && navigator.connection.saveData;
    const lowCores =
      typeof navigator.hardwareConcurrency === "number" &&
      navigator.hardwareConcurrency <= 2;
    if (saveData || lowCores) return;

    const THREE = window.THREE;
    const isCompact = window.innerWidth < 768;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isCompact,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    const width = canvasHost.clientWidth || 440;
    const height = canvasHost.clientHeight || 440;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isCompact ? 1.5 : 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    canvasHost.appendChild(renderer.domElement);
    visualWrap.classList.add("has-webgl");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.z = 5.4;

    const root = new THREE.Group();
    scene.add(root);

    const outerGeo = new THREE.IcosahedronGeometry(1.72, 1);
    const outerEdges = new THREE.EdgesGeometry(outerGeo);
    const outerLattice = new THREE.LineSegments(
      outerEdges,
      new THREE.LineBasicMaterial({ color: 0xd6b77a, transparent: true, opacity: 0.44 })
    );
    root.add(outerLattice);

    const innerGeo = new THREE.OctahedronGeometry(1.06, 1);
    const innerEdges = new THREE.EdgesGeometry(innerGeo);
    const innerLattice = new THREE.LineSegments(
      innerEdges,
      new THREE.LineBasicMaterial({ color: 0x6c8dff, transparent: true, opacity: 0.54 })
    );
    root.add(innerLattice);

    const ringA = new THREE.Mesh(
      new THREE.TorusGeometry(2.14, 0.009, 12, 96),
      new THREE.MeshBasicMaterial({ color: 0xd6b77a, transparent: true, opacity: 0.34 })
    );
    ringA.rotation.x = Math.PI * 0.38;
    ringA.rotation.y = Math.PI * 0.14;
    root.add(ringA);

    const ringB = new THREE.Mesh(
      new THREE.TorusGeometry(1.9, 0.007, 12, 96),
      new THREE.MeshBasicMaterial({ color: 0x6c8dff, transparent: true, opacity: 0.3 })
    );
    ringB.rotation.x = -Math.PI * 0.28;
    ringB.rotation.z = Math.PI * 0.22;
    root.add(ringB);

    // Constellation nodes
    const pos = outerGeo.attributes.position;
    const pts = [];
    const seen = new Set();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const k = `${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)}`;
      if (!seen.has(k)) {
        seen.add(k);
        pts.push(x, y, z);
      }
    }
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    const nodes = new THREE.Points(
      nodeGeo,
      new THREE.PointsMaterial({ color: 0xf6f4ef, size: 0.08, transparent: true, opacity: 0.9 })
    );
    root.add(nodes);

    // Ambient micro-particles
    const pCount = isCompact ? 50 : 100;
    const pArr = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const r = 2.3 + Math.random() * 1.4;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      pArr[i * 3] = r * Math.sin(p) * Math.cos(t);
      pArr[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      pArr[i * 3 + 2] = r * Math.cos(p);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pArr, 3));
    const particles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({ color: 0x6c8dff, size: 0.034, transparent: true, opacity: 0.56 })
    );
    scene.add(particles);

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    if (!isCompact) {
      window.addEventListener(
        "pointermove",
        (e) => {
          target.x = (e.clientX / window.innerWidth - 0.5) * 0.9;
          target.y = (e.clientY / window.innerHeight - 0.5) * 0.9;
        },
        { passive: true }
      );
    }

    let inView = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        (entries) => {
          inView = entries[0] ? entries[0].isIntersecting : true;
        },
        { threshold: 0.05 }
      ).observe(canvasHost);
    }

    window.addEventListener("resize", () => {
      const w = canvasHost.clientWidth || 320;
      const h = canvasHost.clientHeight || 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    const clock = new THREE.Clock();
    const render = () => {
      window.requestAnimationFrame(render);
      if (!inView || document.hidden) return;
      const t = clock.getElapsedTime();
      current.x += (target.x - current.x) * 0.05;
      current.y += (target.y - current.y) * 0.05;

      root.rotation.y = t * 0.16 + current.x * 0.65;
      root.rotation.x = Math.sin(t * 0.25) * 0.14 + current.y * 0.45;
      innerLattice.rotation.y = -t * 0.24;
      innerLattice.rotation.z = t * 0.12;
      ringA.rotation.z = t * 0.1;
      ringB.rotation.y = -t * 0.14;
      particles.rotation.y = -t * 0.04;

      renderer.render(scene, camera);
    };
    render();
  };

  window.addEventListener("load", () => {
    initGsapAnimations();
    initHeroWebGL();
  });
})();
