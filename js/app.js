/* ==========================================
   Welcome
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    $("logo").src = CONFIG.LOGO_URL;

    $("appName").textContent = CONFIG.APP_NAME;

    $("hospitalName").textContent = CONFIG.HOSPITAL_NAME;

    $("credit").innerHTML =
        `${CONFIG.HOSPITAL_NAME}<br>
        Version ${CONFIG.VERSION} | พ.ศ. ${CONFIG.YEAR}`;

    preloadDepartments();

});

el.startButton.addEventListener("click", () => {

    el.welcomePage.style.display = "none";

    el.categoryPage.style.display = "block";

    scrollTopPage();

});

/* ==========================================
   Category Back
========================================== */

$("backButton").addEventListener("click", () => {

    $("categoryPage").style.display = "none";

    $("welcomePage").style.display = "block";

    scrollTopPage();

});

/* ==========================================
   Category
========================================== */

const cards = document.querySelectorAll(".category-card");

cards.forEach(card => {

    card.addEventListener("click", () => {

        const newCategory = card.dataset.value;

        if (
            feedback.category &&
            feedback.category !== newCategory
        ) {

            feedback.detail = "";
            feedback.imageFile = null;
            feedback.imageDriveId = "";
            feedback.imageFileName = "";
            feedback.imageSize = 0;

            $("detailText").value = "";
            $("detailCounter").textContent = "0 / 2000";

            resetImage();

        }

        cards.forEach(c =>
            c.classList.remove("selected")
        );

        card.classList.add("selected");

        feedback.category = newCategory;

        el.nextButton.disabled = false;

    });

});

/* ==========================================
   Category Next
========================================== */

el.nextButton.addEventListener("click", () => {

    feedback.buildingId = "";
    feedback.buildingName = "";
    feedback.floor = "";
    feedback.department = "";

    resetLocationState();

    el.buildingSelect.value = "";

    const locationTitle = $("locationPage").querySelector("h2");
    const locationDescription = $("locationPage").querySelector("p");

    switch (feedback.category) {

        case "compliment":

            locationTitle.textContent =
                "เลือกสถานที่ที่ต้องการชื่นชม";

            locationDescription.textContent =
                "กรุณาเลือกอาคาร และคลินิก หน่วยงาน หรือจุดที่ท่านต้องการชื่นชม";

            break;

        case "suggestion":

            locationTitle.textContent =
                "เลือกสถานที่ที่ต้องการเสนอแนะแนวทาง";

            locationDescription.textContent =
                "กรุณาเลือกอาคาร และคลินิก หน่วยงาน หรือจุดที่ท่านต้องการเสนอแนะ";

            break;

        case "complaint":

            locationTitle.textContent =
                "เลือกสถานที่ที่ต้องการร้องเรียน";

            locationDescription.textContent =
                "กรุณาเลือกอาคาร และคลินิก หน่วยงาน หรือจุดที่ท่านต้องการร้องเรียน";

            break;

        default:

            locationTitle.textContent =
                "เลือกสถานที่ที่ต้องการแสดงความคิดเห็น";

            locationDescription.textContent =
                "กรุณาเลือกอาคาร และคลินิก หน่วยงาน หรือจุดที่ท่านต้องการแสดงความคิดเห็น";

    }

    loadBuildings();

});

async function loadBuildings() {

    await preloadDepartments();

    resetLocationState();

    el.categoryPage.style.display = "none";

    el.locationPage.style.display = "block";

    el.buildingSelect.innerHTML =
        `<option value="">-- กรุณาเลือกอาคาร --</option>`;

    buildings.forEach(item => {

        el.buildingSelect.insertAdjacentHTML(
            "beforeend",
            `<option value="${item.id}">${item.name}</option>`
        );

    });

}

/* ==========================================
   Building Change
========================================== */

el.buildingSelect.addEventListener("change", function () {

    feedback.buildingId = this.value;
    feedback.buildingName = "";
    feedback.floor = "";
    feedback.department = "";

    $("buildingError").style.display = "none";
    $("floorError").style.display = "none";
    $("departmentError").style.display = "none";

    $("buildingSelect").classList.remove("input-error");
    $("floorContainer").classList.remove("input-error");

    $("otherDepartmentGroup").style.display = "none";
    $("otherDepartment").value = "";
    $("otherDepartmentError").style.display = "none";
    $("otherDepartment").classList.remove("input-error");

    el.floorContainer.replaceChildren();
    el.departmentContainer.replaceChildren();

    el.floorSection.style.display = "none";
    el.departmentSection.style.display = "none";

    if (!feedback.buildingId) return;

    feedback.buildingName =
        this.options[this.selectedIndex].text;

    if (feedback.buildingId === "5") {

        feedback.department = feedback.buildingName;

        return;

    }

    const floors = [...new Set(

        departments
            .filter(d =>
                String(d.buildingId) === String(feedback.buildingId))
            .map(d => d.floor)

    )].sort((a, b) => Number(a) - Number(b));

    if (!floors.length) return;

    floors.forEach(floor => {

        const card = document.createElement("div");

        card.className = "floor-card";

        card.textContent = `ชั้น ${floor}`;

        card.onclick = function () {

            document
                .querySelectorAll(".floor-card")
                .forEach(c => c.classList.remove("selected"));

            this.classList.add("selected");

            feedback.floor = floor;
            feedback.department = "";

            $("floorError").style.display = "none";
            $("departmentError").style.display = "none";

            $("floorContainer").classList.remove("input-error");

            $("otherDepartmentGroup").style.display = "none";
            $("otherDepartment").value = "";
            $("otherDepartmentError").style.display = "none";
            $("otherDepartment").classList.remove("input-error");

            el.departmentContainer.replaceChildren();

            renderDepartments(

                departments.filter(d =>

                    String(d.buildingId) === String(feedback.buildingId) &&
                    String(d.floor) === String(floor)

                )

            );

            el.departmentSection.style.display = "block";

        };

        el.floorContainer.appendChild(card);

    });

    el.floorSection.style.display = "block";

});

/* ==========================================
   Create Department Card
========================================== */

function createDepartmentCard(dep) {

    const card = document.createElement("div");

    card.className = "department-card";

    card.innerHTML = `
        <div class="department-name">${dep.name}</div>
        <div class="department-check">✓</div>
    `;

    card.onclick = () => {

        document
            .querySelectorAll(".department-card")
            .forEach(c => c.classList.remove("selected"));

        card.classList.add("selected");

        feedback.department = dep.name;

        $("departmentError").style.display = "none";

        $("otherDepartmentGroup").style.display = "none";

        $("otherDepartment").value = "";

        $("otherDepartmentError").style.display = "none";

        $("otherDepartment").classList.remove("input-error");

    };

    return card;

}

/* ==========================================
   Create Other Department Card
========================================== */

function createOtherDepartmentCard() {

    const card = document.createElement("div");

    card.className = "department-card";

    card.innerHTML = `
        <div class="department-name">อื่น ๆ</div>
        <div class="department-check">✓</div>
    `;

    card.onclick = () => {

        document
            .querySelectorAll(".department-card")
            .forEach(c => c.classList.remove("selected"));

        card.classList.add("selected");

        feedback.department = "";

        $("departmentError").style.display = "none";

        $("otherDepartmentGroup").style.display = "block";

        $("otherDepartment").value = "";

        $("otherDepartmentError").style.display = "none";

        $("otherDepartment").classList.remove("input-error");

        scrollToElement($("otherDepartment"));

    };

    return card;

}

/* ==========================================
   Render Departments
========================================== */

function renderDepartments(list) {

    const container = el.departmentContainer;

    container.replaceChildren();

    if (!list.length) {

        container.textContent = "ไม่พบหน่วยงาน";

        return;

    }

    const groups = {};

    list.forEach(dep => {

        (groups[dep.floor] ??= []).push(dep);

    });

    const fragment = document.createDocumentFragment();

    Object.keys(groups)
        .sort((a, b) => Number(a) - Number(b))
        .forEach(floor => {

            const group = document.createElement("div");

            group.className = "floor-group";

            const title = document.createElement("div");

            title.className = "floor-title";

            title.textContent = `ชั้น ${floor}`;

            group.appendChild(title);

            groups[floor].forEach(dep => {

                group.appendChild(
                    createDepartmentCard(dep)
                );

            });

            fragment.appendChild(group);

        });

    fragment.appendChild(
        createOtherDepartmentCard()
    );

    container.appendChild(fragment);

}

/* ==========================================
   Other Department
========================================== */

const otherDepartment = $("otherDepartment");

otherDepartment.addEventListener("input", function () {

    this.value = this.value.replace(/^\s+/, "");

    feedback.department = this.value.trim();

    $("otherDepartmentError").style.display = "none";

    this.classList.remove("input-error");

});

otherDepartment.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {

        e.preventDefault();

        $("locationNextButton").click();

    }

});

/* ==========================================
   Location Back
========================================== */

$("locationBackButton").addEventListener("click", () => {

    resetLocationState();

    el.buildingSelect.value = "";

    $("locationPage").style.display = "none";

    $("categoryPage").style.display = "block";

    scrollTopPage();

});

/* ==========================================
   Location Next
========================================== */

el.locationNextButton.addEventListener("click", () => {

    $("buildingError").style.display = "none";
    $("floorError").style.display = "none";
    $("departmentError").style.display = "none";
    $("otherDepartmentError").style.display = "none";

    $("buildingSelect").classList.remove("input-error");
    $("floorContainer").classList.remove("input-error");
    $("otherDepartment").classList.remove("input-error");

    if (!feedback.buildingId) {

        $("buildingError").style.display = "block";

        $("buildingSelect").classList.add("input-error");

        scrollToElement($("buildingSelect"));

        return;

    }

    if (feedback.buildingId === "5") {

        feedback.department = feedback.buildingName;

    } else {

        if (!feedback.floor) {

            $("floorError").style.display = "block";

            $("floorContainer").classList.add("input-error");

            scrollToElement($("floorSection"));

            return;

        }

        if ($("otherDepartmentGroup").style.display !== "none") {

            const other = $("otherDepartment").value.trim();

            if (!other) {

                $("otherDepartmentError").style.display = "block";

                $("otherDepartment").classList.add("input-error");

                scrollToElement($("otherDepartment"));

                return;

            }

            feedback.department = other;

        }

        if (!feedback.department) {

            $("departmentError").style.display = "block";

            scrollToElement($("departmentContainer"));

            return;

        }

    }

    const categoryMap = {

        compliment: {
            title: "รายละเอียดคำชม",
            description: "กรุณาระบุรายละเอียดคำชมของท่าน",
            label: "รายละเอียดคำชม",
            placeholder: "เช่น เจ้าหน้าที่ให้บริการดี พูดจาสุภาพ เอาใจใส่ผู้รับบริการ",
            summary: "🟢 คำชม",
            color: "#2E7D32"
        },

        suggestion: {
            title: "รายละเอียดข้อเสนอแนะ",
            description: "กรุณาระบุข้อเสนอแนะของท่าน",
            label: "รายละเอียดข้อเสนอแนะ",
            placeholder: "เช่น ควรเพิ่มที่นั่งรอ เพิ่มช่องบริการ หรือปรับปรุงขั้นตอน",
            summary: "🟡 ข้อเสนอแนะ",
            color: "#F9A825"
        },

        complaint: {
            title: "รายละเอียดข้อร้องเรียน",
            description: "กรุณาระบุรายละเอียดปัญหาที่พบ",
            label: "รายละเอียดข้อร้องเรียน",
            placeholder: "เช่น เจ้าหน้าที่พูดจาไม่สุภาพ รอนาน หรือได้รับบริการไม่เหมาะสม",
            summary: "🔴 ข้อร้องเรียน",
            color: "#C62828"
        }

    };

    const info = categoryMap[feedback.category];

    $("summaryCard").className =
        "summary-card " + feedback.category;

    $("detailTitle").textContent = info.title;

    $("detailTitle").style.color = info.color;

    $("detailDescription").textContent =
        info.description;

    $("detailLabel").innerHTML =
        `${info.label} <span style="color:#D32F2F;">*</span>`;

    $("detailText").placeholder =
        info.placeholder;

    $("summaryCategory").textContent =
        info.summary;

    $("summaryBuilding").textContent =
        feedback.buildingName;

    $("summaryFloor").textContent =
        feedback.floor
            ? `ชั้น ${feedback.floor}`
            : "-";

    $("summaryDepartment").textContent =
        feedback.department;

    $("locationPage").style.display = "none";

    $("detailPage").style.display = "block";

    scrollTopPage();

});

/* ==========================================
   Detail Input
========================================== */

const detailText = $("detailText");
const detailCounter = $("detailCounter");
const detailNextButton = $("detailNextButton");

detailText.addEventListener("input", updateDetailState);

function updateDetailState() {

    detailText.value = detailText.value.replace(/^\s+/, "");

    feedback.detail = detailText.value.trim();

    detailCounter.textContent =
        `${detailText.value.length} / 2000`;

    $("detailError").style.display = "none";

    detailText.classList.remove("input-error");

    if (detailText.value.length >= 1900) {

        detailCounter.style.color = "#D32F2F";

    } else if (detailText.value.length >= 1500) {

        detailCounter.style.color = "#F57C00";

    } else {

        detailCounter.style.color = "#757575";

    }

    validateDetailPage();

}

/* ==========================================
   Detail Back
========================================== */

$("detailBackButton").addEventListener("click", () => {

    $("detailPage").style.display = "none";

    $("locationPage").style.display = "block";

    scrollTopPage();

});

/* ==========================================
   Contact Select
========================================== */

document
    .querySelectorAll(".contact-card")
    .forEach(card => {

        card.addEventListener("click", () => {

            document
                .querySelectorAll(".contact-card")
                .forEach(c => c.classList.remove("selected"));

            card.classList.add("selected");

            $("contactError").style.display = "none";

            const needContact =
                card.dataset.contact === "yes";

            feedback.needContact = needContact;

            if (needContact) {

                $("contactForm").style.display = "block";

            } else {

                $("contactForm").style.display = "none";

                feedback.name = "";
                feedback.phone = "";

                $("contactName").value = "";
                $("contactPhone").value = "";

                $("nameError").style.display = "none";
                $("phoneError").style.display = "none";

                $("contactName").classList.remove("input-error");
                $("contactPhone").classList.remove("input-error");

            }

            validateDetailPage();

        });

    });

/* ==========================================
   Phone Input
========================================== */

$("contactPhone").addEventListener("input", function () {

    this.value =
        this.value.replace(/\D/g, "").slice(0, 10);

    feedback.phone = this.value;

    $("phoneError").style.display = "none";

    this.classList.remove("input-error");

    validateDetailPage();

});

/* ==========================================
   Name Input
========================================== */

$("contactName").addEventListener("input", function () {

    feedback.name =
        this.value.trim();

    $("nameError").style.display = "none";

    this.classList.remove("input-error");

    validateDetailPage();

});

/* ==========================================
   Validate Detail
========================================== */

function validateDetailPage() {

    feedback.detail =
        $("detailText").value.trim();

    feedback.name =
        $("contactName").value.trim();

    feedback.phone =
        $("contactPhone").value.trim();

    $("detailError").style.display = "none";
    $("nameError").style.display = "none";
    $("phoneError").style.display = "none";

    $("detailText").classList.remove("input-error");
    $("contactName").classList.remove("input-error");
    $("contactPhone").classList.remove("input-error");

    if (
        feedback.needContact &&
        feedback.phone &&
        !/^0\d{9}$/.test(feedback.phone)
    ) {

        $("phoneError").style.display = "block";

        $("contactPhone").classList.add("input-error");

    }

}

/* ==========================================
   Compress Image
========================================== */

async function compressImage(file) {

    const MAX_SIZE = 1600;
    const QUALITY = 0.80;

    const image = await createImageBitmap(file);

    let width = image.width;
    let height = image.height;

    if (width > MAX_SIZE || height > MAX_SIZE) {

        const ratio = Math.min(
            MAX_SIZE / width,
            MAX_SIZE / height
        );

        width = Math.round(width * ratio);
        height = Math.round(height * ratio);

    }

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(
        image,
        0,
        0,
        width,
        height
    );

    image.close();

    const blob = await new Promise(resolve => {

        canvas.toBlob(
            resolve,
            "image/jpeg",
            QUALITY
        );

    });

    if (!blob) {

        throw new Error(
            "ไม่สามารถประมวลผลรูปภาพได้"
        );

    }

    return new File(
        [blob],
        "compressed.jpg",
        {
            type: "image/jpeg"
        }
    );

}

/* ==========================================
   Image Preview
========================================== */

const imageInput = $("imageInput");
const imagePreview = $("imagePreview");
const removeImageButton = $("removeImageButton");

imageInput.addEventListener("change", previewImage);

function previewImage() {

    const file = imageInput.files[0];

    if (!file) {

        resetImage();

        return;

    }

    const allowTypes = [
        "image/jpeg",
        "image/png",
        "image/heic",
        "image/heif",
        "image/webp"
    ];

    const extension =
        file.name.split(".").pop().toLowerCase();

    const allowExtensions = [
        "jpg",
        "jpeg",
        "png",
        "heic",
        "heif",
        "webp"
    ];

    if (
        !allowTypes.includes(file.type) &&
        !allowExtensions.includes(extension)
    ) {

        alert(
            `รองรับเฉพาะไฟล์

• JPG
• PNG
• HEIC
• HEIF
• WEBP`
        );

        resetImage();

        return;

    }

    if (file.size > 10 * 1024 * 1024) {

        alert("รูปภาพต้องมีขนาดไม่เกิน 10 MB");

        resetImage();

        return;

    }

    feedback.imageFile = file;

    const reader = new FileReader();

    reader.onload = function (e) {

        imagePreview.innerHTML = `
            <img
                src="${e.target.result}"
                class="preview-image"
                style="cursor:zoom-in;">
        `;

        imagePreview.querySelector("img").onclick = () => {

            $("modalImage").src = e.target.result;

            $("imageModal").style.display = "flex";

        };

    };

    reader.readAsDataURL(file);

    document.querySelector(".upload-title").textContent =
        "✔ แนบรูปภาพแล้ว";

    document.querySelector(".upload-title").style.color =
        "#2E7D32";

    document.querySelector(".upload-subtitle").textContent =
        `${(file.size / 1024 / 1024).toFixed(2)} MB`;

    removeImageButton.style.display = "block";

}

/* ==========================================
   Remove Image
========================================== */

removeImageButton.addEventListener("click", resetImage);

function resetImage() {

    feedback.imageFile = null;
    feedback.imageDriveId = "";
    feedback.imageFileName = "";
    feedback.imageSize = 0;

    imageInput.value = "";

    imagePreview.innerHTML = "";

    removeImageButton.style.display = "none";

    document.querySelector(".upload-title").textContent =
        "แตะเพื่อเลือกรูปภาพ";

    document.querySelector(".upload-title").style.color = "";

    document.querySelector(".upload-subtitle").textContent =
        "JPG / PNG / HEIC ไม่เกิน 10 MB";

}

/* ==========================================
   Detail Next
========================================== */

detailNextButton.addEventListener("click", () => {

    validateDetailPage();

    if (!feedback.detail) {

        $("detailError").style.display = "block";

        $("detailText").classList.add("input-error");

        scrollToElement($("detailText"));

        return;

    }

    if (feedback.needContact === null) {

        $("contactError").style.display = "block";

        scrollToElement(
            document.querySelector(".contact-container")
        );

        return;

    }

    if (feedback.needContact && !feedback.name) {

        $("nameError").style.display = "block";

        $("contactName").classList.add("input-error");

        scrollToElement($("contactForm"));

        return;

    }

    if (
        feedback.needContact &&
        !/^0\d{9}$/.test(feedback.phone)
    ) {

        $("phoneError").style.display = "block";

        $("contactPhone").classList.add("input-error");

        scrollToElement($("contactForm"));

        return;

    }

    const categoryMap = {

        compliment: {
            text: "🟢 คำชม",
            className: "compliment"
        },

        suggestion: {
            text: "🟡 ข้อเสนอแนะ",
            className: "suggestion"
        },

        complaint: {
            text: "🔴 ข้อร้องเรียน",
            className: "complaint"
        }

    };

    const info = categoryMap[feedback.category];

    $("reviewCategory").textContent = info.text;

    $("reviewCategory").className =
        "review-badge " + info.className;

    const locationLines = [];

    if (feedback.department) {

        locationLines.push(
            feedback.department
        );

    }

    const buildingFloorParts = [];

    if (feedback.buildingName) {

        buildingFloorParts.push(
            feedback.buildingName
        );

    }

    if (feedback.floor) {

        buildingFloorParts.push(
            `ชั้น ${feedback.floor}`
        );

    }

    if (buildingFloorParts.length > 0) {

        locationLines.push(
            buildingFloorParts.join(" ")
        );

    }

    $("reviewLocation").textContent =
        locationLines.join("\n");

    $("reviewDetail").textContent =
        feedback.detail;

    if (feedback.needContact) {

        $("reviewContact").textContent =
            "ต้องการให้เจ้าหน้าที่ติดต่อกลับ";

        $("reviewContactDetail").style.display =
            "flex";

        $("reviewName").textContent =
            `คุณ ${feedback.name}`;

        $("reviewPhone").textContent =
            `เบอร์ ${feedback.phone}`;

    } else {

        $("reviewContact").textContent =
            "ไม่ต้องการให้เจ้าหน้าที่ติดต่อกลับ";

        $("reviewContactDetail").style.display =
            "none";

    }

    $("detailPage").style.display = "none";

    $("reviewPage").style.display = "block";

    scrollTopPage();

});

/* ==========================================
   Review Back
========================================== */

$("reviewBackButton").addEventListener("click", () => {

    $("reviewPage").style.display = "none";

    $("detailPage").style.display = "block";

    scrollTopPage();

});

/* ==========================================
   Submit
========================================== */

$("submitButton").addEventListener("click", submitFeedback);

let isSubmitting = false;

async function submitFeedback() {

    if (isSubmitting) return;

    isSubmitting = true;

    showLoading("กำลังส่งความคิดเห็น...");

    feedback.device = getDevice();
    feedback.browser = getBrowser();

    try {

        if (!feedback.imageFile) {

            feedback.imageDriveId = "";
            feedback.imageFileName = "";
            feedback.imageSize = 0;

            saveFeedbackData();

            return;

        }

        const compressedFile =
            await compressImage(feedback.imageFile);

        const base64 =
            await fileToBase64(compressedFile);

        const upload =
            await uploadImage(
                base64,
                compressedFile.type
            );

        if (!upload.success) {

            isSubmitting = false;

            showError(upload.message);

            return;

        }

        feedback.imageDriveId =
            upload.fileId;

        feedback.imageFileName =
            upload.fileName;

        feedback.imageSize =
            upload.fileSize;

        feedback.imageFile = null;

        saveFeedbackData();

    }

    catch (err) {

        isSubmitting = false;

        showError(err);

    }

}

/* ==========================================
   Save Feedback
========================================== */

function saveFeedbackData() {

    const data = {

        category: feedback.category,
        buildingName: feedback.buildingName,
        floor: feedback.floor,
        department: feedback.department,
        detail: feedback.detail,

        imageDriveId: feedback.imageDriveId,
        imageFileName: feedback.imageFileName,
        imageSize: feedback.imageSize,

        needContact: feedback.needContact,
        name: feedback.name,
        phone: feedback.phone,

        device: feedback.device,
        browser: feedback.browser

    };

    saveFeedback(data)

        .then(result => {

            isSubmitting = false;

            $("submitButton").disabled = false;

            $("submitButton").innerHTML =
                "ส่งความคิดเห็น";

            saveSuccess(result);

        })

        .catch(err => {

            isSubmitting = false;

            $("submitButton").disabled = false;

            $("submitButton").innerHTML =
                "ส่งความคิดเห็น";

            showError(err);

        });

}

/* ==========================================
   Save Success
========================================== */

function saveSuccess(result) {

    if (!result.success) {

        showError(result.message);

        return;

    }

    hideLoading();

    $("reviewPage").style.display = "none";

    $("successPage").style.display = "block";

    $("successContactBox").style.display =
        feedback.needContact ? "block" : "none";

    $("successThankBox").style.display =
        feedback.needContact ? "none" : "block";

    if ($("ticketNo")) {

        $("ticketNo").textContent =
            result.ticketNo || "-";

    }

    scrollTopPage();

}

/* ==========================================
   Reset Feedback
========================================== */

function resetFeedback() {

    Object.assign(feedback, {

        category: "",
        buildingId: "",
        buildingName: "",
        floor: "",
        department: "",
        detail: "",

        imageFile: null,
        imageDriveId: "",
        imageFileName: "",
        imageSize: 0,

        needContact: null,
        name: "",
        phone: "",

        device: "",
        browser: ""

    });

    document
        .querySelectorAll(".category-card")
        .forEach(card =>
            card.classList.remove("selected"));

    $("nextButton").disabled = true;

    resetLocationState();

    el.buildingSelect.value = "";

    $("detailText").value = "";

    $("detailCounter").textContent = "0 / 2000";

    $("contactForm").style.display = "none";

    $("contactName").value = "";

    $("contactPhone").value = "";

    document
        .querySelectorAll(".contact-card")
        .forEach(card =>
            card.classList.remove("selected"));

    resetImage();

    $("reviewPage").style.display = "none";

    $("detailPage").style.display = "none";

    $("locationPage").style.display = "none";

    $("categoryPage").style.display = "none";

    $("successPage").style.display = "none";

    $("welcomePage").style.display = "block";

    requestAnimationFrame(scrollTopPage);

}

/* ==========================================
   Restart
========================================== */

$("restartButton").addEventListener("click", () => {

    resetFeedback();

});

/* ==========================================
   Reset Location
========================================== */

function resetLocationState() {

    feedback.buildingId = "";
    feedback.buildingName = "";
    feedback.floor = "";
    feedback.department = "";

    $("buildingError").style.display = "none";
    $("floorError").style.display = "none";
    $("departmentError").style.display = "none";
    $("otherDepartmentError").style.display = "none";

    $("buildingSelect").classList.remove("input-error");
    $("floorContainer").classList.remove("input-error");
    $("otherDepartment").classList.remove("input-error");

    $("otherDepartment").value = "";

    if ($("otherDepartmentGroup")) {

        $("otherDepartmentGroup").style.display = "none";

    }

    el.floorContainer.replaceChildren();

    el.departmentContainer.replaceChildren();

    el.floorSection.style.display = "none";

    el.departmentSection.style.display = "none";

}

/* ==========================================
   Image Modal
========================================== */

$("closeImageModal").addEventListener("click", () => {

    $("imageModal").style.display = "none";

});

$("imageModal").addEventListener("click", e => {

    if (e.target.id === "imageModal") {

        $("imageModal").style.display = "none";

    }

});

/* ==========================================
   Init
========================================== */

window.addEventListener("load", () => {

    preloadDepartments();

});