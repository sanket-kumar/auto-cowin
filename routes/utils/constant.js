var constant = {
    cowinBaseUrl: "https://cdn-api.co-vin.in",
    // cowinBaseUrl: "http://localhost:3090",
    cowinV2: "/api/v2",
    generateOtpEndpoint: "/auth/generateMobileOTP",
    confirmOtpEndpoint: "/auth/confirmOTP",
    slotsByDistrict: "/appointment/sessions/calendarByDistrict",
    minAvailableSlots: 2,
    retryIntervalMS: 10000
};

module.exports = constant;