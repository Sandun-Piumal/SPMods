/* ===== SITE CONFIG — edit here, changes apply to ALL pages ===== */

const SITE = {
  /* ── SP WhatsApp ── */
  wa: {
    version:    "v62.0",
    downloads:  "100K+",
    fileSize:   "110 MB",
    rating:     "4.9",
    minAndroid: "Android 5.0+",
    apkLink:    "https://www.mediafire.com/file/4ap3yuteszznpru/SPWA_V62.0_By_SPMods.apk/file",
  },

  /* ── YouTube Pro ── */
  yt: {
    version:    "v4.0.0",
    downloads:  "50K+",
    fileSize:   "5 MB",
    rating:     "4.8",
    minAndroid: "Android 5.0+",
    apkLink:    "https://www.mediafire.com/file/q2dr8a6ahj3qxsd/YTPro_V4.0_By_SPMods.apk/file",
  },

  /* ── SPGram Messenger ── */
  sgm: {
    version:    "v0.1.0 Beta",
    downloads:  "10K+",
    fileSize:   "77 MB",
    rating:     "4.8",
    minAndroid: "Android 5.0+",
    apkLink:    "https://t.me/SPModsSandun",
  },


  /* ── Shared ── */
  telegram:  "https://t.me/SPModsSandun",
  tgHandle:  "@SPModsSandun",
  year:      "2026",
};

document.addEventListener("DOMContentLoaded", () => {
  // Detect which app this page is for via <html data-app="wa|yt">
  const app = document.documentElement.getAttribute("data-app") || "wa";
  const cfg = { ...SITE[app], telegram: SITE.telegram, tgHandle: SITE.tgHandle, year: SITE.year };

  // Fill all data-cfg elements
  document.querySelectorAll("[data-cfg]").forEach(el => {
    const key = el.getAttribute("data-cfg");
    if (cfg[key] !== undefined) el.textContent = cfg[key];
  });

  // Update APK href links
  document.querySelectorAll("[data-cfg-href='apkLink']").forEach(el => {
    el.href = cfg.apkLink;
  });

  // Update <title> tag
  const base = document.title;
  document.title = base + " " + cfg.version;
});
