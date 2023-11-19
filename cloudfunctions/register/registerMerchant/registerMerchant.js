const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
    const db = cloud.database();
    const _ = db.command;
    const $ = _.aggregate;

    const {
        storeName,
        detailDescription,
        coverpic,
        subpic,
        ownerid,
        ownerWechat,
        locationName,
        availableTimes,
        paymentMethod,
        category,
        locationDetail,
    } = event;
    try {
        const res = await db.collection("merchant-applications").add({
            data: {
                title: storeName,
                subTitle: detailDescription,
                coverPic: coverpic,
                subPic: subpic,
                owner: ownerid,
                ownerWechat: ownerWechat,
                locationName: locationName,
                availableTimes: availableTimes,
                paymentInfo: paymentMethod,
                category: category,
                locationDetail: locationDetail,
                approved: false,
            },
        });
        return res;
    } catch (error) {
        console.error(error);
    }
};
