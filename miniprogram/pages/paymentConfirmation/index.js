const app = getApp();
import { getCurrentAppointments } from "../../utils/merchantUtils";
import { formatMonthDay, createFullDateTime, formatFullDateTime } from "../../utils/util";

Page({
    // ========================
    // Data Initialization
    // ========================
    data: {
        merchantData: app.globalData.currentMerchant,
        order: app.globalData.currentOrder,
        openid: wx.getStorageSync("openid"),
        userInfo: wx.getStorageSync("userInfo"),
        currentAppointments: [],
        reservationShow: false,
        calendarShow: false,
        timeShow: false,
        minHour: 10,
        maxHour: 20,
        minDate: new Date().getTime(),
        maxDate: new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate()).getTime(),
        userLocation: "",
        selectedYear: "",
        selectedDate: "",
        selectedTime: "",
        shownTime: "",
        selectedDateTime: "",
        file: "",
        filter(type, options) {
          if (type === 'minute') {
            return options.filter((option) => option % 30 === 0);
          }
    
          return options;
        },
    },

    // ========================
    // Lifecycle Methods
    // ========================
    onLoad: async function (options) {
        const currentAppointments = await getCurrentAppointments(options.merchantid);
        this.setData({
            currentAppointments: currentAppointments,
            total: options.total,
        });
    },

    // ========================
    // Calendar Methods
    // ========================
    onOpenCalendar() {
        this.setData({ calendarShow: true });
    },
    onCloseCalendar() {
        this.setData({ calendarShow: false });
    },
    onConfirmDate(e) {
        const selectedDateObject = new Date(e.detail);
        const { startTime, endTime } = this.getAvailableTimesForSelectedDay(selectedDateObject);
        if (startTime == 0 || endTime == 0) {
            wx.showToast({
                title: "当日无档期，请重选日期",
                icon: "none",
            });
            return;
        }
        this.setData({
            calendarShow: false,
            selectedDate: formatMonthDay(e.detail),
            selectedYear: selectedDateObject.getFullYear(),
            selectedTime: "",
            shownTime: "",
            minHour: startTime,
            maxHour: endTime,
        });
    },

    getAvailableTimesForSelectedDay(selectedDateObject) {
        const merchantAvailableTimes = this.data.merchantData.availableTimesJson;
        const selectedWeekday = selectedDateObject.getDay();

        let startTime = 0;
        let endTime = 0;

        merchantAvailableTimes.forEach((timeSlot) => {
            if (timeSlot.day === selectedWeekday) {
                startTime = timeSlot.startTime;
                endTime = timeSlot.endTime;
            }
        });

        return { startTime, endTime };
    },

    // ========================
    // Location Methods
    // ========================

    onChangeLocation(e) {
        this.setData({
            userLocation: e.detail,
        });
    },

    // ========================
    // Time Picker Methods
    // ========================
    onOpenReservation(e) {
        this.setData({ reservationShow: true });
    },
    onReservationClose(e) {
        this.setData({ reservationShow: false });
    },
    onOpenTimePicker(e) {
        if (this.data.selectedDate == "") {
            wx.showToast({
                title: "请先选择日期",
                icon: "none",
            });
        } else {
            this.setData({
                timeShow: true,
            });
        }
    },
    onConfirmTime(e) {
        this.setData({
            selectedTime: e.detail,
        });
    },
    onTimeClose(e) {
        this.setData({
            timeShow: false,
            shownTime: e.detail,
        });
    },
    onConfirmDateTime(e) {
        const { selectedYear, selectedDate, selectedTime } = this.data;
        const selectedDateTime = createFullDateTime(selectedYear, selectedDate, selectedTime);

        if (this.isTimeSlotFull(selectedDateTime)) {
            wx.showToast({
                title: "该档期已满，请重选",
                icon: "none",
            });
        } else {
            this.setData({
                selectedDateTime: formatFullDateTime(selectedDateTime),
                selectedDateObject: selectedDateTime,
                reservationShow: false,
            });
        }
    },

    isTimeSlotFull(selectedDateTime) {
        return this.data.currentAppointments.some((appointment) => appointment.getTime() === selectedDateTime.getTime());
    },

    // ========================
    // File Handling Methods
    // ========================
    upload(e) {
        wx.chooseMedia({
            media: ["image"],
            count: 1,
            sizeType: ["original", "compressed"],
            sourceType: ["album", "camera"],
        })
            .then((res) => {
                this.setData({
                    file: res.tempFiles[0].tempFilePath,
                });
            })
            .catch((err) => {
                wx.showToast({
                    title: "上传失败",
                    icon: "error",
                });
            });
    },
    enlarge(e) {
        wx.previewImage({
            current: e.currentTarget.dataset.url,
            urls: [e.currentTarget.dataset.url],
        });
    },

    // ========================
    // Order Handling Methods
    // ========================
    async submitOrder(e) {
        if (!this.isDateTimeSelected()) {
            this.showDateTimeError();
            return;
        }

        wx.showLoading({ title: "创建订单中" });

        try {
            const screenshotID = this.generateScreenshotID();
            const uploadResult = await this.uploadScreenshot(screenshotID);

            const transactionID = await this.createTransaction(uploadResult.fileID);
            if (!transactionID) throw "transaction creation failed";

            const orderID = await this.createOrder(transactionID);
            if (!orderID) throw "order creation failed";

            this.handleOrderSuccess(orderID);
        } catch (err) {
            this.handleOrderError(err);
        }
    },

    isDateTimeSelected() {
        return this.data.selectedDateTime !== "选择时间";
    },

    showDateTimeError() {
        wx.showToast({
            title: "请先选择预约时间",
            icon: "none",
        });
    },

    generateScreenshotID() {
        return Date.now() + "Transaction.jpg";
    },

    async uploadScreenshot(screenshotID) {
        return wx.cloud.uploadFile({
            cloudPath: screenshotID,
            filePath: this.data.file,
        });
    },

    async createTransaction(screenshotFileID) {
        const { total, userInfo, merchantData } = this.data;
        const res = await wx.cloud
            .database()
            .collection("transactions")
            .add({
                data: {
                    sender: userInfo._id,
                    receiver: merchantData.owner,
                    amount: total,
                    screenshot: screenshotFileID,
                    category: "screenshotUSD",
                    createTime: new Date(),
                },
            });
        return res._id;
    },

    async createOrder(transactionID) {
        const { merchantData, userInfo, userLocation, total, order, selectedDateObject } = this.data;

        const res = await wx.cloud
            .database()
            .collection("orders")
            .add({
                data: {
                    merchant: merchantData._id,
                    participant: userInfo._id,
                    transaction: transactionID,
                    order: order,
                    date: selectedDateObject,
                    status: "pending",
                    total: total,
                    userLocation: userLocation,
                    createTime: new Date(),
                },
            });

        return res._id;
    },

    handleOrderSuccess(orderID) {
        wx.hideLoading();
        wx.showToast({
            title: "订单创建成功",
            icon: "success",
        }).then(() => {
            wx.reLaunch({
                url: "/pages/orderDetail/index?orderid=" + orderID,
            });
        });
    },

    handleOrderError(err) {
        console.log(err);
        wx.hideLoading();
        wx.showToast({
            title: "订单创建失败",
            icon: "error",
        });
    },
});
