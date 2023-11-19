const { formatDateTimeShortYear } = require("./util");

async function getTransactionFromID(transactionID) {
    try {
        const res = await wx.cloud.callFunction({
            name: "fetch",
            data: {
                type: "transaction",
                whereCondition: {
                    _id: transactionID,
                },
            },
        });
        if (res.result.code != 200) throw "Error fetching transaction";
        let transaction = res.result.data[0];
        return transaction;
    } catch (error) {
        console.error("Error fetching transaction:", error);
        throw error;
    }
}
async function getUserTransactions(cordID) {
    try {
        const res = await wx.cloud.callFunction({
            name: "fetch",
            data: {
                type: "transaction",
                whereCondition: {
                    sender: cordID,
                },
            },
        });
        if (res.result.code != 200) throw "Error fetching transaction";
        let transactions = res.result.data;
        return transactions;
    } catch (error) {
        console.error("Error fetching transaction:", error);
        throw error;
    }
}

module.exports = {
    getTransactionFromID,
    getUserTransactions,
};
