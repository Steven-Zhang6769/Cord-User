const app = getApp();
const { getMerchantDataWithId } = require("../../utils/merchantUtils");

const TEMPLATE_ID = "b0cVrk0vEvthUKTmqt7xV-31wgxUcC-beFDI5N4kkXc";

Page({
    // Initialization & Setup
    data: {
        openid: wx.getStorageSync("openid"),
        loginStatus: app.globalData.loginStatus,
        userInfo: wx.getStorageSync("userInfo"),
        showMerchantDetail: false,
    },

    onLoad(options) {
        this.fetchMerchantData(options.id);
    },

    // Data Fetching
    async fetchMerchantData(id) {
        try {
            const [merchantData] = await getMerchantDataWithId(id);
            this.setData({ merchantData });
        } catch (error) {
            console.error("Error loading merchant data:", error);
        }
    },

    // UI Actions
    openLocation() {
        const { longitude, latitude, locationName, locationDetail } = this.data.merchantData;

        if (!longitude || !latitude) {
            return wx.showToast({
                title: "商家未提供具体地址",
                icon: "none",
            });
        }

        wx.openLocation({
            latitude,
            longitude,
            name: locationName,
            address: locationDetail,
        });
    },

    enlarge(e) {
        const url = e.currentTarget.dataset.url;
        wx.previewImage({
            current: url,
            urls: this.data.merchantData.subPic,
        });
    },
    showMerchantDetail() {
        this.setData({ showMerchantDetail: true });
    },
    closeStoreDetail() {
        this.setData({ showMerchantDetail: false });
    },

    // Chat-related Operations
    async contactMerchant() {
        if (!this.data.loginStatus) {
            return wx.showToast({
                title: "请先登陆/注册",
                icon: "none",
            });
        }

        const { openid, userInfo, merchantData } = this.data;
        const ownerInfo = merchantData.ownerData;
        const ownerOpenID = ownerInfo.openid;
        const chatID = `${ownerOpenID}${openid}`;

        try {
            if (!userInfo.friends.some((e) => e.openid === ownerOpenID)) {
                await this.subscribeAndAddToFriends(openid, ownerOpenID, userInfo, ownerInfo, chatID);
            }
            this.chatRoomNavigator(chatID, ownerInfo.username, ownerOpenID);
        } catch (error) {
            console.log(error);
            wx.showToast({
                title: "私信失败",
                icon: "error",
            });
        }
    },

    async subscribeAndAddToFriends(customerOpenID, ownerOpenID, customerInfo, ownerInfo, chatID) {
        const subscribeRes = await wx.requestSubscribeMessage({
            tmplIds: [TEMPLATE_ID],
        });
        if (subscribeRes.errMsg !== "requestSubscribeMessage:ok") {
            throw new Error("Request subscribe message failed");
        }

        const addPeopleRes = await wx.cloud.callFunction({
            name: "confirmFriend",
            data: {
                requesterOpenID: customerOpenID,
                requesterInfo: customerInfo,
                receiverOpenID: ownerOpenID,
                receiverInfo: ownerInfo,
                chatRoomID: chatID,
            },
        });
        if (addPeopleRes.errMsg !== "cloud.callFunction:ok") {
            throw new Error("Add people failed");
        }
    },

    // Navigation Helpers
    serviceDetailNavigator(e) {
        const { serviceid, data } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/serviceDetail/index?serviceid=${serviceid}&data=${JSON.stringify(data)}`,
        });
    },

    chatRoomNavigator(chatID, roomName, ownerOpenID) {
        wx.navigateTo({
            url: `/pages/example/chatroom_example/room/room?id=${chatID}&name=${roomName}&haoyou_openid=${ownerOpenID}`,
        });
    },

    navigateBack() {
        wx.navigateBack({ delta: 1 });
    },
});
