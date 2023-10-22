const app = getApp();
import { getAllMerchantData } from "../../utils/merchantUtils";
import { fetchDataFromDB } from "../../utils/dbUtils";
Page({
    data: {
        searchList: [],
        merchants: [],
        sliders: [],
        loginStatus: app.globalData.loginStatus,
        cordID: wx.getStorageSync("CordID"),
        userInfo: wx.getStorageSync("userInfo"),
        showResult: false,
        cardCur: 1,
        categories: [
            { text: "推荐", value: 0 },
            { text: "学习", value: 1 },
            { text: "服务", value: 2 },
            { text: "娱乐", value: 3 },
        ],
        categoryValue: 0,
    },

    onLoad: function (options) {
        this.refreshData();
    },

    onPullDownRefresh: function () {
        this.refreshData();
    },

    async refreshData() {
        const merchants = await getAllMerchantData();
        this.getSlider();
        this.setData({ merchants: merchants });
    },

    async getSlider() {
        const res = await wx.cloud.database().collection("slider").get();
        this.setData({ sliders: res.data });
    },

    search: async function (e) {
        const value = e.detail;
        const db = wx.cloud.database();
        const _ = db.command;
        const searchRes = await fetchDataFromDB(
            "merchant",
            _.or([{ title: { $regex: ".*" + value + ".*", $options: "1" } }, { subTitle: { $regex: ".*" + value + ".*", $options: "1" } }])
        );
        const finalList = searchRes.length === 0 ? [] : searchRes;
        const searchStatus = finalList.length === 0 ? 1 : value && value.length > 0 ? 2 : 0;
        this.setData({
            searchList: finalList,
            search: searchStatus,
        });
    },

    cardSwiper(e) {
        this.setData({
            cardCur: e.detail.current,
        });
    },

    merchantNavigator: function (e) {
        const targetUrl =
            e.currentTarget.dataset.category === "chef"
                ? "/pages/chefDetail/index?id=" + e.currentTarget.dataset.merchant
                : "/pages/merchantDetail/index?id=" + e.currentTarget.dataset.merchant;
        wx.navigateTo({ url: targetUrl });
    },

    swiperNavigator: function (e) {
        if (!this.data.cordID) {
            wx.showToast({ title: "请先注册/登陆" });
        }
        wx.navigateTo({ url: e.currentTarget.dataset.url });
    },

    categoryNavigator: function (e) {
        wx.navigateTo({
            url: "/pages/categoryList/index?category=" + e.currentTarget.dataset.category,
        });
    },
});
