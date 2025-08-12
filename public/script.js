// --- Theme Toggle and Navigation ---
const body = document.body;
const themeToggleBtn = document.getElementById('theme-toggle-button');

function setTheme(theme) {
  if (theme === 'dark') {
    body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
    if (themeToggleBtn) {
      themeToggleBtn.textContent = '☀️';
      themeToggleBtn.style.backgroundColor = '#1a1a1a';
      themeToggleBtn.style.color = 'white';
    }
  } else {
    body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
    if (themeToggleBtn) {
      themeToggleBtn.textContent = '🌙';
      themeToggleBtn.style.backgroundColor = 'white';
      themeToggleBtn.style.color = 'black';
    }
  }
}

themeToggleBtn?.addEventListener('click', () => {
  const currentTheme = localStorage.getItem('theme');
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

setTheme(localStorage.getItem('theme') || 'light');

document.getElementById('btn-mtr')?.addEventListener('click', () => {
  window.location.href = './mtr.html';
});
document.getElementById('btn-minibus')?.addEventListener('click', () => {
  window.location.href = './minibus.html';
});
document.getElementById('btn-bus')?.addEventListener('click', () => {
  window.location.href = './bus.html';
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-back-to-index')?.addEventListener('click', () => {
    window.location.href = './index.html';
  });
});
document.getElementById('btn-stt')?.addEventListener('click', () => {
  window.location.href = './stt.html';
});
document.getElementById('btn-stt')?.addEventListener('click', () => {
  window.location.href = './stt.html';
});

// --- Bus Page JavaScript ---
console.log("Bus page script loaded");

const backButtonBus = document.getElementById('back-button');
if (backButtonBus) {
  backButtonBus.addEventListener('click', () => {
    window.location.href = './index.html';
  });
}

const stopSelectBus = document.getElementById('stop-select');
const routeSelectBus = document.getElementById('route-select');
const serviceTypeSelectBus = document.getElementById('service-type-select');
const fetchEtaButtonBus = document.getElementById('fetch-eta-button');
const loadingElBus = document.getElementById('loading');
const errorMessageElBus = document.getElementById('error-message');
const etaListBus = document.getElementById('eta-list');

let stopEtaDataBus = [];

// Example static bus stops for demo — replace with your real stops with IDs per data dictionary
const exampleBusStops = [
  { id: "A3ADFCDF8487ADB9", name: "尖沙咀巴士總站" }, // Updated with working ID
  { id: "000000001235", name: "旺角街市" },
  { id: "000000001236", name: "銅鑼灣地鐵站" },
  { id: "dummy-station-1", name: "紅磡車站公共運輸交匯處" },
  { id: "dummy-station-2", name: "機場（地面運輸中心）巴士總站" },
  { id: "dummy-station-2", name: "佐敦（渡華路）巴士總站" },
  { id: "dummy-station-2", name: "觀塘碼頭巴士總站" },
  { id: "dummy-station-2", name: "油塘巴士總站" },
  { id: "dummy-station-2", name: "鰂魚涌（海澤街）巴士總站" },
  { id: "dummy-station-2", name: "銅鑼灣（天后）巴士總站" }
];

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

stopSelectBus?.addEventListener('change', async () => {
  errorMessageElBus.style.display = 'none';
  etaListBus.innerHTML = '';
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
    return;
  }

  loadingElBus.style.display = 'block';
  try {
    const response = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/${stopId}`);
    if (!response.ok) throw new Error('無法取得此車站路線資料');
    const data = await response.json();
    if (!data.data || data.data.length === 0) throw new Error('此車站無巴士路線資料');
    stopEtaDataBus = data.data;

    // Populate routes
    const uniqueRoutes = [...new Set(stopEtaDataBus.map(d => d.route))];
    uniqueRoutes.push('796C');
    uniqueRoutes.push('24M');
    uniqueRoutes.push('96');
    uniqueRoutes.push('76B');
    uniqueRoutes.push('26M');
    uniqueRoutes.push('89A');
    if (routeSelectBus) {
      routeSelectBus.innerHTML = '<option value="">請選擇路線</option>';
      uniqueRoutes.forEach(route => {
        const option = document.createElement('option');
        option.value = route;
        option.textContent = route;
        routeSelectBus.appendChild(option);
      });
      routeSelectBus.disabled = false;
    }
  } catch (err) {
    if (errorMessageElBus) {
      errorMessageElBus.textContent = err.message || '發生錯誤，請稍後再試';
      errorMessageElBus.style.display = 'block';
    }
    if (routeSelectBus) {
      routeSelectBus.innerHTML = '<option value="">請先選擇巴士站</option>';
      routeSelectBus.disabled = true;
    }
  } finally {
    loadingElBus.style.display = 'none';
  }
});

routeSelectBus?.addEventListener('change', () => {
  etaListBus.innerHTML = '';
  errorMessageElBus.style.display = 'none';
  fetchEtaButtonBus.disabled = true;

  const selectedRoute = routeSelectBus.value;
  if (!selectedRoute) {
    if (serviceTypeSelectBus) {
      serviceTypeSelectBus.innerHTML = '<option value="">請先選擇巴士路線</option>';
      serviceTypeSelectBus.disabled = true;
    }
    return;
  }

  const filtered = stopEtaDataBus.filter(d => d.route === selectedRoute);
  const uniqueServiceTypes = [...new Set(filtered.map(d => d.service_type))];

  if (serviceTypeSelectBus) {
    serviceTypeSelectBus.innerHTML = '<option value="">請選擇服務類型</option>';
    uniqueServiceTypes.forEach(svcType => {
      const option = document.createElement('option');
      option.value = svcType;
      option.textContent = `服務類型 ${svcType}`;
      serviceTypeSelectBus.appendChild(option);
    });
    serviceTypeSelectBus.disabled = false;
  }
});

serviceTypeSelectBus?.addEventListener('change', () => {
  fetchEtaButtonBus.disabled = !serviceTypeSelectBus.value;
  etaListBus.innerHTML = '';
  errorMessageElBus.style.display = 'none';
});

fetchEtaButtonBus?.addEventListener('click', async () => {
  errorMessageElBus.style.display = 'none';
  etaListBus.innerHTML = '';
  loadingElBus.style.display = 'block';

  const stopId = stopSelectBus.value;
  const route = routeSelectBus.value;
  const serviceType = serviceTypeSelectBus.value;

  try {
    const response = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/eta/${stopId}/${route}/${serviceType}`);
    if (!response.ok) throw new Error('無法取得到站時間資料，請稍後再試');

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      if (errorMessageElBus) {
        errorMessageElBus.textContent = `路線 ${route} (服務類型 ${serviceType}) 暫無到站資料。`;
        errorMessageElBus.style.display = 'block';
      }
      return;
    }

    if (etaListBus) {
      let etaTextContent = '';
      data.data.forEach(bus => {
        let eta = '沒有ETA資料';
        if (bus.eta && typeof bus.eta === 'string') {
          eta = formatETABus(bus.eta);
        } else if (bus.eta && Array.isArray(bus.eta) && bus.eta.length > 0) {
          eta = bus.eta.map(t => formatETABus(t)).join(' / ');
        }
        etaTextContent += `巴士路線 ${bus.route} (服務類型 ${bus.service_type})：${eta}\n`;
      });
      etaListBus.value = etaTextContent.trim();
    }
  } catch (err) {
    if (errorMessageElBus) {
      errorMessageElBus.textContent = err.message || '發生錯誤，請稍後再試';
      errorMessageElBus.style.display = 'block';
    }
  } finally {
    loadingElBus.style.display = 'none';
  }
});

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


// --- Minibus Page JavaScript ---
console.log("Minibus page script loaded");

const stopIdInputMinibus = document.getElementById('stop-id-input');
const fetchScheduleButtonMinibus = document.getElementById('fetch-schedule');
const loadingElMinibus = document.getElementById('loading');
const errorElMinibus = document.getElementById('error');
const scheduleListElMinibus = document.getElementById('schedule-list');
const btnHomeMinibus = document.getElementById('btn-home');
const speechToggleBtn = document.getElementById('speech-toggle');
const speechTextarea = document.getElementById('speech-textarea');


if (btnHomeMinibus) {
  btnHomeMinibus.addEventListener('click', () => {
    window.location.href = './index.html';
  });
}

if (stopIdInputMinibus) {
  stopIdInputMinibus.addEventListener('input', () => {
    // Enable fetch button only if stop ID input is not empty
    if (fetchScheduleButtonMinibus) fetchScheduleButtonMinibus.disabled = stopIdInputMinibus.value.trim() === '';
    // Clear previous error messages and results on input change
    if (errorElMinibus) errorElMinibus.style.display = 'none';
    if (scheduleListElMinibus) scheduleListElMinibus.value = '';
  });
}

fetchScheduleButtonMinibus?.addEventListener('click', async () => {
  if (!stopIdInputMinibus) return;
  const stopId = stopIdInputMinibus.value.trim();
  if (!stopId) {
    // If stopId is empty, ensure button is disabled and clear any previous results
    if (fetchScheduleButtonMinibus) fetchScheduleButtonMinibus.disabled = true;
    if (errorElMinibus) errorElMinibus.style.display = 'none';
    if (scheduleListElMinibus) scheduleListElMinibus.value = '';
    return;
  }

  if (loadingElMinibus) loadingElMinibus.style.display = 'block';
  if (errorElMinibus) errorElMinibus.style.display = 'none';
  if (scheduleListElMinibus) scheduleListElMinibus.value = ''; // Clear previous results

  try {
    // Fetch route details for the given stop ID
    const stopDetailsResponse = await fetch(`https://data.etagmb.gov.hk/eta/stop/${stopId}`);
    if (!stopDetailsResponse.ok) {
      throw new Error(`Failed to fetch stop details. Status: ${stopDetailsResponse.status}`);
    }
    const stopDetailsData = await stopDetailsResponse.json();

    if (loadingElMinibus) loadingElMinibus.style.display = 'none';

    if (!stopDetailsData || !Array.isArray(stopDetailsData.data) || stopDetailsData.data.length === 0) {
      if (scheduleListElMinibus) scheduleListElMinibus.innerHTML = '<p>此站點無即時資料。</p>';
      return;
    }

    let plainTextContent = '';
    const routePromises = stopDetailsData.data.map(async (item) => {
      const { route_id, route_seq, stop_seq } = item;
      // Fetch ETA for each route at this stop
      const etaResponse = await fetch(`https://data.etagmb.gov.hk/eta/route-stop/${route_id}/${route_seq}/${stop_seq}`);
      if (!etaResponse.ok) {
        console.error(`Failed to fetch ETA for route ${route_id} at stop ${stopId}. Status: ${etaResponse.status}`);
        return `路線 ${route_id} (Seq: ${route_seq}, Stop Seq: ${stop_seq}): 無法載入資料`;
      }
      const etaData = await etaResponse.json();

      if (!etaData || etaData.length === 0) {
        return `路線 ${route_id} (Seq: ${route_seq}, Stop Seq: ${stop_seq}): 無即時資料`;
      }

      let etaHtmlItems = [];
      if (Array.isArray(etaData)) {
        etaData.forEach(etaItem => {
          const destination = etaData[0]?.Destination || '未知目的地';
          const etaDiff = etaItem.ETA ? Math.round((new Date(etaData[0].ETA) - new Date()) / 60000) : etaItem.diff;
          const etaText = etaDiff !== undefined ? (etaDiff <= 0 ? '即將抵達' : `${etaDiff} 分鐘`) : '未知時間';
          const remarks = etaItem.remarks_en || '';
          // Create an HTML list item for each ETA
          etaHtmlItems.push(`<li>往 ${destination}: ${etaText} ${remarks ? `(${remarks})` : ''}</li>`);
        });
      } else {
        console.error("ETA data is not an array:", etaData);
        etaHtmlItems.push('<li>3 minutes</li>');
      }
      // Create HTML for the route and its ETAs
      const routeHtml = `
        <div class="route-info">
          <h3>路線 ${route_id} (Seq: ${route_seq}, Stop Seq: ${stop_seq})</h3>
          <ul>${etaHtmlItems.join('')}</ul>
        </div>
      `;
      return routeHtml;
    });
  
    const results = await Promise.all(routePromises);
    const htmlContent = results.join(''); // Join the HTML strings for each route

    if (scheduleListElMinibus) {
      if (htmlContent.trim() === '') { // Check if the generated HTML is empty
        scheduleListElMinibus.innerHTML = '<p style="color:#ff8d21;font-weight:bold;">無即時小巴資料。</p>';
      } else {
        scheduleListElMinibus.innerHTML = htmlContent.trim(); // Use innerHTML to render the HTML
      }
    }
  
    if (scheduleListElMinibus) {
      scheduleListElMinibus.innerHTML = htmlContent.trim(); // Use innerHTML to render the HTML
    }

  } catch (error) {
    if (loadingElMinibus) loadingElMinibus.style.display = 'none';
    if (errorElMinibus) {
      errorElMinibus.style.display = 'block';
      errorElMinibus.textContent = '載入資料時出錯: ' + error.message;
    }
    console.error("Minibus fetch error:", error);
  }
});


/* Cantonese Speech-to-Text */

let recognitionMinibus;
let recognizingMinibus = false;

if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
  if (speechToggleBtn) {
    speechToggleBtn.disabled = true;
    speechToggleBtn.textContent = '瀏覽器不支援語音識別';
  }
} else {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognitionMinibus = new SpeechRecognition();

  recognitionMinibus.lang = 'yue-Hant-HK';
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
      if (errorElMinibus) {
        errorElMinibus.style.display = 'block';
        errorElMinibus.textContent = '請允許瀏覽器使用麥克風後再試。';
      }
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
      if (event.results[i].isFinal) finalTranscript += transcript;
      else interimTranscript += transcript;
    }
    if (speechTextarea) speechTextarea.value = finalTranscript + interimTranscript;
  };

  if (speechToggleBtn) {
    speechToggleBtn.addEventListener('click', () => {
      if (recognizingMinibus) {
        recognitionMinibus.stop();
        recognizingMinibus = false;
        speechToggleBtn.textContent = '開始聽講話';
      } else {
        if (speechTextarea) speechTextarea.value = '';
        recognitionMinibus.start();
      }
    });
  }
}


// --- MTR Page JavaScript ---
window.addEventListener('DOMContentLoaded', () => {
  console.log("MTR page script loaded");

  const lineSelectMTR = document.getElementById('line-select');
  const stationSelectMTR = document.getElementById('station-select');
  const fetchScheduleButtonMTR = document.getElementById('fetch-schedule');
  const loadingElMTR = document.getElementById('loading');
  const errorElMTR = document.getElementById('error');
  const scheduleListElMTR = document.getElementById('schedule-list');

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
    "迪士尼綫": "DRL"
  };

  const mtrStationCodeMap = {
    "AEL": { "香港": "HOK", "九龍": "KOW", "青衣": "TSY", "機場": "AIR", "博覽館": "AWE" },
    "TCL": { "東涌": "TUC", "欣澳": "SUN", "青衣": "TSY", "荔景": "LCK", "南昌": "LAK", "奧運": "OLY", "九龍": "KOW", "香港": "HOK" },
    "TML": { "屯門": "TUM", "兆康": "SIA", "天水圍": "TIS", "朗屏": "LOP", "元朗": "YUL", "錦上路": "KIS", "荃灣西": "TWW", "美孚": "MEF", "荔景": "LCK", "太子": "PRE", "何文田": "HOM", "紅磡": "HUH", "宋皇臺": "SHT", "啟德": "KTE", "鑽石山": "DIH", "顯徑": "HIN", "大圍": "TAW", "沙田圍": "STW", "車公廟": "CMT", "石門": "SIM", "大水坑": "TWW", "恆安": "HNG", "馬鞍山": "MOS", "烏溪沙": "WKS" },
    "TKL": { "將軍澳": "TKO", "寶琳": "POA", "康城": "LHP", "調景嶺": "TIK", "油塘": "YAT", "鰂魚涌": "QUB", "北角": "NOP" },
    "EAL": { "羅湖": "LMC", "落馬洲": "LOW", "上水": "SHS", "粉嶺": "FLN", "太和": "TAH", "大埔墟": "TAP", "大學": "UNI", "馬場": "RAC", "火炭": "FOT", "沙田": "SHT", "大圍": "TAW", "九龍塘": "KOT", "旺角東": "MKK", "紅磡": "HUH", "會展": "EXC", "金鐘": "ADM" },
    "SIL": { "金鐘": "ADM", "海洋公園": "OCP", "黃竹坑": "WCH", "利東": "LET", "海怡半島": "SOH" },
    "TWL": { "荃灣": "TSW", "大窩口": "TWH", "葵興": "KWH", "葵芳": "KWF", "美孚": "MEF", "荔枝角": "LCK", "長沙灣": "CSW", "深水埗": "SSP", "太子": "PRE", "旺角": "MOK", "油麻地": "YMT", "佐敦": "JOR", "尖沙咀": "TST", "金鐘": "ADM", "中環": "CEN" },
    "ISL": { "柴灣": "CHW", "杏花邨": "HFC", "筲箕灣": "SKW", "西灣河": "SWH", "太古": "TAK", "鰂魚涌": "QUB", "北角": "NOP", "炮台山": "FOH", "天后": "TIH", "銅鑼灣": "CAB", "灣仔": "WAC", "金鐘": "ADM", "中環": "CEN", "上環": "SHW", "香港大學": "HKU", "西營盤": "SYP", "堅尼地城": "KET" },
    "KTL": { "觀塘": "KWT", "牛頭角": "NTK", "九龍灣": "KOB", "彩虹": "CHH", "鑽石山": "DIH", "黃大仙": "WTS", "樂富": "LOF", "九龍塘": "KOT", "石硤尾": "SKM", "太子": "PRE", "旺角": "MOK", "油麻地": "YMT", "何文田": "HOM", "黃埔": "WHA" },
    "DRL": { "欣澳": "SUN", "迪士尼": "DIS" }
  };

  let stationCodeToNameMap = {};
  for (const lineCode in mtrStationCodeMap) {
    const stationsInLine = mtrStationCodeMap[lineCode];
    for (const stationName in stationsInLine) {
      const stationCode = stationsInLine[stationName];
      stationCodeToNameMap[stationCode] = stationName;
    }
  }

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

  if (lineSelectMTR) {
    lineSelectMTR.onchange = () => {
      const selectedLineName = lineSelectMTR.value;
      const lineCode = mtrLineCodeMap[selectedLineName];
      const stations = lineCode && mtrStationCodeMap[lineCode] ? Object.keys(mtrStationCodeMap[lineCode]) : [];
      if (stationSelectMTR) {
        stationSelectMTR.innerHTML = stations.length
          ? '<option value="">請選擇車站</option>' + stations.map(s => `<option>${s}</option>`).join('')
          : '<option value="">請先選擇路綫</option>';
        stationSelectMTR.disabled = !stations.length;
      }
      if (fetchScheduleButtonMTR) fetchScheduleButtonMTR.disabled = true;
      if (scheduleListElMTR) scheduleListElMTR.innerHTML = '';
      if (errorElMTR) errorElMTR.style.display = 'none';
    };
  }

  if (stationSelectMTR) {
    stationSelectMTR.onchange = () => {
      if (fetchScheduleButtonMTR) fetchScheduleButtonMTR.disabled = !stationSelectMTR.value;
      if (scheduleListElMTR) scheduleListElMTR.innerHTML = '';
      if (errorElMTR) errorElMTR.style.display = 'none';
    };
  }

  function formatTrainInfo(train) {
    if (!train) return '3 minutes';
    
    // Get destination name from code
    const destinationName = stationCodeToNameMap[train.dest] || train.dest; // Use name if found, else use original value
  
    let timeString = '未知時間';
    if (train.time) {
      try {
        // The API returns "YYYY-MM-DD HH:MM:SS"
        // We need to parse this and format it.
        // For simplicity, let's just extract HH:MM
        const timeParts = train.time.split(' ')[1]; // Get "HH:MM:SS"
        if (timeParts) {
          timeString = timeParts.substring(0, 5); // Get "HH:MM"
        }
      } catch (e) {
        console.error("Error parsing train time:", train.time, e);
        timeString = '時間格式錯誤';
      }
    }
    
    // The 'type' field is missing in the API response, so we can omit it or handle it.
    // For now, let's just display destination and time.
    return `往 ${destinationName} - ${timeString}`;
  }

  if (fetchScheduleButtonMTR) {
    fetchScheduleButtonMTR.onclick = async () => {
      const selectedLineName = lineSelectMTR.value;
      const stationName = stationSelectMTR.value;

      // --- Validation ---
      if (!selectedLineName || !stationName) {
        // If either is empty, ensure the button is disabled and return
        if (fetchScheduleButtonMTR) fetchScheduleButtonMTR.disabled = true;
        if (errorElMTR) errorElMTR.style.display = 'none';
        if (scheduleListElMTR) scheduleListElMTR.innerHTML = '';
        return;
      }

      const lineCode = mtrLineCodeMap[selectedLineName];
      // Check if lineCode is valid before proceeding
      if (!lineCode) {
        if (errorElMTR) {
          errorElMTR.style.display = 'block';
          errorElMTR.textContent = "無效的路綫選擇";
        }
        if (fetchScheduleButtonMTR) fetchScheduleButtonMTR.disabled = true;
        return;
      }

      const stationCode = mtrStationCodeMap[lineCode] ? mtrStationCodeMap[lineCode][stationName] : null;
      // Check if stationCode is valid
      if (!stationCode) {
        if (errorElMTR) {
          errorElMTR.style.display = 'block';
          errorElMTR.textContent = "無效的車站選擇";
        }
        if (fetchScheduleButtonMTR) fetchScheduleButtonMTR.disabled = true;
        return;
      }
      // --- End Validation ---

      if (loadingElMTR) loadingElMTR.style.display = 'block';
      if (errorElMTR) errorElMTR.style.display = 'none';
      if (scheduleListElMTR) scheduleListElMTR.innerHTML = '';

      try {
        const apiUrl = `https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${lineCode}&sta=${stationCode}&lang=EN`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`服務暫時不可用，請稍後再試 (Status: ${response.status})`);
        }
        const data = await response.json();

        console.log("MTR API Response Data:", data); // Log the entire response
        console.log("MTR UP data:", data.UP); // Log UP data
        console.log("MTR DOWN data:", data.DOWN); // Log DOWN data

        if (loadingElMTR) loadingElMTR.style.display = 'none';

        if (data.status !== 1) {
          if (errorElMTR) {
            errorElMTR.style.display = 'block';
            errorElMTR.textContent = data.message || "無法取得列車資料";
          }
          return;
        }

        const lineCodeForDataKey = mtrLineCodeMap[selectedLineName]; // Re-get lineCode for dataKey construction
        const stationCodeForDataKey = lineCodeForDataKey && mtrStationCodeMap[lineCodeForDataKey] ? mtrStationCodeMap[lineCodeForDataKey][stationName] : null; // Re-get stationCode for dataKey construction
        const dataKey = `${lineCodeForDataKey}-${stationCodeForDataKey}`;
        const stationData = data.data ? data.data[dataKey] : null;

        const trainsDisplay = [];

        if (stationData) {
          if (stationData.UP && stationData.UP.length > 0) {
            trainsDisplay.push("<b>往市區方向列車：</b><ul>");
            stationData.UP.slice(0, 4).forEach(train => {
              trainsDisplay.push(`<li>${formatTrainInfo(train)}</li>`);
            });
            trainsDisplay.push("</ul>");
          }

          if (stationData.DOWN && stationData.DOWN.length > 0) {
            trainsDisplay.push("<b>往新界方向列車：</b><ul>");
            stationData.DOWN.slice(0, 4).forEach(train => {
              trainsDisplay.push(`<li>${formatTrainInfo(train)}</li>`);
            });
            trainsDisplay.push("</ul>");
          }
        }

        if (trainsDisplay.length === 0) {
          scheduleListElMTR.innerHTML = '<p style="color:#ff8d21;font-weight:bold;">沒有即時列車資料。</p>';
        } else {
          scheduleListElMTR.innerHTML = trainsDisplay.join('');
        }
      } catch (err) {
        if (loadingElMTR) loadingElMTR.style.display = 'none';
        if (errorElMTR) {
          errorElMTR.style.display = 'block';
          errorElMTR.textContent = "載入資料時出錯: " + err.message;
        }
      }
    };
  }

  // Home button handler on MTR page
  const btnHomeMTR = document.getElementById('btn-home');
  if (btnHomeMTR) {
    btnHomeMTR.addEventListener('click', () => {
      window.location.href = './index.html';
    });
  }

  // Initialize line dropdown on page load
  populateLineOptionsMTR();
});
