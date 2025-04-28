const { db } = require('./db')

const  validateUser = (username, password) => {
  let query = 'SELECT user_id as id, username FROM users  WHERE username = ? and password = ?';
  return new Promise(async (resolve, reject) => {
    const dbStmt = db.prepare(query);
    const res =dbStmt.get([username, password])
    res ? resolve({
      validation : true,
      user_id : res.id
    }):resolve({validation : false})
  })
}

const addUser = (username, password) => {
  let query = 'INSERT INTO users (username, password) VALUES (?, ?)';
  return new Promise((resolve, reject) => {
    const dbStmt = db.prepare(query);
    const  result = dbStmt.run(username, password);
    (result.changes > 0) ? resolve({status : true, message : 'New user added'}) : reject({status : false, message : 'No user added'})
  });
}

const doesUserExits = (username) => {
  return new Promise((resolve, reject) => {
    const dbStmt = db.prepare('SELECT username FROM users WHERE username = ?');
    const result = dbStmt.get(username);
    result ? resolve(true) : resolve(false);
  })
}


module.exports = {
  validateUser: (username, password) => {
    return validateUser(username, password)
  },
  addUser: (username, password) => {
    return doesUserExits(username)
    .then(data => {
      if(data){
        return Promise.resolve({status : false, message : "User alread exists."})
      }
      else{
        return addUser(username, password)
      }
    })
    .catch(err => console.log(err))
  },
}
