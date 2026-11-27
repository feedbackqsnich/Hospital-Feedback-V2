let pieChart;
let trendChart;
let buildingChart;
let serviceChart;

// สีประจำอาคาร

const BUILDING_COLORS = {

    "อาคารมหิตลาธิเบศร": "#43A047",

    "อาคารสถาบันสุขภาพเด็กแห่งชาติมหาราชินี": "#FBC02D",

    "อาคารเฉลิมพระเกียรติฯ 80 พรรษา": "#1E88E5",

    "อาคารสยามบรมราชกุมารี": "#8E24AA",

    "ลานจอดรถ อาคารเฉลิมพระเกียรติฯ 80 พรรษา": "#009688"

};

const mockData = {

    summary: {

        compliment: 125,
        suggestion: 84,
        complaint: 16

    },

    trend: [

        { short: "ม.ค.", month: "มกราคม", value: 18 },
        { short: "ก.พ.", month: "กุมภาพันธ์", value: 22 },
        { short: "มี.ค.", month: "มีนาคม", value: 15 },
        { short: "เม.ย.", month: "เมษายน", value: 28 },
        { short: "พ.ค.", month: "พฤษภาคม", value: 31 },
        { short: "มิ.ย.", month: "มิถุนายน", value: 19 },
        { short: "ก.ค.", month: "กรกฎาคม", value: 26 },
        { short: "ส.ค.", month: "สิงหาคม", value: 24 },
        { short: "ก.ย.", month: "กันยายน", value: 21 },
        { short: "ต.ค.", month: "ตุลาคม", value: 29 },
        { short: "พ.ย.", month: "พฤศจิกายน", value: 33 },
        { short: "ธ.ค.", month: "ธันวาคม", value: 27 }

    ],

    buildings: [

        { name: "อาคารสยามบรมราชกุมารี", value: 58 },
        { name: "อาคารมหิตลาธิเบศร", value: 42 },
        { name: "อาคารสถาบันสุขภาพเด็กแห่งชาติมหาราชินี", value: 33 },
        { name: "อาคารเฉลิมพระเกียรติฯ 80 พรรษา", value: 18 },
        { name: "ลานจอดรถ อาคารเฉลิมพระเกียรติฯ 80 พรรษา", value: 3 }

    ],

    services: [

        {
            name: "คลินิกอายุรกรรมทั่วไป",
            value: 36,
            building: "อาคารสยามบรมราชกุมารี",
            buildingShort: "อาคารสยามฯ"
        },

        {
            name: "ห้องจ่ายยาผู้ป่วยนอก",
            value: 29,
            building: "อาคารสยามบรมราชกุมารี",
            buildingShort: "อาคารสยามฯ"
        },

        {
            name: "คลินิกจิตเวช",
            value: 21,
            building: "อาคารเฉลิมพระเกียรติฯ 80 พรรษา",
            buildingShort: "อาคารเฉลิมฯ"
        },

        {
            name: "สังคมสงเคราะห์",
            value: 18,
            building: "อาคารมหิตลาธิเบศร",
            buildingShort: "อาคารมหิตฯ"
        }

    ],

    latest: []

};


function prepareChartData(data, fiscalYear = "all") {
    // สรุปประเภทความคิดเห็น
    mockData.summary = {
        compliment: data.filter(item => item.Category === "compliment").length,
        suggestion: data.filter(item => item.Category === "suggestion").length,
        complaint: data.filter(item => item.Category === "complaint").length
    };


    // ======================================
    // เตรียมข้อมูลรายเดือน (Monthly Trend)
    // FY = 12 เดือน ต.ค. - ก.ย.
    // All = ทุกเดือนต่อเนื่องตามข้อมูลจริง
    // ======================================

    const monthNames = [
        "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.",
        "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.",
        "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];

    // แปลงวันที่เป็น Key ปี-เดือน
    const getMonthKey = (year, month) => `${year}-${month}`;

    // สร้างข้อมูลเดือน
    const createMonthData = (year, month) => {
        const thaiYear = year + 543;

        return {
            year,
            month,
            key: getMonthKey(year, month),
            label: `${monthNames[month]} ${String(thaiYear).slice(-2)}`,
            compliment: 0,
            suggestion: 0,
            complaint: 0
        };
    };

    let months = [];

    // ======================================
    // กรณีเลือกปีงบประมาณ
    // ======================================
    if (fiscalYear !== "all") {

        const selectedFY = Number(fiscalYear);
        const startYear = selectedFY - 544;

        // สร้าง 12 เดือน ตั้งแต่ ต.ค. ถึง ก.ย.
        for (let i = 0; i < 12; i++) {
            const date = new Date(startYear, 9 + i, 1);

            months.push(
                createMonthData(
                    date.getFullYear(),
                    date.getMonth()
                )
            );
        }

    } else {

        // ======================================
        // กรณีเลือก All
        // แสดงทุกเดือนตั้งแต่ข้อมูลแรกถึงข้อมูลล่าสุด
        // ======================================

        const validDates = data
            .filter(item => item.Timestamp)
            .map(item => new Date(item.Timestamp))
            .filter(date => !isNaN(date.getTime()));

        if (validDates.length > 0) {

            // หาวันที่เก่าที่สุดและใหม่ที่สุด
            const sortedDates = validDates.sort(
                (a, b) => a.getTime() - b.getTime()
            );

            const firstDate = sortedDates[0];
            const lastDate = sortedDates[sortedDates.length - 1];

            // เริ่มจากเดือนแรกที่มีข้อมูล
            let currentYear = firstDate.getFullYear();
            let currentMonth = firstDate.getMonth();

            const endYear = lastDate.getFullYear();
            const endMonth = lastDate.getMonth();

            // สร้างเดือนต่อเนื่องจนถึงเดือนสุดท้าย
            while (
                currentYear < endYear ||
                (currentYear === endYear && currentMonth <= endMonth)
            ) {

                months.push(
                    createMonthData(currentYear, currentMonth)
                );

                // เลื่อนไปเดือนถัดไป
                currentMonth++;

                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
            }
        }
    }

    // ======================================
    // นับความคิดเห็นแยกตามเดือนและประเภท
    // ======================================

    data.forEach(item => {

        if (!item.Timestamp) return;

        const date = new Date(item.Timestamp);
        if (isNaN(date.getTime())) return;

        const key = getMonthKey(
            date.getFullYear(),
            date.getMonth()
        );

        const monthData = months.find(
            month => month.key === key
        );

        if (!monthData) return;

        if (item.Category === "compliment") {
            monthData.compliment++;

        } else if (item.Category === "suggestion") {
            monthData.suggestion++;

        } else if (item.Category === "complaint") {
            monthData.complaint++;
        }
    });

    // ======================================
    // ส่งข้อมูลให้กราฟ
    // ======================================

    mockData.trend = months.map(item => ({
        month: item.label,
        short: item.label,
        compliment: item.compliment,
        suggestion: item.suggestion,
        complaint: item.complaint,
        value:
            item.compliment +
            item.suggestion +
            item.complaint
    }));

    // เตรียมข้อมูลรายอาคาร (5 อาคารหลัก + อื่นๆ)

    const mainBuildings = Object.keys(BUILDING_COLORS);

    const buildingCounts = {};

    // ตั้งค่า 5 อาคารหลัก
    mainBuildings.forEach(building => {
        buildingCounts[building] = 0;
    });

    // รวมอาคารที่ไม่อยู่ในรายการ และอาคารที่ไม่ระบุ เป็น "อื่นๆ"
    data.forEach(item => {

        const building = (item.Building || "").trim();

        if (mainBuildings.includes(building)) {

            buildingCounts[building]++;

        } else {

            buildingCounts["อื่นๆ"] =
                (buildingCounts["อื่นๆ"] || 0) + 1;

        }

    });

    // เรียง 5 อาคารหลักตามจำนวน และวาง "อื่นๆ" ไว้ท้ายสุด
    mockData.buildings = mainBuildings
        .map(name => ({
            name,
            value: buildingCounts[name]
        }))
        .sort((a, b) => b.value - a.value);

    // เพิ่มหมวดอื่นๆ เมื่อมีข้อมูล
    if (buildingCounts["อื่นๆ"]) {
        mockData.buildings.push({
            name: "อื่นๆ",
            value: buildingCounts["อื่นๆ"]
        });
    }

    // เตรียมข้อมูลรายหน่วยงาน / จุดบริการ
    const serviceCounts = {};

    data.forEach(item => {
        const department = item.Department || "ไม่ระบุหน่วยงาน";
        const building = item.Building || "ไม่ระบุอาคาร";
        const floor = item.Floor || "ไม่ระบุชั้น";

        console.log("ตรวจสอบข้อมูลชั้น:", item.Floor, item);

        const key = `${department}|||${building}|||${floor}`;

        if (!serviceCounts[key]) {
            serviceCounts[key] = {
                name: department,
                value: 0,
                building: building,
                buildingShort: building,
                floor: floor
            };
        }

        serviceCounts[key].value++;
    });

    mockData.services = Object.values(serviceCounts)
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    console.log("เตรียมข้อมูลกราฟสำเร็จ:", mockData);
}


const totalComments = () =>
    mockData.summary.compliment +
    mockData.summary.suggestion +
    mockData.summary.complaint;

function createPieChart() {

    const canvas = document.getElementById("pieChart");

    if (!canvas) return;

    if (pieChart) {

        pieChart.destroy();

    }

    document.getElementById("pieCenterValue").textContent =
        totalComments();

    pieChart = new Chart(canvas, {

        type: "doughnut",

        data: {

            labels: [

                "คำชม",
                "ข้อเสนอแนะ",
                "ข้อร้องเรียน"

            ],

            datasets: [{

                data: [

                    mockData.summary.compliment,
                    mockData.summary.suggestion,
                    mockData.summary.complaint

                ],

                backgroundColor: [

                    "#43A047",
                    "#F59E0B",
                    "#E53935"

                ],

                borderWidth: 2,

                borderColor: "#FFFFFF",

                hoverBorderWidth: 2,

                hoverOffset: 6

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: true,

            cutout: "60%",

            layout: {

                padding: 14

            },

            animation: {

                animateRotate: true,

                duration: 1200

            },

            plugins: {

                legend: {

                    display: false

                },

                tooltip: {

                    backgroundColor: "rgba(38,50,56,1)",

                    borderWidth: 0,

                    cornerRadius: 14,

                    padding: 16,

                    displayColors: true,

                    boxPadding: 6,

                    titleColor: "#FFF",

                    bodyColor: "#FFF",

                    titleFont: {

                        family: "Prompt",

                        size: 16,

                        weight: "600"

                    },

                    bodyFont: {

                        family: "Prompt",

                        size: 16,

                        weight: "500"

                    },

                    callbacks: {

                        label(context) {

                            const value = context.raw;

                            const total = context.dataset.data.reduce((a, b) => a + b, 0);

                            const percent = ((value / total) * 100).toFixed(1);

                            return `${value} เรื่อง (${percent}%)`;

                        }

                    }

                }

            }

        }

    });

}


function createTrendChart() {

    const canvas = document.getElementById("trendChart");
    if (!canvas) return;

    if (trendChart) {
        trendChart.destroy();
    }

    const ctx = canvas.getContext("2d");

    const trendData = mockData.trend;
    const totalMonths = trendData.length;

    // ลดความถี่ของชื่อเดือนเมื่อข้อมูลมีหลายปี
    let labelInterval = 1;

    if (totalMonths > 24) {
        labelInterval = 3;
    } else if (totalMonths > 12) {
        labelInterval = 2;
    }

    trendChart = new Chart(ctx, {

        type: "line",

        data: {

            labels: trendData.map(item => item.short),

            datasets: [

                // คำชม
                {
                    label: "คำชม",
                    data: trendData.map(item => item.compliment),

                    borderColor: "#43A047",
                    backgroundColor: "rgba(67,160,71,0.10)",

                    tension: 0.35,
                    borderWidth: 3,

                    pointRadius: totalMonths > 24 ? 2 : 4,
                    pointHoverRadius: 7,

                    pointBackgroundColor: "#FFFFFF",
                    pointBorderColor: "#43A047",
                    pointBorderWidth: 2,

                    fill: false
                },

                // ข้อเสนอแนะ
                {
                    label: "ข้อเสนอแนะ",
                    data: trendData.map(item => item.suggestion),

                    borderColor: "#F59E0B",
                    backgroundColor: "rgba(249,168,37,0.10)",

                    tension: 0.35,
                    borderWidth: 3,

                    pointRadius: totalMonths > 24 ? 2 : 4,
                    pointHoverRadius: 7,

                    pointBackgroundColor: "#FFFFFF",
                    pointBorderColor: "#F59E0B",
                    pointBorderWidth: 2,

                    fill: false
                },

                // ข้อร้องเรียน
                {
                    label: "ข้อร้องเรียน",
                    data: trendData.map(item => item.complaint),

                    borderColor: "#E53935",
                    backgroundColor: "rgba(229,57,53,0.10)",

                    tension: 0.35,
                    borderWidth: 3,

                    pointRadius: totalMonths > 24 ? 2 : 4,
                    pointHoverRadius: 7,

                    pointBackgroundColor: "#FFFFFF",
                    pointBorderColor: "#E53935",
                    pointBorderWidth: 2,

                    fill: false
                }

            ]

        },

        options: {

            responsive: true,
            maintainAspectRatio: false,

            layout: {
                padding: {
                    top: 0
                }
            },

            interaction: {
                mode: "index",
                intersect: false
            },

            animation: {
                duration: 800,
                easing: "easeOutQuart"
            },

            plugins: {

                legend: {
                    display: false,
                    position: "top",

                    labels: {
                        color: "#455A64",
                        padding: 20,

                        font: {
                            family: "Sarabun",
                            size: 15,
                            weight: "500"
                        },

                        usePointStyle: true,
                        pointStyle: "circle",
                        boxWidth: 10,
                        boxHeight: 10,

                        generateLabels(chart) {
                            const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);

                            labels.forEach(label => {
                                label.pointStyle = "circle";
                                label.fillStyle = label.strokeStyle;
                                label.lineWidth = 0;
                            });

                            return labels;
                        }
                    }
                },

                tooltip: {

                    backgroundColor: "rgba(38,50,56,0.95)",
                    cornerRadius: 12,
                    padding: 14,

                    displayColors: false,
                    bodySpacing: 12,
                    titleMarginBottom: 12,

                    titleColor: "#FFFFFF",
                    bodyColor: "#FFFFFF",

                    titleFont: {
                        family: "Sarabun",
                        size: 16,
                        weight: "600"
                    },

                    bodyFont: {
                        family: "Sarabun",
                        size: 15,
                        weight: "500"
                    },

                    callbacks: {

                        title(context) {
                            return trendData[context[0].dataIndex].month;
                        },

                        label(context) {

                            const category = context.dataset.label;

                            let emoji = "📝";

                            if (category === "คำชม") {
                                emoji = "💚";
                            } else if (category === "ข้อเสนอแนะ") {
                                emoji = "💡";
                            } else if (category === "ข้อร้องเรียน") {
                                emoji = "😡";
                            }

                            return `${emoji} ${category}: ${context.raw} เรื่อง`;
                        }

                    }

                }
            },

            scales: {

                x: {

                    grid: {
                        display: false
                    },

                    ticks: {

                        color: "#000000",

                        font: {
                            family: "Sarabun",
                            size: 14
                        },

                        autoSkip: false,

                        callback(value, index) {

                            // แสดงเดือนตามระยะที่กำหนด
                            if (index % labelInterval !== 0) {
                                return "";
                            }

                            return this.getLabelForValue(value);
                        }

                    },

                    border: {
                        display: false
                    }

                },

                y: {

                    beginAtZero: true,

                    ticks: {

                        precision: 0,

                        color: "#000000",

                        font: {
                            family: "Sarabun",
                            size: 14
                        }

                    },

                    grid: {
                        color: "#E3EEF8"
                    },

                    border: {
                        display: false
                    }

                }

            }

        }

    });

}


function createBuildingChart() {

    const canvas = document.getElementById("buildingChart");

    if (!canvas) return;

    if (buildingChart) {

        buildingChart.destroy();

    }

    buildingChart = new Chart(canvas, {

        type: "bar",

        data: {

            labels: mockData.buildings.map(item => {
                const shortNames = {
                    "อาคารมหิตลาธิเบศร": "มหิตฯ",
                    "อาคารสถาบันสุขภาพเด็กแห่งชาติมหาราชินี": "สถาบันฯ",
                    "อาคารเฉลิมพระเกียรติฯ 80 พรรษา": "เฉลิมฯ",
                    "อาคารสยามบรมราชกุมารี": "สยามฯ",
                    "ลานจอดรถ อาคารเฉลิมพระเกียรติฯ 80 พรรษา": "ลานจอดรถ",
                    "อื่นๆ": "อื่นๆ"
                };

                return shortNames[item.name] || item.name;
            }),

            datasets: [{

                data: mockData.buildings.map(item => item.value),

                backgroundColor: mockData.buildings.map(item =>
                    BUILDING_COLORS[item.name] || "#90A4AE"
                ),

                borderColor: mockData.buildings.map(item => {
                    const borderColors = {
                        "อาคารมหิตลาธิเบศร": "#2E7D32",
                        "อาคารสถาบันสุขภาพเด็กแห่งชาติมหาราชินี": "#F9A825",
                        "อาคารเฉลิมพระเกียรติฯ 80 พรรษา": "#1565C0",
                        "อาคารสยามบรมราชกุมารี": "#6A1B9A",
                        "ลานจอดรถ อาคารเฉลิมพระเกียรติฯ 80 พรรษา": "#009688"
                    };

                    return borderColors[item.name] || "#78909C";
                }),

                borderWidth: 2,

                borderRadius: 10,

                borderSkipped: false,

                barThickness: 40

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            animation: {

                duration: 1200,

                easing: "easeOutQuart"

            },

            plugins: {

                legend: {

                    display: false

                },

                tooltip: {

                    backgroundColor: "rgba(38,50,56,1)",

                    borderWidth: 0,

                    cornerRadius: 14,

                    padding: 16,

                    displayColors: false,

                    bodySpacing: 10,

                    titleMarginBottom: 10,

                    titleColor: "#FFF",

                    bodyColor: "#FFF",

                    titleFont: {
                        family: "Sarabun",
                        size: 16,
                        weight: "600"
                    },

                    bodyFont: {
                        family: "Sarabun",
                        size: 15,
                        weight: "500"
                    },

                    callbacks: {

                        title(context) {
                            return mockData.buildings[context[0].dataIndex].name;
                        },

                        label(context) {
                            return `${context.raw} ความคิดเห็น`;
                        }

                    }

                }

            },

            scales: {

                x: {

                    beginAtZero: true,

                    grid: {

                        color: "#E3EEF8"

                    },

                    ticks: {

                        color: "#000000",

                        font: {
                            family: "Sarabun",
                            size: 15
                        }

                    },

                    border: {

                        display: false

                    }

                },

                y: {

                    grid: {

                        display: false

                    },

                    ticks: {

                        color: "#000000",

                        font: {
                            family: "Sarabun",
                            size: 15
                        }

                    },

                    border: {

                        display: false

                    }

                }

            }

        }

    });

}

function createServiceChart() {

    const canvas = document.getElementById("serviceChart");

    if (!canvas) return;

    if (serviceChart) {

        serviceChart.destroy();

    }

    serviceChart = new Chart(canvas, {

        type: "bar",

        data: {

            labels: mockData.services.map(item => item.name),

            datasets: [{

                data: mockData.services.map(item => item.value),

                backgroundColor: mockData.services.map(
                    item => BUILDING_COLORS[item.building] || "#90A4AE"
                ),

                borderRadius: 10,

                borderSkipped: false,

                barThickness: 32

            }]

        },

        options: {

            indexAxis: "y",

            responsive: true,

            maintainAspectRatio: false,

            animation: {

                duration: 1200,

                easing: "easeOutQuart"

            },

            plugins: {

                legend: {

                    display: false

                },

                tooltip: {

                    backgroundColor: "rgba(38,50,56,1)",

                    borderWidth: 0,

                    cornerRadius: 14,

                    padding: 16,

                    displayColors: false,

                    titleColor: "#FFF",

                    bodyColor: "#FFF",

                    titleFont: { family: "Sarabun", size: 16, weight: "600" },
                    bodyFont: { family: "Sarabun", size: 16, weight: "500" },

                    callbacks: {

                        title(context) {
                            const item = mockData.services[context[0].dataIndex];
                            return `${item.name}`;
                        },

                        label(context) {
                            const item = mockData.services[context.dataIndex];

                            // ลานจอดรถ ไม่ต้องแสดงชั้นและอาคารซ้ำ
                            if (item.building.includes("ลานจอดรถ")) {
                                return `${item.value} ความคิดเห็น`;
                            }

                            return [`ชั้น ${item.floor} ${item.buildingShort}`, `${item.value} ความคิดเห็น`];
                        }

                    }

                }

            },

            scales: {

                x: {

                    beginAtZero: true,

                    grid: {
                        color: "#E3EEF8"
                    },

                    ticks: {
                        stepSize: 5,
                        precision: 0,
                        color: "#000000",
                        font: {
                            family: "Sarabun",
                            size: 15,
                            weight: "500"
                        }
                    },

                    border: {
                        display: false
                    }

                },

                y: {

                    grid: {

                        display: false

                    },

                    ticks: {

                        color: "#000000",

                        padding: 10,

                        font: {

                            family: "Sarabun",

                            size: 15,

                            weight: "500"

                        }

                    },

                    border: {

                        display: false

                    }

                }

            }

        }

    });

}

// เรียกใช้งานเพิ่มใน initCharts()

function initCharts() {

    createPieChart();

    createTrendChart();

    createBuildingChart();

    createServiceChart();

}