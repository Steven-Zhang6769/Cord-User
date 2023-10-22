// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database();
const TEMPLATE_ID = "b0cVrk0vEvthUKTmqt7xV-31wgxUcC-beFDI5N4kkXc";

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    let response = await cloud.openapi.subscribeMessage.send({
        touser: event.haoyouopenid,
        templateId: TEMPLATE_ID,
        page: event.url,
        lang: "zh_CN",
        miniprogram_state: "developer",
        data: event.data,
    });
    return { status: "success", response };
} catch (error) {
    console.error(error);
    return { status: "error", error };
}
}