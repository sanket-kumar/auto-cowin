"use strict";
let request = require("request");
const constant = require("../utils/constant");
const cowinUtil = require("../utils/cowinUtil.js");
let sound = require("./sound");
/*
5min = 100

15secs -- && currentTime between :startTime - timeDiff  and :endTime + timeDiff


*/
let counter = 0;

module.exports = {
    txnId: "",
    authToken: "",
    runAutoScript: false,
    startAutoScript: function() {
        this.runAutoScript = true;
    },
    stopAutoScript: function() {
        this.runAutoScript = false;
    },
    autoSlotBooking: function(districtsInput) {
        if (this.runAutoScript == false) {
            console.log("Stopping Auto Slot Booking script!!!!!!!!!!");
            return;
        }
        let districts = [];
        districtsInput.forEach((val) => {
            districts.push(parseInt(val));
        });
        // console.log(districts);
        let slots = [];
        this.autoSlotBookingDistrictWise(districts, 0, slots, (callback) => {
            counter++;

            if (counter % 10 == 0) {
                console.log("..");
            }
            if (slots.length > 0) {
                console.log("Final slots data :: ");
                console.log(slots);
                sound.playCowinNotificationSound();
            }
            setTimeout(
                this.autoSlotBooking.bind(this, districts),
                constant.retryIntervalMS + Math.random() * 3000
            );
        });
    },

    autoSlotBookingDistrictWise: function(districts, index, slots, done) {
        if (index == districts.length) {
            return done();
        }
        let districtId = districts[index];
        this.getAvailbleSlots(districtId, (response) => {
            if (response.available_slots.length > 0) {
                slots.push(...response.available_slots);
            }
            setTimeout(
                this.autoSlotBookingDistrictWise.bind(
                    this,
                    districts,
                    ++index,
                    slots,
                    done
                ),
                (Math.random() + 0.5) * 1000
            );
        });
    },

    getAvailbleSlots: function(district_id, callback) {
        if (counter == 0) {
            console.log("Query Date:: ", cowinUtil.curDateFormatted());
        }
        let options = {
            method: "GET",
            url: constant.cowinBaseUrl + constant.cowinV2 + constant.slotsByDistrict,
            qs: {
                district_id: district_id,
                date: cowinUtil.curDateFormatted(),
            },
            headers: {
                accept: "application/json, text/plain, */*",
                authorization: "Bearer " + this.authToken,
            },
            json: true,
        };

        request(options, function(error, response) {
            if (error) throw new Error(error);
            let availableSlotData = processCowinData(response.body);
            // console.log(
            //     "District: " +
            //     district_id +
            //     " | Slots: " +
            //     availableSlotData.available_slots.length +
            //     "| Total Sessions: " +
            //     availableSlotData.totalSessions
            // );
            callback(availableSlotData);
        });
    },
};

var processCowinData = function(cowinResponse) {
    let processedCowinData = {
        available_slots: [],
        totalSessions: 0,
    };
    let centres = cowinResponse.centers;
    if (centres == undefined) {
        console.error(cowinResponse);
    }
    for (let i = 0; i < centres.length; i++) {
        let centreData = centres[i];
        let centreName = centreData.name;
        let centreAddress = centreData.address;
        let sessionsData = centreData.sessions;
        for (let j = 0; j < sessionsData.length; j++) {
            processedCowinData.totalSessions = processedCowinData.totalSessions + 1;
            let sessionData = sessionsData[j];
            if (sessionData.min_age_limit >= 45) {
                continue;
            }
            if (sessionData.available_capacity < constant.minAvailableSlots) {
                continue;
            }
            if (sessionData.vaccine != "COVISHIELD") {
                continue;
            }
            processedCowinData.available_slots.push({
                district_id: centreData.district_id,
                session_id: sessionData.session_id,
                district_name: centreData.district_name,
                centre_name: centreName,
                centre_address: centreAddress,
                pincode: centreData.pincode,
                date: sessionData.date,
                available_capacity: sessionData.available_capacity,
                min_age_limit: sessionData.min_age_limit,
                vaccine: sessionData.vaccine,
            });
        }
    }
    return processedCowinData;
};