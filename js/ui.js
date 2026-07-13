/* ==========================================
   Loading
========================================== */

function showLoading(text = "กำลังส่ง...") {

    $("loadingOverlay").style.display = "flex";

    $("submitButton").disabled = true;

    $("submitButton").innerHTML =
        `<span class="button-spinner"></span>${text}`;

}

function hideLoading() {

    $("loadingOverlay").style.display = "none";

    $("submitButton").disabled = false;

    $("submitButton").innerHTML = "ส่ง";

}

/* ==========================================
   Error
========================================== */

function showError(err) {

    console.error(err);

    hideLoading();

    let message = "เกิดข้อผิดพลาด";

    if (typeof err === "string") {

        message = err;

    }

    else if (err?.message) {

        message = err.message;

    }

    else if (err?.toString) {

        message = err.toString();

    }

    alert(

`ไม่สามารถส่งข้อมูลได้

${message}

กรุณาลองใหม่อีกครั้ง`

    );

}

/* ==========================================
   Image Modal
========================================== */

$("closeImageModal").onclick = () => {

    $("imageModal").style.display = "none";

};

$("imageModal").onclick = e => {

    if (e.target.id === "imageModal") {

        $("imageModal").style.display = "none";

    }

};