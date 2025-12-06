const bcrypt = require('bcrypt');
bcrypt.hash('superadmin123', 10, (err, hash) => {
  if (err) throw err;
  console.log('Your bcrypt hash:', hash);
});