# Currency Dashboard - Live Exchange Rates

A premium, responsive, and serverless currency converter web application. Built with HTML5, CSS3, and JavaScript, it provides real-time conversions, interactive trend charts, and detailed exchange dashboards without requiring any API keys or registration.

---

## ✨ Features

*   **Real-time Keyless Conversion**: Communicates directly with the open, rate-limit-free Fawaz Ahmed Currency API.
*   **7-Day Historical Trend Chart**: A lightweight, interactive sparkline trend chart drawn dynamically using custom SVG paths with coordinates scaled to rate fluctuations.
*   **Dual-Theme Mode (Dark / Light)**: Features a glassmorphic dark theme by default, toggleable to a clean light theme, with user preference persisted in the browser's `localStorage`.
*   **Quick Conversion Table**: Computes and displays a breakdown for conversion intervals (1, 5, 10, 50, 100, 500, 1000) for the selected currency pair.
*   **Popular Rates Grid**: Highlights live rate values for 6 major trading pairs (USD/EUR, USD/GBP, USD/JPY, EUR/GBP, USD/CAD, USD/AUD) on page load.
*   **100% Responsive Design**: Employs CSS Grid, Flexbox, and media queries to look perfect on mobile viewports (with auto-stacking dropdowns and rotated elements), tablets, and high-resolution desktops.

---

## 📂 Project Structure

```text
├── index.html       # Semantic HTML5 markup, theme buttons, SVG wrappers, and tables
├── style.css        # Glassmorphic CSS design system, Custom Properties, keyframe animations
├── app.js           # DOM controls, asynchronous API fetches, dynamic SVG generator, event listeners
└── codes.js         # Dictionary mapping currency ISO codes to 2-letter flag country codes
```

---

## 🛠️ Technologies Used

*   **HTML5**: Semantic elements (`main`, `header`, `section`) and ARIA labels.
*   **CSS3**: CSS Custom Variables, Glassmorphic filters (`backdrop-filter`), flex-grid positioning, scale transforms, and drifting keyframe animations.
*   **JavaScript**: `fetch` API, asynchronous parallel requests (`Promise.all`), custom math mapping, and local storage management.
*   **FontAwesome**: Scalable visual icons.
*   **FlagsAPI**: Dynamic flag images for selected countries.

---

## 🚀 How to Run Locally

Since the project is built entirely on client-side web technologies, you can run it easily:

### Option 1: Direct Execution
1. Double-click the `index.html` file to open it directly in any modern web browser.

### Option 2: Local Web Server (Recommended)
Running through a local web server is recommended to avoid CORS or origin restrictions on local file paths:

*   **Using Python**:
    ```bash
    python -m http.server 8080
    ```
    Then visit `http://localhost:8080` in your browser.

*   **Using Node.js (`npx`)**:
    ```bash
    npx http-server . -p 8080
    ```
    Then visit `http://localhost:8080` in your browser.
