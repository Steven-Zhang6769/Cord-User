// app.js
import { getUserData } from "./utils/userUtils";
const CommunityManager = require("./utils/communityManager");
App({
    globalData: {
        userInfo: null,
        friends: [],
        openid: null,
        ownerData: null,
        merchantData: null,
        loginStatus: false,
        currentOrder: null,
        currentMerchant: null,
    },

    onLaunch: function () {
        this.initializeApp();
    },

    initializeApp: async function () {
        const communityManager = new CommunityManager();
        this.globalData.communityManager = communityManager;
        this.initializeCloud();
        this.autoUpdate();
        const openid = await this.handleOpenid();
        await this.handleUserInfo(openid);
    },

    initializeCloud: function () {
        if (!wx.cloud) {
            console.error("请使用 2.2.3 或以上的基础库以使用云能力");
        } else {
            wx.cloud.init({
                env: "cord-4gtkoygbac76dbeb",
                traceUser: true,
            });
        }
    },

    autoUpdate: function () {
        if (wx.canIUse("getUpdateManager")) {
            const updateManager = wx.getUpdateManager();
            updateManager.onCheckForUpdate((res) => {
                if (res.hasUpdate) {
                    wx.showModal({
                        title: "更新提示",
                        content: "检测到新版本，是否下载新版本并重启小程序？",
                        success: (res) => {
                            if (res.confirm) {
                                this.downLoadAndUpdate(updateManager);
                            } else if (res.cancel) {
                                wx.showModal({
                                    title: "提示",
                                    content: "本次版本更新涉及到新的功能添加，旧版本无法正常访问的",
                                    showCancel: false,
                                    confirmText: "确定更新",
                                    success: (res) => {
                                        if (res.confirm) {
                                            this.downLoadAndUpdate(updateManager);
                                        }
                                    },
                                });
                            }
                        },
                    });
                }
            });
        } else {
            wx.showModal({
                title: "提示",
                content: "当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试",
            });
        }
    },

    downLoadAndUpdate: function (updateManager) {
        wx.showLoading();
        updateManager.onUpdateReady(() => {
            wx.hideLoading();
            updateManager.applyUpdate();
        });
        updateManager.onUpdateFailed(() => {
            wx.showModal({
                title: "新版本存在",
                content: "新版本已经上线，请您删除当前小程序，重新搜索打开",
            });
        });
    },

    handleOpenid: async function () {
        let openid = wx.getStorageSync("openid");
        if (openid) {
            return openid;
        } else {
            try {
                let res = await wx.cloud.callFunction({ name: "getOpenid" });
                openid = res.result.openid;
                wx.setStorageSync("openid", openid);
                this.globalData.openid = openid;
            } catch (error) {
                console.log("云函数获取失败", error);
            }
        }
        return openid;
    },

    handleUserInfo: async function (openid) {
        if (!openid) return;

        let userInfo = wx.getStorageSync("userInfo");
        if (userInfo) {
            this.globalData.userInfo = userInfo;
            this.globalData.loginStatus = true;
            return;
        } else {
            getUserData(openid);
        }
    },
});
