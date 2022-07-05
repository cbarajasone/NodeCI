const { clearCacheHash } = require('../services/cache');

module.exports = async (req,res,next) => {
    
    // Execute Route handler so we can work after the logic executed 
    await next();

    clearCacheHash(req.user.id)
}