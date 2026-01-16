window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const targetUrl = urlParams.get('target');

    if (targetUrl) {
        // ถ้ามีเป้าหมาย ให้เริ่มกระบวนการหลอน
        startNightmare(targetUrl);
    }
};

function generateLink() {
    let originalUrl = document.getElementById('originalUrl').value.trim();
    if (!originalUrl) return alert("ใส่ลิงก์ก่อนเพื่อน!");
    if (!originalUrl.startsWith('http')) originalUrl = 'https://' + originalUrl;

    const encodedUrl = btoa(originalUrl);
    const host = window.location.href.split('?')[0];
    // URL parameter หลอกๆ ให้ดูน่ากลัว
    const creepyLink = `${host}?fatal_error=0x882&session_hijack=true&target=${encodedUrl}`;

    document.getElementById('creepyOutput').value = creepyLink;
    document.getElementById('resultBox').style.display = 'flex';
}


function startNightmare(encodedTarget) {
    // 1. ปิดหน้าสร้าง เปิดหน้าหลอน
    document.getElementById('generatorPage').style.display = 'none';
    const overlay = document.getElementById('prankOverlay');
    overlay.style.display = 'flex';

    const audio = document.getElementById("alarmSound");
    audio.volume = 1.0;

    // ***สำคัญ*** Browser สมัยใหม่จะไม่เล่นเสียงจนกว่า User จะมี Interaction
    // เราเลยดักจับการคลิกครั้งแรก เพื่อเปิดเสียง + บังคับ Fullscreen
    let hasInteracted = false;
    document.body.addEventListener('click', function() {
        if (!hasInteracted) {
            audio.play();
            // พยายามบังคับ Fullscreen (บาง Browser ยอม)
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
            hasInteracted = true;
        }
    });
    // เผื่อฟลุ๊ค Browser เก่าๆ ยอมให้เล่นเลย
    try { audio.play(); } catch(e) { console.log("Waiting for click to play audio"); }


    // 2. ดึงข้อมูลจริงที่น่ากลัวกว่า IP (รุ่นเครื่อง + แบตเตอรี่)
    // ข้อมูลรุ่นเครื่อง
    const userAgent = navigator.userAgent;
    let deviceText = "UNKNOWN DEVICE";
    if(userAgent.includes("iPhone")) deviceText = "APPLE iPHONE";
    else if(userAgent.includes("iPad")) deviceText = "APPLE iPAD";
    else if(userAgent.includes("Android")) deviceText = "ANDROID DEVICE";
    else if(userAgent.includes("Windows")) deviceText = "WINDOWS PC";
    else if(userAgent.includes("Mac")) deviceText = "MACINTOSH";
    document.getElementById('deviceInfo').innerText = deviceText + " [COMPROMISED]";

    // ข้อมูลแบตเตอรี่ (หลอนมาก เพราะมันตรงกับเครื่องเหยื่อจริงๆ)
    if ('getBattery' in navigator) {
        navigator.getBattery().then(function(battery) {
            updateBatteryInfo(battery);
            battery.addEventListener('levelchange', () => updateBatteryInfo(battery));
        });
    } else {
        document.getElementById('batteryLevel').innerText = "UNKNOWN (DRAINING RAPIDLY)";
    }

    // 3. นับถอยหลังสู่ความตาย (แล้ว Redirect)
    let count = 5;
    const countNum = document.getElementById('countdownNumber');
    let realUrl = atob(encodedTarget);

    const interval = setInterval(() => {
        count--;
        countNum.innerText = count;
        
        // ยิ่งเวลายิ่งน้อย จอยิ่งสั่นแรง
        if(count < 3) {
             overlay.style.animation = "shakeHard 0.1s infinite, bgStrobe 0.05s infinite";
        }

        if (count <= 0) {
            clearInterval(interval);
            // ออกจาก Fullscreen ก่อนไป (เผื่อไว้)
            if (document.exitFullscreen) { document.exitFullscreen(); }
            window.location.href = realUrl; // ไปสู่สุคติ (เว็บปลายทาง)
        }
    }, 1000);
}

function updateBatteryInfo(battery) {
    const level = Math.round(battery.level * 100);
    const status = battery.charging ? "CHARGING" : "DISCHARGING FAST";
    document.getElementById('batteryLevel').innerText = `${level}% [${status}]`;
}

function copyToClipboard() {
    const copyText = document.getElementById("creepyOutput");
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    alert("ก๊อปแล้ว! เอาไปเชือดได้เลย");
}