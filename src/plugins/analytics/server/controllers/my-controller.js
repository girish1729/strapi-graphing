'use strict';

module.exports = {
  index(ctx) {
    ctx.body = strapi
      .plugin('analytics')
      .service('myService')
      .getWelcomeMessage();
  },
};
