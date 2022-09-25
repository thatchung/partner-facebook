var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};

const FB = __importDefault(require("../plugin/fb.js"));
// const FB = __importDefault(require("../plugin/fb.js"));

// import GroupPost from '../../dist/lib/models/groupPost';

module.exports = {
  // GET /hello
  async index(ctx) {

    const fb = await FB.default.init({
      groupIds: [],
      useCookies: true,
      disableAssets: true,
      headless: false,
      debug: false,
      output: './',
    }, './cookies.json');
    try {
      console.log('init done');
      await fb.login(
        "khanh.trieu@riviu.vn",
        "123456@@",
      );
    } catch (e) {
      console.log('login error');
    }
    console.log('login done');
    await fb.getGroupPosts(parseInt("125253729673696", 10), (o) => CallbackData(o) );
    ctx.send('Hello World!');
  },

  async CallbackData(data) {
    console.log('get data');
    console.log(data);
    data.forEach(async item => {
      await strapi.query('post').create({
        post_id: item.post_id,
        create_date: new Date(),
        update_date: new Date(),
        content: item.post,
        user_name: item.author,
        user_id: item.user_id,
        reaction: item.postLike,
        comment: item.postComment,
        link: item.link,
        group_id: item.group_id,
        group_name: "dddd"
      });
    });
  }
};