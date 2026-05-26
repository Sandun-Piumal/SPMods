/* ===== SITE CONFIG — edit here, changes apply to ALL pages ===== */
const SITE = {
  version:   "v9.65",
  downloads: "100K+",
  fileSize:  "67 MB",
  rating:    "4.9",
  minAndroid:"Android 5.0+",
  apkLink:   "YOUR_APK_LINK_HERE",
  telegram:  "https://t.me/SPModsSandun",
  tgHandle:  "@SPModsSandun",
  year:      "2025",
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
