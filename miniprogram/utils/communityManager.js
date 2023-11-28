const app = getApp();
class CommunityManager {
    constructor() {}
    async getPosts() {
        return await this.fetchCommunityData();
    }
    async getPostByID(id) {
        return await this.fetchCommunityData({ _id: id });
    }
    async getUserPosts(userid) {
        return await this.fetchCommunityData({ author: userid });
    }
    async fetchCommunityData(whereCondition = {}) {
        try {
            let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const res = await wx.cloud.callFunction({
                name: "fetch",
                data: {
                    type: "posts",
                    timezone: timezone,
                    whereCondition: whereCondition,
                },
            });
            console.log(res);
            return res.result.list;
        } catch (error) {
            console.error("Error fetching community data:", error);
        }
    }
}

module.exports = CommunityManager;
