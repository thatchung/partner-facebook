const axios = require('axios');
const sha256 = require('sha256');

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const FB = __importDefault(require("../plugin/fb.js"));

module.exports = {
  async index(ctx) {
    let { shoppeLink, id1 , id2, id3 } = ctx.request.body;
    let appId = '17397670001'
    let appKey = 'VOLHRASPL4KK5Y5XLEJ5RB2Z3UD3WLMH'
    let timestamp = parseInt(new Date().getTime() / 1000)
    let payload = {"query":"mutation{\n  generateShortLink(input:{originUrl:\""+shoppeLink+"\",subIds:[\""+id1+"\",\""+id2+"\",\""+id3+"\"]}){\n    shortLink\n  }\n}","variables":null}
	let signature = sha256(appId + timestamp + JSON.stringify(payload) + appKey)
    let kq = '';
    try {
    	let res = await axios.post('https://open-api.affiliate.shopee.vn/graphql', payload, { headers: { 'Authorization': `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}` } })
	    let data = res.data
	    if (data && data.generateShortLink && data.generateShortLink.shortLink) {
	      this.shortLink = data.generateShortLink && data.generateShortLink.shortLink
	    }
	    if (data && data.data && data.data.generateShortLink && data.data.generateShortLink.shortLink) {
	    	kq = data.data.generateShortLink.shortLink
	    }
    }
    catch (err) {
    	console.log(err)
    }
    ctx.send({ link :kq });
  },

  async datapost(ctx) {
    let kq = '';
    let { link } = ctx.request.query;
    let fb = {};
    if (link) {
      if (!fb.page) {
        fb = await FB.default.init({
          groupIds: [],
          useCookies: true,
          disableAssets: true,
          headless: false,
          debug: true,
          output: './',
        });
      }
      let rs = await fb.getDataByLink(link);
      // let rs = await fb.postGroupByLink(link);
      kq = rs
    }
    ctx.send({ data : kq });
  }
};