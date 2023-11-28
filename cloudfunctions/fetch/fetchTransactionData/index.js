// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV, // Set to the current environment
});

// 云函数入口函数
exports.main = async (event, context) => {
    const db = cloud.database();
    const $ = db.command.aggregate;
    const whereCondition = event.whereCondition ? event.whereCondition : {};

    try {
        const transactionAggregation = await db
            .collection("transactions")
            .aggregate()
            .match(whereCondition)
            .addFields({
                formattedDate: {
                    $dateToString: {
                        format: "%Y/%m/%d %H:%M",
                        timezone: event.timezone,
                        date: "$createTime",
                    },
                },
            })
            .lookup({
                from: "users",
                localField: "sender",
                foreignField: "_id",
                as: "senderData",
            })
            .lookup({
                from: "owners",
                localField: "receiver",
                foreignField: "_id",
                as: "receiverData",
            })
            .project({
                senderData: { $arrayElemAt: ["$senderData", 0] },
                receiverData: { $arrayElemAt: ["$receiverData", 0] },
                transactionData: "$$ROOT",
            })
            .project({
                // Adjust the second projection to remove sender and receiver arrays from the root
                "transactionData.senderData": 0,
                "transactionData.receiverData": 0,
            })
            .end();

        const transactionData = transactionAggregation.list;

        // Format and return the data as required
        return {
            code: 200,
            data: transactionData,
            message: "success",
        };
    } catch (error) {
        console.error("Error:", error);
        return { code: 500, message: "Internal server error" };
    }
};
