const { start } = require("repl");
const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
    const db = cloud.database();
    const _ = db.command;
    const $ = _.aggregate;

    const whereCondition = event.whereCondition ? event.whereCondition : {};
    if (event.date) {
        whereCondition.date = _.gte(new Date());
    }
    if (event.dateReverse) {
        whereCondition.date = _.lte(new Date());
    }
    if(event.startOfDay && event.endOfDay){
      whereCondition.date = _.and(_.gte(new Date(event.startOfDay)), _.lte(new Date(event.endOfDay)))
      }

    const statusMap = {
        pending: "待审核",
        rejected: "已拒绝",
        paid: "已确定",
        complete: "已完成",
    };

    const res = db
        .collection("orders")
        .aggregate()
        .match(whereCondition)
        .limit(event.limit || 1000)
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
        .addFields({
            merchantData: { $arrayElemAt: ["$merchantData", 0] },
            participantData: { $arrayElemAt: ["$participantData", 0] },
            transactionData: { $arrayElemAt: ["$transactionData", 0] },
            formattedReservationTime: {
              $dateToString: { format: "%Y/%m/%d %H:%M", date: "$date" }
          },
          formattedCreateTime: {
            $dateToString: { format: "%Y/%m/%d %H:%M", date: "$createTime" }
        },
            chineseStatus: {
                $switch: {
                    branches: [
                        { case: { $eq: ["$status", "pending"] }, then: statusMap.pending },
                        { case: { $eq: ["$status", "rejected"] }, then: statusMap.rejected },
                        { case: { $eq: ["$status", "complete"] }, then: statusMap.complete },
                        { case: { $eq: ["$status", "paid"] }, then: statusMap.paid },
                    ],
                    default: "未知状态", // A fallback status for any unknown case
                },
            },
        })
        .end();

    return res;
};
