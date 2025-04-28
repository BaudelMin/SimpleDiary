const { db } = require('./db')

const removeParagraphsByPageId = (page_ids) => {
    let query = `
        DELETE FROM paragraphs
        WHERE page_id in (${page_ids})
    `
    return new Promise((resolve, reject) => {
        console.log('Removig paragraph by page id :  ', query)
        const dbStmt = db.prepare(query);
        const result  = dbStmt.run()
        resolve(result)
    })
}

const removeParagraphsByPageIdAndParagraphId = (page_id, paragraph_id) => {
    let query = `
        DELETE FROM paragraphs
        WHERE page_id == ? and paragraph_id = ?
    `
    return new Promise((resolve, reject) => {
        const dbStmt = db.prepare(query);
        let result = dbStmt.run(page_id, paragraph_id);
        resolve(result);
    })
}

const removePageByUserId = (user_id) => {
    let query = `
        DELETE FROM page
        WHERE user_id == ?
    `
    return new Promise((resolve, reject) => {
        const dbStmt = db.prepare(query);
        let result = dbStmt.run(user_id);
        resolve(result);
    })
}

const removePageByPageId = (page_id) => {
    let query = `
        DELETE FROM page
        WHERE page_id == ?
    `
    return new Promise((resolve, reject) => {
        const dbStmt = db.prepare(query);
        let result = dbStmt.run(page_id);
        resolve(result)
    })
}

const removeUserByUserId = (user_id) => {
    let query = `
        DELETE FROM users
        WHERE user_id == ?
    `
    return new Promise((resolve, reject) => {
        const dbStmt = db.prepare(query);
        let result = dbStmt.run(user_id);
        resolve(result);
    })
}

const collectUsersAllPageId = (user_id) => {
    let query = 'SELECT page_id as id FROM page WHERE user_id = ?', id_list = '';
    return new Promise((resolve, reject) => {
        const dbStmt = db.prepare(query);
        let result;
        result = dbStmt.all(user_id);
        for (index = 0; index < result.length; index ++){
            id_list = (index == 0) ? (id_list + String(result[index].id)) : (id_list + ', ' + String(result[index].id))
        }
        resolve(id_list);
    })
}

module.exports = {
    removeUser: (user_id) => {
        // Remove user and all related pages and paragraph
        // Required: user_id
        return collectUsersAllPageId(user_id)
        .then(data => {
            console.log('after collecting all pages id', data);
            return removeParagraphsByPageId(data)
        })
        .then(data => {
            console.log('after remove all paragraph', data);
            return removePageByUserId(user_id)
        })
        .then(data => {
            console.log(data);
            removeUserByUserId(user_id)
        })
        .catch(err => console.log("Couldn't delete user and its content. \n Error : ",err))
    },
    removeSpecificPage : (page_id) => {
        // Removes specific page from database
        // Required: page_id
        return removeParagraphsByPageId(page_id)
        .then(data => {
            console.log('data : ', data)
            removePageByPageId(page_id);
        })
        .catch(err => console.log("Couldn't remove page content. \n Error : ", err))
    },
    removeSpecificParagraph: (page_id, paragraph_id) => {
        // Removes specific paragraphs
        // Required: page_id and paragraph_id
        return removeParagraphsByPageIdAndParagraphId(page_id, paragraph_id)
        .then(resData => console.log('Removing paragraph succed : ', resData))
        .catch(err => console.log("Couldn't remove paragraph content. \n Error : ", err))
    }
}
