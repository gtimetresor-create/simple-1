// REPLACE THESE WITH YOUR THINGSPEAK DETAILS
const CHANNEL_ID = "3576966"; // Must be your actual numeric Channel ID (no letters)
const READ_API_KEY = "FCPTY591ETT4EI4K"; // Required if your channel is Private
 

const URL = `https://thingspeak.com{CHANNEL_ID}/feeds/last.json?api_key=${READ_API_KEY}`;

async function fetchTankData() {
  try {
    const response = await fetch(URL);
    if (!response.ok) throw new Error("Network error");
    
    const data = await response.json();

    // Parse Field 1 (Water Level %) and Field 2 (Pump State)
    const waterLevel = parseInt(data.field1) || 0;
    const pumpState = parseInt(data.field2) || 0;
    const updatedTime = new Date(data.created_at).toLocaleTimeString();

    updateDashboard(waterLevel, pumpState, updatedTime);
  } catch (error) {
    console.error("Failed to fetch ThingSpeak data:", error);
    document.getElementById("connection-status").textContent = "Disconnected";
    document.getElementById("connection-status").className = "badge";
  }
}

function updateDashboard(level, pump, time) {
  // Update Connection Badge
  const connBadge = document.getElementById("connection-status");
  connBadge.textContent = "Live";
  connBadge.className = "badge online";

  // Update Tank Water Height & Text
  document.getElementById("water-fill").style.height = `${level}%`;
  document.getElementById("level-text").textContent = `${level}%`;

  // Update Pump Status
  const pumpEl = document.getElementById("pump-status");
  if (pump === 1) {
    pumpEl.textContent = "RUNNING (ON)";
    pumpEl.className = "status-pill on";
  } else {
    pumpEl.textContent = "STOPPED (OFF)";
    pumpEl.className = "status-pill off";
  }

  // Update Level Alert (Matches your ESP32 LED thresholds)
  const alertEl = document.getElementById("level-alert");
  if (level <= 30) {
    alertEl.textContent = "LOW LEVEL";
    alertEl.className = "status-pill low";
  } else if (level < 80) {
    alertEl.textContent = "MEDIUM";
    alertEl.className = "status-pill med";
  } else {
    alertEl.textContent = "HIGH / FULL";
    alertEl.className = "status-pill on";
  }

  // Update Overflow Buzzer Status (>= 95%)
  const alarmEl = document.getElementById("alarm-status");
  if (level >= 95) {
    alarmEl.textContent = "OVERFLOW ALARM!";
    alarmEl.className = "status-pill alarm";
  } else {
    alarmEl.textContent = "NORMAL";
    alarmEl.className = "status-pill off";
  }

  // Update Timestamp
  document.getElementById("last-updated").textContent = time;
}

// Fetch immediately on load, then refresh every 5 seconds
fetchTankData();
setInterval(fetchTankData, 5000);
