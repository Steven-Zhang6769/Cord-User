const app = getApp();
Page({
    data: {
        userInfo: app.globalData.userInfo,
        communityManager: app.globalData.communityManager,
        posts: [],
        loading: false,
    },

    async onLoad(options) {
        console.log(options);
        this.setData({ loading: true });
        const communityManager = app.globalData.communityManager;
        const posts = await communityManager.getPostByID(options.id);
        const postId = options.id;
        this.setData({ posts, postId, loading: false });
    },
    async onShow() {
        this.onLoad();
    },
    async onPullDownRefresh() {
        console.log(this.data);
    },
    async likePost(e) {
        const { id } = e.currentTarget.dataset;
        const post = this.data.posts.find((post) => post._id === id);
        const db = wx.cloud.database();
        const _ = db.command;
        const res = await db
            .collection("posts")
            .doc(id)
            .update({
                data: {
                    likes: _.addToSet(app.globalData.userInfo._id),
                },
            });
        if (res.errMsg === "document.update:ok") {
            post.likes.push(app.globalData.userInfo._id);
            this.setData({ posts: this.data.posts });
        }
    },
    async unlikePost(e) {
        const { id } = e.currentTarget.dataset;
        const post = this.data.posts.find((post) => post._id === id);
        const db = wx.cloud.database();
        const _ = db.command;
        const res = await db
            .collection("posts")
            .doc(id)
            .update({
                data: {
                    likes: _.pull(app.globalData.userInfo._id),
                },
            });
        if (res.errMsg === "document.update:ok") {
            post.likes = post.likes.filter((like) => like !== app.globalData.userInfo._id);
            this.setData({ posts: this.data.posts });
        }
    },
    enlarge(e) {
        const { post, current } = e.currentTarget.dataset;
        wx.previewImage({
            urls: post.photos,
            current: current,
        });
    },
    async submitComment(e) {
        if (!this.data.comment) {
            wx.showToast({
                title: "请输入评论内容",
                icon: "none",
            });
            return;
        }
        if (!app.globalData.userInfo) {
            wx.showToast({
                title: "请先登录",
                icon: "none",
            });
            return;
        }
        const comment = this.data.comment;
        const db = wx.cloud.database();
        const _ = db.command;
        const postId = this.data.postId;

        wx.showLoading({
            title: "评论中",
        });
        const commentRes = await db.collection("comments").add({
            data: {
                content: comment,
                author: app.globalData.userInfo._id,
                post: postId,
                createTime: new Date(),
            },
        });
        console.log(commentRes);

        const res = await db
            .collection("posts")
            .doc(postId)
            .update({
                data: {
                    comments: _.addToSet(commentRes._id),
                },
            });

        if (res.errMsg === "document.update:ok") {
            wx.hideLoading();
            wx.showToast({
                title: "评论成功",
            });
            this.onLoad({
                id: postId,
            });
        } else {
            wx.hideLoading();
            wx.showToast({
                title: "评论失败",
                icon: "none",
            });
        }
    },
    onChangeComment(e) {
        const { detail } = e;
        this.setData({ comment: detail });
    },
});
