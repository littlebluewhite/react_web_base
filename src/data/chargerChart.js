const chargerBarChartOptions = (size) => {
    return {
        maintainAspectRatio: false,
        plugins: {
            legend: false,
            tooltip: true,
        },
        interaction: {
            mode: 'point',
            intersect: true
        },
        responsive: true,
        scales: {
            x: {
                stacked: true,
                offset: true,
                grid: {
                    borderWidth: 3,
                    borderColor: "#84E2F7",
                    display: false
                },
                ticks: {
                    font: {
                        size: size * 0.9,
                    },
                    color: "#84E2F7"
                }
            },
            y: {
                stacked: true,
                beginAtZero: true,
                grid: {
                    borderWidth: 3,
                    borderColor: "#84E2F7",
                    display: true,
                    color: "rgba(143, 205, 204, 0.15",
                    drawTicks: false
                },
                ticks: {
                    font: {
                        size: size,
                    },
                    crossAlign: "center",
                    color: "#84E2F7",
                    padding: 14
                }
            }
        }
    }
}

function gradientColor(chart){
    const result = chart.getContext("2d").createLinearGradient(0, 150, 0, 300)
    result.addColorStop(0, "rgb(224,247,132)");
    result.addColorStop(1, "rgb(122,134,72)");
    return result
}

function gradientHoverColor(chart){
    const result = chart.getContext("2d").createLinearGradient(0, 150, 0, 300)
    result.addColorStop(0, "rgb(230,253,150)");
    result.addColorStop(1, "rgb(147,162,86)");
    return result
}

function gradientColorOther(chart){
    const result = chart.getContext("2d").createLinearGradient(0, 150, 0, 300)
    result.addColorStop(0, "rgb(132, 226, 247)");
    result.addColorStop(1, "rgb(33,82,93)");
    return result
}

function gradientHoverColorOther(chart){
    const result = chart.getContext("2d").createLinearGradient(0, 150, 0, 300)
    result.addColorStop(0, "rgb(147,231,255)");
    result.addColorStop(1, "rgb(43,109,124)");
    return result
}


const monthMapping = {
    1: {"EN": "January", "CN": "1月"},
    2: {"EN": "February", "CN": "2月"},
    3: {"EN": "March", "CN": "3月"},
    4: {"EN": "April", "CN": "4月"},
    5: {"EN": "May", "CN": "5月"},
    6: {"EN": "June", "CN": "6月"},
    7: {"EN": "July", "CN": "7月"},
    8: {"EN": "August", "CN": "8月"},
    9: {"EN": "September", "CN": "9月"},
    10: {"EN": "October", "CN": "10月"},
    11: {"EN": "November", "CN": "11月"},
    12: {"EN": "December", "CN": "12月"},
}
export {chargerBarChartOptions, gradientColor, gradientHoverColor, gradientColorOther, gradientHoverColorOther, monthMapping}
