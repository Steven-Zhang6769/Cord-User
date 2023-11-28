const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
    const db = cloud.database();
    const _ = db.command;
    const $ = _.aggregate;
    try {
        // single post
        if (event.whereCondition._id) {
            const res = await db
                .collection("posts")
                .aggregate()
                .match(event.whereCondition)
                .lookup({
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "authorData",
                })
                .lookup({
                    from: "comments",
                    localField: "comments",
                    foreignField: "_id",
                    as: "commentData",
                })
                // Join each comment with its author
                .unwind("$commentData")
                .lookup({
                    from: "users",
                    localField: "commentData.author",
                    foreignField: "_id",
                    as: "commentAuthorData",
                })
                .addFields({
                    "commentData.authorData": { $arrayElemAt: ["$commentAuthorData", 0] },
                    "commentData.formattedCreateTime": {
                        $dateToString: { format: "%Y/%m/%d %H:%M", timezone: event.timezone, date: "$commentData.createTime" },
                    },
                })
                .group({
                    _id: "$_id",
                    root: { $first: "$$ROOT" },
                    comments: { $push: "$commentData" },
                })
                .replaceRoot({
                    newRoot: {
                        $mergeObjects: ["$root", { commentData: "$comments" }],
                    },
                })
                .addFields({
                    authorData: { $arrayElemAt: ["$authorData", 0] },
                    formattedCreateTime: {
                        $dateToString: { format: "%Y/%m/%d %H:%M", timezone: event.timezone, date: "$createTime" },
                    },
                })
                .end();
            return res;
        } else {
            const res = await db
                .collection("posts")
                .aggregate()
                .match(event.whereCondition)
                .lookup({
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "authorData",
                })
                .addFields({
                    authorData: { $arrayElemAt: ["$authorData", 0] },
                    formattedCreateTime: {
                      $dateToString: { format: "%Y/%m/%d %H:%M", timezone: event.timezone, date: "$createTime" },
                  },
                })
                .end();
            return res;
        }
    } catch (error) {
        console.error("Error fetching posts:", error);
    }
};
