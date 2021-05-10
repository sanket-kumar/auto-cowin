var express = require("express");
var request = require("request");
var constant = require("./utils/constant.js");
var findSlots = require("./cowin_main/find_slots.js");
const {
    txnId,
    authToken
} = require("./cowin_main/find_slots.js");

var router = express.Router();

/* GET users listing. */
router.get("/generateOtp", function(req, res, next) {
    let phoneNumber = req.query.phoneNumber;
    if (phoneNumber == undefined || phoneNumber.length != 10) {
        return res.status(400).send("Invalid phone number");
    }
    var options = {
        method: "POST",
        url: constant.cowinBaseUrl + constant.cowinV2 + constant.generateOtpEndpoint,
        headers: {
            authority: "cdn-api.co-vin.in",
            "sec-ch-ua": '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
            accept: "application/json, text/plain, */*",
            "content-type": "application/json",
        },
        body: {
            secret: "U2FsdGVkX19nD5gmYK5o1/hV3We2XF5hzvrlvEbfPTGuyUXs1u3kCqo+bVOmSg6zJnQ8RMl5yNQKOhyOEcEBJw==",
            mobile: parseInt(phoneNumber),
        },
        json: true
    };

    request(options, function(error, response) {
        if (error) {
            console.error(error);
            return res.status(500).send("Error from CoWin");
        }
        findSlots.txnId = response.body.txnId;
        if (findSlots.txnId == undefined) {
            console.log(response.body);
            console.log(options.body)
            return res.status(500).send(response.body || "Error generating OTP");
        }
        console.log("Txn ID: ", findSlots.txnId);
        res.send("Successfully generated");
    });
});

router.get("/generateAuthToken", function(req, res, next) {
    let otp = req.query.otp;
    if (otp == undefined) {
        return res.status(400).send("Invalid otp");
    }
    var options = {
        'method': 'POST',
        'url': constant.cowinBaseUrl + constant.cowinV2 + constant.confirmOtpEndpoint,
        'headers': {
            authority: "cdn-api.co-vin.in",
            "sec-ch-ua": '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
            accept: "application/json, text/plain, */*",
            "content-type": "application/json",
        },
        body: {
            "otp": parseInt(otp),
            "txnId": findSlots.txnId
        },
        json: true
    };
    request(options, function(error, response) {
        if (error) {
            console.error(error);
            return res.status(500).send("Error from CoWin");
        }
        findSlots.authToken = response.body.token;
        if (findSlots.authToken == undefined) {
            console.log(response.body);
            return res.status(500).send(response.body || "Error generating Auth Token");
        }
        console.log("Auth Token: ", findSlots.authToken);
        res.send("Successfully Verified");
    });
});

router.get("/findSlots", function(req, res, next) {
    let districtId = req.query.districtId;
    if (districtId == undefined) {
        return res.status(400).send("Invalid districtId");
    }
    findSlots.getAvailbleSlots(parseInt(districtId), (response) => {
        res.send(response)
    });
});

router.get("/findSlotsAuto", function(req, res, next) {
    if (req.query.districts == undefined) {
        throw new Error("Please provide districts");
    }
    let districts = req.query.districts.split(',');
    findSlots.startAutoScript();
    findSlots.autoSlotBooking(districts);
    res.send("Started Auto Slot finding")
});

router.get("/stopSlotsAuto", function(req, res, next) {
    if (findSlots.runAutoScript == false) {
        return res.send("Already stopped");
    }
    findSlots.stopAutoScript();
    return res.send("Stopped auto slot booking");

});

router.get("/setAuthToken", function(req, res, next) {
    let authToken = req.query.authToken;
    if (authToken == undefined) {
        return res.status(400).send("Invalid Auth Token");
    }
    findSlots.authToken = authToken;
    return res.send("Set Auth token successfully!!!!!!!!");

});

module.exports = router;