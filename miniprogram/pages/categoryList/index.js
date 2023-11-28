var util = require("../../utils/util");
const { fetchMerchantData } = require("../../utils/merchantUtils");

Page({
    data: {
        allMerchants: [],
        loading: false,
    },
    onLoad: async function (options) {
        console.log(options);
        this.setData({ loading: true });
        let category = options.category;
        switch (options.category) {
            case "learning":
                wx.setNavigationBarTitle({ title: "学习类" });
                break;
            case "service":
                wx.setNavigationBarTitle({ title: "服务类" });
                break;
            case "entertainment":
                wx.setNavigationBarTitle({ title: "娱乐类" });
                break;
        }
        await this.getAllMerchants(options.category);
        this.setData({ loading: false, category });
    },
    onPullDownRefresh: async function () {
        await this.onLoad({
            category: this.data.category,
        });
        wx.stopPullDownRefresh();
    },

    async getAllMerchants(category) {
        try {
            const allMerchants = await fetchMerchantData({ category: category });
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
