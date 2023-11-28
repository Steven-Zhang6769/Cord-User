const app = getApp();
Page({
    data: {
        userInfo: app.globalData.userInfo,
        fileList: [],
        message: "",
    },

    onLoad(options) {},
    handleFileList(event, operation, listName) {
        const fileList = [...this.data[listName]];
        const { file, index } = event.detail;

        if (operation === "add") {
            fileList.push({ file, url: file.url });
        } else if (operation === "delete") {
            fileList.splice(index, 1);
        }

        this.setData({ [listName]: fileList });
    },
    onClickLeft(e) {
        wx.navigateBack({
            delta: 1,
        });
    },
    onChange(e) {
        const { detail } = e;
        this.setData({ message: detail });
    },
    addPhoto(event) {
        this.handleFileList(event, "add", "fileList");
    },

    deletePhoto(event) {
        this.handleFileList(event, "delete", "fileList");
    },
    uploadSingleFile(filename, url) {
        return wx.cloud.uploadFile({
            cloudPath: filename,
            filePath: url,
        });
    },

    async uploadFiles(files) {
        if (!files.length) return [];

        const uploadTasks = files.map((file) => {
            const extension = file.url.split(".").pop();
            return this.uploadSingleFile(`${Math.floor(Math.random() * 100000)}.${extension}`, file.url);
        });
        return await Promise.all(uploadTasks);
    },
    async submit() {
        const { fileList, message } = this.data;
        if (!message) {
            wx.showToast({
                title: `内容不能为空`,
                icon: "none",
            });
            return;
        }

        wx.showLoading({
            title: "正在发布...",
        });

        const fileResults = await this.uploadFiles(fileList);
        const fileIds = fileResults.map((item) => item.fileID);
        const res = await wx.cloud
            .database()
            .collection("posts")
            .add({
                data: {
                    message,
                    photos: fileIds,
                    author: app.globalData.userInfo._id,
                    comments: [],
                    createTime: new Date(),
                    likes: [],
                },
            });
        if (res.errMsg === "collection.add:ok") {
            wx.hideLoading();
            wx.showToast({
                title: "创建成功",
            });
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1,
                });
            }, 1500);
        } else {
            wx.hideLoading();
            wx.showToast({
                title: "创建失败",
                icon: "none",
            });
        }
    },
});
