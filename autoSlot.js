var findSlots = require("./routes/cowin_main/find_slots.js");

function main() {
    if (process.argv.length < 4) {
        console.error("Invalid arguments!!!!");
        process.exit(1);
    }
    const districtString = process.argv[2];
    const authToken = process.argv[3];
    let districts = districtString.split(',');
    findSlots.authToken = authToken;
    findSlots.startAutoScript();
    findSlots.autoSlotBooking(districts);
    console.log("Started Auto Slot finding")
}

main();