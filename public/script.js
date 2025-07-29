// --- Theme Toggle and Navigation (from existing script.js) ---
const body = document.body;
const themeToggleBtn = document.getElementById('theme-toggle-button');

// Function to set the theme
function setTheme(theme) {
  if (theme === 'dark') {
    body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
    themeToggleBtn.textContent = '☀️'; // Change button text to sun for light mode
    themeToggleBtn.style.backgroundColor = '#1a1a1a'; // Dark gray to match page background
    themeToggleBtn.style.color = 'white'; // White text for dark button
  } else { // theme === 'light'
    body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
    themeToggleBtn.textContent = '🌙'; // Change button text to moon for dark mode
    themeToggleBtn.style.backgroundColor = 'white'; // White for light mode button
    themeToggleBtn.style.color = 'black'; // Black text for white button
  }
}

// Event listener for the theme toggle button
themeToggleBtn?.addEventListener('click', () => {
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'dark') {
    setTheme('light');
  } else {
    setTheme('dark');
  }
});

// Apply the saved theme on page load
const savedTheme = localStorage.getItem('theme');
setTheme(savedTheme || 'light'); // Default to light if no theme is saved

// Navigation listeners from index.html
document.getElementById('btn-mtr')?.addEventListener('click', () => {
  window.location.href = '/home/applejuice/team-c-deaf-project/public/mtr.html';
});

document.getElementById('btn-minibus')?.addEventListener('click', () => {
  window.location.href = '/home/applejuice/team-c-deaf-project/public/minibus.html';
});
document.getElementById('btn-bus')?.addEventListener('click', () => {
  window.location.href = '/home/applejuice/team-c-deaf-project/public/bus.html';
});


// --- Bus Page JavaScript (from public/bus.html) ---
console.log("Bus page script loaded"); // For debugging

const backButtonBus = document.getElementById('back-button');
if (backButtonBus) {
  backButtonBus.addEventListener('click', () => {
    window.location.href = '/home/applejuice/team-c-deaf-project/public/index.html';
  });
}

const stopSelectBus = document.getElementById('stop-select');
const routeSelectBus = document.getElementById('route-select');
const serviceTypeSelectBus = document.getElementById('service-type-select');
const fetchEtaButtonBus = document.getElementById('fetch-eta-button');
const loadingElBus = document.getElementById('loading');
const errorMessageElBus = document.getElementById('error-message');
const etaListBus = document.getElementById('eta-list');

let stopEtaDataBus = []; // to store fetched route and service type data for selected stop

// Example static list of bus stops - update with real data if available
const exampleBusStops = [
  { id: "000000001234", name: "尖沙咀巴士總站" },
  { id: "000000001235", name: "旺角街市" },
  { id: "000000001236", name: "銅鑼灣地鐵站" }
];

// Populate bus stops dropdown
function populateStopsBus() {
  if (stopSelectBus) {
    exampleBusStops.forEach(stop => {
      const option = document.createElement('option');
      option.value = stop.id;
      option.textContent = stop.name;
      stopSelectBus.appendChild(option);
    });
  }
}
populateStopsBus();

// When a stop is selected, fetch available bus routes and service types for that stop
if (stopSelectBus) {
  stopSelectBus.addEventListener('change', async () => {
    if (errorMessageElBus) errorMessageElBus.style.display = 'none';
    if (etaListBus) etaListBus.innerHTML = '';
    if (fetchEtaButtonBus) fetchEtaButtonBus.disabled = true;
    if (serviceTypeSelectBus) {
      serviceTypeSelectBus.innerHTML = '<option value="">請先選擇巴士路線</option>';
      serviceTypeSelectBus.disabled = true;
    }
    if (routeSelectBus) {
      routeSelectBus.innerHTML = '<option value="">載入中...</option>';
      routeSelectBus.disabled = true;
    }

    const stopId = stopSelectBus.value;
    if (!stopId) {
      if (routeSelectBus) {
        routeSelectBus.innerHTML = '<option value="">請先選擇巴士站</option>';
        routeSelectBus.disabled = true;
      }
      if (serviceTypeSelectBus) {
        serviceTypeSelectBus.innerHTML = '<option value="">請先選擇巴士路線</option>';
        serviceTypeSelectBus.disabled = true;
      }
      return;
    }

    if (loadingElBus) loadingElBus.style.display = 'block';
    try {
      const response = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/${stopId}`);
      if (!response.ok) throw new Error('無法取得此車站路線資料');
      const data = await response.json();
      if (!data.data || data.data.length === 0) {
        throw new Error('此車站無巴士路線資料');
      }
      stopEtaDataBus = data.data;
      populateRoutesBus(stopEtaDataBus);
      if (loadingElBus) loadingElBus.style.display = 'none';
      if (routeSelectBus) routeSelectBus.disabled = false;
    } catch (err) {
      if (loadingElBus) loadingElBus.style.display = 'none';
      if (errorMessageElBus) errorMessageElBus.textContent = err.message || '發生錯誤，請稍後再試。';
      if (errorMessageElBus) errorMessageElBus.style.display = 'block';
      if (routeSelectBus) {
        routeSelectBus.innerHTML = '<option value="">請先選擇巴士站</option>';
        routeSelectBus.disabled = true;
      }
      if (serviceTypeSelectBus) {
        serviceTypeSelectBus.innerHTML = '<option value="">請先選擇巴士路線</option>';
        serviceTypeSelectBus.disabled = true;
      }
    }
  });
}

// Populate route dropdown from fetched data
function populateRoutesBus(data) {
  if (routeSelectBus) {
    routeSelectBus.innerHTML = '<option value="">請選擇路線</option>';
    const uniqueRoutes = new Set();
    data.forEach(item => {
      if (item.route && !uniqueRoutes.has(item.route)) {
        uniqueRoutes.add(item.route);
        const option = document.createElement('option');
        option.value = item.route;
        option.textContent = item.route;
        routeSelectBus.appendChild(option);
      }
    });
  }

  if (serviceTypeSelectBus) {
    serviceTypeSelectBus.innerHTML = '<option value="">請先選擇巴士路線</option>';
    serviceTypeSelectBus.disabled = true;
  }
  if (fetchEtaButtonBus) fetchEtaButtonBus.disabled = true;
}

// When route changes, populate service type dropdown
if (routeSelectBus) {
  routeSelectBus.addEventListener('change', () => {
    const selectedRoute = routeSelectBus.value;
    if (etaListBus) etaListBus.innerHTML = '';
    if (errorMessageElBus) errorMessageElBus.style.display = 'none';

    if (!selectedRoute) {
      if (serviceTypeSelectBus) {
        serviceTypeSelectBus.innerHTML = '<option value="">請先選擇巴士路線</option>';
        serviceTypeSelectBus.disabled = true;
      }
      if (fetchEtaButtonBus) fetchEtaButtonBus.disabled = true;
      return;
    }

    const filtered = stopEtaDataBus.filter(item => item.route === selectedRoute);

    if (serviceTypeSelectBus) {
      serviceTypeSelectBus.innerHTML = '<option value="">請選擇服務類型</option>';
      const uniqueServiceTypes = new Set();
      filtered.forEach(item => {
        if (item.service_type && !uniqueServiceTypes.has(item.service_type)) {
          uniqueServiceTypes.add(item.service_type);
          const option = document.createElement('option');
          option.value = item.service_type;
          option.textContent = `服務類型 ${item.service_type}`;
          serviceTypeSelectBus.appendChild(option);
        }
      });
    }

    if (serviceTypeSelectBus) serviceTypeSelectBus.disabled = false;
    if (fetchEtaButtonBus) fetchEtaButtonBus.disabled = true;
  });
}

// Enable the fetch button only if service type selected
if (serviceTypeSelectBus) {
  serviceTypeSelectBus.addEventListener('change', () => {
    if (fetchEtaButtonBus) fetchEtaButtonBus.disabled = !serviceTypeSelectBus.value;
    if (etaListBus) etaListBus.innerHTML = '';
    if (errorMessageElBus) errorMessageElBus.style.display = 'none';
  });
}

// Fetch & Display ETA using the new API given all selections
if (fetchEtaButtonBus) {
  fetchEtaButtonBus.addEventListener('click', async () => {
    if (errorMessageElBus) errorMessageElBus.style.display = 'none';
    if (etaListBus) etaListBus.innerHTML = '';
    if (loadingElBus) loadingElBus.style.display = 'block';

    const stopId = stopSelectBus.value;
    const route = routeSelectBus.value;
    const serviceType = serviceTypeSelectBus.value;

    try {
      const response = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/eta/${stopId}/${route}/${serviceType}`);
      if (!response.ok) throw new Error('無法取得到站時間資料，請稍後再試。');
      const data = await response.json();

      if (loadingElBus) loadingElBus.style.display = 'none';

      if (!data.data || data.data.length === 0) {
        if (errorMessageElBus) errorMessageElBus.textContent = `路線 ${route} (服務類型 ${serviceType}) 暫無到站資料。`;
        if (errorMessageElBus) errorMessageElBus.style.display = 'block';
        return;
      }

      if (etaListBus) etaListBus.innerHTML = '';
      data.data.forEach(bus => {
        const li = document.createElement('li');
        const etaText = (bus.eta && bus.eta.length > 0)
          ? bus.eta.map(t => formatETABus(t)).join(' / ')
          : '沒有ETA資料';
        li.textContent = `巴士路線 ${bus.route} (服務類型 ${bus.service_type})：${etaText}`;
        etaListBus.appendChild(li);
      });
    } catch (err) {
      if (loadingElBus) loadingElBus.style.display = 'none';
      if (errorMessageElBus) errorMessageElBus.textContent = err.message || '發生錯誤，請稍後再試。';
      if (errorMessageElBus) errorMessageElBus.style.display = 'block';
    }
  });
}

// Format ETA time string as minutes from now, or 即將到站 if due soon
function formatETABus(isoStr) {
  if (!isoStr) return '未知';
  const etaDate = new Date(isoStr);
  if (isNaN(etaDate)) return '未知';
  const now = new Date();
  const diffMs = etaDate - now;
  if (diffMs <= 0) return '即將到站';
  const diffMins = Math.round(diffMs / 60000);
  return `${diffMins} 分鐘後`;
}


// --- Minibus Page JavaScript (from public/minibus.html) ---
console.log("Minibus page script loaded"); // For debugging

const stopIdInputMinibus = document.getElementById('stop-id-input');
const fetchScheduleButtonMinibus = document.getElementById('fetch-schedule');
const loadingElMinibus = document.getElementById('loading');
const errorElMinibus = document.getElementById('error');
const scheduleListElMinibus = document.getElementById('schedule-list');
const btnHomeMinibus = document.getElementById('btn-home');
const speechToggleBtn = document.getElementById('speech-toggle');
const speechTextarea = document.getElementById('speech-textarea');

// Back button click handler
if (btnHomeMinibus) {
  btnHomeMinibus.addEventListener('click', () => {
    window.location.href = '/home/applejuice/team-c-deaf-project/public/index.html';
  });
}

// Enable fetch button only when stop ID is not empty
if (stopIdInputMinibus) {
  stopIdInputMinibus.addEventListener('input', () => {
    if (fetchScheduleButtonMinibus) fetchScheduleButtonMinibus.disabled = stopIdInputMinibus.value.trim() === '';
    if (errorElMinibus) errorElMinibus.style.display = 'none';
    if (scheduleListElMinibus) scheduleListElMinibus.innerHTML = '';
  });
}

// Fetch minibus ETA info
if (fetchScheduleButtonMinibus) {
  fetchScheduleButtonMinibus.addEventListener('click', async () => {
    const stopId = stopIdInputMinibus.value.trim();
    if (!stopId) return;

    if (loadingElMinibus) loadingElMinibus.style.display = 'block';
    if (errorElMinibus) errorElMinibus.style.display = 'none';
    if (scheduleListElMinibus) scheduleListElMinibus.innerHTML = '';

    try {
      const url = `https://data.etagmb.gov.hk/eta/stop/${encodeURIComponent(stopId)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();

      if (loadingElMinibus) loadingElMinibus.style.display = 'none';

      // Assuming data is an array of minibuses arriving at the stop
      if (!data || !Array.isArray(data) || data.length === 0) {
        if (scheduleListElMinibus) scheduleListElMinibus.innerHTML = '<p>沒有即時資料。</p>';
        return;
      }

      let html = '<ul>';
      data.forEach(item => {
        const route = item.Route || item.route || '未知路線';
        const dest = item.Destination || item.destination || '未知目的地';
        const eta = item.EstimateTime || item.ETA || item.estimatedTime || '未知時間';

        let etaText;
        if (typeof eta === 'number') {
          if (eta <= 0) {
            etaText = '即將抵達';
          } else {
            etaText = `${Math.round(eta / 60)} 分鐘後抵達`;
          }
        } else {
          etaText = eta;
        }

        html += `<li><strong>路線：</strong>${route}<br><strong>目的地：</strong>${dest}<br><strong>預計到達時間：</strong>${etaText}</li>`;
      });
      html += '</ul>';

      if (scheduleListElMinibus) scheduleListElMinibus.innerHTML = html;

    } catch (error) {
      if (loadingElMinibus) loadingElMinibus.style.display = 'none';
      if (errorElMinibus) {
        errorElMinibus.style.display = 'block';
        errorElMinibus.textContent = '載入資料時出錯: ' + error.message;
      }
    }
  });
}

/* ----------------------- */
/* Cantonese Speech-to-Text */
/* ----------------------- */

let recognitionMinibus; 
let recognizingMinibus = false; 

// Check for browser support
if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
  if (speechToggleBtn) speechToggleBtn.disabled = true;
  if (speechToggleBtn) speechToggleBtn.textContent = '瀏覽器不支援語音識別';
} else {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognitionMinibus = new SpeechRecognition();

  recognitionMinibus.lang = 'yue-Hant-HK'; // Cantonese (Hong Kong)
  recognitionMinibus.continuous = true;
  recognitionMinibus.interimResults = true;

  recognitionMinibus.onstart = () => {
    recognizingMinibus = true;
    if (speechToggleBtn) speechToggleBtn.textContent = '停止聆聽';
    if (errorElMinibus) errorElMinibus.style.display = 'none';
  };

  recognitionMinibus.onerror = (event) => {
    console.error('語音識別錯誤:', event.error);
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      if (errorElMinibus) errorElMinibus.style.display = 'block';
      if (errorElMinibus) errorElMinibus.textContent = '請允許瀏覽器使用麥克風後再試。';
    }
  };

  recognitionMinibus.onend = () => {
    recognizingMinibus = false;
    if (speechToggleBtn) speechToggleBtn.textContent = '開始聽講話';
  };

  recognitionMinibus.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }
    if (speechTextarea) speechTextarea.value = finalTranscript + interimTranscript;
  };

  if (speechToggleBtn) {
    speechToggleBtn.addEventListener('click', () => {
      if (recognizingMinibus) {
        recognitionMinibus.stop();
        recognizingMinibus = false;
        if (speechToggleBtn) speechToggleBtn.textContent = '開始聽講話';
      } else {
        if (speechTextarea) speechTextarea.value = '';
        recognitionMinibus.start();
      }
    });
  }
}


// --- MTR Page JavaScript (from public/mtr.html) ---
console.log("MTR page script loaded"); // For debugging

const lineSelectMTR = document.getElementById('line-select');
const stationSelectMTR = document.getElementById('station-select');
const fetchScheduleButtonMTR = document.getElementById('fetch-schedule');
const loadingElMTR = document.getElementById('loading');
const errorElMTR = document.getElementById('error');
const scheduleListElMTR = document.getElementById('schedule-list');

// Mapping from display line names (Chinese) to API line codes
const mtrLineCodeMap = {
  "機場快綫": "AEL",
  "東涌綫": "TCL",
  "屯馬綫": "TML",
  "將軍澳綫": "TKL",
  "東鐵綫": "EAL",
  "南港島綫": "SIL",
  "荃灣綫": "TWL",
  "港島綫": "ISL",
  "觀塘綫": "KTL",
  "迪士尼綫": "DRL",
};

// Complete mapping station names per line to station codes from Data Dictionary v1.7

const mtrStationCodeMap = {
  "AEL": { // Airport Express Line
    "香港": "HOK",
    "九龍": "KOW",
    "青衣": "TSY",
    "機場": "AIR",
    "博覽館": "AWE"
  },
  "TCL": { // Tung Chung Line
    "東涌": "TUC",
    "欣澳": "SUN",
    "青衣": "TSY",
    "荔景": "LCK",
    "南昌": "LAK",
    "奧運": "OLY",
    "九龍": "KOW",
    "香港": "HOK"
  },
  "TML": { // Tuen Ma Line
    "屯門": "TUM",
    "兆康": "SIA",
    "天水圍": "TIS",
    "朗屏": "LOP",
    "元朗": "YUL",
    "錦上路": "KIS",
    "荃灣西": "TWW",
    "美孚": "MEF",
    "荔景": "LCK",
    "太子": "PRE",
    "何文田": "HOM",
    "紅磡": "HUH",
    "宋皇臺": "SHT",
    "啟德": "KTE",
    "鑽石山": "DIH",
    "顯徑": "HIN",
    "大圍": "TAW",
    "沙田圍": "STW",
    "車公廟": "CMT",
    "石門": "SIM",
    "大水坑": "TWW",
    "恆安": "HNG",
    "馬鞍山": "MOS",
    "烏溪沙": "WKS"
  },
  "TKL": { // Tseung Kwan O Line
    "將軍澳": "TKO",
    "寶琳": "POA",
    "康城": "LHP",
    "調景嶺": "TIK",
    "油塘": "YAT",
    "鰂魚涌": "QUB",
    "北角": "NOP"
  },
  "EAL": { // East Rail Line
    "羅湖": "LMC",
    "落馬洲": "LOW",
    "上水": "SHS",
    "粉嶺": "FLN",
    "太和": "TAH",
    "大埔墟": "TAP",
    "大學": "UNI",
    "馬場": "RAC",
    "火炭": "FOT",
    "沙田": "SHT",
    "大圍": "TAW",
    "九龍塘": "KOT",
    "旺角東": "MKK",
    "紅磡": "HUH",
    "會展": "EXC",
    "金鐘": "ADM"
  },
  "SIL": { // South Island Line
    "金鐘": "ADM",
    "海洋公園": "OCP",
    "黃竹坑": "WCH",
    "利東": "LET",
    "海怡半島": "SOH"
  },
  "TWL": { // Tsuen Wan Line
    "荃灣": "TSW",
    "大窩口": "TWH",
    "葵興": "KWH",
    "葵芳": "KWF",
    "美孚": "MEF",
    "荔枝角": "LCK",
    "長沙灣": "CSW",
    "深水埗": "SSP",
    "太子": "PRE",
    "旺角": "MOK",
    "油麻地": "YMT",
    "佐敦": "JOR",
    "尖沙咀": "TST",
    "金鐘": "ADM",
    "中環": "CEN"
  },
  "ISL": { // Island Line
    "柴灣": "CHW",
    "杏花邨": "HFC",
    "筲箕灣": "SKW",
    "西灣河": "SWH",
    "太古": "TAK",
    "鰂魚涌": "QUB",
    "北角": "NOP",
    "炮台山": "FOH",
    "天后": "TIH",
    "銅鑼灣": "CAB",
    "灣仔": "WAC",
    "金鐘": "ADM",
    "中環": "CEN",
    "上環": "SHW",
    "香港大學": "HKU",
    "西營盤": "SYP",
    "堅尼地城": "KET"
  },
  "KTL": { // Kwun Tong Line
    "觀塘": "KWT",
    "牛頭角": "NTK",
    "九龍灣": "KOB",
    "彩虹": "CHH",
    "鑽石山": "DIH",
    "黃大仙": "WTS",
    "樂富": "LOF",
    "九龍塘": "KOT",
    "石硤尾": "SKM",
    "太子": "PRE",
    "旺角": "MOK",
    "油麻地": "YMT",
    "何文田": "HOM",
    "黃埔": "WHA"
  },
  "DRL": { // Disneyland Resort Line
    "欣澳": "SUN",
    "迪士尼": "DIS"
  }
};

// Populate line options on page load
function populateLineOptionsMTR() {
  if (lineSelectMTR) {
    lineSelectMTR.innerHTML = '<option value="">請選擇路綫</option>';
    for (const lineName in mtrLineCodeMap) {
      const option = document.createElement('option');
      option.value = lineName;
      option.textContent = lineName;
      lineSelectMTR.appendChild(option);
    }
  }
}

// Populate stations when line changes
if (lineSelectMTR) {
  lineSelectMTR.onchange = () => {
    const selectedLineName = lineSelectMTR.value;
    const lineCode = mtrLineCodeMap[selectedLineName];
    const stations = lineCode && mtrStationCodeMap[lineCode] ? Object.keys(mtrStationCodeMap[lineCode]) : [];

    if (stationSelectMTR) {
      stationSelectMTR.innerHTML = stations.length
        ? '<option value="">請選擇車站</option>' + stations.map(s => `<option>${s}</option>`).join("")
        : '<option value="">請先選擇路綫</option>';
      stationSelectMTR.disabled = !stations.length;
    }
    if (fetchScheduleButtonMTR) fetchScheduleButtonMTR.disabled = true;
    if (scheduleListElMTR) scheduleListElMTR.innerHTML = '';
    if (errorElMTR) errorElMTR.style.display = 'none';
  };
}

// Enable fetch button when station selected
if (stationSelectMTR) {
  stationSelectMTR.onchange = () => {
    if (fetchScheduleButtonMTR) fetchScheduleButtonMTR.disabled = !stationSelectMTR.value;
    if (scheduleListElMTR) scheduleListElMTR.innerHTML = '';
    if (errorElMTR) errorElMTR.style.display = 'none';
  };
}

// Fetch and display next train info from Next Train API
if (fetchScheduleButtonMTR) {
  fetchScheduleButtonMTR.onclick = async () => {
    const selectedLineName = lineSelectMTR.value;
    const stationName = stationSelectMTR.value;
    if (!selectedLineName || !stationName) return;
    if (loadingElMTR) loadingElMTR.style.display = "block";
    if (errorElMTR) errorElMTR.style.display = "none";
    if (scheduleListElMTR) scheduleListElMTR.innerHTML = "";

    const lineCode = mtrLineCodeMap[selectedLineName];
    const stationCode = lineCode && mtrStationCodeMap[lineCode] ? mtrStationCodeMap[lineCode][stationName] : null;

    if (!lineCode || !stationCode) {
      if (loadingElMTR) loadingElMTR.style.display = "none";
      if (errorElMTR) {
        errorElMTR.style.display = "block";
        errorElMTR.textContent = "無效的路綫或車站代碼";
      }
      return;
    }

    try {
      const apiUrl = `https://rt.data.gov.hk/v1/transport/mtr/nextTrain?line=${lineCode}&sta=${stationCode}&lang=EN`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("服務暫時不可用，請稍後再試");
      const data = await response.json();

      if (loadingElMTR) loadingElMTR.style.display = "none";

      if (data.status !== 1 || (!data.UP && !data.DOWN)) {
        if (errorElMTR) {
          errorElMTR.style.display = "block";
          errorElMTR.textContent = data.message || "無法取得列車資料";
        }
        return;
      }

      const trainsDisplay = [];

      // Helper to format train info
      function formatTrainInfo(train) {
        const plat = train.plat ? `月台 ${train.plat}` : '';
        const time = train.time ? train.time.replace('T', ' ').substring(0, 19) : '未知時間';
        const dest = train.dest || '';
        return `${plat} - 目的地: ${dest} - 預計到達時間: ${time}`;
      }

      if (data.UP && data.UP.length > 0) {
        trainsDisplay.push("<b>往上行方向列車：</b><ul>");
        data.UP.forEach((train, idx) => {
          if (idx >= 4) return;
          trainsDisplay.push(`<li>${formatTrainInfo(train)}</li>`);
        });
        trainsDisplay.push("</ul>");
      }

      if (data.DOWN && data.DOWN.length > 0) {
        trainsDisplay.push("<b>往下行方向列車：</b><ul>");
        data.DOWN.forEach((train, idx) => {
          if (idx >= 4) return;
          trainsDisplay.push(`<li>${formatTrainInfo(train)}</li>`);
        });
        trainsDisplay.push("</ul>");
      }

      scheduleListElMTR.innerHTML = trainsDisplay.length > 0 ? trainsDisplay.join('') : "<p>沒有即時列車資料。</p>";

    } catch (err) {
      if (loadingElMTR) loadingElMTR.style.display = "none";
      if (errorElMTR) {
        errorElMTR.style.display = "block";
        errorElMTR.textContent = "載入資料時出錯: " + err.message;
      }
    }
  };
}

populateLineOptionsMTR();

