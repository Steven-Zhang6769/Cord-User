// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
    const db = cloud.database();
    const _ = db.command;
    const $ = _.aggregate;

    const whereCondition = event.whereCondition ? event.whereCondition : {};

    // Get current date/time
    const currentDate = new Date();

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
        })
        .end();

    return res;
};
