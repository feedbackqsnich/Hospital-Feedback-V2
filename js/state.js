/* ==========================================
   Global State
========================================== */

const feedback = {

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

};

/* ==========================================
   Master Data
========================================== */

const buildings = [

    {
        id: "1",
        name: "อาคารสยามบรมราชกุมารี"
    },

    {
        id: "2",
        name: "อาคารมหิตลาธิเบศร"
    },

    {
        id: "3",
        name: "อาคารสถาบันสุขภาพเด็กแห่งชาติมหาราชินี"
    },

    {
        id: "4",
        name: "อาคารเฉลิมพระเกียรติฯ 80 พรรษา"
    },

    {
        id: "5",
        name: "ลานจอดรถ อาคารเฉลิมพระเกียรติฯ 80 พรรษา"
    }

];

let departments = [];