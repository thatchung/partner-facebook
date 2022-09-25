var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const moment = require('moment');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./cs.json');
// const auth = new GoogleAuth({
//     scopes: 'https://www.googleapis.com/auth/spreadsheets',
//   });

// const service = google.sheets({version: 'v4', auth});

module.exports = {
  async add(ctx) {
  	try {
  		console.log(ctx.request.body)
  		const { name, phone } = ctx.request.body
  		if(!name || !phone) {
  			ctx.send('oke');
  			return
  		}
  		const doc = new GoogleSpreadsheet('13hTEAZMRjVcvdUkGG3I8pNu83H88Lo0PufS6ud7DEyE');
		await doc.useServiceAccountAuth(creds);

		await doc.loadInfo();
		const sheet = doc.sheetsByIndex[0];
		await sheet.addRow({ name , phone});

	} catch (err) {
	    throw err;
	}

	ctx.send('done');
  },

};
