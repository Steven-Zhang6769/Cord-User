const updateOrder = require("./updateOrder/index");
const updateMerchant = require("./updateMerchant/index");
const updateService = require("./updateService/index");
// 云函数入口函数

exports.main = async (event, context) => {
    switch (event.type) {
        case "order":
            return updateOrder.main(event, context);
        case "merchant":
            return updateMerchant.main(event, context);
        case "service":
            return updateService.main(event, context);
        default:
            return null;
    }
};