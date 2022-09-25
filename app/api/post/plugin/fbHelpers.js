"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoScroll = exports.sleep = exports.getOldPublications = exports.generateFacebookGroupURLById = void 0;
const fs_1 = __importDefault(require("fs"));
function generateFacebookGroupURLById(id) {
    return `https://www.facebook.com/groups/${id}/`;
}
exports.generateFacebookGroupURLById = generateFacebookGroupURLById;
function getOldPublications(fileName) {
    let allPublicationsList;
    if (fs_1.default.existsSync(fileName)) {
        allPublicationsList = JSON.parse(fs_1.default.readFileSync(fileName, { encoding: 'utf8' }));
    }
    else {
        allPublicationsList = [];
    }
    return allPublicationsList;
}
exports.getOldPublications = getOldPublications;
async function sleep(duration) {
    return new Promise(((resolve) => {
        setTimeout(resolve, duration);
    }));
}
exports.sleep = sleep;
function autoScroll() {
    const internalSleep = async (duration) => new Promise(((resolve) => {
        setTimeout(resolve, duration);
    }));
    const scroll = async () => {
        window.scrollBy(0, document.body.scrollHeight);
        await internalSleep(Math.round((Math.random() * 4000) + 1000));
        scroll();
    };
    scroll();
}
exports.autoScroll = autoScroll;
