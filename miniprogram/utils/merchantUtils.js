const { fetchDataFromDB } = require("./dbUtils");

const db = wx.cloud.database();

async function getAllMerchantData() {
    const merchants = await fetchDataSafe("merchant");
    return await processMerchants(merchants);
}

async function getMerchantDataWithId(id) {
    const merchant = await fetchDataSafe("merchant", null, id);
    return await processMerchants([merchant]);
}

async function fetchDataSafe(collection, whereCondition = null, docId = null) {
    try {
        return await fetchDataFromDB(collection, whereCondition, docId);
    } catch (error) {
        console.error(`Error fetching ${collection} data:`, error);
        throw error;
    }
}

async function processMerchants(merchants) {
    const allMerchantDataPromises = merchants.map(async (merchant) => {
        const [ownerData, serviceData, avgRating] = await Promise.all([
            fetchDataSafe("owner", null, merchant.owner),
            fetchDataSafe("service", { merchant: merchant._id }),
            calculateAverageRating(merchant._id),
        ]);

        return {
            ...merchant,
            ownerData,
            serviceData,
            avgRating,
        };
    });

    return await Promise.all(allMerchantDataPromises);
}

async function calculateAverageRating(merchantId) {
    const $ = db.command.aggregate;

    try {
        const avgRatingDict = await db
            .collection("orders")
            .aggregate()
            .match({
                merchant: merchantId,
            })
            .group({
                _id: null,
                avgRating: $.avg("$rating"),
            })
            .end();

        return avgRatingDict.list[0] ? avgRatingDict.list[0].avgRating : 0;
    } catch (error) {
        console.error("Error calculating average rating:", error);
        throw error;
    }
}

module.exports = {
    getAllMerchantData,
    getMerchantDataWithId,
};
