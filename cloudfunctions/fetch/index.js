const fetchMerchantData = require("./fetchMerchantData/index");
const fetchOrderData = require("./fetchOrderData/index");
const fetchTransactionData = require("./fetchTransactionData/index");
const fetchOwnerData = require("./fetchOwnerData/index");

// 云函数入口函数

exports.main = async (event, context) => {
    switch (event.type) {
        case "merchant":
            return fetchMerchantData.main(event, context);
        case "order":
            return fetchOrderData.main(event, context);
        case "transaction":
            return fetchTransactionData.main(event, context);
        case "owner":
            return fetchOwnerData.main(event, context);
        default:
            return null;
    }
};
