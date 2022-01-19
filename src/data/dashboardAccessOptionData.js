const dashboardAccessOptions = (labelWidth, size, setChartHoverData, maxY2)=>({
    onHover: function (evt, element) {
        if (element.length !== 0) {
            const datasetIndex = element["0"].datasetIndex
            const index = element["0"].index
            setChartHoverData({"isOpen": true, "index": index, "datasetIndex": datasetIndex})
        } else {
            setChartHoverData({"isOpen": false, "index": null, "datasetIndex": null})
        }
    },
    // events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
    maintainAspectRatio: false,
    animation:{
        duration: 0
    },
    plugins: {
        legend: {
            reverse: false,
            fullSize: false,
            display: true,
            position: "top",
            align: "start",
            labels: {
                boxWidth: labelWidth*0.75,
                boxHeight: labelWidth*0.2,
                color: "#8FCDCC",
                font: {
                    size: size,
                    family: "Noto Sans SC",

                }
            },
        },
        tooltip: true
            // Tooltip will only receive click events
            // events: ["click"]
    },
    scales: {
        x: {
            offset: true,
            grid: {
                borderWidth: 3,
                borderColor: "#84E2F7",
                display: false
            },
            ticks: {
                font:{
                    size: size,
                },
                color: "#84E2F7"
            }
        },
        y: {
            position: "left",
            beginAtZero: true,
            // max: maxY,
            grace: "20%",
            grid: {
                borderWidth: 3,
                borderColor: "#84E2F7",
                display: true,
                color: "rgba(143, 205, 204, 0.15)",
                drawTicks: false,
            },
            ticks: {
                font:{
                    size: size,
                },
                stepSize: 1,
                maxTicksLimit: 11,
                crossAlign: "center",
                color: "#84E2F7",
                padding: 14,
            }
        },
        y2: {
            display: false,
            position: "right",
            beginAtZero: true,
            max: maxY2,
            min: -maxY2,
            grid: {
                borderWidth: 3,
                borderColor: "#84E2F7",
                display: false,
                color: "rgba(128, 82, 45, 0.5)",
                drawTicks: false
            },
            ticks: {
                font:{
                    size: size,
                },
                stepSize: 1,
                maxTicksLimit: 11,
                crossAlign: "center",
                color: "#B56E36",
                padding: 14,
            },
            // title: {
            //     display: true,
            //     text: 'difference',
            //     color: '#191',
            //     align: "center",
            //     font: {
            //         family: 'Noto Sans SC',
            //         size: size,
            //         style: 'normal',
            //         lineHeight: 1.2
            //     },
            // }
        }
    }
})

const dashboardAccessData = (lineRadius, data, lang, size, data3) => {
    const dataLabel = {
        "out":{"EN":"Out", "CN":"出"},
        "in":{"EN":"In", "CN":"进"},
        // "difference":{"EN":"Difference", "CN":"差值"}
    }
    return {
        labels: data.labels,
        datasets: [
            {
                order: 2,
                label: dataLabel.out[lang],
                data: data.data[0].data,
                type: "bar",
                backgroundColor: "#4D7B92",
                borderColor: "rgba(190,237,255, 0.0)",
                // barThickness: size,
                barPercentage: 0.7,
                yAxisID: 'y',
                // maxBarThickness: lineRadius*1.5,
            },
            {
                order: 2,
                label: dataLabel.in[lang],
                data: data.data[1].data,
                type: "bar",
                backgroundColor: "#806B78",
                borderColor: "rgba(190,237,255, 0.0)",
                // barThickness: size,
                barPercentage: 0.7,
                yAxisID: 'y',
                // maxBarThickness: lineRadius*1.5,
            },
            // {
            //     order: 1,
            //     label: dataLabel.difference[lang],
            //     data: data3,
            //     type: "scatter",
            //     backgroundColor: "#80522D",
            //     yAxisID: 'y2',
            //     pointRadius: lineRadius,
            // },
        ]
    }
}

export {dashboardAccessOptions, dashboardAccessData}
