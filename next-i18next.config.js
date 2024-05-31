const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'nb'],
  },
  localePath: path.resolve('./public/locales'),
};
