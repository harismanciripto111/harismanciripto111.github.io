/* =====================================================================
   CONTROLLER — listens to the user, updates the Model, tells the View.
   ===================================================================== */

const Controller = {

  transitioning: false,
  audioUnlocked: false,

  init() {
  View.init();
  this.bindMenu();
  this.bindKeyboard();
  this.bindAudioUnlock();
  this.bindAudioButton();
  this.bindContactForm();
},

  /* ---------- Contact form (relayed via formsubmit.co, mailto fallback) ---------- */
  bindContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;
    const status = document.getElementById("form-status");
    const btn = form.querySelector(".form-send");

    form.addEventListener("submit", async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if (data._honey) return;  // honeypot caught a bot
      if (!data.name.trim() || !data.email.trim() || !data.message.trim()) {
        status.textContent = "Fill in all three fields first.";
        return;
      }
      btn.disabled = true;
      status.textContent = "Sending…";
      try {
        const res = await fetch(`https://formsubmit.co/ajax/${Model.contactEmail}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            message: data.message,
            _subject: `Portfolio message from ${data.name}`,
          }),
        });
        if (!res.ok) throw new Error(res.status);
        status.textContent = "Sent! I'll get back to you soon.";
        form.reset();
        this.play();
      } catch {
        // relay unreachable: open the visitor's own mail app instead
        status.textContent = "Couldn't reach the relay, opening your email app instead…";
        const subject = encodeURIComponent(`Portfolio message from ${data.name}`);
        const body = encodeURIComponent(`${data.message}\n\nReply to: ${data.email}`);
        location.href = `mailto:${Model.contactEmail}?subject=${subject}&body=${body}`;
      } finally {
        btn.disabled = false;
      }
    });
  },

  /* ---------- Navigation ---------- */
goTo(screen) { 
  if (this.transitioning || screen === Model.state.screen) return; 
  this.transitioning = true; 
  this.play(); 

  View.wipe( 
      () => {                       // mid-wipe: swap screens while covered
        Model.state.screen = screen;
        View.showScreen(screen);
        if (screen === "projects") this.loadProjects();
      },
      () => { this.transitioning = false; }
    );
  },

  select(index) {
    const n = View.els.menuItems.length;
    const next = (index + n) % n;
    if (next !== Model.state.menuIndex) this.play();
    Model.state.menuIndex = next;
    View.setMenuSelection(next);
  },

  /* ---------- Screen data loading ---------- */
  async loadProjects() {
    View.renderFeatured(Model.featured);
    if (Model.state.reposLoaded) return;
    const { repos, live } = await Model.fetchRepos();
    const status = live
      ? `${repos.length} repositories · live from GitHub`
      : "Live repository list unavailable here · open my GitHub profile above";
    View.renderRepos(repos, status, Model);
    Model.state.reposLoaded = true;
  },

  /* ---------- Sound (browsers block audio until first user gesture) ---------- */
  play() {
    if (this.audioUnlocked) View.playSelect();
  },

  musicOn: false,

  setMusic(on) {
    const bgm = document.getElementById("bgm");
    const button = document.getElementById("audio-toggle");
    if (!bgm) return;
    const show = (state) => {
      this.musicOn = state;
      if (button) {
        button.textContent = state ? "🔊" : "🔇";
        button.setAttribute("aria-label", state ? "Mute music" : "Play music");
      }
    };
    if (on) {
      bgm.volume = 0.5;
      bgm.play().then(() => show(true)).catch(() => show(false));
    } else {
      bgm.pause();
      show(false);
    }
  },

  // Browsers block sound until a gesture: the first click/key starts the music
  // (unless that click is on the speaker button, which handles itself).
  bindAudioUnlock() {
    const gate = document.getElementById("enter-gate");
    const bgm = document.getElementById("bgm");
    const hideGate = () => {
      if (!gate) return;
      gate.classList.add("gone");
      setTimeout(() => gate.remove(), 700);
    };
    // 1) try to start the music immediately; works when the browser allows autoplay
    if (bgm) {
      bgm.volume = 0.5;
      bgm.play().then(() => { this.setMusic(true); hideGate(); }).catch(() => {});
    }
    if (!gate) return;
    // 2) otherwise the first click / tap / key anywhere starts it
    const enter = (e) => {
      removeEventListener("pointerdown", enter, true);
      removeEventListener("keydown", enter, true);
      this.audioUnlocked = true;
      if (e.target.closest && e.target.closest("#audio-toggle")) { hideGate(); return; }
      e.preventDefault(); e.stopPropagation();
      this.setMusic(true);
      hideGate();
    };
    addEventListener("pointerdown", enter, true);
    addEventListener("keydown", enter, true);
  },

  bindAudioButton() {
    const button = document.getElementById("audio-toggle");
    if (!button) return;
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      this.setMusic(!this.musicOn);
    });
  },

  /* ---------- Input bindings ---------- */
  bindMenu() {
    View.els.menuItems.forEach((item, i) => {
      item.addEventListener("mouseenter", () => this.select(i));
      item.addEventListener("click", () => this.goTo(item.dataset.target));
    });

    document.querySelectorAll("[data-back]").forEach(b =>
      b.addEventListener("click", () => this.goTo("home")));

    // Clicking the name always takes you home
    document.getElementById("big-name").addEventListener("click", () => {
      if (Model.state.screen !== "home") this.goTo("home");
      else this.play();
    });
  },

  bindKeyboard() {
    addEventListener("keydown", e => {
      if (Model.state.screen === "home") {
        if (e.key === "ArrowDown") { this.select(Model.state.menuIndex + 1); e.preventDefault(); }
        else if (e.key === "ArrowUp") { this.select(Model.state.menuIndex - 1); e.preventDefault(); }
        else if (e.key === "Enter") {
          this.goTo(View.els.menuItems[Model.state.menuIndex].dataset.target);
        }
      } else if (e.key === "Escape") {
        this.goTo("home");
      }
    });
  },
};

Controller.init();
