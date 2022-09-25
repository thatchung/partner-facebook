var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
module.exports = {
  // GET /hello
  async totalPrice(ctx) {
  	let { create_date_gte, create_date_lte , admin_id } = ctx.request.query;
    let post = await strapi.query('post').find({ 
    	create_date_gte : create_date_gte,
    	create_date_lte : create_date_lte,
    	admin_id : admin_id
    });
    let total_price = 0;
    let total_bonus = 0;
    for (let item of post) {
    	total_price += parseInt(item.price_fix);
    	total_bonus += parseInt(item.price_bonus);
    }
    ctx.send({
    	total_price,
    	total_bonus
    });
  },
};