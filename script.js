(function () {
  // ---------- DOM elements ----------
  const dateInput = document.getElementById("dateInput");
  const weekdaySpan = document.getElementById("weekdayDisplay");
  const achievementsField = document.getElementById("achievementsField");
  const weaknessesField = document.getElementById("weaknessesField");
  const progressDisplay = document.getElementById("progressDisplay");
  const weakPreview = document.getElementById("weakPreview");
  const saveBtn = document.getElementById("saveBtn");
  const clearBtn = document.getElementById("clearBtn");
  const storageMsg = document.getElementById("storageMessage");

  // Gather checkboxes (exactly 16)
  const weekdayChecks = [];
  const weekendChecks = [];
  for (let i = 1; i <= 8; i++)
    weekdayChecks.push(document.getElementById(`task${i}`));
  for (let i = 9; i <= 16; i++)
    weekendChecks.push(document.getElementById(`task${i}`));

  const allCheckboxes = [...weekdayChecks, ...weekendChecks]; // 16

  // Helper: check if date is weekend (sat=6, sun=0)
  function isWeekendDate(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    const day = d.getDay(); // 0 sun, 6 sat
    return day === 0 || day === 6;
  }

  // Update weekday text from dateInput
  function updateWeekdayDisplay() {
    const dateVal = dateInput.value;
    if (!dateVal) {
      weekdaySpan.textContent = "——";
      return;
    }
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) {
      weekdaySpan.textContent = "invalid";
      return;
    }
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    weekdaySpan.textContent = weekdays[d.getDay()];
  }

  // Count completed tasks among all 16
  function countCompleted() {
    return allCheckboxes.filter((cb) => cb && cb.checked).length;
  }

  function updateProgress() {
    const done = countCompleted();
    progressDisplay.textContent = `⭐ ${done}/16 tasks`;
  }

  // Update weakness preview from weaknessesField
  function updateWeakPreview() {
    let txt = weaknessesField.value.trim();
    if (!txt) {
      weakPreview.textContent = "next week: —";
      return;
    }
    // first line or short version
    const firstLine = txt.split("\n")[0];
    const short =
      firstLine.length > 35 ? firstLine.substring(0, 32) + "…" : firstLine;
    weakPreview.textContent = `next week: ${short}`;
  }

  // Load data for selected date from localStorage
  function loadForDate() {
    const selectedDate = dateInput.value;
    if (!selectedDate) return;

    const key = `sumeya_${selectedDate}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // set checkboxes according to saved tasks array (length 16 expected)
        if (Array.isArray(data.tasks) && data.tasks.length === 16) {
          allCheckboxes.forEach((cb, idx) => {
            if (cb) cb.checked = data.tasks[idx] === true;
          });
        } else {
          // fallback: reset all
          allCheckboxes.forEach((cb) => (cb.checked = false));
        }
        achievementsField.value = data.achievements || "";
        weaknessesField.value = data.weaknesses || "";
      } catch (e) {
        console.warn("parse error", e);
      }
    } else {
      // no saved data -> reset checks & fields
      allCheckboxes.forEach((cb) => (cb.checked = false));
      achievementsField.value = "";
      weaknessesField.value = "";
    }
    // always update ui after load
    updateProgress();
    updateWeakPreview();
    storageMsg.textContent = `📂 loaded: ${selectedDate}`;
  }

  // Save current state for selected date
  function saveCurrent() {
    const selectedDate = dateInput.value;
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }

    const tasksState = allCheckboxes.map((cb) => cb.checked);
    const data = {
      tasks: tasksState,
      achievements: achievementsField.value,
      weaknesses: weaknessesField.value,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(`sumeya_${selectedDate}`, JSON.stringify(data));
    storageMsg.textContent = `✅ saved for ${selectedDate}`;
  }

  // Clear ONLY the selected date's data
  function clearSelectedDate() {
    const selectedDate = dateInput.value;
    if (!selectedDate) {
      alert("Pick a date first");
      return;
    }
    if (confirm(`Erase all data for ${selectedDate}?`)) {
      localStorage.removeItem(`sumeya_${selectedDate}`);
      loadForDate(); // resets to empty
      storageMsg.textContent = `🧹 cleared ${selectedDate}`;
    }
  }

  // event listeners
  dateInput.addEventListener("change", function () {
    updateWeekdayDisplay();
    loadForDate();
  });

  // realtime updates for progress & weakness preview
  allCheckboxes.forEach((cb) => {
    if (cb)
      cb.addEventListener("change", function () {
        updateProgress();
        // auto-save? we don't auto-save, just update ui
      });
  });

  weaknessesField.addEventListener("input", updateWeakPreview);
  achievementsField.addEventListener("input", function () {
    // you could add preview but not needed
  });

  saveBtn.addEventListener("click", saveCurrent);
  clearBtn.addEventListener("click", clearSelectedDate);

  // set default date to today and trigger load
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;
  dateInput.value = todayStr;
  updateWeekdayDisplay();
  loadForDate();
  clearBtn.addEventListener("dblclick", function () {
    storageMsg.textContent = "double‑click clears only selected date data";
  });

  updateProgress();
  updateWeakPreview();
})();
