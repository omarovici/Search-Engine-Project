// #region Highlighting Functions
function highlightText(text, word) {
  if (!word) return text;
  // Escape regex special characters in word
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  return text.replace(regex, '<span class="highlight">$1</span>');
}
// #endregion

// #region Spinner & Back To Top
function showSpinner(show) {
  document.getElementById("spinner").style.display = show ? "block" : "none";
}

function showBackToTop(show) {
  document.getElementById("backToTop").style.display = show ? "block" : "none";
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.getElementById("backToTop").onclick = scrollToTop;
window.addEventListener("scroll", function () {
  showBackToTop(window.scrollY > 200);
});
// #endregion

// #region Favicon & Domain Extraction
function getFavicon(url) {
  try {
    const u = new URL(url, window.location.origin);
    return u.origin + "/favicon.ico";
  } catch {
    return "";
  }
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}
// #endregion

// #region Dark Mode
const darkModeToggle = document.getElementById("darkModeToggle");
const darkModeIcon = document.getElementById("darkModeIcon");
function setDarkMode(on) {
  document.body.classList.add("theme-transition", "theme-fade");
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.body.classList.toggle("dark", on);
      darkModeToggle.classList.toggle("active", on);
      if (darkModeIcon) {
        darkModeIcon.src = on ? "assets/moon.svg" : "assets/sun.svg";
        darkModeIcon.alt = on ? "Dark mode" : "Light mode";
      }
      localStorage.setItem("darkMode", on ? "1" : "0");
      setTimeout(() => {
        document.body.classList.remove("theme-transition", "theme-fade");
      }, 600);
    }, 10);
  });
}
darkModeToggle.onclick = () =>
  setDarkMode(!document.body.classList.contains("dark"));
darkModeToggle.onkeydown = (e) => {
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    setDarkMode(!document.body.classList.contains("dark"));
  }
};
// On load, restore dark mode
if (localStorage.getItem("darkMode") === "1") setDarkMode(true);
// #endregion

// #region Voice Search
const micBtn = document.getElementById("micBtn");
const micIcon = document.getElementById("micIcon");
const micIconImg = document.getElementById("micIconImg");
const searchInput = document.getElementById("searchInput");
let recognition;
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  micBtn.onclick = function () {
    recognition.start();
    if (micIconImg) micIconImg.src = "assets/microphone.png";
    micBtn.classList.add("recording");
    micBtn.disabled = true;
  };
  recognition.onresult = function (event) {
    let transcript = event.results[0][0].transcript;
    transcript = transcript.replace(/[.\u06D4]+$/g, "").trim(); // Remove trailing dot(s) (English/Arabic)
    searchInput.value = transcript;
    if (micIconImg) micIconImg.src = "assets/mic.png";
    micBtn.classList.remove("recording");
    micBtn.disabled = false;
    // Optionally, auto-submit the form
    document.getElementById("searchForm").requestSubmit();
  };
  recognition.onerror = function () {
    if (micIconImg) micIconImg.src = "assets/mic.png";
    micBtn.classList.remove("recording");
    micBtn.disabled = false;
  };
  recognition.onend = function () {
    if (micIconImg) micIconImg.src = "assets/mic.png";
    micBtn.classList.remove("recording");
    micBtn.disabled = false;
  };
} else {
  micBtn.style.display = "none";
}
// #endregion

// #region Results Animation
function showResultsWithAnimation(html) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.style.opacity = 0;
  resultsDiv.innerHTML = html;
  setTimeout(() => {
    resultsDiv.style.transition = "opacity 0.7s";
    resultsDiv.style.opacity = 1;
  }, 30);
}
// #endregion

// #region Search Form Submission & Results
document
  .getElementById("searchForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const query = document.getElementById("searchInput").value.trim();
    const orderBy = document.getElementById("orderBySelect").value;
    if (!query) return;
    const resultsDiv = document.getElementById("results");
    // Special case for 'israel'
    if (query.toLowerCase() === "israel") {
      showSpinner(false);
      resultsDiv.innerHTML = `
        <div class="special-image-container">
          <img src="assets/download.jpeg" class="special-animated-image" alt="Special" />
          <div class="special-sentence">Peace and understanding bring light to the world.</div>
        </div>
      `;
      return;
    }
    showSpinner(true);
    resultsDiv.innerHTML = "";
    const t0 = performance.now();
    try {
      const response = await fetch(
        `http://localhost:5062/api/SearchEngine?word=${encodeURIComponent(
          query
        )}&orderBy=${encodeURIComponent(orderBy)}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      let data = await response.json();
      // Filter out results containing 'https://go.redirectingat.com/'
      data = data.filter((item) => {
        const url = item.Url || item.url || "";
        return !url.includes("https://go.redirectingat.com/");
      });
      const t1 = performance.now();
      showSpinner(false);
      if (!data || data.length === 0) {
        showResultsWithAnimation(`<div style="text-align:center;margin-top:32px;">
                <img src='https://cdn-icons-png.flaticon.com/512/2748/2748558.png' alt='No results' width='80' style='opacity:0.7;'/><br>
                <p style="color:#b00;font-size:1.1em;">No results found.<br>Try another search!</p>
            </div>`);
        return;
      }
      const info = `<div style='color:#2a5298;font-size:1em;margin-bottom:10px;'>${
        data.length
      } results found in ${(t1 - t0).toFixed(1)} ms</div>`;
      // Show only first 5 results in preview
      const previewCount = 5;
      let shownCount = previewCount;
      const renderPreview = () =>
        data
          .slice(0, shownCount)
          .map((item) => {
            let url = item.Url || item.url;
            if (url.endsWith(".html")) {
              url +=
                (url.includes("?") ? "&" : "?") +
                "highlight=" +
                encodeURIComponent(query);
            }
            let favicon = "";
            if (url.startsWith("http")) {
              favicon = `<img class="result-favicon" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(
                url
              )}&sz=32" alt="favicon"/>`;
            } else if (url.endsWith(".html")) {
              favicon = `<img class="result-favicon" src="${getFavicon(
                url
              )}" alt="favicon"/>`;
            }
            const domain = extractDomain(url);
            const urlTitleMap = {
              "https://www.reuters.com/": "Reuters",
              "https://www.nbcnews.com/": "NBC News",
              "https://www.empireonline.com/": "Empire Online",
              "https://www.nytimes.com/": "NY Times",
              "https://www.nytimes.com/athletic/": "NY Times - The Athletic",
              "https://www.bbc.com/": "BBC",
              "https://www.bbc.com/sport": "BBC - Sports",
              "https://cnn.com/": "CNN",
              "https://www.goal.com/en-us": "Goal (US)",
              "https://www.theguardian.com/": "The Guardian",
              "https://www.theguardian.com/international":
                "The Guardian - International",
              "https://www.geeksforgeeks.org/": "GeeksforGeeks",
              "https://www.skysports.com/": "Sky Sports",
              "https://www.reuters.com/finance": "Reuters - Finance",
              "https://www.nbcnews.com/politics": "NBC News - Politics",
              "https://www.empireonline.com/movies": "Empire Online - Movies",
              "https://www.bbc.com/news": "BBC - News",
              "https://www.bbc.com/weather": "BBC - Weather",
              "https://cnn.com/sport": "CNN - Sports",
              "https://www.goal.com/en-us/news": "Goal (US) - News",
              "https://www.theguardian.com/sport": "The Guardian - Sport",
              "https://www.geeksforgeeks.org/data-structures":
                "GeeksforGeeks - Data Structures",
              "https://www.skysports.com/football": "Sky Sports - Football",
              "https://www.nbcnews.com/us-news": "NBC News - US News",
              "https://www.nbcnews.com/new-york": "NBC News - New York",
              "https://www.nbcnews.com/los-angeles": "NBC News - Los Angeles",
              "https://www.nbcnews.com/chicago": "NBC News - Chicago",
              "https://www.nbcnews.com/dallas-fort-worth":
                "NBC News - Dallas Fort Worth",
              "https://www.nbcnews.com/philadelphia": "NBC News - Philadelphia",
              "https://www.nbcnews.com/washington": "NBC News - Washington",
              "https://www.nbcnews.com/boston": "NBC News - Boston",
              "https://www.nbcnews.com/bay-area": "NBC News - Bay Area",
              "https://www.nbcnews.com/miami": "NBC News - Miami",
              "https://www.nbcnews.com/san-diego": "NBC News - San Diego",
              "https://www.nbcnews.com/connecticut": "NBC News - Connecticut",
              "https://www.nbcnews.com/world": "NBC News - World",
              "https://www.nbcnews.com/business": "NBC News - Business",
              "https://www.nbcnews.com/select": "NBC News - Select",
              "https://www.nbcnews.com/tips/": "NBC News - Tips",
              "https://www.teamtalk.com/": "TeamTalk",
              "https://www.telemundo.com/": "Telemundo",
              "https://www.football365.com/": "Football365",
              "https://edition.cnn.com/": "CNN (International)",
              "https://practice.geeksforgeeks.org/": "GFG Practice",
              "https://holidays.theguardian.com/": "The Guardian Holidays",
              "https://podcasts.apple.com/": "Apple Podcasts",
              "https://store.moma.org/": "MoMA Store",
              "https://holidays.theguardian.com/": "The Guardian Holidays",
              "https://www.football365.com/": "Football365",
              "http://www.football365.com/": "Football365",
              "http://www.nbcsports.com/": "NBC Sports",
              "https://news.sky.com/": "Sky News",
              "https://apnews.com/": "Associated Press",
              "https://www.nbc.com/": "NBC",
              "https://www.theatlantic.com/": "The Atlantic",
              "https://www.nbcnews.com/": "NBC News",
            };
            
            const matchedTitle =
              Object.keys(urlTitleMap)
                .sort((a, b) => b.length - a.length)
                .find((key) => url.includes(key)) || url;
            const title = urlTitleMap[matchedTitle] || url;
            return `
                <div class="result-card">
                    <a href="${url}" class="result-title" target="_blank">${favicon}<span class="result-url">${title}</span></a>
                    <div class="result-snippet">Count: ${item.Count ?? item.count} &nbsp; Word: ${(item.Word ?? item.word).charAt(0).toUpperCase() + (item.Word ?? item.word).slice(1).toLowerCase()}</div>
                </div>
            `;
          })
          .join("");
      let showMoreBtn = "";
      if (data.length > shownCount) {
        showMoreBtn = `<button class="show-more-btn" id="showMoreBtn">Show More</button>`;
      }
      showResultsWithAnimation(info + renderPreview() + showMoreBtn);
      if (data.length > shownCount) {
        document.getElementById("showMoreBtn").onclick = function () {
          openModalWithPagination(data, query, previewCount);
        };
      }
      // Modal close logic
      document.getElementById("closeModal").onclick = closeModal;
      document.getElementById("modalBackdrop").onclick = closeModal;
      function closeModal() {
        document.getElementById("resultsModal").style.display = "none";
        document.getElementById("modalBackdrop").style.display = "none";
      }
      localStorage.setItem("lastSearch", query);
    } catch (err) {
      showSpinner(false);
      showResultsWithAnimation(
        '<p style="color:#b00;">Error fetching results.</p>'
      );
    }
  });
// #endregion

// #region Modal Logic
function openModalWithPagination(data, query, pageSize) {
  const modal = document.getElementById("resultsModal");
  const backdrop = document.getElementById("modalBackdrop");
  const modalResults = document.getElementById("modalResults");
  let shownCount = data.length;
  function renderModalResults() {
    modalResults.innerHTML = data
      .slice(0, shownCount)
      .map((item) => {
        let url = item.Url || item.url;
        if (url.endsWith(".html")) {
          url +=
            (url.includes("?") ? "&" : "?") +
            "highlight=" +
            encodeURIComponent(query);
        }
        let favicon = "";
        if (url.startsWith("http")) {
          favicon = `<img class="result-favicon" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(
            url
          )}&sz=32" alt="favicon"/>`;
        } else if (url.endsWith(".html")) {
          favicon = `<img class="result-favicon" src="${getFavicon(
            url
          )}" alt="favicon"/>`;
        }
        const domain = extractDomain(url);
        const urlTitleMap = {
          "https://www.reuters.com/": "Reuters",
          "https://www.nbcnews.com/": "NBC News",
          "https://www.empireonline.com/": "Empire Online",
          "https://www.nytimes.com/": "NY Times",
          "https://www.nytimes.com/athletic/": "NY Times - The Athletic",
          "https://www.bbc.com/": "BBC",
          "https://www.bbc.com/sport": "BBC - Sports",
          "https://cnn.com/": "CNN",
          "https://www.goal.com/en-us": "Goal (US)",
          "https://www.theguardian.com/": "The Guardian",
          "https://www.theguardian.com/international":
            "The Guardian - International",
          "https://www.geeksforgeeks.org/": "GeeksforGeeks",
          "https://www.skysports.com/": "Sky Sports",
          "https://www.reuters.com/finance": "Reuters - Finance",
          "https://www.nbcnews.com/politics": "NBC News - Politics",
          "https://www.empireonline.com/movies": "Empire Online - Movies",
          "https://www.bbc.com/news": "BBC - News",
          "https://www.bbc.com/weather": "BBC - Weather",
          "https://cnn.com/sport": "CNN - Sports",
          "https://www.goal.com/en-us/news": "Goal (US) - News",
          "https://www.theguardian.com/sport": "The Guardian - Sport",
          "https://www.geeksforgeeks.org/data-structures":
            "GeeksforGeeks - Data Structures",
          "https://www.skysports.com/football": "Sky Sports - Football",
          "https://www.nbcnews.com/us-news": "NBC News - US News",
          "https://www.nbcnews.com/new-york": "NBC News - New York",
          "https://www.nbcnews.com/los-angeles": "NBC News - Los Angeles",
          "https://www.nbcnews.com/chicago": "NBC News - Chicago",
          "https://www.nbcnews.com/dallas-fort-worth":
            "NBC News - Dallas Fort Worth",
          "https://www.nbcnews.com/philadelphia": "NBC News - Philadelphia",
          "https://www.nbcnews.com/washington": "NBC News - Washington",
          "https://www.nbcnews.com/boston": "NBC News - Boston",
          "https://www.nbcnews.com/bay-area": "NBC News - Bay Area",
          "https://www.nbcnews.com/miami": "NBC News - Miami",
          "https://www.nbcnews.com/san-diego": "NBC News - San Diego",
          "https://www.nbcnews.com/connecticut": "NBC News - Connecticut",
          "https://www.nbcnews.com/world": "NBC News - World",
          "https://www.nbcnews.com/business": "NBC News - Business",
          "https://www.nbcnews.com/select": "NBC News - Select",
          "https://www.nbcnews.com/tips/": "NBC News - Tips",
          "https://www.teamtalk.com/": "TeamTalk",
          "https://www.telemundo.com/": "Telemundo",
          "https://www.football365.com/": "Football365",
          "https://edition.cnn.com/": "CNN (International)",
          "https://practice.geeksforgeeks.org/": "GFG Practice",
          "https://holidays.theguardian.com/": "The Guardian Holidays",
          "https://podcasts.apple.com/": "Apple Podcasts",
          "https://store.moma.org/": "MoMA Store",
          "https://holidays.theguardian.com/": "The Guardian Holidays",
          "https://www.football365.com/": "Football365",
          "http://www.football365.com/": "Football365",
          "http://www.nbcsports.com/": "NBC Sports",
          "https://news.sky.com/": "Sky News",
          "https://apnews.com/": "Associated Press",
          "https://www.nbc.com/": "NBC",
          "https://www.theatlantic.com/": "The Atlantic",
          "https://www.nbcnews.com/": "NBC News",
        };

        const matchedTitle =
          Object.keys(urlTitleMap)
            .sort((a, b) => b.length - a.length) // Sort keys by length in descending order
            .find((key) => url.includes(key)) || url;
        const title = urlTitleMap[matchedTitle] || url;

        return `
            <div class="result-card">
                <a href="${url}" class="result-title" target="_blank">${favicon}<span class="result-url">${title}</span></a>
                <div class="result-snippet">Count: ${item.Count ?? item.count} &nbsp; Word: ${(item.Word ?? item.word).charAt(0).toUpperCase() + (item.Word ?? item.word).slice(1).toLowerCase()}</div>
            </div>
            `;
      })
      .join("");
  }
  renderModalResults();
  modal.style.display = "block";
  backdrop.style.display = "block";
  // Infinite scroll logic removed since all results are shown
  modalResults.onscroll = null;
}
// #endregion

// #region Highlight on Page Load & Welcome Overlay
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const highlight = params.get("highlight");
  if (highlight) {
    function walk(node) {
      if (node.nodeType === 3) {
        const replaced = highlightText(node.nodeValue, highlight);
        if (replaced !== node.nodeValue) {
          const span = document.createElement("span");
          span.innerHTML = replaced;
          node.replaceWith(...span.childNodes);
        }
      } else if (
        node.nodeType === 1 &&
        node.childNodes &&
        !["SCRIPT", "STYLE", "NOSCRIPT"].includes(node.tagName)
      ) {
        for (let i = 0; i < node.childNodes.length; i++) {
          walk(node.childNodes[i]);
        }
      }
    }
    walk(document.body);
  }
  // Restore last search
  const last = localStorage.getItem("lastSearch");
  if (last) {
    document.getElementById("searchInput").value = last;
  }
  // Animated circles for About section
  const about = document.getElementById("about-section");
  if (about && !about.querySelector(".circle")) {
    about.insertAdjacentHTML(
      "beforeend",
      `
            <div class="circle circle1"></div>
            <div class="circle circle2"></div>
            <div class="circle circle3"></div>
            <div class="circle circle4"></div>
        `
    );
  }
  // Welcome overlay logic
  const welcome = document.getElementById("welcome-overlay");
  if (welcome) {
    setTimeout(() => {
      welcome.classList.add("hide");
      setTimeout(() => (welcome.style.display = "none"), 800);
    }, 2200); // Show for 2.2 seconds
  }
  // Typewriter animation for welcome message
  const typewriterText = document.getElementById("typewriter-text");
  const cursor = document.querySelector(".typewriter-cursor");
  const message = "Welcome To Our Search Engine!";
  let i = 0;
  function typeWriter() {
    if (i <= message.length) {
      typewriterText.textContent = message.slice(0, i);
      i++;
      setTimeout(typeWriter, 55);
    }
  }
  if (typewriterText) typeWriter();
  // Blinking cursor
  if (cursor) {
    setInterval(() => {
      cursor.style.opacity = cursor.style.opacity === "0" ? "1" : "0";
    }, 500);
  }
  // Dynamic Footer Animation
  const footerText = document.getElementById("footerText");
  const year = new Date().getFullYear();
  const messageFooter = ` ${year} Faculty of Computer Science and Artificial Intelligence, Fayoum University. All rights reserved.`;
  let j = 0;
  function typeFooter() {
    if (footerText && j <= messageFooter.length) {
      footerText.textContent = messageFooter.slice(0, j);
      j++;
      setTimeout(typeFooter, 32);
    }
  }
  if (footerText) typeFooter();
});
// #endregion

// #region Keyboard Shortcuts
window.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    document.getElementById("searchInput").value = "";
    document.getElementById("results").innerHTML = "";
  }
  if (
    e.key === "/" &&
    document.activeElement !== document.getElementById("searchInput")
  ) {
    e.preventDefault();
    document.getElementById("searchInput").focus();
  }
});
// #endregion

// #region Modal HTML Injection
document.body.insertAdjacentHTML(
  "beforeend",
  `
    <div id="resultsModal" class="modal">
        <div class="modal-content">
            <span id="closeModal" class="close">&times;</span>
            <div id="modalResults"></div>
        </div>
    </div>
    <div id="modalBackdrop" class="modal-backdrop"></div>
`
);
// #endregion

// #region Custom Dropdown Logic
(function () {
  const dropdown = document.getElementById("orderByDropdown");
  const selected = dropdown.querySelector(".dropdown-selected");
  const list = dropdown.querySelector(".dropdown-list");
  const options = dropdown.querySelectorAll(".dropdown-option");
  const hiddenSelect = document.getElementById("orderBySelect");

  function closeDropdown() {
    dropdown.classList.remove("open");
  }
  function openDropdown() {
    dropdown.classList.add("open");
    selected.focus();
  }
  selected.addEventListener("click", function (e) {
    dropdown.classList.toggle("open");
  });
  selected.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      dropdown.classList.toggle("open");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      options[0].focus();
    } else if (e.key === "Escape") {
      closeDropdown();
    }
  });
  options.forEach((opt, idx) => {
    opt.setAttribute("tabindex", "0");
    opt.addEventListener("click", function () {
      options.forEach((o) => o.classList.remove("selected"));
      opt.classList.add("selected");
      selected.textContent = opt.textContent;
      hiddenSelect.value = opt.getAttribute("data-value");
      closeDropdown();
    });
    opt.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        opt.click();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (idx < options.length - 1) options[idx + 1].focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (idx > 0) options[idx - 1].focus();
        else selected.focus();
      } else if (e.key === "Escape") {
        closeDropdown();
        selected.focus();
      }
    });
  });
  document.addEventListener("click", function (e) {
    if (!dropdown.contains(e.target)) closeDropdown();
  });
})();
// #endregion
