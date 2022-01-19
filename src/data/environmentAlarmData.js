export const environmentAlarmData = {
    "co2": { "warning": 800, "danger": 1000},
    "co": { "warning": 7.2, "danger": 9},
    "hcho": {"warning": 0.064, "danger": 0.08},
    "tvoc": {"warning": 0.448, "danger": 0.56},
    "o3": {"warning": 0.048, "danger": 0.06},
    "pm10": {"warning": 60, "danger": 75},
    "pm2.5": {"warning": 28, "danger": 35},
    // "temperature": {"warning": 30, "danger": 40},
    "temperature": {"warning": 1000, "danger": 2000},
    // "humidity": {"warning": 70, "danger": 90},
    "humidity": {"warning": 1000, "danger": 2000},
}

// warning:  low < value <= high