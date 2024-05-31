const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'nb',
    locales: ['en', 'nb'],
  },
  localePath: path.resolve('./public/locales'),
};
