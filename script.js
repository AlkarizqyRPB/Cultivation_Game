// ==========================
// Cultivation Tower - Fixed JS
// ==========================

// STATE
let realm = 0;
let currentFloor = 1;
let progress = 0;
let stats = { str: 0, agi: 0, def: 0, luck: 0, charm: 0 };
let isCultivating = false;
let awaitingStat = false; // true setelah breakthrough sampai player menekan Get Stat
let rewardOpened = false;

// DOM
const progressBar = document.querySelector(".progress");
const realmEl = document.getElementById("realm");
const statStr = document.getElementById("stat-str");
const statAgi = document.getElementById("stat-agi");
const statDef = document.getElementById("stat-def");
const statLuck = document.getElementById("stat-luck");
const statCharm = document.getElementById("stat-charm");
const dialogText = document.getElementById("dialog-text");
const floorListItems = document.querySelectorAll(".floor-list .floor");
const floorDialogText = document.getElementById("floor-dialog-text");
const eventText = document.querySelector(".event-text");
const rewardChest = document.querySelector(".reward");
const chestImage = document.querySelector(".chest");
const openRewardBtn = document.getElementById("open-reward-btn");

const cultivateBtn = document.getElementById("cultivate-btn");
const breakthroughBtn = document.getElementById("breakthrough-btn");
const getStatBtn = document.getElementById("get-stat-btn");
const resetBtn = document.getElementById("reset-btn");
const checkFloorBtn = document.querySelector(".check-btn");

// Save key
const SAVE_KEY = "cultivateGameSave";

// ====== Utility ======
function updateUI() {
  realmEl.textContent = realm;
  progressBar.style.width = `${progress}%`;
  statStr.textContent = stats.str;
  statAgi.textContent = stats.agi;
  statDef.textContent = stats.def;
  statLuck.textContent = stats.luck;
  statCharm.textContent = stats.charm;

  // Tombol state
  breakthroughBtn.disabled = progress < 100;
  // Get stat aktif jika ada awaitingStat = true
  getStatBtn.disabled = !awaitingStat;
  // Visual glow (class) pada breakthrough jika ready
  if (progress >= 100) {
    breakthroughBtn.classList.add("glow");
  } else {
    breakthroughBtn.classList.remove("glow");
  }
  // Visual for getStat
  if (awaitingStat) getStatBtn.classList.add("glow");
  else getStatBtn.classList.remove("glow");
}

function updateRewardChestUI() {
  // Tampilkan reward hanya di Floor 5
  if (currentFloor === 5) {
    rewardChest.style.display = "block";
    chestImage.style.backgroundImage = rewardOpened
      ? 'url("kosong.png")'
      : 'url("belumDibuka.png")';
    openRewardBtn.disabled = rewardOpened;
  } else {
    rewardChest.style.display = "none";
  }
}

openRewardBtn.addEventListener("click", () => {
  if (rewardOpened || currentFloor !== 5) return;

  rewardOpened = true;
  chestImage.style.backgroundImage = 'url("kosong.png")';
  openRewardBtn.disabled = true;

  dialogText.textContent =
    "Kamu telah membuka peti misterius. Isinya… kosong? Atau mungkin hadiah sejati adalah perjalananmu ke sini.";
  saveGame();
});

function saveGame() {
  const data = {
    realm,
    currentFloor,
    progress,
    stats,
    awaitingStat,
    rewardOpened,
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Save error:", e);
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    realm = d.realm ?? 0;
    currentFloor = d.currentFloor ?? 1;
    progress = d.progress ?? 0;
    stats = d.stats ?? stats;
    awaitingStat = d.awaitingStat ?? false;
    rewardOpened = d.rewardOpened ?? false;
  } catch (e) {
    console.warn("Load error:", e);
  }
}

// ====== Events ======

// Cultivate: 1x klik -> bar terisi otomatis sampai 100% (smooth)
cultivateBtn.addEventListener("click", () => {
  if (isCultivating || progress >= 100) return;
  isCultivating = true;
  dialogText.textContent = "Meditasi dimulai... Qi mengalir ke dalam tubuh.";

  // isi pelan supaya ada animasi (kamu bisa ubah speed)
  const step = 4; // persen per tick
  const tickMs = 40; // ms per tick
  const interval = setInterval(() => {
    progress += step;
    if (progress >= 100) progress = 100;
    updateUI();

    if (progress >= 100) {
      clearInterval(interval);
      isCultivating = false;
      dialogText.textContent = "Qi penuh! Siap melakukan Breakthrough.";
      // aktifkan breakthrough (updateUI akan menambahkan glow)
      saveGame();
    } else {
      saveGame(); // autosave saat mengisi (opsional)
    }
  }, tickMs);
});

// Breakthrough: jika progress penuh -> realm++ & set awaitingStat
breakthroughBtn.addEventListener("click", () => {
  if (progress < 100) {
    alert("Progress belum penuh. Cultivate dulu!");
    return;
  }

  realm += 1;
  progress = 0;
  awaitingStat = true; // menandakan pemain harus tekan Get Stat
  dialogText.textContent = `Selamat! Kamu mencapai Realm ${realm}. Ambil hadiah statmu (Get Stat).`;

  // tombol
  breakthroughBtn.disabled = true;
  getStatBtn.disabled = false;

  updateUI();
  saveGame();
});

// Get Stat: hitung gain terpisah, tampilkan gain, lalu tambahkan ke total
getStatBtn.addEventListener("click", () => {
  if (!awaitingStat) return;

  // Hitung gain (tampilkan nilai gain, jangan langsung menampilkan total)
  const gain = {
    str: Math.floor(Math.random() * 3) + 1, // 1-3
    agi: Math.floor(Math.random() * 3) + 1, // 1-3
    def: Math.floor(Math.random() * 3) + 1, // 1-3
    luck: Math.floor(Math.random() * 2) + 1, // 1-2
    charm: Math.floor(Math.random() * 2) + 1, // 1-2
  };

  // Tambahkan ke total
  stats.str += gain.str;
  stats.agi += gain.agi;
  stats.def += gain.def;
  stats.luck += gain.luck;
  stats.charm += gain.charm;

  // Tampilkan pesan yang JELAS: show gain & total (optional)
  dialogText.textContent = `Kamu menerima: STR +${gain.str}; AGI +${gain.agi}; DEF +${gain.def}; LUCK +${gain.luck}; CHARM +${gain.charm}.`;

  // Hentikan keadaan awaitingStat
  awaitingStat = false;
  getStatBtn.disabled = true;
  getStatBtn.classList.remove("glow");

  updateUI();
  saveGame();
});

// Check Floor: syarat contoh STR > 5 untuk naik dari Floor 1 -> 2
checkFloorBtn.addEventListener("click", () => {
  let message = "";

  if (currentFloor === 1) {
    if (stats.str > 5) {
      currentFloor = 2;
      message = "Kamu berhasil naik ke Floor 2!";
    } else {
      const needed = 6 - stats.str;
      message = `Statmu belum cukup. Kamu butuh STR ${needed} lagi untuk naik ke Floor 2.`;
    }
  } else if (currentFloor === 2) {
    if (stats.agi > 8) {
      currentFloor = 3;
      message = "Kecepatanmu membawamu ke Floor 3!";
    } else {
      const needed = 9 - stats.agi;
      message = `Statmu belum cukup. Kamu butuh AGI ${needed} lagi untuk naik ke Floor 3.`;
    }
  } else if (currentFloor === 3) {
    if (stats.def > 10) {
      currentFloor = 4;
      message = "Pertahananmu membuatmu layak ke Floor 4!";
    } else {
      const needed = 11 - stats.def;
      message = `Statmu belum cukup. Kamu butuh DEF ${needed} lagi untuk naik ke Floor 4.`;
    }
  } else if (currentFloor === 4) {
    if (stats.luck > 12) {
      currentFloor = 5;
      message = "Keberuntunganmu membuka jalan ke Floor 5!";
    } else {
      const needed = 13 - stats.luck;
      message = `Statmu belum cukup. Kamu butuh LUCK ${needed} lagi untuk naik ke Floor 5.`;
    }
  } else {
    message = "Kamu sudah berada di lantai tertinggi untuk sekarang.";
  }

  floorDialogText.textContent = message;
  updateRewardChestUI();
  updateEventText();
  updateFloorUI();
  saveGame();
});

// floor description
const floorDescriptions = {
  1: "Anda berdiri di pintu masuk Lantai 1. Sebuah ruangan yang remang-remang membisikkan janji-janji kekuasaan.",
  2: "Lantai 2 dipenuhi angin yang berbisik. Ujian kecepatan dimulai di sini.",
  3: "Dinding kokoh dan aura tebal menyelimuti Lantai 3. Kekuatan pertahanan diuji.",
  4: "Di Lantai 4, keberuntungan menentukan nasib. Pilihan acak membawa hasil tak terduga.",
  5: "Kamu telah mencapai puncak—Lantai 5. Aura kekuasaan terasa menekan, namun menjanjikan keabadian.",
};

function updateEventText() {
  eventText.textContent =
    floorDescriptions[currentFloor] ||
    "Tempat misterius yang belum dijelajahi...";
}

// floor event
function updateFloorUI() {
  floorListItems.forEach((item, index) => {
    if (index + 1 === currentFloor) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

// Reset Game: hapus save dan reset semua variabel (tanpa reload)
resetBtn.addEventListener("click", () => {
  if (!confirm("Apakah kamu yakin ingin mereset semua progress?")) return;

  realm = 0;
  currentFloor = 1;
  progress = 0;
  stats = { str: 0, agi: 0, def: 0, luck: 0, charm: 0 };
  awaitingStat = false;
  rewardOpened = false;

  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {
    /* ignore */
  }

  dialogText.textContent = "Progress telah direset.";
  floorDialogText.textContent = "Setiap lantai menyimpan tantangan baru...";
  updateRewardChestUI();
  updateEventText();
  updateFloorUI();
  updateUI();
  alert("Semua progress berhasil direset!");
});

// Init: load & render
(function init() {
  loadGame();
  updateUI();
  updateFloorUI();
  updateEventText();
  updateRewardChestUI();
  // set tombol awal
  breakthroughBtn.disabled = progress < 100;
  getStatBtn.disabled = !awaitingStat;
})();
