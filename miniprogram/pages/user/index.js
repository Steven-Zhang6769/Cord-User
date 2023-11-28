const app = getApp();
import { getUserActiveOrders } from "../../utils/orderUtils";
Page({
    data: {
        userInfo: app.globalData.userInfo,
        loginStatus: app.globalData.loginStatus,
        loading: false,
    },
    onLoad: async function (options) {
        this.setData({ loading: true });
        const res = await getUserActiveOrders(app.globalData.userInfo._id);
        this.setData({
            orderData: res,
            loading: false,
        });
    },
    async onPullDownRefresh() {
        await this.onLoad();
        wx.stopPullDownRefresh();
    },

    login(e) {
        wx.navigateTo({
            url: "../register/index",
        });
    },
    error(e) {
        wx.navigateTo({
            url: "/pages/error/index",
        });
    },
    suggestion(e) {
        if (this.data.loginStatus == true) {
            wx.navigateTo({
                url: "/pages/suggestion/index",
            });
        } else {
            wx.showToast({
                title: "请先登录/注册",
            });
        }
    },
    developer(e) {
        wx.navigateTo({
            url: "/pages/developer/index?",
        });
    },
    viewHistory(e) {
        wx.navigateTo({
            url: "/pages/orderList/index?type=history",
        });
    },

    viewMoreOrders() {
        wx.navigateTo({
            url: "/pages/orderList/index?type=current",
        });
    },

    viewCommunityHistory() {
        wx.navigateTo({
            url: "/pages/posts/history/index",
        });
    },

    viewTransactions(e) {
        wx.navigateTo({
            url: "/pages/transactionList/index",
        });
    },

    orderNavigator(e) {
        wx.navigateTo({
            url: "/pages/orderDetail/index?orderid=" + e.currentTarget.dataset.orderid,
        });
    },
});
