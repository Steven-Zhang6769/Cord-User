const app = getApp();
import { getUserData } from "../../utils/userUtils";
Page({
    data: {
        openid: wx.getStorageSync("openid"),
        friendList: app.globalData.userInfo.friends,
    },

    onLoad: async function (options) {
        wx.showLoading({ title: "加载中" });
        const res = await getUserData(this.data.openid);
        this.setData({
            userInfo: app.globalData.userInfo,
            friendList: app.globalData.userInfo.friends,
        });
        wx.hideLoading();
    },
    chat(e) {
        let chatID = e.currentTarget.dataset.chatid;
        let name = e.currentTarget.dataset.name;
        let targetOpenID = e.currentTarget.dataset.openid;
        wx.navigateTo({
            url: "/pages/example/chatroom_example/room/room?id=" + chatID + "&name=" + name + "&haoyou_openid=" + targetOpenID,
        });
    },
});
