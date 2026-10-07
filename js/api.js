/* ==========================================
   API URL
========================================== */

const API = {

    WEBAPP: "https://feedback-api.feedbackqsnich.workers.dev"

};

/* ==========================================
   Fetch
========================================== */

async function api(action, data = {}) {

    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, 30000);

    try {

        const response = await fetch(API.WEBAPP, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action,
                ...data
            }),
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`เซิร์ฟเวอร์ตอบกลับผิดพลาด (${response.status})`);
        }

        return await response.json();

    } catch (err) {

        if (err.name === "AbortError") {
            throw new Error("การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง");
        }

        throw err;

    } finally {

        clearTimeout(timeout);

    }
}

/* ==========================================
   Preload Departments
========================================== */

let departmentsPromise = null;

async function preloadDepartments() {

    // ถ้ามีข้อมูลแล้ว ไม่ต้องเรียก API
    if (departments.length) {
        return departments;
    }

    // ถ้ามี request กำลังโหลดอยู่ ให้รอ request เดิม
    if (departmentsPromise) {
        return departmentsPromise;
    }

    departmentsPromise = api("getLocationData")
        .then(result => {

            departments = result.departments || [];

            return departments;

        })
        .catch(err => {

            console.error(err);

            departmentsPromise = null;

            throw err;

        });

    return departmentsPromise;
}

/* ==========================================
   Upload Image
========================================== */

async function uploadImage(base64, mimeType) {

    return await api("uploadImage", {

        base64,

        mimeType

    });

}

/* ==========================================
   Save Feedback
========================================== */

async function saveFeedback(data) {

    return await api("saveFeedback", {

        data

    });

}