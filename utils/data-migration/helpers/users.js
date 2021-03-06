const api = require('../api');

let users;

const initUsers = async (token) => {
  users = await api.listUsers(token);
};

const getUserByEmail = (email) => {
  if (!email) return {};

  const user = users.find((b) => b.username.toLowerCase() === email.toLowerCase());
  if (!user) return {};

  return {
    _id: user._id,
    username: user.username,
    firstname: user.firstname,
    surname: user.surname,
    email: user.email,
    bank: {
      id: user.bank.id,
      name: user.bank.name,
      emails: user.bank.emails,
    },
  };
};

module.exports = {
  initUsers,
  getUserByEmail,
};
