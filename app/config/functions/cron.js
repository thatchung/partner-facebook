'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const moment = require('moment');
const FB = __importDefault(require("../../api/post/plugin/fb.js"));
let fb = {};
module.exports = {
  /**
   * Simple example.
   * Every monday at 1am.
   */
  // '0 1 * * 1': () => {
  //
  // }
  
  // '0 */3 * * *': async() => {
  //   console.log("Cron running " + new Date());
  //   try {
  //     const date = moment().add(-3, 'days').format('YYYY-MM-DD HH:mm:ss');
  //     let post = await strapi.query('post').find({ _limit: -1, create_date_gte : date });
  //     if(post && post.length > 0) {
  //       fb = {};
  //       for(let item of post) {
  //         try {
  //           await updatePost(item);
  //         } catch (err) {
  //           console.log(err);
  //         }
  //       }
  //     }
  //     console.log('Update Done: ' + post.length);
  //     return;
  //   }
  //   catch (err){ 
  //     console.log(err);
  //   }
  //   console.log('Update Failed!');
  // }
};

async function updatePost(item) {
  if (item) {
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