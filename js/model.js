/* =====================================================================
   MODEL — the data and state of the app. Never touches the DOM.
   Edit your content here: featured projects, skills, image overrides.
   ===================================================================== */

const Model = {

  githubUser: "harismanciripto111",

  // Where the contact form delivers (via formsubmit.co relay)
  contactEmail: "harismanciripto111@gmail.com",

  // App state (read/written by the Controller, displayed by the View)
  state: {
    screen: "home",        // which screen is showing
    menuIndex: 0,          // selected item on the home menu
    reposLoaded: false,
    skillsBuilt: false,
  },

  // ---- Featured projects (hand-written, shown above the GitHub feed) ----
  featured: [
    {
      title: "MY GITHUB",
      tag: "Web3 · Automation", color: "#ff4d5a", live: true,
      url: "https://github.com/harismanciripto111", cta: "Open GitHub →",
      img: "assets/projects/github.png",
      desc: "Repos, experiments and open-source work: Web3 infrastructure, automation and security research.",
    },
  ],

  // Repos already shown in "featured" get hidden from the GitHub feed
  featuredRepoNames: [],

  // Shown if the GitHub API can't be reached
  fallbackRepos: [],

  // Optional thumbnail overrides: repo name → image path.
  // Anything not listed is looked up at assets/projects/<RepoName>.png
  projectImages: {
    // "DownloadGuard": "assets/projects/downloadguard.png",
  },

  langColors: {
    JavaScript: "#5c5af1", TypeScript: "#3178c6", Python: "#3572A5",
    PHP: "#4F5D95", CSS: "#663399", HTML: "#e34c26",
    "Jupyter Notebook": "#DA5B0B", MATLAB: "#e16737", Java: "#b07219", C: "#555", "C++": "#f34b7d",
  },

  // ---- Skills screen ----
  skills: [
    { group: "AI · ML", items: [
      ["Python · Java · C++", 50], ["Chat GPT", 88],
      ["Gemini", 86], ["Meshy AI", 85],
      ["NLP & Transformers", 82], ["MediaPipe", 86],
    ]},
    { group: "Cloud & Engineering", items: [
      ["Git & GitHub", 88], ["Azure", 74],
      ["Multisim", 76], ["LT Spice", 80],
      ["Raspberry", 90], ["Bash · PowerShell", 67],
      ["Proteus · Blender", 60],
    ]},
    { group: "Spoken Languages", items: [
      ["English · Assamese · Hindi", 100], ["Japanese (JLPT N4)", 62], ["Russian", 30],
    ]},
  ],

  // ---- Data fetching ----
  async fetchRepos() {
    const skip = new Set(this.featuredRepoNames);
    try {
      const res = await fetch(
        `https://api.github.com/users/${this.githubUser}/repos?per_page=100&sort=updated`
      );
      if (!res.ok) throw new Error(res.status);
      const repos = (await res.json()).filter(r => !r.fork && !skip.has(r.name));
      return { repos, live: true };
    } catch {
      return { repos: this.fallbackRepos.filter(r => !skip.has(r.name)), live: false };
    }
  },
};
