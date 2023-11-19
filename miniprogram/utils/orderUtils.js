const { formatDateTimeShortYear } = require("./util");
const db = wx.cloud.database();
const _ = db.command;
const $ = _.aggregate;

// Function to get orders for a specific merchant
async function getMerchantOrders(merchantId) {
    try {
        const res = await wx.cloud.callFunction({
            name: "fetch",
            data: {
                type: "order",
                whereCondition: {
                    merchant: merchantId,
                },
            },
        });
        return res.result.list;
    } catch (error) {
        console.error("Error fetching orders for merchant:", error);
        throw error;
    }
}

async function getUserActiveOrders(cordID) {
    try {
        const res = await wx.cloud.callFunction({
            name: "fetch",
            data: {
                type: "order",
                whereCondition: {
                    participant: cordID,
                    status: { $ne: "complete" },
                },
                date: true,
                limit: 3,
            },
        });
        return res.result.list;
    } catch (error) {
        console.error("Error fetching orders for merchant:", error);
        throw error;
    }
}
async function filterFetchOrders(filter) {
    // Determine the active filter based on the data
    let whereCondition = {};
    if (filter.pending) {
        whereCondition.status = "pending";
    }
    if (filter.paid) {
        whereCondition.status = "paid";
    }
    if (filter.complete) {
        whereCondition.status = "complete";
    }
    if (filter.rejected) {
        whereCondition.status = "rejected";
    }

    let requestData = {
        type: "order",
        whereCondition: whereCondition,
    };

    if (filter.current) {
        // Logic to filter current orders (you would define what "current" means for your use case)
        requestData.date = true;
    }
    if (filter.history) {
        // Logic to filter historical orders
        requestData.dateReverse = true;
    }

    try {
        const res = await wx.cloud.callFunction({
            name: "fetch",
            data: requestData,
        });
        return res.result.list;
    } catch (error) {
        console.error("Error fetching orders for merchant:", error);
        throw error;
    }
}

async function getOrderfromID(orderId) {
    try {
        const res = await wx.cloud.callFunction({
            name: "fetch",
            data: {
                type: "order",
                whereCondition: {
                    _id: orderId,
                },
            },
        });
        let order = res.result.list[0];
        order.date = formatDateTimeShortYear(new Date(order.date));
        order.createTime = formatDateTimeShortYear(new Date(order.createTime));
        return order;
    } catch (error) {
        console.error("Error fetching order:", error);
        throw error;
    }
}

module.exports = {
    getMerchantOrders,
    getUserActiveOrders,
    filterFetchOrders,
    getOrderfromID,
};
