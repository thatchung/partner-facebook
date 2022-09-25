var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const FB = __importDefault(require("../plugin/fb.js"));
const { sanitizeEntity } = require('strapi-utils');

module.exports = {

  async index(ctx) {
    let { id } = ctx.request.body;
    let fb = {};
    if (id) {
      let item = await strapi.query('post').findOne({ id });
      if (!fb.page) {
        fb = await FB.default.init({
          groupIds: [],
          useCookies: false,
          disableAssets: true,
          headless: false,
          debug: false,
          output: './',
        }, './cookies.json');
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
              if(total >= p_b && parseInt(price_bonus) < parseInt(group.price_bonus[p_b])) {
                price_bonus = parseInt(group.price_bonus[p_b]);
              }
            }
          }
          catch (e){ }
        }
        item = await strapi.services.post.update({ id }, {
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
      // try {
      //   await fb.close();
      // }
      // catch (ex) {}
      return sanitizeEntity(item, { model: strapi.models.post });
    }
    ctx.send('Hello Wwworld!');

  },

  // async CallbackData(data) {
  //   console.log('get data');
  //   console.log(data);
  //   data.forEach(async item => {
  //     await strapi.query('post').create({
  //       post_id: item.post_id,
  //       create_date: new Date(),
  //       update_date: new Date(),
  //       content: item.post,
  //       user_name: item.author,
  //       user_id: item.user_id,
  //       reaction: item.postLike,
  //       comment: item.postComment,
  //       link: item.link,
  //       group_id: item.group_id,
  //       group_name: "dddd"
  //     });
  //   });
  // }
};