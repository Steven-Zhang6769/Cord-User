const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
    const db = cloud.database();
    const _ = db.command;
    const $ = _.aggregate;
    try {
      const res = await db.collection("orders")
          .aggregate()
          .match({
              merchant: event.merchantID,
              date: _.gt(new Date())
          })
          .project({
              date: 1,
              endDate: $.add([
                  '$date',
                  30 * 60 * 1000
              ])
          })
          .end();
      return res
  } catch (error) {
      console.error("Error fetching previous appointments:", error);
  }
};
