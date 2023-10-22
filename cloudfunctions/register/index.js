// 云函数入口文件
const TcbRouter = require("tcb-router");
const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境

const db = cloud.database();

async function registerMerchant(event) {
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
        const res = await db.collection("merchant-application").add({
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
}

async function registerOwner(event) {
    const { avatarFileID, username, openid } = event;
    try {
        const res = await db.collection("owner").add({
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
}

async function registerService(event) {
    try {
        const res = await db.collection("service").add({
            data: {
                event,
            },
        });
        return res;
    } catch (error) {
        console.error(error);
    }
}

async function registerUser(event) {
    try {
        const res = await db.collection("user").add({
            data: {
                ...event,
                friends: [],
            },
        });
        return res;
    } catch (error) {
        console.error(error);
    }
}

// 云函数入口函数
exports.main = async (event, context) => {
    const app = new TcbRouter({ event });
    app.route("merchant", registerMerchant);
    app.route("owner", registerOwner);
    app.route("service", registerService);
    app.route("user", registerUser);

    return app.serve();
};
