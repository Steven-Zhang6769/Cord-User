const { fetchDataFromDB } = require("./dbUtils");

async function getMerchantOrders(merchantId) {
    try {
        const orders = await fetchDataFromDB("orders", { merchant: merchantId });
        return await processOrders(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        throw error;
    }
}

async function processOrders(orders) {
    const allOrderDataPromises = orders.map(async (order) => {
        const [serviceData, participantData, transactionData] = await Promise.all([
            fetchDataFromDB("service", null, order.service),
            fetchDataFromDB("user", null, order.participant),
            fetchDataFromDB("transaction", null, order.transaction),
        ]);

        return {
            ...order,
            serviceData,
            participantData,
            transactionData,
            createTime: formatTimeWithHours(new Date(order.createTime)),
            reservationDate: formatTimeWithHours(new Date(order.date)),
        };
    });

    const allOrderData = await Promise.all(allOrderDataPromises);
    return allOrderData.sort((a, b) => new Date(a.reservationDate).getTime() - new Date(b.reservationDate).getTime());
}

module.exports = {
    getMerchantOrders,
};
