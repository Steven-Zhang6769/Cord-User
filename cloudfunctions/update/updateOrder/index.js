// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "cord-4gtkoygbac76dbeb" });

// 云函数入口函数
exports.main = async (event, context) => {
  if(event.data.date){
    event.data.date = new Date(event.data.date)
  }
  return await cloud
  .database()
  .collection("orders").doc(event.orderid).update({
    data: event.data
  })
}