// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event);
    const { requesterOpenID, requesterInfo, receiverOpenID, receiverInfo, chatRoomID } = event;
    const res1 = await db
        .collection("user")
        .where({ openid: requesterOpenID })
        .update({
            data: {
                friends: db.command.addToSet({
                    id: chatRoomID,
                    userInfo: receiverInfo,
                    openid: receiverOpenID,
                }),
            },
        });
    const res2 = await db
        .collection("owner")
        .where({ openid: receiverOpenID })
        .update({
            data: {
                friends: db.command.addToSet({
                    id: chatRoomID,
                    userInfo: requesterInfo,
                    openid: requesterOpenID,
                }),
            },
        });
}