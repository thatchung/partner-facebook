var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const FB = __importDefault(require("../plugin/fb.js"));
const { sanitizeEntity } = require('strapi-utils');
let fb = {};
const moment = require('moment');

module.exports = {
  async index(ctx) {
    try {
      const date = moment().add(-3, 'days').format('YYYY-MM-DD HH:mm:ss');
      let post = await strapi.query('post').find({ create_date_gte : date });
      if(post && post.length > 0) {
        for(let item of post) {
          await updatePost(item);
        }
      }
      ctx.send('Update Done: ' + post.length);
      return;
    }
    catch (err){ 
      console.log(err);
    }
    ctx.send('Update Failed!');
  },

  async indexv2(ctx) {
    
      let post = await strapi.query('post').find({ 
        create_date_gte : '2022-08-11 00:00:00',
        reaction: true
       });
      if(post && post.length > 0) {
        for(let item of post) {
          try {
            await updatePost(item);
          }
          catch (err){ 
            console.log(err);
          }
        }
        // await updatePost(post[0]);
      }
      ctx.send('Update Done: ' + post.length);
      return;
    ctx.send('Update Failed!');
  }
};

async function updatePost(item) {
  if (item) {
    if (!fb.page) {
      fb = await FB.default.init({
        groupIds: [],
        useCookies: true,
        disableAssets: true,
        headless: false,
        debug: false,
        output: './',
      }, './cookies.json');
      // await fb.login('khanh.trieu@riviu.vn','Skypro900@@');
    }
    if(item.link.includes('/videos/')) {
      let res = await fb.getVideoLink(item.link);
      if (res.linkpost) {
        item.link = res.linkpost;
      }
    }
    let rs = await fb.getPostByLink(item.link);
    console.log(rs);
    if (rs) {
      let total = rs.reaction;
      let price_fix = 0;
      let price_bonus = 0;
      if (item.group_id) {
        try {
          let group = await strapi.query('group').findOne({ id : item.group_id });
          if(total >= 1) {
            price_fix = group.price_fix;
          }
          for(let p_b in group.price_bonus) {
            if(total >= p_b && price_bonus < group.price_bonus[p_b]) {
              price_bonus = group.price_bonus[p_b];
            }
          }
        }
        catch (e){ }
      }
      await strapi.services.post.update({ id : item.id }, {
        update_date: new Date(),
        reaction : rs.reaction,
        comment : rs.comment,
        share : rs.share,
        content : rs.content.replace(/[^\w\s]/gi, ''),
        price_fix,
        price_bonus,
        link: item.link,
        total : total
      });
    }
    
  }
}