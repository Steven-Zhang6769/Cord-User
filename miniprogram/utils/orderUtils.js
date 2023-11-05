const { formatDateTimeShortYear } = require("./util");

// Function to get orders for a specific merchant
async function getMerchantOrders(merchantId) {
    try {
        const res = await wx.cloud.callFunction({
            name: "fetchOrderData",
            data: {
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

async function getOrderfromID(orderId) {
    try {
        const res = await wx.cloud.callFunction({
            name: "fetchOrderData",
            data: {
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
    getOrderfromID,
};
