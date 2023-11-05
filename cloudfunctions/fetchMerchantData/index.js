// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
    const db = cloud.database();
    const _ = db.command;
    const $ = _.aggregate;
    const whereCondition = event.whereCondition ? event.whereCondition : {};

    const res = db
        .collection("merchants")
        .aggregate()
        .match(whereCondition)
        .lookup({
            from: "owners",
            localField: "owner",
            foreignField: "_id",
            as: "ownerData",
        })
        .lookup({
            from: "services",
            localField: "_id",
            foreignField: "merchant",
            as: "serviceData",
        })
        .lookup({
            from: "orders",
            let: { merchant_id: "$_id" },
            pipeline: [
                { $match: { $expr: { $eq: ["$merchant", "$$merchant_id"] } } }, // Changed "$merchants" to "$merchant"
                { $group: { _id: null, avgRating: $.avg("$rating") } },
            ],
            as: "avgRatingData",
        })
        .addFields({
            ownerData: { $arrayElemAt: ["$ownerData", 0] },
            avgRating: { $arrayElemAt: ["$avgRatingData.avgRating", 0] },
        })
        .end();

    return res;
};
