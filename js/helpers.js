/* ==========================================
   Helper
========================================== */

window.$ = id => document.getElementById(id);

/* ==========================================
   Scroll
========================================== */

function scrollTopPage() {

    requestAnimationFrame(() => {

        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

    });

}

function scrollToElement(element) {

    if (!element) return;

    requestAnimationFrame(() => {

        const y =
            element.getBoundingClientRect().top +
            window.pageYOffset -
            100;

        window.scrollTo({

            top: Math.max(0, y),
            behavior: "auto"

        });

    });

}

/* ==========================================
   Device
========================================== */

function getDevice() {

    const ua = navigator.userAgent;

    if (/Android/i.test(ua)) return "Android";
    if (/iPhone|iPad|iPod/i.test(ua)) return "iPhone";
    if (/Windows/i.test(ua)) return "Windows";
    if (/Macintosh/i.test(ua)) return "Mac";

    return "Unknown";

}

/* ==========================================
   Browser
========================================== */

function getBrowser() {

    const ua = navigator.userAgent;

    if (ua.includes("Edg")) return "Edge";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";

    return "Unknown";

}

/* ==========================================
   Base64
========================================== */

function fileToBase64(file) {

    return new Promise((resolve, reject) => {

        if (!file) {

            resolve("");
            return;

        }

        const reader = new FileReader();

        reader.onload = e =>
            resolve(e.target.result.split(",")[1]);

        reader.onerror = reject;

        reader.readAsDataURL(file);

    });

}