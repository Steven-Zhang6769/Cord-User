import { getOrderfromID } from "../../utils/orderUtils";
import { contactMerchant } from "../../utils/messagingUtils";
const app = getApp();
Page({
    data: {
        userInfo: app.globalData.userInfo,
        loading: true,
        rating: 0,
    },

    onLoad: async function (options) {
        wx.showLoading({ title: "加载订单中" });
        const orderData = await getOrderfromID(options.orderid);
        const { transactionData, merchantData, participantData } = orderData;

        this.setData({
            transactionData,
            merchantData,
            participantData,
            orderData,
            loading: false,
        });
        wx.hideLoading();
    },
    enlarge(e) {
        wx.previewImage({
            current: e.currentTarget.dataset.url,
            urls: [e.currentTarget.dataset.url],
        });
    },
    transactionNavigator(e) {
        wx.navigateTo({
            url: "/pages/transactionDetail/index?transactionid=" + e.currentTarget.dataset.transactionid,
        });
    },
    merchantNavigator(e) {
        wx.navigateTo({
            url: "/pages/merchantDetail/index?id=" + this.data.merchantData._id,
        });
    },
    async onChangeRating(e) {
        try {
            updateRating(e.detail);
            this.setData({
                rating: e.detail,
            });
        } catch (error) {
            wx.showToast({
                title: "评分失败",
                icon: "error",
            });
            console.error("Rating error:", error);
        }
    },
    async onContactMerchant() {
        try {
            const { userInfo, merchantData } = this.data;
            let ownerData = await wx.cloud.callFunction({
                name: "fetch",
                data: {
                    type: "owner",
                    ownerid: merchantData.owner,
                },
            });
            await contactMerchant(userInfo, ownerData);
        } catch (error) {
            console.error("Contact merchant error:", error);
        }
    },
    async updateRating(rating) {
        const res = await cloud
            .database()
            .collection("orders")
            .doc(this.data.orderData._id)
            .update({
                data: {
                    rating: rating,
                },
            });
        return res;
    },
});
