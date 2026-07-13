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

    const response = await fetch(API.WEBAPP, {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            action,

            ...data

        })

    });

    return await response.json();

}

/* ==========================================
   Preload Departments
========================================== */

async function preloadDepartments() {

    if (departments.length) return;

    try {

        const result = await api("getLocationData");

        departments = result.departments || [];

    }

    catch (err) {

        console.error(err);

    }

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