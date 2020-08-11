const regexAtLeastOneUppercase = /[A-Z]+/;

module.exports = (user) => {
  if (user && user.password && !user.password.match(regexAtLeastOneUppercase)) {
    return [{
      password: {
        order: '5',
        text: 'Your password must contain at least one upper-case character.',
      },
    }];
  }

  return [];
};