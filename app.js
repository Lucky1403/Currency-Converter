// API Configuration
const BASE_URL = "https://latest.currency-api.pages.dev/v1/currencies";
const HISTORICAL_BASE_URL = "https://{date}.currency-api.pages.dev/v1/currencies";

// Selectors
const fromSelect = document.getElementById("fromSelect");
const toSelect = document.getElementById("toSelect");
const fromFlag = document.getElementById("fromFlag");
const toFlag = document.getElementById("toFlag");
const amountInput = document.getElementById("amountInput");
const convertBtn = document.getElementById("convertBtn");
const resultMsg = document.getElementById("resultMsg");
const rateSubMsg = document.getElementById("rateSubMsg");
const swapBtn = document.getElementById("swapBtn");
const themeToggle = document.getElementById("themeToggle");
const copyBtn = document.getElementById("copyBtn");
const toast = document.getElementById("toast");
const toastMsg = document.getElementById("toastMsg");
const converterForm = document.getElementById("converterForm");

// Details panel selectors
const chartLoader = document.getElementById("chartLoader");
const trendChart = document.getElementById("trendChart");
const chartHeading = document.getElementById("chartHeading");
const conversionTableBody = document.getElementById("conversionTableBody");
const tblColFrom = document.getElementById("tblColFrom");
const tblColTo = document.getElementById("tblColTo");
const popularRatesGrid = document.getElementById("popularRatesGrid");

// Filter out defunct currencies not supported by major APIs
const excludeCurrencies = ["AQD", "ECS"];
const activeCurrencyCodes = Object.keys(countryList).filter(
  (code) => !excludeCurrencies.includes(code)
);

// Initialize application
window.addEventListener("DOMContentLoaded", () => {
  setupTheme();
  populateDropdowns();
  setupEventListeners();
  performExchange();
  updatePopularRates();
});

// Theme Management
function setupTheme() {
  const savedTheme = localStorage.getItem("currency-converter-theme") || "dark";
  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
  } else {
    document.body.classList.remove("light-theme");
  }
}

function toggleTheme() {
  const isLight = document.body.classList.toggle("light-theme");
  localStorage.setItem("currency-converter-theme", isLight ? "light" : "dark");
  
  // Create a subtle scale animation on toggle click
  themeToggle.style.transform = "scale(0.9)";
  setTimeout(() => {
    themeToggle.style.transform = "";
  }, 100);
}

// Dropdown population
function populateDropdowns() {
  activeCurrencyCodes.forEach((code) => {
    // Populate "From" select
    const optFrom = document.createElement("option");
    optFrom.value = code;
    optFrom.innerText = code;
    if (code === "USD") optFrom.selected = true;
    fromSelect.append(optFrom);

    // Populate "To" select
    const optTo = document.createElement("option");
    optTo.value = code;
    optTo.innerText = code;
    if (code === "INR") optTo.selected = true;
    toSelect.append(optTo);
  });

  updateFlag(fromSelect, fromFlag);
  updateFlag(toSelect, toFlag);
}

function updateFlag(selectElement, flagElement) {
  const currCode = selectElement.value;
  const countryCode = countryList[currCode];
  if (countryCode) {
    flagElement.src = `https://flagsapi.com/${countryCode}/flat/64.png`;
    flagElement.alt = `${currCode} flag`;
  }
}

// Event Listeners
function setupEventListeners() {
  fromSelect.addEventListener("change", (e) => {
    updateFlag(fromSelect, fromFlag);
    performExchange();
  });

  toSelect.addEventListener("change", (e) => {
    updateFlag(toSelect, toFlag);
    performExchange();
  });

  swapBtn.addEventListener("click", swapCurrencies);
  themeToggle.addEventListener("click", toggleTheme);
  copyBtn.addEventListener("click", copyToClipboard);

  converterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    performExchange();
  });
}

// Swap currencies
function swapCurrencies() {
  const tempVal = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = tempVal;

  updateFlag(fromSelect, fromFlag);
  updateFlag(toSelect, toFlag);

  // Rotate swap button icon
  const icon = swapBtn.querySelector("i");
  icon.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
  icon.style.transform = "rotate(180deg)";
  
  performExchange();

  setTimeout(() => {
    icon.style.transition = "none";
    icon.style.transform = "";
  }, 400);
}

// Format Numbers beautifully
function formatCurrency(val, currencyCode) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "code"
    }).format(val);
  } catch (e) {
    return `${val.toFixed(2)} ${currencyCode}`;
  }
}

// Main API call & conversion handler
async function performExchange() {
  let amtVal = parseFloat(amountInput.value);
  if (isNaN(amtVal) || amtVal <= 0) {
    amtVal = 1;
    amountInput.value = "1";
  }

  const fromCurr = fromSelect.value;
  const toCurr = toSelect.value;

  // Add skeleton classes to show loading state
  resultMsg.classList.add("skeleton");
  rateSubMsg.classList.add("skeleton");
  convertBtn.disabled = true;

  try {
    const url = `${BASE_URL}/${fromCurr.toLowerCase()}.json`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to load rate data (Status: ${response.status})`);
    }

    const data = await response.json();
    const rate = data[fromCurr.toLowerCase()][toCurr.toLowerCase()];
    
    if (!rate) {
      throw new Error(`Exchange rate not available for ${fromCurr} to ${toCurr}`);
    }

    const finalAmount = amtVal * rate;

    // Display formatted results
    resultMsg.classList.remove("skeleton");
    rateSubMsg.classList.remove("skeleton");
    
    resultMsg.innerHTML = `${formatNumber(amtVal)} <span style="font-size: 1.1rem; color: var(--text-secondary);">${fromCurr}</span> = ${formatNumber(finalAmount)} <span style="color: var(--accent);">${toCurr}</span>`;
    
    const dateStamp = data.date || new Date().toISOString().split("T")[0];
    rateSubMsg.innerText = `1 ${fromCurr} = ${rate.toFixed(4)} ${toCurr} • Rates accurate as of ${dateStamp}`;

    // Update details panels
    updateConversionTable(fromCurr, toCurr, rate);
    updateHistoricalTrend(fromCurr, toCurr);

  } catch (error) {
    console.error("Exchange rate fetch error:", error);
    resultMsg.classList.remove("skeleton");
    rateSubMsg.classList.remove("skeleton");
    resultMsg.innerHTML = `<span style="color: var(--danger); font-size: 1.25rem;">Conversion Failed</span>`;
    rateSubMsg.innerText = error.message || "Please check your network connection.";
  } finally {
    convertBtn.disabled = false;
  }
}

// Helper to format numbers with commas
function formatNumber(num) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(num);
}

// Populates the Quick Conversion Table
function updateConversionTable(fromCode, toCode, rate) {
  tblColFrom.innerText = fromCode;
  tblColTo.innerText = toCode;
  conversionTableBody.innerHTML = "";

  const amounts = [1, 5, 10, 50, 100, 500, 1000];
  amounts.forEach((amt) => {
    const converted = amt * rate;
    const row = document.createElement("tr");
    
    const cellAmt = document.createElement("td");
    cellAmt.innerText = `${amt} ${fromCode}`;
    
    const cellConv = document.createElement("td");
    cellConv.innerText = `${formatNumber(converted)} ${toCode}`;

    row.appendChild(cellAmt);
    row.appendChild(cellConv);
    conversionTableBody.appendChild(row);
  });
}

// Populates Popular rates dashboard
async function updatePopularRates() {
  popularRatesGrid.innerHTML = "";
  
  // Show skeletons initially
  for (let i = 0; i < 6; i++) {
    const skeletonPill = document.createElement("div");
    skeletonPill.className = "rate-pill skeleton";
    skeletonPill.style.height = "2.8rem";
    popularRatesGrid.appendChild(skeletonPill);
  }

  try {
    // Fetch USD rates
    const usdUrl = `${BASE_URL}/usd.json`;
    const eurUrl = `${BASE_URL}/eur.json`;
    
    const [usdRes, eurRes] = await Promise.all([fetch(usdUrl), fetch(eurUrl)]);
    if (!usdRes.ok || !eurRes.ok) throw new Error("Could not load popular rates");

    const usdData = await usdRes.json();
    const eurData = await eurRes.json();

    const rates = [
      { from: "USD", to: "EUR", val: usdData.usd.eur },
      { from: "USD", to: "GBP", val: usdData.usd.gbp },
      { from: "USD", to: "JPY", val: usdData.usd.jpy },
      { from: "EUR", to: "GBP", val: eurData.eur.gbp },
      { from: "USD", to: "CAD", val: usdData.usd.cad },
      { from: "USD", to: "AUD", val: usdData.usd.aud },
    ];

    popularRatesGrid.innerHTML = "";
    rates.forEach((pair) => {
      const pill = document.createElement("div");
      pill.className = "rate-pill";
      
      const label = document.createElement("span");
      label.className = "rate-pair";
      label.innerText = `${pair.from}/${pair.to}`;

      const rateVal = document.createElement("span");
      rateVal.className = "rate-value";
      rateVal.innerText = pair.val.toFixed(4);

      pill.appendChild(label);
      pill.appendChild(rateVal);
      popularRatesGrid.appendChild(pill);
    });

  } catch (err) {
    console.error("Error setting popular rates:", err);
    popularRatesGrid.innerHTML = `<p style="grid-column: span 2; font-size: 0.85rem; color: var(--danger); text-align: center;">Unable to load exchange grid</p>`;
  }
}

// Generate array of past YYYY-MM-DD date strings
function getPastDates(daysCount) {
  const dates = [];
  // Loop from 6 days ago up to today
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
}

// Fetch historical rate helper
async function fetchHistoricalRate(dateStr, fromCode, toCode) {
  const formattedUrl = HISTORICAL_BASE_URL.replace("{date}", dateStr);
  const url = `${formattedUrl}/${fromCode.toLowerCase()}.json`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    return {
      date: dateStr,
      rate: data[fromCode.toLowerCase()][toCode.toLowerCase()]
    };
  } catch (error) {
    console.warn(`Historical lookup failed for ${dateStr}:`, error.message);
    return null;
  }
}

// Fetches 7 days of historical rates and draws inline SVG trend chart
async function updateHistoricalTrend(fromCode, toCode) {
  chartLoader.style.opacity = "1";
  chartHeading.innerHTML = `<i class="fa-solid fa-chart-line" aria-hidden="true"></i> 7-Day Trend (${fromCode}/${toCode})`;
  
  const dates = getPastDates(7);
  
  try {
    const promises = dates.map(date => fetchHistoricalRate(date, fromCode, toCode));
    const results = await Promise.all(promises);
    
    // Filter out failed network responses
    const validDataPoints = results.filter(point => point !== null && point.rate !== undefined);
    
    if (validDataPoints.length < 2) {
      throw new Error("Insufficient data points available");
    }

    drawSVGChart(validDataPoints);
    chartLoader.style.opacity = "0";

  } catch (err) {
    console.error("Trend visualization error:", err);
    trendChart.innerHTML = "";
    chartLoader.style.opacity = "1";
    chartLoader.innerText = "Trend data unavailable for this pair";
  }
}

// Dynamically draws smooth SVG sparkline inside `<svg id="trendChart">`
function drawSVGChart(dataPoints) {
  const width = 400;
  const height = 150;
  const paddingLeftRight = 25;
  const paddingTopBottom = 25;

  const rates = dataPoints.map(p => p.rate);
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);
  const range = maxRate - minRate;

  // Clear previous SVG contents
  trendChart.innerHTML = "";

  // Append a defs element containing gradients
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  
  const linearGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
  linearGradient.setAttribute("id", "chartGrad");
  linearGradient.setAttribute("x1", "0%");
  linearGradient.setAttribute("y1", "0%");
  linearGradient.setAttribute("x2", "0%");
  linearGradient.setAttribute("y2", "100%");

  const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", "var(--accent)");
  stop1.setAttribute("stop-opacity", "0.28");

  const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop2.setAttribute("offset", "100%");
  stop2.setAttribute("stop-color", "var(--accent)");
  stop2.setAttribute("stop-opacity", "0.00");

  linearGradient.appendChild(stop1);
  linearGradient.appendChild(stop2);
  defs.appendChild(linearGradient);
  trendChart.appendChild(defs);

  // Compute scale mappings
  const coordinates = dataPoints.map((point, i) => {
    const x = paddingLeftRight + (i * (width - 2 * paddingLeftRight)) / (dataPoints.length - 1);
    let y = height / 2; // Default if flat line
    if (range > 0) {
      y = height - paddingTopBottom - ((point.rate - minRate) / range) * (height - 2 * paddingTopBottom);
    }
    return { x, y, rate: point.rate, date: point.date };
  });

  // 1. Draw horizontal gridlines (Min & Max reference lines)
  const drawGridLine = (yVal, labelText, rateVal) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", paddingLeftRight);
    line.setAttribute("y1", yVal);
    line.setAttribute("x2", width - paddingLeftRight);
    line.setAttribute("y2", yVal);
    line.setAttribute("stroke", "var(--table-border)");
    line.setAttribute("stroke-dasharray", "4,4");
    line.setAttribute("stroke-width", "1");
    trendChart.appendChild(line);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", paddingLeftRight - 5);
    text.setAttribute("y", yVal + 4);
    text.setAttribute("fill", "var(--text-secondary)");
    text.setAttribute("font-size", "9px");
    text.setAttribute("font-family", "var(--font-mono)");
    text.setAttribute("text-anchor", "end");
    text.textContent = rateVal.toFixed(3);
    trendChart.appendChild(text);
  };

  if (range > 0) {
    drawGridLine(paddingTopBottom, "Max", maxRate);
    drawGridLine(height - paddingTopBottom, "Min", minRate);
  } else {
    drawGridLine(height / 2, "Rate", minRate);
  }

  // 2. Build Path descriptions (smooth Bezier curve interpolation)
  let dPathStr = `M ${coordinates[0].x} ${coordinates[0].y}`;
  for (let i = 1; i < coordinates.length; i++) {
    const p0 = coordinates[i - 1];
    const p1 = coordinates[i];
    // Control points for smooth curves
    const cpX1 = p0.x + (p1.x - p0.x) / 2;
    const cpY1 = p0.y;
    const cpX2 = p0.x + (p1.x - p0.x) / 2;
    const cpY2 = p1.y;
    dPathStr += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }

  // 3. Draw gradient area under curve
  const areaPathStr = `${dPathStr} L ${coordinates[coordinates.length - 1].x} ${height - paddingTopBottom} L ${coordinates[0].x} ${height - paddingTopBottom} Z`;
  const areaPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  areaPath.setAttribute("d", areaPathStr);
  areaPath.setAttribute("fill", "url(#chartGrad)");
  trendChart.appendChild(areaPath);

  // 4. Draw outline sparkline
  const linePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  linePath.setAttribute("d", dPathStr);
  linePath.setAttribute("stroke", "var(--accent)");
  linePath.setAttribute("stroke-width", "3");
  linePath.setAttribute("stroke-linecap", "round");
  linePath.setAttribute("stroke-linejoin", "round");
  linePath.setAttribute("fill", "none");
  trendChart.appendChild(linePath);

  // 5. Draw data points (dots with native tooltips)
  coordinates.forEach((pt) => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", pt.x);
    circle.setAttribute("cy", pt.y);
    circle.setAttribute("r", "4.5");
    circle.setAttribute("fill", "var(--text-primary)");
    circle.setAttribute("stroke", "var(--accent)");
    circle.setAttribute("stroke-width", "2");
    circle.style.cursor = "pointer";
    circle.style.transition = "transform 0.15s ease";

    // Mouse over visual enhancements
    circle.addEventListener("mouseover", () => {
      circle.setAttribute("r", "6.5");
    });
    circle.addEventListener("mouseout", () => {
      circle.setAttribute("r", "4.5");
    });

    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    // Format date nicely
    const dateFormatted = formatDateString(pt.date);
    title.textContent = `Date: ${dateFormatted}\nRate: ${pt.rate.toFixed(4)}`;
    circle.appendChild(title);

    trendChart.appendChild(circle);
  });
}

// Helper to format YYYY-MM-DD to "MMM DD" (e.g. "Jun 05")
function formatDateString(str) {
  try {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const parts = str.split("-");
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parts[2];
    return `${months[monthIndex]} ${day}`;
  } catch (e) {
    return str;
  }
}

// Copy results to clipboard
function copyToClipboard() {
  const resultText = resultMsg.innerText;
  const rateText = rateSubMsg.innerText;
  const textToCopy = `${resultText} (${rateText})`;

  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      showToast("Conversion rate copied to clipboard!");
    })
    .catch((err) => {
      console.error("Could not copy text: ", err);
      showToast("Copy failed. Please copy manually.");
    });
}

function showToast(message) {
  toastMsg.innerText = message;
  toast.classList.add("show");
  
  // Create a slight pulse in the copy button
  copyBtn.querySelector("i").className = "fa-solid fa-check";
  copyBtn.style.color = "var(--success)";

  setTimeout(() => {
    toast.classList.remove("show");
    copyBtn.querySelector("i").className = "fa-regular fa-copy";
    copyBtn.style.color = "";
  }, 2200);
}
