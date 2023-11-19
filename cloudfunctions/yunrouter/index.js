const cloud = require("wx-server-sdk");
const TcbRouter = require("tcb-router");

cloud.init({ env: "cord-4gtkoygbac76dbeb" });

const db = cloud.database();
const TEMPLATE_ID = "b0cVrk0vEvthUKTmqt7xV-31wgxUcC-beFDI5N4kkXc";

// Reminder Functions
async function sendReminder(event) {
    try {
        let response = await cloud.openapi.subscribeMessage.send({
            touser: event.haoyouopenid,
            templateId: TEMPLATE_ID,
            page: event.url,
            lang: "zh_CN",
            miniprogram_state: "developer",
            data: event.data,
        });
        return { status: "success", response };
    } catch (error) {
        console.error(error);
        return { status: "error", error };
    }
}

// Subscription Functions
async function subscribeMessage(ctx) {
    try {
        const openid = cloud.getWXContext().OPENID;
        ctx.body = await db.collection("subscribeMessage").add({
            data: {
                touser: openid,
                page: ctx._req.event.page,
                data: ctx._req.event.data,
                id: ctx._req.event.data.id,
                templateId: ctx._req.event.templateId,
                done: false,
            },
        });
    } catch (error) {
        console.error(error);
    }
}

async function sendMessage(event) {
    try {
        const messages = await db.collection("subscribeMessage").where({ done: false }).get();
        return Promise.all(messages.data.map(processMessage));
    } catch (error) {
        console.error(error);
    }
}

async function processMessage(message) {
    await cloud.openapi.subscribeMessage.send({
        touser: message.touser,
        page: message.page,
        data: message.data,
        templateId: message.templateId,
    });
    return db
        .collection("subscribeMessage")
        .doc(message._id)
        .update({ data: { done: true } });
}

// Friendship Functions
async function confirmAndNotifyFriendship(event) {
    try {
        await addFriend(event);
        await notifyFriend(event);
    } catch (error) {
        console.error(error);
    }
}

async function addFriend(event) {
    const { requesterOpenID, requesterInfo, receiverOpenID, receiverInfo, chatRoomID } = event;
    const res1 = await db
        .collection("users")
        .where({ openid: requesterOpenID })
        .update({
            data: {
                friends: db.command.addToSet({
                    id: chatRoomID,
                    receiverInfo,
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
                    requesterInfo,
                    openid: requesterOpenID,
                }),
            },
        });
}
async function notifyFriend(event) {
    const receiverOpenID = event.receiverOpenID.replace("_owner", "");
    const notificationData = {
        thing1: {
            value: event.requesterInfo.username,
        },
        thing2: {
            value: "新客户消息！",
        },
    };
    await cloud.openapi.subscribeMessage.send({
        touser: receiverOpenID,
        data: notificationData,
        templateId: TEMPLATE_ID,
    });
}

// Main Function
exports.main = async (event, context) => {
    const app = new TcbRouter({ event });

    app.router("sendReminderRoute", async (ctx) => {
        ctx.body = await sendReminder(ctx.data);
    });

    app.router("subscribeToMessageRoute", async (ctx) => {
        await subscribeMessage(ctx);
    });

    app.router("sendMessageRoute", async (ctx) => {
        ctx.body = await sendMessage(ctx.data);
    });

    app.router("confirmFriendshipRoute", async (ctx) => {
        console.log(ctx.event);
        await confirmAndNotifyFriendship(ctx.data);
    });

    return app.serve();
};
