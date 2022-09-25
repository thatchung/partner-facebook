var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { google } = require('googleapis');


// const clientId = '713132580063-ccvmgh0ercek88ca1idd76elb1iukeu6.apps.googleusercontent.com'
// const clientSecret = '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'
// const redirectUrl = 'https://developers.google.com/oauthplayground'
// const refreshToken = '1//04vmOkv2OyiVzCgYIARAAGAQSNwF-L9IrpHO4deb-q6DKo--W3V9jlPP3FNkR0ObECY2nT924px-5WwPouBjsO72PGGpymrbGtqs'

const clientId = '788306603404-smc0idrm4gb7q938ejs11ksbmhnctgc5.apps.googleusercontent.com'
const clientSecret = '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'
const redirectUrl = 'https://developers.google.com/oauthplayground'
const refreshToken = '1//04WnaXbb-zVw9CgYIARAAGAQSNwF-L9IrWxY23fYiZQ5OnlGcWYEQot_f-b2JgICYvu0OjWW0VFFcDd7yfWuaDsoZUzOfo3ApOuk'

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl)
oauth2Client.setCredentials({refresh_token: refreshToken})
const drive = google.drive({
	version: 'v3',
	auth: oauth2Client
})

module.exports = {
  async uploadFile(ctx) {
  	const XLSX = require('xlsx')

	const workbook = XLSX.readFile('./../17.xlsx');
	const wb = XLSX.utils.book_new();
	const sheet_name_list = workbook.SheetNames;
	const xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

	for(let i = 0;i < xlData.length; i++) {
		if(!xlData[i].linkdrive && xlData[i].ID) {
			console.log(xlData[i].ID);
			let link = await getLinkDrive(xlData[i].ID,xlData[i]['Tên quán'])
			if(link && link.link_drive) {
				xlData[i].linkdrive = link.link_drive
				xlData[i].total_image = link.total_image
			}
		}
	}
	let ws = XLSX.utils.json_to_sheet(xlData);
	XLSX.utils.book_append_sheet(wb, ws, 'Records');
	XLSX.writeFile(wb, './../out.xlsx');

	ctx.send('oke');
  },

  async uploadDriveUuid(ctx) {
  	let { uuid } = ctx.request.query;

		let link = await getLinkDrive2(uuid)
		if(link && link.link_drive) {
			xlData[i].linkdrive = link.link_drive
			xlData[i].total_image = link.total_image
		}

		ctx.send(link);
  },
};

async function getLinkDrive(uuid,placename) {
	const edrive = await strapi.services.drive.findOne({ place_name: uuid });
	if(edrive) {
		return {
	    	link_drive : edrive.link,
	    	total_image : edrive.total_image
	    }
	}
	const knex = strapi.connections.riviu;
	let places = await knex('review_place').where({
	  uuid: uuid
	})
	// if(!places || (places && places.length === 0)) {
	// 	places = await knex('review_place').whereRaw(`state = 'active' and name like '${name}%'`)
	// }
	if(places && places.length >= 1 && places[0].image_link && places[0].image_link.includes('https://')
		&& places[0].image_link !== 'https://static.riviu.co/image/2020/11/29/b278befcbdf829569c709038a0f24f3e.jpeg'
		&& !places[0].image_link.includes('cdn01.diadiemanuong.com')) {
		const place = places[0]
		let folderId  = await createFolder(placename)
	  	await uploadFile(place.image_link,'logo',folderId)
	  	const rs = await shareFile(folderId)
	    let listPost = await getListPost(place.uuid)
	    let listImage = await getListImages(listPost)
	    if(listImage.length < 10 && place.list_display_media && place.list_display_media !== '[]') {
	    	listImage = await getListImageFromPlaces(listImage,place.list_display_media)
	    }
	    for(let i = 0;i < listImage.length; i++) {
	    	await uploadFile(listImage[i],`image_${i}`,folderId)
	    }

	    await strapi.services.drive.create({
	    	place_name: uuid,
	    	link: `https://drive.google.com/drive/folders/${folderId}`,
	    	total_image: listImage.length + 1
	    });

	    return {
	    	link_drive : `https://drive.google.com/drive/folders/${folderId}`,
	    	total_image : listImage.length + 1
	    }
	} else return null
}

async function getLinkDrive2(uuid) {
	const edrive = await strapi.services.drive.findOne({ place_name: uuid });
	if(edrive) {
		return {
	    	link_drive : edrive.link,
	    	total_image : edrive.total_image
	    }
	}
	const knex = strapi.connections.riviu;
	let places = await knex('review_place').where({
	  uuid: uuid
	})
	// if(!places || (places && places.length === 0)) {
	// 	places = await knex('review_place').whereRaw(`state = 'active' and name like '${name}%'`)
	// }
	if(places && places.length >= 1 && places[0].image_link && places[0].image_link.includes('https://')
		&& places[0].image_link !== 'https://static.riviu.co/image/2020/11/29/b278befcbdf829569c709038a0f24f3e.jpeg'
		&& !places[0].image_link.includes('cdn01.diadiemanuong.com')) {
		const place = places[0]
		let folderId  = await createFolder(place.name)
	  	await uploadFile(place.image_link,'logo',folderId)
	  	const rs = await shareFile(folderId)
	    let listPost = await getListPost(place.uuid)
	    let listImage = await getListImages(listPost)
	    if(listImage.length < 10 && place.list_display_media && place.list_display_media !== '[]') {
	    	listImage = await getListImageFromPlaces(listImage,place.list_display_media)
	    }
	    for(let i = 0;i < listImage.length; i++) {
	    	await uploadFile(listImage[i],`image_${i}`,folderId)
	    }

	    await strapi.services.drive.create({
	    	place_name: uuid,
	    	link: `https://drive.google.com/drive/folders/${folderId}`,
	    	total_image: listImage.length + 1
	    });

	    return {
	    	link_drive : `https://drive.google.com/drive/folders/${folderId}`,
	    	total_image : listImage.length + 1
	    }
	} else return null
}

async function getListPost(place_uuid) {
	const knex = strapi.connections.riviu;
	let posts = await knex('review_post').whereRaw(`editor_state = 'submit' and list_target like '[{"model": "review_place", "object_uuid": "${place_uuid}"}]'`)
	return posts
}

async function getListImages(list_post) {
	const knex = strapi.connections.riviu;
	let list_image = []
	for(let i = 0;i < list_post.length; i++) {
		if(list_image.length >= 10) {
			break;
		}
		let medias = await knex('review_media').whereRaw(`list_target like '["review_post_${list_post[i].uuid}"]'`)
		for(let j = 0;j < medias.length; j++) {
			if(list_image.length >= 10) {
				break;
			}
			if(medias[j].media_link.includes('https://')) {
				list_image.push(medias[j].media_link)
			} else {
				list_image.push(`https://static.riviu.co${medias[j].media_link}`)
			}
		}
	}

	return list_image
}

async function getListImageFromPlaces(list_image,list_uuid) {
	const uuids = list_uuid.replace('[','(').replace(']',')')
	const knex = strapi.connections.riviu;
	let medias = await knex('review_media').whereRaw(`uuid in ${uuids}`)
	for(let j = 0;j < medias.length; j++) {
		if(list_image.length >= 10) {
			break;
		}
		if(medias[j].media_link.includes('https://')) {
			list_image.push(medias[j].media_link)
		} else {
			list_image.push(`https://static.riviu.co${medias[j].media_link}`)
		}
	}
	return list_image
}

async function uploadFile(url,fileName,folderId) {
	let type = get_url_extension(url)
	https.get(url.replace('_output',''), async (stream) => {
        try{
	  		const createFile = await drive.files.create({
	  			resource: {
				    name: `${fileName}.${type}`,
				    parents: [folderId],
				},
	  			media: {
	  				mimeType: `image/${type}`,
	  				body: stream
	  			},
	  			fields: 'id'
	  		})
	  	} catch(error) {
	  		console.error(error)
	  	}
    });
}

async function createFolder(name) {

  const fileMetadata = {
    name: name,
    mimeType: 'application/vnd.google-apps.folder',
  };
  try {
    const file = await drive.files.create({
      resource: fileMetadata,
      fields: 'id',
    });
    console.log('Folder Data:', file.data);
    return file.data.id;
  } catch (err) {
    // TODO(developer) - Handle error
    throw err;
  }
}

async function shareFile(fileId) {

  try {
    await drive.permissions.create({
      fileId,
      requestBody: {
      	role: 'reader',
      	type: 'anyone'
      }
    });
  } catch (err) {
    // TODO(developer) - Handle error
    throw err;
  }
}

function get_url_extension( url ) {
    return url.split(/[#?]/)[0].split('.').pop().trim();
}