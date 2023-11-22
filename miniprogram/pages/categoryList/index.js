var util = require("../../utils/util");
const { fetchMerchantData } = require("../../utils/merchantUtils");

Page({
    data: {
        allMerchants: [],
        loading: true,
    },
    onLoad: function (options) {
        wx.showLoading({
            title: "加载中",
        });
        let currentCategory = [options.category];
        switch (options.category) {
            case "study":
                wx.setNavigationBarTitle({ title: "学习类" });
                break;
            case "service":
                wx.setNavigationBarTitle({ title: "服务类" });
                currentCategory = ["service", "chef"];
                break;
            case "entertainment":
                wx.setNavigationBarTitle({ title: "娱乐类" });
                break;
        }
        this.setData({
            category: currentCategory,
            loading: false,
        });
        wx.hideLoading();
        this.getAllMerchants();
    },
    onReady: function (options) {},
    onPullDownRefresh: function () {
        this.onLoad(); //重新加载onLoad()
        wx.hideLoading();
    },

    async getAllMerchants(e) {
        try {
            const allMerchants = await fetchMerchantData({ category: this.data.category[0] });
            this.setData({
                allMerchants,
            });
        } catch (error) {
            console.error(error);
        }
    },
    merchantNavigator(e) {
        wx.navigateTo({
            url: "/pages/merchantDetail/index?id=" + e.currentTarget.dataset.merchant,
        });
    },
});
