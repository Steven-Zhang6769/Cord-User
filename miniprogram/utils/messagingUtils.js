const TEMPLATE_ID = "b0cVrk0vEvthUKTmqt7xV-31wgxUcC-beFDI5N4kkXc";
async function contactMerchant(userInfo, ownerInfo) {
    let openid = userInfo.openid;
    console.log(ownerInfo);
    try {
        if (!userInfo.friends.some((e) => e.openid === ownerInfo.openid)) {
            await subscribeAndAddToFriends(openid, ownerInfo.openid, userInfo, ownerInfo, `${ownerInfo.openid}${openid}`);
        }
        chatRoomNavigator(`${ownerInfo.openid}${openid}`, ownerInfo.username, ownerInfo.openid);
    } catch (error) {
        console.error(error);
        wx.showToast({ title: "私信失败", icon: "error" });
    }
}

async function subscribeAndAddToFriends(customerOpenID, ownerOpenID, customerInfo, ownerInfo, chatID) {
    const addPeopleRes = await wx.cloud.callFunction({
        name: "confirmFriend",
        data: {
            requesterOpenID: customerOpenID,
            requesterInfo: customerInfo,
            receiverOpenID: ownerOpenID,
            receiverInfo: ownerInfo,
            chatRoomID: chatID,
        },
    });
    if (addPeopleRes.errMsg !== "cloud.callFunction:ok") throw new Error("Add people failed");
}

async function chatRoomNavigator(chatID, roomName, ownerOpenID) {
    wx.navigateTo({
        url: `/pages/example/chatroom_example/room/room?id=${chatID}&name=${roomName}&haoyou_openid=${ownerOpenID}`,
    });
}

module.exports = {
    contactMerchant,
    subscribeAndAddToFriends,
    chatRoomNavigator,
};
