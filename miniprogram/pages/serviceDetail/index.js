const app = getApp();
const { getMerchantOrders } = require("../../utils/orderUtils");

Page({
    data: {
        loginStatus: app.globalData.loginStatus,
    },

    onLoad(options) {
        this.setData({
            serviceID: options.serviceid,
            options: options,
        });
        this.refreshServiceData();
        wx.stopPullDownRefresh();
    },

    onPullDownRefresh() {
        this.refreshServiceData();
        wx.hideLoading();
    },

    async refreshServiceData() {
        await this.loadServiceData(this.data.serviceID);
    },

    async loadServiceData(serviceID) {
        try {
            const serviceData = await this.fetchDocumentFromCollection("service", serviceID);
            this.setData({ serviceData });

            const merchantData = await this.fetchMerchantWithLeaderData(serviceData.merchant);
            this.setData({ merchantData });
        } catch (error) {
            console.error("Error loading service data:", error);
        }
    },

    async fetchMerchantWithLeaderData(merchantID) {
        const merchantData = await this.fetchDocumentFromCollection("merchant", merchantID);
        merchantData.leaderData = await this.getUserData(merchantData.leader);
        return merchantData;
    },

    fetchDocumentFromCollection(collectionName, documentID) {
        return wx.cloud
            .database()
            .collection(collectionName)
            .doc(documentID)
            .get()
            .then((res) => res.data);
    },

    getUserData(userID) {
        return wx.cloud
            .database()
            .collection("user")
            .where({ _id: userID })
            .get()
            .then((res) => res.data[0]);
    },

    enlarge(e) {
        const url = e.currentTarget.dataset.url;
        wx.previewImage({
            current: url,
            urls: [url],
        });
    },

    navigateToPayment(serviceid, merchantid) {
        wx.navigateTo({
            url: `/pages/paymentConfirmation/index?serviceid=${serviceid}&merchantid=${merchantid}`,
        });
    },

    payment(e) {
        if (this.data.loginStatus) {
            this.navigateToPayment(e.currentTarget.dataset.serviceid, e.currentTarget.dataset.merchantid);
        } else {
            wx.showToast({
                title: "请先登陆/注册",
                icon: "error",
            });
        }
    },
});
