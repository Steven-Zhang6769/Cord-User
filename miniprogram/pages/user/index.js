const app = getApp();
import { getUserActiveOrders } from "../../utils/orderUtils";
Page({
    data: {
        userInfo: app.globalData.userInfo,
        loginStatus: app.globalData.loginStatus,
        loading: true,
    },
    onLoad: async function (options) {
        wx.showLoading({
            title: "加载中",
        });
        const res = await getUserActiveOrders(app.globalData.userInfo._id);
        this.setData({
            orderData: res,
            loading: false,
        });
        wx.hideLoading();
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
