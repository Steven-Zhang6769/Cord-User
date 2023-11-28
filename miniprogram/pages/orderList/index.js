const app = getApp();
import { filterFetchOrders } from "../../utils/orderUtils";
Page({
    data: {
        loading: false,
        value: "",
        filters: {
            all: true,
            current: false,
            history: false,
            pending: false,
            paid: false,
            complete: false,
            rejected: false,
        },
        options: [
            { text: "所有", value: "all" },
            { text: "现存", value: "current" },
            { text: "历史", value: "history" },
            { text: "待审核", value: "pending" },
            { text: "已付款", value: "paid" },
            { text: "已完成", value: "complete" },
            { text: "已拒绝", value: "rejected" },
        ],
    },

    onLoad: async function (options) {
        this.setData({ loading: true });
        // Initialize newFilters object with all properties set to false
        let newFilters = {
            all: false,
            current: false,
            history: false,
            pending: false,
            paid: false,
            complete: false,
            rejected: false,
        };

        newFilters[options.type] = true;

        // Fetch orders with the current filter settings
        const res = await filterFetchOrders(newFilters);
        this.setData({
            filters: newFilters,
            value: options.type,
            orders: res,
            loading: false,
            inputOptions: options,
        });
    },
    async onPullDownRefresh() {
        await this.onLoad(this.data.inputOptions);
        wx.stopPullDownRefresh();
    },

    onFilterChange: async function (e) {
        wx.showLoading({ title: "加载中" });
        // Reset all filters
        let newFilters = {
            all: false,
            current: false,
            history: false,
            pending: false,
            paid: false,
            complete: false,
            rejected: false,
        };

        const value = e.detail;
        newFilters[value] = true;

        // Fetch the orders with new filters
        const res = await filterFetchOrders(newFilters);
        this.setData({ orders: res, filters: newFilters });
        wx.hideLoading();
    },

    orderNavigator: function (e) {
        wx.navigateTo({
            url: "/pages/orderDetail/index?orderid=" + e.currentTarget.dataset.orderid,
        });
    },
});
