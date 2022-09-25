"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
const path = __importDefault(require("path"));
const client = __importDefault(require("https"));
// const clipboard = __importDefault(require("copy-to-clipboard"));
const selectors_1 = __importDefault(require("./selectors"));
const fbHelpers_1 = require("./fbHelpers");
// const cookiesFile = require("./cookies");
class Facebook {
    constructor(config, browser, page, cookiesFileName) {
        this.url = 'https://facebook.com';
        this.altUrl = 'https://www.facebook.com';
        this.config = config;
        this.browser = browser;
        this.page = page;
        this.cookiesFilePath = cookiesFileName;
    }
    static async init(options, cookiesFilePath = 'fbjs_cookies.json') {
        const browserOptions = {
            headless: true,//options.headless,
            debug: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sendbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
            ],
        };
        if (process.arch === 'arm' || process.arch === 'arm64') {
            browserOptions.executablePath = 'chromium-browser';
        }
        const browser = await puppeteer_1.default.launch(browserOptions);
        const incognitoContext = await browser.createIncognitoBrowserContext();
        const page = await incognitoContext.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36');
        // if(!fs_1.default.existsSync(cookiesFilePath)) {
        //     await this.login('khanh.trieu@riviu.vn','Skypro90@');
        // }
        if (options.useCookies && fs_1.default.existsSync(cookiesFilePath)) {
            const cookiesString = fs_1.default.readFileSync(cookiesFilePath);
            const cookies = JSON.parse(cookiesString.toString());
            await page.setCookie(...cookies);
        }
        // if (options.useCookies) {
        //     const cookies = cookiesFile.default
        //     console.log(cookies)
        //     await page.setCookie(...cookies);
        // }
        return new Facebook(options, browser, page, cookiesFilePath);
    }
    async disableAssets() {
        if (this.page === undefined) {
            throw new initialisationError_1.default();
        }
        await this.page.setRequestInterception(true);
        const blockResources = [
            'image', 'media', 'font', 'textrack', 'object',
            'beacon', 'csp_report', 'imageset',
        ];
        this.page.on('request', (request) => {
            const rt = request.resourceType();
            if (blockResources.indexOf(rt) > 0
                || request.url()
                    .match(/\.((jpe?g)|png|gif)/) != null) {
                request.abort();
            }
            else {
                request.continue();
            }
        });
    }
    async enterAuthCode(authCode) {
        const authCodeInputSelector = '//input[contains(concat(" ", normalize-space(@name), " "), " approvals_code")]';
        const authCodeContinueButtonSelector = '//button[contains(concat(" ", normalize-space(@id), " "), " checkpointSubmitButton")]';
        if (this.page === undefined || this.config === undefined) {
            throw new initialisationError_1.default();
        }
        await this.page.waitForXPath(authCodeInputSelector);
        await (await this.page.$x(authCodeInputSelector))[0].focus();
        await this.page.keyboard.type(authCode);
        await this.page.waitForXPath(authCodeContinueButtonSelector);
        await (await this.page.$x(authCodeContinueButtonSelector))[0].click();
        await this.page.waitForXPath(authCodeContinueButtonSelector);
        await (await this.page.$x(authCodeContinueButtonSelector))[0].click();
        if (this.config.useCookies) {
            const cookies = await this.page.cookies();
            fs_1.default.writeFileSync(this.cookiesFilePath, JSON.stringify(cookies, null, 2));
        }
        do {
            await this.page.waitForNavigation({ timeout: 10000000 });
            const u = new URL(this.page.url());
            if (u.pathname === '/') {
                break;
            }
            await this.page.waitForXPath(authCodeContinueButtonSelector);
            await (await this.page.$x(authCodeContinueButtonSelector))[0].click();
        } while (this.page.url() !== this.url && this.page.url() !== this.altUrl);
        if (this.config.disableAssets) {
            await this.disableAssets();
        }
        if (this.config.useCookies) {
            const cookies = await this.page.cookies();
            if (this.cookiesFilePath === undefined) {
                this.cookiesFilePath = 'fbjs_cookies';
            }
            fs_1.default.writeFileSync(`./${this.cookiesFilePath.replace(/\.json$/g, '')}.json`, JSON.stringify(cookies, null, 2));
        }
    }
    async close() {
        try {
            var _a, _b;
            (_a = this.page) === null || _a === void 0 ? void 0 : _a.close();
            (_b = this.browser) === null || _b === void 0 ? void 0 : _b.close();
        }
        catch (_a) {
            (() => { })();
        }
    }
    async login(username, password) {
        if (this.page === undefined || this.config === undefined) {
            throw new initialisationError_1.default();
        }
        await this.page.goto('https://www.facebook.com/?ref=tn_tnmn');
        try {
            await this.page.waitForXPath('//button[@data-cookiebanner="accept_button"]');
            const acceptCookiesButton = (await this.page.$x('//button[@data-cookiebanner="accept_button"]'))[0];
            await this.page.evaluate((el) => {
                el.focus();
                el.click();
            }, acceptCookiesButton);
        }
        catch (_a) {
            (() => { })();
        }
        await this.page.waitForSelector(selectors_1.default.login_form.parent);
        await this.page.focus(selectors_1.default.login_form.email);
        await this.page.keyboard.type(username);
        await this.page.focus(selectors_1.default.login_form.password);
        await this.page.keyboard.type(password);
        await this.page.waitForXPath('//button[@data-testid="royal_login_button"]');
        const [loginButton] = await this.page.$x('//button[@data-testid="royal_login_button"]');
        await this.page.evaluate((el) => {
            el.click();
        }, loginButton);
        try {
            await this.page.waitForXPath('//form[contains(concat(" ", normalize-space(@class), " "), " checkpoint")]');
        }
        catch (e) {
            await this.page.waitForXPath('//div[@data-pagelet="Stories"]');
            if (this.config.disableAssets) {
                await this.disableAssets();
            }
            if (this.config.useCookies || true) {
                const cookies = await this.page.cookies();
                if (this.cookiesFilePath === undefined) {
                    this.cookiesFilePath = 'cookies';
                }
                fs_1.default.writeFileSync(`./${this.cookiesFilePath.replace(/\.json$/g, '')}.json`, JSON.stringify(cookies, null, 2));
            }
            return;
        }
        throw new twoFARequiredError_1.default();
    }
    async getGroupPosts(groupId, outputFileName, callback, save = true) {
        if (this.page === undefined || this.config === undefined) {
            throw new initialisationError_1.default();
        }
        const groupUrl = fbHelpers_1.generateFacebookGroupURLById(groupId);
        await this.page.goto(groupUrl, {
            timeout: 600000,
            waitUntil: 'domcontentloaded',
        });
        if (outputFileName === undefined) {
            outputFileName = `${this.config.output + groupId}.json`;
        }
        const savePost = (postData) => {
            const allPublicationsList = fbHelpers_1.getOldPublications(outputFileName);
            allPublicationsList.push(postData);
            if (save) {
                fs_1.default.writeFileSync(outputFileName, JSON.stringify(allPublicationsList, undefined, 4), { encoding: 'utf8' });
            }
        };
        this.page.evaluate(fbHelpers_1.autoScroll);
        await this.page.waitForSelector(selectors_1.default.facebook_group.group_feed_container);
        const handlePosts = async () => {
            var _a;
            const post = await ((_a = this.page) === null || _a === void 0 ? void 0 : _a.evaluateHandle(() => window.posts.shift()));
            const postData = await this.parsePost(post);
            if (callback !== undefined && callback !== null) {
                callback(postData);
            }
            savePost(postData);
        };
        this.page.exposeFunction('handlePosts', handlePosts);
        this.page.evaluate((cssSelectors) => {
            window.posts = [];
            const target = document.querySelector(cssSelectors.facebook_group.group_feed_container);
            const observer = new MutationObserver((mutations) => {
                for (let i = 0; i < mutations.length; i += 1) {
                    for (let j = 0; j < mutations[i].addedNodes.length; j += 1) {
                        const addedNode = mutations[i].addedNodes[j];
                        const postElm = addedNode.querySelector(cssSelectors.facebook_post.post_element);
                        if (postElm) {
                            window.posts.push(postElm);
                            handlePosts();
                        }
                    }
                }
            });
            observer.observe(target, { childList: true });
        }, selectors_1.default);
    }
    async parsePost(post) {
        if (this.page === undefined || this.config === undefined) {
            throw new initialisationError_1.default();
        }
        const { authorName, content } = await this.page.evaluate(async (postElm, cssSelectors) => {
            let postAuthorElm;
            postAuthorElm = postElm.querySelector(cssSelectors.facebook_post.post_author);
            let postAuthorName;
            if (postAuthorElm) {
                postAuthorName = postAuthorElm.innerText;
            }
            else {
                postAuthorElm = postElm.querySelector(cssSelectors.facebook_post.post_author2);
                postAuthorName = postAuthorElm.innerText;
            }
            const postContentElm = postElm.querySelector(cssSelectors.facebook_post.post_content);
            let postContent;
            if (postContentElm) {
                const expandButton = postContentElm.querySelector(cssSelectors.facebook_post.post_content_expand_button);
                if (expandButton) {
                    postContent = await new Promise((res) => {
                        const observer = new MutationObserver(() => {
                            observer.disconnect();
                            res(postContentElm.innerText);
                        });
                        observer.observe(postContentElm, { childList: true, subtree: true });
                        expandButton.click();
                    });
                }
                else {
                    postContent = postContentElm.innerText;
                }
            }
            else {
                postContent = '';
            }
            return {
                authorName: postAuthorName,
                content: postContent,
            };
        }, post, selectors_1.default);
        const submission = {
            author: authorName,
            post: content,
        };
        return submission;
    }
    async getPostByLink(link) {
        if(!fs_1.default.existsSync(`./cookies.json`)) {
            const cookies = await this.page.cookies();
            fs_1.default.writeFileSync(`./cookies.json`, JSON.stringify(cookies, null, 2));
        }
        
        link = link.replace('/permalink/','/posts/')
        console.log(link);
        await this.page.goto(link, {
            timeout: 90000,
            waitUntil: 'domcontentloaded',
        });
        // const { data } = await this.page.evaluate((cssSelectors) => {
        //     const target = document.querySelector(cssSelectors.facebook_post.post_element);
        //     // if (target) {
        //     //     data = postElm;
        //     // }
        //     return { data : target }
        // }, selectors_1.default);

        await this.page.waitForSelector('div[role=article][aria-labelledby]', { timeout: 60000 })
        let element = await this.page.$(selectors_1.default.facebook_post.post_reacion)
        let reaction = await this.page.evaluate(el => el ? el.textContent : 0, element)
        let element1 = await this.page.$(selectors_1.default.facebook_post.post_comment)
        let comment = await this.page.evaluate(el => el ? el.textContent : 0, element1)
        let element2 = await this.page.$(selectors_1.default.facebook_post.post_share)
        let share = await this.page.evaluate(el => el ? el.textContent : 0, element2)
        let element3 = await this.page.$(selectors_1.default.facebook_post.post_content)
        let content = await this.page.evaluate(el => el ? el.textContent : '', element3)

        let checkBig = 0;
        let reaction_number = 0;
        if(reaction && reaction.includes("K")) {
            checkBig = parseFloat(reaction.replace(',','.'));
            console.log(checkBig)
            reaction_number = checkBig * 1000; // Math.floor(checkBig) * 1000;
        }
        else {
            reaction_number = parseInt(reaction);
        }
        return {
            reaction : reaction_number,
            comment : parseInt(comment),
            share : parseInt(share),
            content
        };
    }
    async getVideoLink(link) {
        console.log('video');
        await this.page.goto(link, {
            timeout: 90000,
            waitUntil: 'domcontentloaded',
        });

        await this.page.waitForSelector('head', { timeout: 60000 })
        let element = await this.page.$('link[rel=canonical]')
        let linkpost = await this.page.evaluate(el => el ? el.getAttribute('href') : '', element)
        
        return {
            linkpost : linkpost
        };
    }
    // async internalSleep(duration) {
    //     new Promise(((resolve) => { setTimeout(resolve, duration) }))
    // }
    async getDataByLink(link) {
        let id = link.slice(link.indexOf("/permalink/") + 11,link.length - 1)
        link = `https://m.facebook.com/esgsgsegsg/posts/pcb.${id}/`
        // link = 'https://m.facebook.com/esgsgsegsg/posts/pcb.2764071937056072/'
        console.log(link);
        await this.page.goto(link, {
            timeout: 90000,
            waitUntil: 'domcontentloaded',
        });
        let today = new Date();
        await this.page.waitForSelector('div._4vuj', { timeout: 90000 })
        console.log(today);
        const temp = await this.page.evaluate(async () => {
            const internalSleep = async (duration) => new Promise(((resolve) => {
                setTimeout(resolve, duration);
            }));
            const src = [];
            src.push(document.body.scrollHeight)
            window.scrollBy(0, document.body.scrollHeight);
            // src.push(document.body.scrollHeight)
            await internalSleep(500);
            window.scrollBy(0, document.body.scrollHeight);
            await internalSleep(500);
            src.push(document.body.scrollHeight)
            return src;
        });
        today = new Date();
        console.log(today);
        console.log(temp);

        const user = await this.page.$eval('div._4vuj div._tmc div._3kz9 a',
            u => u ? u.textContent : '');

        const contents = await this.page.evaluate((selector) => {
            const names = [];
            for (element of document.querySelector(selector).children) {
                names.push(element.textContent);
            }
            return names;
        }, 'div._4vuj div._189t div._26p9 span');
        const content = contents.filter( o => { return !(o == '' || o == undefined || o == ' ') }).join('\n');

        const image = await this.page.$$eval('div._4vuj div._56be div._7buy img',
            imgs => imgs.map(img => img.getAttribute('src')));

        let listImage = image.filter(o => !( o.includes("https://static") || o.includes("data:image/") ) )


        for(let i = 0; i < listImage.length; i++) {
            downloadImage(listImage[i], `../uploads/${id}-${i}.jpg`)
        }



        return {
            user : user,
            image : listImage,
            content : content
        };
    }

    async postGroupByLink(link) {
        link = 'https://www.facebook.com/groups/riviu.chiemchungminh'
        await this.page.goto(link, {
            timeout: 60000,
            waitUntil: 'domcontentloaded',
        });
        await this.page.waitForSelector('div[data-pagelet="DiscussionRootSuccess"]', { timeout: 90000 })
        await this.page.click(`div[data-pagelet="GroupInlineComposer"] div[role="button"]`);
        let text = `# **Ống hút trái tim cho những đôi môi thiếu tình iu nè �**\n�Hút lấy tình iu rột rột ở đây nè: \nhttps://thanh.riviu.vn/onghuttim \n cre:Test`
        for (let i = 0; i < text.length; i++) {
            // await clipboard.default.write(text)
            await this.page.keyboard.down('Control')
            await this.page.keyboard.press('V')
            await this.page.keyboard.up('Control')
            if (i === text.length - 1) {

                await this.page.waitFor(2000);
                await this.page.keyboard.down('Control');
                await this.page.keyboard.press(String.fromCharCode(13));
                await this.page.keyboard.up('Control');
                await this.page.waitFor(4000);
         
                console.log('done');
            }
        }
        return { oke : 'qqq' }
    }
}
function downloadImage(url, filepath) {
    client.default.get(url, (res) => {
        res.pipe(fs_1.default.createWriteStream(filepath));
    });
}
exports.default = Facebook;
