// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
    const db = cloud.database();
    const _ = db.command;
    const $ = _.aggregate;

    const whereCondition = event.whereCondition ? event.whereCondition : {};

    const currentDate = new Date();

    const statusMap = {
        pending: "待审核",
        rejected: "已拒绝",
        complete: "已完成",
        approved: "已确定",
    };

    const res = db
        .collection("orders")
        .aggregate()
        .match(whereCondition)
        .lookup({
            from: "merchants",
            localField: "merchant",
            foreignField: "_id",
            as: "merchantData",
        })
        .lookup({
            from: "users",
            localField: "participant",
            foreignField: "_id",
            as: "participantData",
        })
        .lookup({
            from: "transactions",
            localField: "transaction",
            foreignField: "_id",
            as: "transactionData",
        })
        .lookup({
            from: "orders",
            let: { merchant_id: "$merchant" },
            pipeline: [
                {
                    $match: {
                        $expr: { $eq: ["$merchant", "$$merchant_id"] },
                        date: _.gt(currentDate), // Get orders with "date" greater than current time
                    },
                },
                {
                    $addFields: {
                        previousAppointmentList: [
                            "$date",
                            { $add: ["$date", 30 * 60 * 1000] }, // Adds 30 minutes to the date in milliseconds
                        ],
                    },
                },
            ],
            as: "futureOrders",
        })
        .addFields({
            merchantData: { $arrayElemAt: ["$merchantData", 0] },
            participantData: { $arrayElemAt: ["$participantData", 0] },
            transactionData: { $arrayElemAt: ["$transactionData", 0] },
            chineseStatus: {
                $switch: {
                    branches: [
                        { case: { $eq: ["$status", "pending"] }, then: statusMap.pending },
                        { case: { $eq: ["$status", "rejected"] }, then: statusMap.rejected },
                        { case: { $eq: ["$status", "complete"] }, then: statusMap.complete },
                        { case: { $eq: ["$status", "approved"] }, then: statusMap.approved },
                    ],
                    default: "未知状态", // A fallback status for any unknown case
                },
            },
        })
        .end();

    return res;
};
