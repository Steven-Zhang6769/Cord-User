const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
    const db = cloud.database();
    const _ = db.command;
    const $ = _.aggregate;

    const { avatarFileID, username, openid } = event;
    try {
        const res = await db.collection("owners").add({
            data: {
                avatar: avatarFileID,
                username: username,
                openid: openid,
                friends: [],
            },
        });
        return res;
    } catch (error) {
        console.error(error);
    }
};
