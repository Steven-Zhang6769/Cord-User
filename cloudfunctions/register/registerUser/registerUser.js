const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
    const db = cloud.database();
    const _ = db.command;
    const $ = _.aggregate;

    try {
        const { type, ...restOfEvent } = event; // Destructure to separate 'type' from the rest
        const res = await db.collection("users").add({
            data: {
                ...restOfEvent, // Spread the rest of the fields excluding 'type'
                friends: [],
            },
        });
        return res;
    } catch (error) {
        console.error(error);
    }
  
};
