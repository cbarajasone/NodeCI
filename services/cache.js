const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const keys = require('../config/keys');

const client = redis.createClient(keys.redisURI);
client.get = util.promisify(client.get);
client.hget = util.promisify(client.hget);
client.set = util.promisify(client.set);
client.hset = util.promisify(client.hset);

const exec = mongoose.Query.prototype.exec;

// Use normal function declaration, 
// Using arrow function EFFE up the scope of this

mongoose.Query.prototype.cache = function(options = {}) {
    this.useCache = true;
    this.cacheHashKey = JSON.stringify(options.key || '');

    return this;
}

mongoose.Query.prototype.exec = async function () {
    if (!this.useCache) {
        return exec.apply(this, arguments)
    }
    
    try {
        const key = JSON.stringify(Object.assign({}, this.getQuery(), {
            collection: this.mongooseCollection.name
        }))
        const cachedValue = await client.hget(this.cacheHashKey, key);
        
        if (cachedValue) {
            const doc = JSON.parse(cachedValue);

            // Hidrating Arrays Heyyy
            return Array.isArray(doc)
                ? doc.map(d => new this.model(d))
                : new this.model(doc);
        }
        const result = await exec.apply(this, arguments);

        await client.hset(this.cacheHashKey, key, JSON.stringify(result)); 

        return result;

    } catch(error) {
        console.log(error);
        throw error;
    }
}

module.exports = {
    clearCacheHash(key) {
        client.del(JSON.stringify(key))
    },
}