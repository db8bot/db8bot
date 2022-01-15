async function run() {
    const MongoClient = require('mongodb').MongoClient
    const uri = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASS}@db8botcluster.q3bif.mongodb.net/23bot?retryWrites=true&w=majority`
    const database = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    var dbClient = await database.connect()
    var collection = dbClient.db('db8bot').collection('tabroomLiveUpdates')
    collection.createIndex({ "expireAt": 1 }, { expireAfterSeconds: 0 })
}

run()
