var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const moment = require('moment');
module.exports = {
  // GET /hello
  async index(ctx) {
    const knex = strapi.connections.default;
  	let { create_date_gte, create_date_lte, groupid } = ctx.request.query;
  	let start_date = moment(create_date_gte).format('D');
    let end_date = moment(create_date_lte).format('D');
	let item_data = [];
	let data = await knex('posts')
	    .where('posts.create_date', '>=', create_date_gte)
	    .andWhere('posts.create_date', '<=', create_date_lte)
	    .groupBy(`posts.admin_id`)
	    .select(`posts.admin_id`,
	    	knex.raw('SUM(posts.price_fix) as price_fix'),
	    	knex.raw('SUM(posts.price_bonus) as price_bonus'),
	    	knex.raw('COUNT(posts.id) as total_post')
	    	)
    let listUser =  await knex('users-permissions_user')
	    .where('type', '=', 'partner')
	    .select(`id`,`username`,`email`)
	
    let total_price = 0;
    let total_bonus = 0;
    let total_money = 0;

	for(let user of listUser) {
		let post = data.find(o => o.admin_id === user.id);
		let p_fix = post ? post.price_fix : 0;
		let p_bonus = post ? post.price_bonus : 0;
		total_price += p_fix;
		total_bonus += p_bonus;
		item_data.push({
			user_id: user.id,
			user_name: user.username,
			user_email: user.email,
			total_post: post ? post.total_post : 0,
			price_fix: p_fix,
			price_bonus: p_bonus,
			price_total: p_fix + p_bonus
		})
	}

	let total_post = await knex('posts')
	    .where('posts.create_date', '>=', create_date_gte)
	    .andWhere('posts.create_date', '<=', create_date_lte)
	    .count('id', {as: 'total_post'})
	total_money = total_price + total_bonus;
	let rs = {
		list : item_data.sort((a, b) => b.price_total - a.price_total),
		statistic : {
			total_price,
			total_bonus,
			total_money,
			total_post : total_post[0].total_post
		}
	}

    ctx.send(rs);
  },
};