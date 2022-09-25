'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

async function clearGroupCache(data) {
    let cache = {};
    if(strapi.middleware){
        if(strapi.middleware.cache){
            cache = strapi.middleware.cache
        }
    }

    if (cache && typeof cache.clearCache === "function") {
        const itemCache = cache.getCacheConfig("group");
        if (itemCache && typeof data.id === "string") {
            await cache.clearCache(itemCache, { id: data.id });
            return;
        }
    }
}
module.exports = {
    lifecycles: {
        async afterUpdate(result, params, data) {
            await clearGroupCache(result);
        },
    }
    
};
