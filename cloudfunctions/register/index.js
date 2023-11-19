// 云函数入口文件

const cloud = require("wx-server-sdk");
const registerMerchant = require("./registerMerchant/index");
const registerOwner = require("./registerOwner/index");
const registerService = require("./registerService/index");
const registerUser = require("./registerUser/index");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
    switch (event.type) {
        case "merchant":
            return registerMerchant.main(event, context);
        case "owner":
            return registerOwner.main(event, context);
        case "service":
            return registerService.main(event, context);
        case "user":
            return registerUser.main(event, context);
        default:
            return null;
    }
};
