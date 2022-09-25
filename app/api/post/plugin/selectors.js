"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    login_form: {
        email: 'input#email',
        password: 'input#password',
        submit: 'button[data-testid="royal_login_button"]',
        parent: 'form',
    },
    facebook_group: {
        group_name: 'title',
        group_feed_container: 'div[role=feed]',
    },
    facebook_post: {
        post_element: 'div[role=article][aria-labelledby]',
        post_author: 'h2 span a',
        post_author2: 'h2 strong span',
        post_author_avatar: 'object image',
        post_link: 'span[dir=auto] > span a',
        post_content: 'div[dir=auto][class]',
        post_content_expand_button: 'div[role=button]',
        post_attachment: 'div[dir=auto][class] + div[class][id]',
        post_attachment2: 'div[class][id]',
        post_video: 'video',
        post_img: 'img',
        post_reacion: 'span.o3hwc0lp.lq84ybu9.hf30pyar.oshhggmv.lwqmdtw6 span.nnzkd6d7',
        post_comment: 'div.gtad4xkn:nth-child(1)',//'div.l9j0dhe7>span.d2edcug0.hpfvmrgz.qv66sw1b.c1et5uql.lr9zc1uh.a8c37x1j.fe6kdd0r.mau55g9w.c8b282yb.keod5gw0.nxhoafnm.aigsh9s9.d3f4x2em.iv3no6db.jq4qci2q.a3bd9o3v.b1v8xokw.m9osqain',
        post_share: 'div.gtad4xkn:nth-child(2)'
    }
};
