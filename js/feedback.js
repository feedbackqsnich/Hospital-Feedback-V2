// ==============================
// FEEDBACK ALL PAGE
// ==============================

let allFeedbackData = [];

// ==============================
// CACHE ปีงบประมาณร่วมกับ Dashboard
// ==============================

const FISCAL_YEAR_CACHE_KEY = "selectedFiscalYear";

function getCachedFiscalYear() {
    return localStorage.getItem(FISCAL_YEAR_CACHE_KEY) || "all";
}

function saveCachedFiscalYear(year) {
    localStorage.setItem(FISCAL_YEAR_CACHE_KEY, year);
}

let currentCategory = "all";
let currentFiscalYear = "all";
let currentSearch = "";
let currentPage = 1;

const ITEMS_PER_PAGE = 20;


// ==============================
// เริ่มต้นหน้า
// ==============================

document.addEventListener("DOMContentLoaded", async () => {
    const searchInput = document.getElementById("feedbackSearch");
    const yearFilter = document.getElementById("feedbackYearFilter");
    const feedbackListContainer = document.getElementById("feedbackFullList");
    const feedbackCountElement = document.getElementById("feedbackResultsCount");
    const pagination = document.getElementById("feedbackPagination");

    // Loading state
    if (feedbackListContainer) {
        feedbackListContainer.innerHTML = `
        <div class="dashboard-loading">
            <span class="loading-spinner"></span>
            <span>กำลังโหลดข้อมูล...</span>
        </div>`;
    }

    if (pagination) pagination.innerHTML = "";

    try {
        allFeedbackData = await getFeedbackData();
        console.log("Feedback page data:", allFeedbackData);

        // รับค่าจาก URL
        const params = new URLSearchParams(window.location.search);
        const urlYear = params.get("year");
        const urlCategory = params.get("category");

        // เลือกปีจาก URL ก่อน ถ้าไม่มีใช้ Cache ล่าสุด
        const cachedYear = getCachedFiscalYear();

        const initialYear =
            urlYear &&
                yearFilter &&
                yearFilter.querySelector(`option[value="${urlYear}"]`)
                ? urlYear
                : cachedYear;

        if (
            yearFilter &&
            yearFilter.querySelector(`option[value="${initialYear}"]`)
        ) {
            currentFiscalYear = initialYear;
            yearFilter.value = initialYear;
        }

        // ถ้าปีมาจาก URL ให้บันทึกเป็นค่าล่าสุดด้วย
        if (urlYear && currentFiscalYear === urlYear) {
            saveCachedFiscalYear(urlYear);
        }

        if (["all", "compliment", "suggestion", "complaint"].includes(urlCategory)) {
            currentCategory = urlCategory;
        }

        updateCategoryButtons();
        renderFeedbackList();

        // ค้นหา
        if (searchInput) {
            searchInput.addEventListener("input", () => {
                currentSearch = searchInput.value.trim();
                currentPage = 1;
                renderFeedbackList();
            });
        }

        // เปลี่ยนปีงบประมาณ + บันทึก Cache ร่วมกับ Dashboard
        if (yearFilter) {
            yearFilter.addEventListener("change", () => {
                currentFiscalYear = yearFilter.value;

                saveCachedFiscalYear(currentFiscalYear);

                currentPage = 1;
                updateURL();
                renderFeedbackList();
            });
        }

        // ปุ่มประเภทความคิดเห็น
        document.querySelectorAll(".feedback-filter-btn").forEach(button => {
            button.addEventListener("click", () => {
                currentCategory = button.dataset.category || "all";
                currentPage = 1;

                updateCategoryButtons();
                updateURL();
                renderFeedbackList();
            });
        });

    } catch (error) {
        console.error("โหลดความคิดเห็นไม่สำเร็จ:", error);

        if (feedbackListContainer) {
            feedbackListContainer.innerHTML = `
                <div class="feedback-empty">
                    โหลดข้อมูลไม่สำเร็จ กรุณาลองรีเฟรชหน้าอีกครั้ง
                </div>`;
        }

        if (feedbackCountElement) {
            feedbackCountElement.textContent = "ไม่สามารถโหลดข้อมูลได้";
        }

        if (pagination) pagination.innerHTML = "";
    }
});


// ==============================
// กรองปีงบประมาณ
// ==============================

function feedbackFilterByFiscalYear(data, fiscalYear) {
    if (fiscalYear === "all") return data;

    return data.filter(item => {
        if (!item.Timestamp) return false;

        const date = new Date(item.Timestamp);
        if (isNaN(date.getTime())) return false;

        const parts = new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "numeric",
            timeZone: "Asia/Bangkok"
        }).formatToParts(date);

        const year = Number(
            parts.find(part => part.type === "year")?.value
        );

        const month = Number(
            parts.find(part => part.type === "month")?.value
        );

        const thaiFiscalYear = month >= 10
            ? year + 544
            : year + 543;

        return thaiFiscalYear === Number(fiscalYear);
    });
}


// ==============================
// ประเภทความคิดเห็น
// ==============================

function feedbackGetCategoryLabel(category) {
    const value = String(category || "").trim().toLowerCase();

    if (value.includes("compliment") || value.includes("ชม")) {
        return "คำชม";
    }

    if (value.includes("suggestion") || value.includes("เสนอ")) {
        return "ข้อเสนอแนะ";
    }

    if (value.includes("complaint") || value.includes("ร้องเรียน")) {
        return "ข้อร้องเรียน";
    }

    return "ไม่ระบุประเภท";
}

function feedbackGetTypeClass(category) {
    const label = feedbackGetCategoryLabel(category);

    if (label === "คำชม") return "type-compliment";
    if (label === "ข้อเสนอแนะ") return "type-suggestion";
    if (label === "ข้อร้องเรียน") return "type-complaint";

    return "type-other";
}


// ==============================
// Escape HTML
// ==============================

function feedbackEscapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}


// ==============================
// จัดข้อความความคิดเห็น
// เก็บบรรทัดต้นฉบับ แต่ตัดช่องว่าง/ย่อหน้าเกิน
// ==============================

function feedbackCleanDetail(value) {
    return String(value || "ไม่มีรายละเอียด")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .split("\n")
        .map(line => line.trim())
        .filter(line => line !== "")
        .join("\n")
        .trim();
}


// ==============================
// ค้นหาข้อมูลรูปภาพแนบ
// รองรับ field รูปภาพหลายรูปแบบ
// ==============================

function feedbackGetImageUrls(item) {
    const urls = [];

    // 1. อ่าน Image Drive ID จาก Google Sheet โดยตรง
    const driveIdValue = item["Image Drive ID"];

    if (driveIdValue) {
        const ids = Array.isArray(driveIdValue)
            ? driveIdValue
            : String(driveIdValue)
                .split(/[\n,]+/)
                .map(id => id.trim())
                .filter(Boolean);

        ids.forEach(id => {
            // ถ้าเป็น URL อยู่แล้ว ให้ใช้ URL เดิม
            if (/^https?:\/\//i.test(id)) {
                urls.push(id);
            } else {
                // ถ้าเป็น Google Drive ID ให้แปลงเป็น URL รูปภาพ
                urls.push(
                    `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1200`
                );
            }
        });
    }

    // 2. รองรับฟิลด์ URL รูปแบบอื่น เผื่อข้อมูลเก่าที่มีอยู่
    const possibleFields = [
        "Image", "Images",
        "Photo", "Photos",
        "Picture", "Pictures",
        "Attachment", "Attachments",
        "ImageURL", "ImageUrl", "imageUrl",
        "PhotoURL", "PhotoUrl", "photoUrl",
        "AttachmentURL", "AttachmentUrl",
        "FileURL", "FileUrl",
        "image", "images", "photo", "photos",
        "attachment", "attachments"
    ];

    function collect(value) {
        if (!value) return;

        if (typeof value === "string") {
            const text = value.trim();
            if (!text) return;

            // URL โดยตรง
            if (/^https?:\/\//i.test(text)) {
                urls.push(text);
                return;
            }

            // JSON string
            if (
                (text.startsWith("[") && text.endsWith("]")) ||
                (text.startsWith("{") && text.endsWith("}"))
            ) {
                try {
                    collect(JSON.parse(text));
                } catch (e) {
                    // ข้ามข้อมูลที่ไม่ใช่ JSON
                }
            }

            return;
        }

        if (Array.isArray(value)) {
            value.forEach(collect);
            return;
        }

        if (typeof value === "object") {
            const urlKeys = [
                "url", "URL", "src", "link",
                "imageUrl", "ImageUrl", "ImageURL",
                "fileUrl", "FileUrl", "FileURL"
            ];

            for (const key of urlKeys) {
                if (value[key]) {
                    collect(value[key]);
                    return;
                }
            }
        }
    }

    possibleFields.forEach(field => {
        if (item[field]) {
            collect(item[field]);
        }
    });

    // 3. ตัด URL ซ้ำ
    return [...new Set(urls)];
}


// ==============================
// วันที่และเวลา
// ==============================

function feedbackFormatDateTime(timestamp) {
    if (!timestamp) return "-";

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "-";

    const dateText = new Intl.DateTimeFormat("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Bangkok"
    }).format(date);

    const timeText = new Intl.DateTimeFormat("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Bangkok"
    }).format(date);

    return `${dateText} ${timeText} น.`;
}


// ==============================
// อัปเดตปุ่ม Filter
// ==============================

function updateCategoryButtons() {
    document.querySelectorAll(".feedback-filter-btn").forEach(button => {
        const active = button.dataset.category === currentCategory;

        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
    });
}


// ==============================
// อัปเดต URL
// ==============================

function updateURL() {
    const params = new URLSearchParams();

    params.set("year", currentFiscalYear);
    params.set("category", currentCategory);

    window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`
    );
}

// ==============================
// กรองและแสดงรายการ
// ==============================

function renderFeedbackList() {
    const container = document.getElementById("feedbackFullList");
    const countElement = document.getElementById("feedbackResultsCount");

    if (!container) return;

    // 1. กรองปีงบประมาณ
    let filtered = feedbackFilterByFiscalYear(
        allFeedbackData,
        currentFiscalYear
    );

    // 2. กรองประเภท
    if (currentCategory !== "all") {
        filtered = filtered.filter(item =>
            feedbackGetCategoryLabel(item.Category) ===
            feedbackGetCategoryLabel(currentCategory)
        );
    }

    // 3. กรองคำค้น
    if (currentSearch) {
        const searchLower = currentSearch.toLowerCase();

        filtered = filtered.filter(item => {
            const searchableText = [
                item.Department,
                item.Building,
                item.Floor,
                item.Detail,
                item.Category
            ].join(" ").toLowerCase();

            return searchableText.includes(searchLower);
        });
    }

    // 4. เรียงใหม่ล่าสุด
    filtered = filtered
        .filter(item =>
            item.Timestamp &&
            !isNaN(new Date(item.Timestamp).getTime())
        )
        .sort((a, b) =>
            new Date(b.Timestamp) - new Date(a.Timestamp)
        );

    // 5. จำนวนทั้งหมด
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    // ป้องกัน currentPage เกินจำนวนหน้าหลัง Filter
    currentPage = Math.max(
        1,
        Math.min(currentPage, totalPages || 1)
    );

    // 6. แสดงข้อมูลตามหน้าปัจจุบัน
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    const visibleItems = filtered.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    // แสดงจำนวนความคิดเห็น
    if (countElement) {
        countElement.textContent =
            `พบ ${totalCount.toLocaleString("th-TH")} รายการ`;
    }

    // 7. กรณีไม่พบข้อมูล
    if (!visibleItems.length) {
        container.innerHTML = `
            <div class="feedback-empty">
                ไม่พบความคิดเห็นที่ตรงกับเงื่อนไข
            </div>
        `;

        renderFeedbackPagination(totalCount);
        return;
    }

    // 8. Render cards
    container.innerHTML = visibleItems.map(item => {
        const categoryLabel = feedbackGetCategoryLabel(item.Category);
        const categoryClass = feedbackGetTypeClass(item.Category);
        const dateTime = feedbackFormatDateTime(item.Timestamp);

        const department = String(
            item.Department || "ไม่ระบุหน่วยงาน"
        ).trim();

        const building = String(item.Building || "").trim();
        const floor = String(item.Floor || "").trim();

        const isParking =
            /ลานจอดรถ/.test(department) ||
            /ลานจอดรถ/.test(building);

        let locationLine = "";

        if (!isParking) {
            const locationParts = [];

            if (floor) {
                locationParts.push(`ชั้น ${floor}`);
            }

            if (building) {
                locationParts.push(building);
            }

            locationLine = locationParts.join(" ");
        }

        const detail = feedbackCleanDetail(item.Detail);
        const imageUrls = feedbackGetImageUrls(item);
        const hasImages = imageUrls.length > 0;

        return `
            <article class="feedback-full-item">

                <div class="feedback-item-header">

                    <span class="feedback-type ${categoryClass}">
                        ${feedbackEscapeHTML(categoryLabel)}
                    </span>

                    <span class="feedback-date">
                        ${feedbackEscapeHTML(dateTime)}
                    </span>

                </div>

                <div class="feedback-department">
                    ${feedbackEscapeHTML(department)}
                </div>

                ${locationLine ? `
                    <div class="feedback-location">
                        ${feedbackEscapeHTML(locationLine)}
                    </div>
                ` : ""}

                <div class="feedback-full-detail" style="${!locationLine ? 'margin-top: 4px !important;' : ''}">${feedbackEscapeHTML(detail.trim())}</div>

                ${hasImages ? `
                    <button
                        type="button"
                        class="feedback-image-banner"
                        data-image-urls="${feedbackEscapeHTML(JSON.stringify(imageUrls))}"
                        aria-label="คลิกเพื่อดูรูปภาพที่แนบ"
                    >
                        <span class="feedback-image-banner-icon">▧</span>
                        <span>
    <strong>มีรูปภาพแนบ</strong>
    <small>คลิกเพื่อดู</small>
</span>
                        <span class="feedback-image-banner-arrow">›</span>
                    </button>
                ` : ""}

            </article>
        `;
    }).join("");

    // คลิก Banner รูปภาพ เพื่อเปิดดูรูป
    container.querySelectorAll(".feedback-image-banner").forEach(button => {
        button.addEventListener("click", () => {
            let imageUrls = [];

            try {
                imageUrls = JSON.parse(button.dataset.imageUrls || "[]");
            } catch (error) {
                console.error("อ่านข้อมูลรูปภาพไม่สำเร็จ", error);
            }

            if (imageUrls.length) {
                openFeedbackImageModal(imageUrls);
            }
        });
    });

    // 9. แสดง Pagination
    renderFeedbackPagination(totalCount);
}


// ==============================
// PAGINATION
// ==============================

function renderFeedbackPagination(totalCount) {
    const pagination = document.getElementById("feedbackPagination");

    if (!pagination) return;

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    if (totalPages <= 1) {
        pagination.innerHTML = "";
        return;
    }

    let pages = [];

    if (totalPages <= 5) {
        pages = Array.from(
            { length: totalPages },
            (_, i) => i + 1
        );

    } else {
        pages = [1];

        if (currentPage > 3) {
            pages.push("...");
        }

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let page = start; page <= end; page++) {
            pages.push(page);
        }

        if (currentPage < totalPages - 2) {
            pages.push("...");
        }

        pages.push(totalPages);
    }

    pagination.innerHTML = `
        <button
            type="button"
            class="pagination-btn pagination-prev"
            data-page="${currentPage - 1}"
            ${currentPage === 1 ? "disabled" : ""}
            aria-label="หน้าก่อนหน้า"
        >‹</button>

        ${pages.map(page => page === "..."
        ? `<span class="pagination-ellipsis">...</span>`
        : `
                <button
                    type="button"
                    class="pagination-btn ${page === currentPage ? "active" : ""}"
                    data-page="${page}"
                    ${page === currentPage ? 'aria-current="page"' : ""}
                >${page}</button>
            `
    ).join("")}

        <button
            type="button"
            class="pagination-btn pagination-next"
            data-page="${currentPage + 1}"
            ${currentPage === totalPages ? "disabled" : ""}
            aria-label="หน้าถัดไป"
        >›</button>
    `;

    pagination.querySelectorAll("button[data-page]").forEach(button => {
        button.addEventListener("click", () => {
            const page = Number(button.dataset.page);

            if (
                page < 1 ||
                page > totalPages ||
                page === currentPage
            ) {
                return;
            }

            currentPage = page;
            renderFeedbackList();
            containerScrollTop();
        });
    });
}


function containerScrollTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ==============================
// IMAGE-ONLY MODAL
// ==============================

function openFeedbackImageModal(imageUrls) {
    const modal = document.getElementById("feedbackDetailModal");
    const content = document.getElementById("feedbackModalContent");
    const title = document.getElementById("feedbackModalTitle");

    if (!modal || !content) return;

    // เปลี่ยนหัว Modal
    if (title) {
        title.textContent = "รูปภาพที่แนบ";
    }

    // แสดงเฉพาะรูป ไม่แสดงข้อความความคิดเห็น
    content.innerHTML = `
        <div class="feedback-image-modal-gallery">
            ${imageUrls.map(url => `
                <img
                    src="${feedbackEscapeHTML(url)}"
                    class="feedback-image-modal-img"
                    alt="รูปภาพประกอบความคิดเห็น"
                    loading="lazy"
                >
            `).join("")}
        </div>
    `;

    modal.hidden = false;
    document.body.style.overflow = "hidden";
}


// ==============================
// ปิด Popup
// ==============================

function closeFeedbackModal() {
    const modal = document.getElementById("feedbackDetailModal");
    const title = document.getElementById("feedbackModalTitle");

    if (!modal) return;

    modal.hidden = true;
    document.body.style.overflow = "";

    // คืนชื่อ Modal เดิม
    if (title) {
        title.textContent = "รายละเอียดความคิดเห็น";
    }
}


// ==============================
// ตั้งค่าปุ่มปิด Popup
// ==============================

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("feedbackDetailModal");
    const closeButton = document.getElementById("feedbackModalClose");
    const backdrop = document.querySelector(".feedback-modal-backdrop");

    if (closeButton) {
        closeButton.addEventListener("click", closeFeedbackModal);
    }

    if (backdrop) {
        backdrop.addEventListener("click", closeFeedbackModal);
    }

    // ปิดด้วยปุ่ม ESC
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && modal && !modal.hidden) {
            closeFeedbackModal();
        }
    });
});