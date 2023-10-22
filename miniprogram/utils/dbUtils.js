const db = wx.cloud.database();

async function fetchDataFromDB(collection, whereCondition = null, docId = null) {
    try {
        let query = db.collection(collection);
        if (docId) {
            const res = await query.doc(docId).get();
            return res.data;
        } else {
            if (whereCondition) query = query.where(whereCondition);
            const res = await query.get();
            return res.data;
        }
    } catch (error) {
        console.error(`Error fetching data from ${collection}:`, error);
        throw error;
    }
}

module.exports = {
    fetchDataFromDB,
};
