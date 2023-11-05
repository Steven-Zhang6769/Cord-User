const db = wx.cloud.database();
const _ = db.command;
const $ = _.aggregate;

async function getAllMerchantData() {
    return await fetchMerchantData();
}

async function getMerchantDataWithID(id) {
    return await fetchMerchantData({ _id: id });
}
async function fetchMerchantData(whereCondition = {}) {
    try {
        const res = await wx.cloud.callFunction({
            name: "fetchMerchantData",
            data: {
                whereCondition: whereCondition,
            },
        });
        return res.result.list;
    } catch (error) {
        console.error("Error fetching merchant data:", error);
    }
}

async function getCurrentAppointments(merchantID) {
    try {
        const futureAppointments = await db
            .collection("orders")
            .where({
                merchant: merchantID,
                date: db.command.gt(new Date()),
            })
            .get();

        const appointments = futureAppointments.data;

        const appointmentTimes = appointments.flatMap((appointment) => {
            const startDate = new Date(appointment.date);
            const endDate = new Date(startDate);
            endDate.setMinutes(startDate.getMinutes() + 30);
            return [startDate, endDate];
        });

        return appointmentTimes;
    } catch (error) {
        console.error("Error fetching current appointments:", error);
        throw error;
    }
}

module.exports = {
    getAllMerchantData,
    getMerchantDataWithID,
    getCurrentAppointments,
};
