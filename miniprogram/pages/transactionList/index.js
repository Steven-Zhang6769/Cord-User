const app = getApp();
import { getUserTransactions } from "../../utils/transactionUtils";
Page({
    data: {
        userInfo: app.globalData.userInfo,
    },

    onLoad: async function (options) {
        const res = await getUserTransactions(this.data.userInfo._id);
        this.setData({
            transactions: res,
        });
    },
    transactionNavigator(e) {
        wx.navigateTo({
            url: "/pages/transactionDetail/index?transactionid=" + e.currentTarget.dataset.transactionid,
        });
    },
});
