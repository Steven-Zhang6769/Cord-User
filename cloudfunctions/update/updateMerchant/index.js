// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "cord-4gtkoygbac76dbeb" });

// 云函数入口函数
exports.main = async (event, context) => {
  const { _id, ...updates } = event.data;
  console.log(event)
  return await cloud
  .database()
  .collection("merchants").doc(_id).update({
    data: updates
  })
}