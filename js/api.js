
const API_URL =
    "https://script.google.com/macros/s/AKfycbyg-CQHqY34Gy2NRAgtaB9q8MPetaFlBCzD-Z2m9uC7fyWNqGhdjH2z0IMflbr-35ms/exec";

// ==============================
// FEEDBACK CACHE
// ==============================

const CACHE_KEY = "feedbackDataCache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 นาที

let feedbackMemoryCache = null;
let feedbackFetchPromise = null;


// ==============================
// อ่าน Cache
// ==============================

function getCachedFeedback() {

    // Memory Cache
    if (feedbackMemoryCache) {
        return feedbackMemoryCache;
    }

    // Session Cache
    try {
        const cached = sessionStorage.getItem(CACHE_KEY);

        if (cached) {
            const parsed = JSON.parse(cached);

            if (parsed && Array.isArray(parsed.data)) {
                feedbackMemoryCache = parsed;
                return parsed;
            }
        }
    } catch (error) {
        console.warn("อ่าน Cache ไม่สำเร็จ:", error);
    }

    return null;
}


// ==============================
// บันทึก Cache
// ==============================

function saveFeedbackCache(data) {

    const cache = {
        data: data,
        timestamp: Date.now()
    };

    feedbackMemoryCache = cache;

    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
        console.warn("บันทึก Cache ไม่สำเร็จ:", error);
    }
}


// ==============================
// ดึงข้อมูลจาก API
// ==============================

async function fetchFeedbackFromAPI() {

    console.log("กำลังเรียก API:", API_URL);

    const response = await fetch(API_URL);

    console.log("API Status:", response.status);

    if (!response.ok) {
        throw new Error("ไม่สามารถเชื่อมต่อ API ได้");
    }

    const result = await response.json();

    console.log("API Result:", result);

    if (!result.success) {
        throw new Error(result.message || "ไม่สามารถดึงข้อมูลได้");
    }

    console.log("จำนวนข้อมูลทั้งหมด:", result.total);

    saveFeedbackCache(result.data);

    return result.data;
}


// ==============================
// GET FEEDBACK DATA
// ==============================

async function getFeedbackData() {

    const cached = getCachedFeedback();

    // มี Cache → ส่งข้อมูลทันที ไม่ต้องรอ
    if (cached) {

        console.log("ใช้ข้อมูลจาก Cache:", cached.data.length, "รายการ");

        // Cache หมดอายุ → อัปเดตเบื้องหลัง
        const isExpired =
            Date.now() - cached.timestamp > CACHE_DURATION;

        if (isExpired) {

            console.log("Cache หมดอายุ กำลังอัปเดตเบื้องหลัง");

            if (!feedbackFetchPromise) {
                feedbackFetchPromise = fetchFeedbackFromAPI()
                    .catch(error => {
                        console.error("อัปเดต Cache ไม่สำเร็จ:", error);
                    })
                    .finally(() => {
                        feedbackFetchPromise = null;
                    });
            }
        }

        return cached.data;
    }

    // ไม่มี Cache → โหลด API ครั้งแรก
    if (!feedbackFetchPromise) {
        feedbackFetchPromise = fetchFeedbackFromAPI();
    }

    try {
        return await feedbackFetchPromise;
    } finally {
        feedbackFetchPromise = null;
    }
}
