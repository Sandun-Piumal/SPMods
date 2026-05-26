/* ===== SITE CONFIG — edit here, changes apply to ALL pages ===== */
const SITE = {
  version:   "v61.3",
  downloads: "100K+",
  fileSize:  "110 MB",
  rating:    "4.9",
  minAndroid:"Android 5.0+",
  apkLink:   "https://www.mediafire.com/file/lqkm1vwqopsc4h4/SPWA_V61.3_By_SPMods.apk/file",
  telegram:  "https://t.me/SPModsSandun",
  tgHandle:  "@SPModsSandun",
  year:      "2026",
};

document.addEventListener("DOMContentLoaded", () => {
  // Fill all data-cfg elements
  document.querySelectorAll("[data-cfg]").forEach(el => {
    const key = el.getAttribute("data-cfg");
    if (SITE[key] !== undefined) el.textContent = SITE[key];
  });

  // Update APK href links
  document.querySelectorAll("[data-cfg-href='apkLink']").forEach(el => {
    el.href = SITE.apkLink;
  });

  // Update <title> tag — append version to whatever base title is set
  const base = document.title;
  document.title = base + " " + SITE.version;
});
