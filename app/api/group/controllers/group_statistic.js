var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const moment = require('moment');
module.exports = {
  async totalPost(ctx) {
  	const knex = strapi.connections.default;
  	let { create_date_gte, create_date_lte, groupid } = ctx.request.query;
  	let group_id = groupid.split(',');
  	let list = [];
  	let labels = [];
  	let start_date = moment(create_date_gte).format('D');
    let end_date = moment(create_date_lte).format('D');
    let statistic = [];
  	for(let group of group_id) {
  		let item_data = [];
  		let total_posts = 0;
  		let chats = await knex('posts')
  			.where('posts.group_id',group)
	        .andWhere('posts.create_date', '>=', create_date_gte)
	        .andWhere('posts.create_date', '<=', create_date_lte)
	        .groupByRaw(`extract(day from posts.create_date)`)
	        .select([knex.raw(`count('id') as posts`),knex.raw(`extract(day from posts.create_date) as day`)])
	    for (var i = start_date; i <= end_date; i++) {
	    	let posts = chats.find(o => o.day === i);
	    	let value = posts ? posts.posts : 0;
	    	total_posts += parseInt(value);
    		item_data.push(value);
    	}
    	statistic.push({
    		id: group,
    		name: getLabel(group),
    		total: total_posts
    	})
    	list.push({
    		label: getLabel(group),
        backgroundColor: getColor(group),
        data: item_data
    	})
  	}
  	for (var i = start_date; i <= end_date; i++) {
  		labels.push(i)
  	}
  	let total_data = []
  	let chats = await knex('posts')
        .andWhere('posts.create_date', '>=', create_date_gte)
        .andWhere('posts.create_date', '<=', create_date_lte)
        .groupByRaw(`extract(day from posts.create_date)`)
        .select([knex.raw(`count('id') as posts`),knex.raw(`extract(day from posts.create_date) as day`)])
    for (var i = start_date; i <= end_date; i++) {
    	let posts = chats.find(o => o.day === i);
    	let value = posts ? posts.posts : 0;
			total_data.push(value);
		}
		list.push({
			label: 'Tổng Cộng',
	    backgroundColor: '#f80079',
	    data: total_data
		})

		let rs = {
			chart_data : {
	    	labels,
	    	list
	    },
	    statistic
		}
    ctx.send(rs);
  },
  async totalUser(ctx) {
  	const knex = strapi.connections.default;
  	let { create_date_gte, create_date_lte, adminid } = ctx.request.query;
  	let list = [];
  	let labels = [];
  	let start_date = moment(create_date_gte).format('D');
    let end_date = moment(create_date_lte).format('D');
  	for (var i = start_date; i <= end_date; i++) {
  		labels.push(i)
  	}
  	let total_data = []
  	let chats = await knex('posts')
  			.where('posts.admin_id', '=', adminid)
        .andWhere('posts.create_date', '>=', create_date_gte)
        .andWhere('posts.create_date', '<=', create_date_lte)
        .groupByRaw(`extract(day from posts.create_date)`)
        .select([knex.raw(`count('id') as posts`),knex.raw(`extract(day from posts.create_date) as day`)])
    for (var i = start_date; i <= end_date; i++) {
    	let posts = chats.find(o => o.day === i);
    	let value = posts ? posts.posts : 0;
			total_data.push(value);
		}
		list.push({
			label: 'Tổng Cộng',
	    backgroundColor: '#f80079',
	    data: total_data
		})

    ctx.send({
    	labels,
    	list
    });
  },
};

function getLabel(id) {
	if(id === '1') {
		return 'Hội riviu mỹ phẩm'
	} else if(id === '2') {
		return 'Outfit of the day'
	} else {
		return 'Thánh công nghệ'
	}
}

function getColor(id) {
	if(id === '1') {
		return '#f87900'
	} else if(id === '2') {
		return '#f87979'
	} else {
		return '#007979'
	}
}