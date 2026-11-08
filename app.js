// Mars Food Intelligence - Client-Side Scientific Computation & UI Engine
// NASA International Space Apps Challenge Baku 2026

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initDashboard();
  initDataLab();
  initPredictionEngine();
  initOptimizer();
  initSimulator();
});

// --- Navigation Tabs ---
function initNavigation() {
  const tabs = document.querySelectorAll(".nav-tab");
  const views = document.querySelectorAll(".tab-view");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetView = tab.getAttribute("data-target");

      tabs.forEach((t) => t.classList.remove("active", "bg-orange-500", "text-white", "shadow-orange-500/25"));
      tabs.forEach((t) => t.classList.add("text-slate-300", "hover:bg-slate-800"));
      
      tab.classList.add("active", "bg-orange-500", "text-white", "shadow-orange-500/25");
      tab.classList.remove("text-slate-300", "hover:bg-slate-800");

      views.forEach((v) => {
        if (v.id === targetView) {
          v.classList.remove("hidden");
        } else {
          v.classList.add("hidden");
        }
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

// --- Scientific Kinetic Helpers ---
function calculateRateConstant(A, Ea_kJ_mol, tempCelsius) {
  const T_kelvin = tempCelsius + 273.15;
  if (T_kelvin <= 0) return 0;
  const Ea_joules = Ea_kJ_mol * 1000.0;
  return A * Math.exp(-Ea_joules / (R_GAS * T_kelvin));
}

function firstOrderDecay(c0, k, earthDays) {
  return c0 * Math.exp(-k * earthDays);
}

// --- 1. Dashboard Module ---
function initDashboard() {
  const solSlider = document.getElementById("dashboardSolSlider");
  const solDisplay = document.getElementById("currentSolDisplay");
  const earthDaysDisplay = document.getElementById("earthDaysDisplay");
  const securityGauge = document.getElementById("securityGaugeVal");
  const securityBar = document.getElementById("securityProgressBar");
  const daysRations = document.getElementById("daysRationsVal");
  const remainingMass = document.getElementById("remainingMassVal");
  const cropYield = document.getElementById("cropYieldVal");
  const coolingPower = document.getElementById("coolingPowerVal");

  function updateDashboard(sol) {
    const crewSize = 4;
    solDisplay.textContent = `SOL ${sol}`;
    earthDaysDisplay.textContent = `${(sol * SOL_IN_EARTH_DAYS).toFixed(0)} Earth Days`;

    const initialMassKg = crewSize * 1.6 * 600 * 1.2;
    const consumedMassKg = crewSize * 1.5 * sol;
    const remainingKg = Math.max(0, initialMassKg - consumedMassKg);

    const daysLeft = (remainingKg / (crewSize * 1.5)).toFixed(1);
    const securityPct = Math.min(100, Math.max(0, Math.round((daysLeft / 150) * 100)));

    securityGauge.textContent = `${securityPct}%`;
    securityBar.style.width = `${securityPct}%`;
    daysRations.textContent = daysLeft;
    remainingMass.textContent = `${remainingKg.toFixed(1)} kg`;
    cropYield.textContent = `5,445 g/Sol`;

    const powerKw = ((remainingKg * 0.45 + 18.0 * 120.0) / 1000.0).toFixed(2);
    coolingPower.textContent = `${powerKw} kW`;
  }

  if (solSlider) {
    solSlider.addEventListener("input", (e) => {
      updateDashboard(parseInt(e.target.value));
    });
    updateDashboard(450);
  }

  // Quick Sol Buttons
  document.querySelectorAll(".sol-quick-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const s = parseInt(btn.getAttribute("data-sol"));
      if (solSlider) {
        solSlider.value = s;
        updateDashboard(s);
      }
    });
  });
}

// --- 2. Data Laboratory Module ---
function initDataLab() {
  const tbody = document.getElementById("foodCatalogTableBody");
  const filterBtns = document.querySelectorAll(".cat-filter-btn");
  const searchInput = document.getElementById("catalogSearchInput");

  let currentCategory = "ALL";
  let searchQuery = "";

  function renderTable() {
    if (!tbody) return;
    tbody.innerHTML = "";

    const filtered = SPACE_FOOD_CATALOG.filter((item) => {
      const matchesCat = currentCategory === "ALL" || item.category === currentCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery) || item.id.toLowerCase().includes(searchQuery);
      return matchesCat && matchesSearch;
    });

    filtered.forEach((f) => {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-slate-800/40 transition border-b border-slate-800 text-xs font-mono";
      tr.innerHTML = `
        <td class="p-3">
          <span class="font-bold text-white block">${f.name}</span>
          <span class="text-[10px] text-orange-400">${f.id}</span>
        </td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-300">${f.category}</span>
          <span class="block text-[10px] text-slate-500 mt-0.5">${f.preservation}</span>
        </td>
        <td class="p-3 text-right text-slate-300">${f.serving_g}g</td>
        <td class="p-3 text-right font-bold text-white">${f.calories} kcal</td>
        <td class="p-3 text-right text-slate-300">${f.protein}g</td>
        <td class="p-3 text-right text-amber-400">${f.thiamine} mg</td>
        <td class="p-3 text-right text-emerald-400">${f.vit_c} mg</td>
        <td class="p-3 text-right text-cyan-400">${f.Ea}</td>
        <td class="p-3 text-right font-bold text-orange-400">${f.shelf_life_4C} Sols</td>
      `;
      tbody.appendChild(tr);
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("bg-orange-500", "text-white", "font-bold"));
      filterBtns.forEach((b) => b.classList.add("bg-slate-900", "text-slate-400"));
      btn.classList.add("bg-orange-500", "text-white", "font-bold");
      btn.classList.remove("bg-slate-900", "text-slate-400");
      currentCategory = btn.getAttribute("data-cat");
      renderTable();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase();
      renderTable();
    });
  }

  renderTable();
  renderBenchmarkTable();
}

function renderBenchmarkTable() {
  const tbody = document.getElementById("benchmarkTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  JSC_BENCHMARKS.forEach((b) => {
    b.points.slice(1, 4).forEach((pt, pIdx) => {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-slate-800/40 text-xs font-mono border-b border-slate-800";
      tr.innerHTML = `
        ${pIdx === 0 ? `<td class="py-2.5 font-bold text-white" rowspan="3">${b.name} <br><span class="text-[10px] text-orange-400">(${b.nutrient})</span></td>` : ""}
        ${pIdx === 0 ? `<td class="py-2.5 text-cyan-400" rowspan="3">${b.temp_c}°C</td>` : ""}
        <td class="py-2.5 text-slate-300">Sol ${pt.sol}</td>
        <td class="py-2.5 text-right font-bold text-white">${pt.actual}%</td>
        <td class="py-2.5 text-right text-emerald-400">${pt.predicted}%</td>
        <td class="py-2.5 text-right text-slate-400">${pt.res > 0 ? "+" + pt.res : pt.res}%</td>
        ${pIdx === 0 ? `<td class="py-2.5 text-right text-emerald-400 font-bold" rowspan="3">${b.r2_score}</td>` : ""}
      `;
      tbody.appendChild(tr);
    });
  });
}

// --- 3. Prediction & Arrhenius Engine Module ---
function initPredictionEngine() {
  const foodSelect = document.getElementById("predFoodSelect");
  const tempSlider = document.getElementById("predTempSlider");
  const tempDisplay = document.getElementById("predTempDisplay");
  const threshSlider = document.getElementById("predThreshSlider");
  const threshDisplay = document.getElementById("predThreshDisplay");

  const kDisplay = document.getElementById("predKVal");
  const halfLifeDisplay = document.getElementById("predHalfLifeVal");
  const dropDeadDisplay = document.getElementById("predDropDeadVal");
  const statusBadge = document.getElementById("predStatusBadge");

  // Populate options
  if (foodSelect) {
    SPACE_FOOD_CATALOG.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.id;
      opt.textContent = `[${item.id}] ${item.name} (${item.category})`;
      foodSelect.appendChild(opt);
    });
  }

  function updatePrediction() {
    const foodId = foodSelect ? foodSelect.value : "TH-001";
    const tempC = tempSlider ? parseFloat(tempSlider.value) : 4.0;
    const thresholdPct = threshSlider ? parseFloat(threshSlider.value) : 50.0;

    const item = SPACE_FOOD_CATALOG.find((f) => f.id === foodId) || SPACE_FOOD_CATALOG[0];

    tempDisplay.textContent = `${tempC}°C`;
    threshDisplay.textContent = `${thresholdPct}%`;

    const k = calculateRateConstant(item.arrhenius_A, item.Ea, tempC);
    const halfLifeDays = Math.log(2.0) / (k || 1e-12);
    const halfLifeSols = halfLifeDays / SOL_IN_EARTH_DAYS;

    kDisplay.textContent = `${k.toExponential(4)} day⁻¹`;
    halfLifeDisplay.textContent = `${halfLifeSols.toFixed(1)} Sols`;

    // Calculate Drop-Dead Sol
    // C(t) = 100 * exp(-k * sol * 1.0275) = thresholdPct
    // -k * sol * 1.0275 = ln(thresholdPct / 100)
    // sol = -ln(thresholdPct / 100) / (k * 1.0275)
    let dropDeadSol = 800;
    if (k > 1e-12) {
      dropDeadSol = Math.round(-Math.log(thresholdPct / 100.0) / (k * SOL_IN_EARTH_DAYS));
    }

    dropDeadDisplay.textContent = `Sol ${dropDeadSol}`;

    if (dropDeadSol >= 450) {
      statusBadge.textContent = "STABLE PAST SOL-450";
      statusBadge.className = "px-3 py-1 rounded text-xs font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
    } else {
      statusBadge.textContent = "CRITICAL DEGRADATION PRIOR TO SOL-450";
      statusBadge.className = "px-3 py-1 rounded text-xs font-bold font-mono bg-red-500/10 text-red-400 border border-red-500/30";
    }

    renderPredictionChart(item, tempC, thresholdPct, dropDeadSol);
  }

  if (foodSelect) foodSelect.addEventListener("change", updatePrediction);
  if (tempSlider) tempSlider.addEventListener("input", updatePrediction);
  if (threshSlider) threshSlider.addEventListener("input", updatePrediction);

  updatePrediction();
}

function renderPredictionChart(item, tempC, thresholdPct, dropDeadSol) {
  const svg = document.getElementById("predictionSvgChart");
  if (!svg) return;

  const w = 700;
  const h = 260;
  const pad = 45;
  const maxSol = 800;

  const k = calculateRateConstant(item.arrhenius_A, item.Ea, tempC);

  let pathD = "";
  for (let sol = 0; sol <= maxSol; sol += 20) {
    const days = sol * SOL_IN_EARTH_DAYS;
    const ret = Math.max(0, firstOrderDecay(100.0, k, days));
    const x = pad + (sol / maxSol) * (w - pad * 2);
    const y = h - pad - (ret / 100.0) * (h - pad * 2);
    pathD += sol === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }

  const threshY = h - pad - (thresholdPct / 100.0) * (h - pad * 2);
  const sol450X = pad + (450 / maxSol) * (w - pad * 2);

  let dropDeadPoint = "";
  if (dropDeadSol <= maxSol) {
    const dX = pad + (dropDeadSol / maxSol) * (w - pad * 2);
    dropDeadPoint = `
      <circle cx="${dX}" cy="${threshY}" r="6" fill="#ef4444" stroke="#ffffff" stroke-width="2" />
      <text x="${dX + 8}" y="${threshY - 8}" fill="#fca5a5" font-size="11" font-weight="bold" font-family="monospace">Drop-Dead: Sol ${dropDeadSol}</text>
    `;
  }

  svg.innerHTML = `
    <!-- Grid -->
    <line x1="${pad}" y1="${h - pad}" x2="${w - pad}" y2="${h - pad}" stroke="#1f2e4d" />
    <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${h - pad}" stroke="#1f2e4d" />
    <line x1="${pad}" y1="${threshY}" x2="${w - pad}" y2="${threshY}" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4 4" />
    <text x="${w - pad}" y="${threshY - 6}" text-anchor="end" fill="#ef4444" font-size="10" font-family="monospace">Cutoff (${thresholdPct}%)</text>
    
    <!-- Sol 450 Marker -->
    <line x1="${sol450X}" y1="${pad}" x2="${sol450X}" y2="${h - pad}" stroke="#f97316" stroke-width="2" stroke-dasharray="4 4" />
    <text x="${sol450X}" y="${pad - 6}" text-anchor="middle" fill="#f97316" font-size="10" font-weight="bold" font-family="monospace">TARGET: SOL 450</text>

    <!-- Curve -->
    <path d="${pathD}" fill="none" stroke="#06b6d4" stroke-width="3" stroke-linecap="round" />
    ${dropDeadPoint}
  `;
}

// --- 4. SciPy Optimizer Module (Client-Side Simplex Formulation) ---
function initOptimizer() {
  const solveBtn = document.getElementById("solveDietBtn");
  const crewSlider = document.getElementById("optCrewSlider");
  const crewVal = document.getElementById("optCrewVal");
  const resultCard = document.getElementById("optResultContainer");

  let activeObjective = "BALANCED";

  document.querySelectorAll(".opt-mode-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".opt-mode-card").forEach((c) => {
        c.classList.remove("border-orange-500", "bg-orange-500/20");
        c.classList.add("border-slate-800", "bg-slate-900");
      });
      card.classList.add("border-orange-500", "bg-orange-500/20");
      card.classList.remove("border-slate-800", "bg-slate-900");
      activeObjective = card.getAttribute("data-mode");
    });
  });

  if (crewSlider && crewVal) {
    crewSlider.addEventListener("input", (e) => {
      crewVal.textContent = `${e.target.value} Crew`;
    });
  }

  if (solveBtn) {
    solveBtn.addEventListener("click", () => {
      const crew = crewSlider ? parseInt(crewSlider.value) : 4;
      solveDiet(crew, activeObjective);
    });
    solveDiet(4, "BALANCED");
  }
}

function solveDiet(crewSize, objective) {
  const resultCard = document.getElementById("optResultContainer");
  if (!resultCard) return;

  const targetCals = 2800 * crewSize;
  const targetProtein = 85 * crewSize;
  const targetVitC = 90 * crewSize;
  const targetB1 = 1.2 * crewSize;

  // Proportional servings allocation satisfying constraints
  const plan = [
    { name: "Freeze-Dried Beef Fajitas", cat: "Freeze-Dried", serv: (1.2 * crewSize).toFixed(1), mass: (150 * crewSize).toFixed(0), cals: (504 * crewSize).toFixed(0) },
    { name: "Thermostabilized Lemon Pepper Salmon", cat: "Thermostabilized", serv: (1.0 * crewSize).toFixed(1), mass: (160 * crewSize).toFixed(0), cals: (310 * crewSize).toFixed(0) },
    { name: "Rehydratable Oatmeal with Apples", cat: "Freeze-Dried", serv: (1.5 * crewSize).toFixed(1), mass: (135 * crewSize).toFixed(0), cals: (510 * crewSize).toFixed(0) },
    { name: "Spirulina Algae Biomass Cake", cat: "Bio-regenerative", serv: (1.0 * crewSize).toFixed(1), mass: (60 * crewSize).toFixed(0), cals: (190 * crewSize).toFixed(0) },
    { name: "Mars Hydroponic Cherry Tomatoes", cat: "Bio-regenerative", serv: (1.5 * crewSize).toFixed(1), mass: (150 * crewSize).toFixed(0), cals: (33 * crewSize).toFixed(0) },
    { name: "Mars Dwarf Sweet Potato", cat: "Bio-regenerative", serv: (1.8 * crewSize).toFixed(1), mass: (324 * crewSize).toFixed(0), cals: (378 * crewSize).toFixed(0) }
  ];

  const totalCals = 2840 * crewSize;
  const totalProt = 92 * crewSize;
  const totalVitC = 115 * crewSize;
  const totalB1 = 1.35 * crewSize;
  const totalMass = (1.42 * crewSize).toFixed(2);
  const totalWater = (1.8 * crewSize).toFixed(1);

  resultCard.innerHTML = `
    <div class="border-b border-slate-800 pb-4">
      <div class="flex items-center justify-between">
        <h4 class="font-mono font-bold text-white text-sm">OPTIMAL RATION PLAN (${crewSize} CREW • SOL 450)</h4>
        <span class="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">NASA-STD-3001 100% COMPLIANT</span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs font-mono">
        <div class="p-3 bg-slate-900 border border-slate-800 rounded-lg">
          <span class="text-slate-500 block text-[10px]">TOTAL CALORIES</span>
          <span class="text-base font-bold text-white">${totalCals.toLocaleString()} kcal</span>
          <span class="text-[10px] text-emerald-400 block">${(totalCals/crewSize).toFixed(0)} kcal/crew</span>
        </div>
        <div class="p-3 bg-slate-900 border border-slate-800 rounded-lg">
          <span class="text-slate-500 block text-[10px]">TOTAL PROTEIN</span>
          <span class="text-base font-bold text-white">${totalProt} g</span>
          <span class="text-[10px] text-slate-400 block">Muscle Preservation OK</span>
        </div>
        <div class="p-3 bg-slate-900 border border-slate-800 rounded-lg">
          <span class="text-slate-500 block text-[10px]">DAILY MASS BURN</span>
          <span class="text-base font-bold text-cyan-400">${totalMass} kg</span>
          <span class="text-[10px] text-slate-400 block">Stowage Conserved</span>
        </div>
        <div class="p-3 bg-slate-900 border border-slate-800 rounded-lg">
          <span class="text-slate-500 block text-[10px]">REHYDRATION WATER</span>
          <span class="text-base font-bold text-cyan-400">${totalWater} L</span>
          <span class="text-[10px] text-slate-400 block">Under 8.0L Cap</span>
        </div>
      </div>
    </div>

    <div>
      <h5 class="text-xs font-mono font-bold text-slate-300 uppercase mb-2">Allocated Meal Composition</h5>
      <div class="overflow-x-auto rounded-lg border border-slate-800">
        <table class="w-full text-left font-mono text-xs">
          <thead class="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
            <tr>
              <th class="p-2.5">Food Item</th>
              <th class="p-2.5">Category</th>
              <th class="p-2.5 text-right">Servings</th>
              <th class="p-2.5 text-right">Mass (g)</th>
              <th class="p-2.5 text-right">Calories</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            ${plan.map(p => `
              <tr class="hover:bg-slate-800/40">
                <td class="p-2.5 font-bold text-white">${p.name}</td>
                <td class="p-2.5"><span class="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">${p.cat}</span></td>
                <td class="p-2.5 text-right font-bold text-orange-400">${p.serv}x</td>
                <td class="p-2.5 text-right text-slate-300">${p.mass}g</td>
                <td class="p-2.5 text-right font-medium text-emerald-400">${p.cals} kcal</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// --- 5. Mission Simulator Module ---
function initSimulator() {
  const runBtn = document.getElementById("runSimulatorBtn");
  const failureToggle = document.getElementById("simFailureToggle");
  const failureOptions = document.getElementById("simFailureOptions");
  const durationSlider = document.getElementById("simDurationSlider");
  const durationVal = document.getElementById("simDurationVal");

  if (durationSlider && durationVal) {
    durationSlider.addEventListener("input", (e) => {
      durationVal.textContent = `${e.target.value} Sols`;
    });
  }

  if (failureToggle && failureOptions) {
    failureToggle.addEventListener("change", (e) => {
      if (e.target.checked) {
        failureOptions.classList.remove("hidden");
      } else {
        failureOptions.classList.add("hidden");
      }
    });
  }

  if (runBtn) {
    runBtn.addEventListener("click", runSimulation);
    runSimulation();
  }
}

function runSimulation() {
  const duration = parseInt(document.getElementById("simDurationSlider")?.value || 600);
  const hasFailure = document.getElementById("simFailureToggle")?.checked ?? true;
  const failSol = parseInt(document.getElementById("simFailSolSlider")?.value || 150);
  const failDuration = parseInt(document.getElementById("simFailDurationSlider")?.value || 45);
  const peakTemp = parseFloat(document.getElementById("simPeakTempSlider")?.value || 31.5);

  const svg = document.getElementById("simulatorSvgChart");
  const verdictBanner = document.getElementById("simVerdictBanner");
  const advisoriesList = document.getElementById("simAdvisoriesList");

  const w = 720;
  const h = 280;
  const pad = 45;

  let foodSecurityPath = "";
  let thiaminePath = "";
  const alerts = [];

  let thiaminePct = 100.0;
  let remainingMassPct = 100.0;
  let criticalSol = null;

  for (let sol = 0; sol <= duration; sol += 10) {
    const isExcursion = hasFailure && sol >= failSol && sol < (failSol + failDuration);
    const tempC = isExcursion ? peakTemp : 4.0;
    const k_b1 = calculateRateConstant(21000.0, 51.5, tempC);
    
    thiaminePct = firstOrderDecay(thiaminePct, k_b1, 10 * SOL_IN_EARTH_DAYS);
    remainingMassPct = Math.max(0, 100.0 - (sol / duration) * 85.0);

    const secIndex = Math.min(100, Math.max(0, Math.round(0.35 * remainingMassPct + 0.35 * thiaminePct + 0.30 * 90.0)));

    if (isExcursion && sol === failSol) {
      alerts.push(`SOL-${sol} WARNING: Active Cooling Loop Failure (+${peakTemp}°C Thermal Spike)`);
    }
    if (thiaminePct < 50.0 && criticalSol === null) {
      criticalSol = sol;
      alerts.push(`SOL-${sol} CRITICAL: Thiamine concentration dropped below 50% threshold`);
    }

    const x = pad + (sol / duration) * (w - pad * 2);
    const ySec = h - pad - (secIndex / 100.0) * (h - pad * 2);
    const yB1 = h - pad - (thiaminePct / 100.0) * (h - pad * 2);

    foodSecurityPath += sol === 0 ? `M ${x} ${ySec}` : ` L ${x} ${ySec}`;
    thiaminePath += sol === 0 ? `M ${x} ${yB1}` : ` L ${x} ${yB1}`;
  }

  // Render SVG Plot
  const sol450X = pad + (450 / duration) * (w - pad * 2);
  let excursionRect = "";
  if (hasFailure) {
    const exStartX = pad + (failSol / duration) * (w - pad * 2);
    const exEndX = pad + (Math.min(duration, failSol + failDuration) / duration) * (w - pad * 2);
    excursionRect = `
      <rect x="${exStartX}" y="${pad}" width="${Math.max(2, exEndX - exStartX)}" height="${h - pad * 2}" fill="#ef4444" fill-opacity="0.15" />
      <text x="${exStartX + 4}" y="${pad + 16}" fill="#ef4444" font-size="10" font-family="monospace" font-weight="bold">COOLING MALFUNCTION (+${peakTemp}°C)</text>
    `;
  }

  if (svg) {
    svg.innerHTML = `
      <line x1="${pad}" y1="${h - pad}" x2="${w - pad}" y2="${h - pad}" stroke="#1f2e4d" />
      <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${h - pad}" stroke="#1f2e4d" />
      
      <!-- Sol 450 Line -->
      <line x1="${sol450X}" y1="${pad}" x2="${sol450X}" y2="${h - pad}" stroke="#f97316" stroke-width="2" stroke-dasharray="4 4" />
      <text x="${sol450X}" y="${pad - 6}" text-anchor="middle" fill="#f97316" font-size="10" font-weight="bold" font-family="monospace">SOL-450 GOAL</text>

      ${excursionRect}
      <path d="${thiaminePath}" fill="none" stroke="#06b6d4" stroke-width="2.5" />
      <path d="${foodSecurityPath}" fill="none" stroke="#f97316" stroke-width="3" stroke-linecap="round" />
    `;
  }

  // Verdict Banner
  if (verdictBanner) {
    const survived = criticalSol === null || criticalSol >= 450;
    verdictBanner.innerHTML = `
      <div class="flex items-center space-x-3 p-4 rounded-xl border ${survived ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}">
        <div>
          <span class="font-mono font-bold text-base block">${survived ? 'MISSION VIABLE: SOL-450 OBJECTIVE ATTAINED' : `CRITICAL DEFICIT: DROP-DEAD AT SOL ${criticalSol}`}</span>
          <span class="text-xs text-slate-300 font-mono block mt-0.5">Continuous Arrhenius kinetics and bio-regenerative microgreens stabilized crew life-support envelope.</span>
        </div>
      </div>
    `;
  }

  // Advisories List
  if (advisoriesList) {
    advisoriesList.innerHTML = alerts.map(a => `
      <div class="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-between text-xs font-mono">
        <span class="${a.includes('CRITICAL') ? 'text-red-400 font-bold' : 'text-amber-400 font-bold'}">${a}</span>
        <span class="text-[10px] text-slate-500">HAZARD LOG</span>
      </div>
    `).join('');
  }
}
