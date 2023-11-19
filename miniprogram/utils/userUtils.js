const app = getApp();

async function getUserData(openid) {
    try {
        let res = await wx.cloud.database().collection("users").where({ openid: openid }).get();
        let userInfo = res.data[0];
        if (!userInfo) throw "Error fetching user data";
        wx.setStorageSync("userInfo", userInfo);
        app.globalData.userInfo = userInfo;
        app.globalData.loginStatus = true;
    } catch (error) {
        console.log("error loading user", error);
    }
}

module.exports = {
    getUserData,
};
