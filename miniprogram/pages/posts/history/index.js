const app = getApp();
Page({
    data: {
        userInfo: app.globalData.userInfo,
        communityManager: app.globalData.communityManager,
        posts: [],
        loading: false,
    },

    async onLoad(options) {
        this.setData({ loading: true });
        const communityManager = app.globalData.communityManager;
        const posts = await communityManager.getPosts();
        this.setData({ posts, loading: false });
    },
    onShow() {
        this.onLoad();
    },
    onPullDownRefresh() {
        this.onLoad();
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
    postDetailNavigator(e) {
        const { id } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/posts/detail/index?id=${id}`,
        });
    },
});
