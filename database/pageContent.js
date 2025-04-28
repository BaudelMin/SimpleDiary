const { db } = require('./db')

const  saveAllPageContent = (data) => {
        let pageQuery = 'INSERT INTO page (title, create_at, update_at, page_number, user_id) VALUES(?, ?, ?, ?, ?)'
        let paragraphQuery = `
            INSERT INTO paragraphs (sub_title, paragraph, paragraph_pos, sub_title_pos, page_id) 
            VALUES(@sub_title, @paragraph, @paragraph_pos, @sub_title_pos, @page_id)
        `
        let dbStmt, pageResult, newPageId, insertAllParagraphs, insertParagraph
        return new Promise((resolve, reject) => {
            try {
                dbStmt = db.prepare(pageQuery);
                pageResult = dbStmt.run(data.title, data.create_at, data.create_at, data.page_number, data.user_id);
                newPageId = pageResult.lastInsertRowid;
                data.paragraphContents.forEach(element => {
                    element.page_id = newPageId;
                });
                // console.log(data.paragraphContents);
                insertParagraph = db.prepare(paragraphQuery);
                insertAllParagraphs = db.transaction((paragraphs) => {
                    // console.log(paragraphs);
                    for (const paragraph of paragraphs) insertParagraph.run(paragraph);
                });
                insertAllParagraphs(data.paragraphContents);
                resolve({message : 'All page content saved.'})
            }
            catch(error){
                reject(error);
            }
        })

}

const saveNewParagraph = (data) => {
    let paragraphQuery = `
            INSERT INTO paragraphs (sub_title, paragraph, paragraph_pos, sub_title_pos, page_id) 
            VALUES(?, ?, ?, ?, ?)
        `
    let countQuery = 'select count() as count from paragraphs  where page_id = ?'
    return new Promise((resolve, reject) => {
        try{
            const countStmt = db.prepare(countQuery);
            let countResult = countStmt.get(data.page_id);
            // console.log('countResult = ', countResult, parseInt(countResult.count))
            if (parseInt(countResult.count) >= 4){
                resolve({ status : false, message : 'Maximum paragraph already exceed'})
            }
            else{
                const dbStmt = db.prepare(paragraphQuery);
                dbStmt.run(data.sub_title, data.paragraph, data.paragraph_pos, data.sub_title_pos, data.page_id);
                resolve({ status : true, message : 'New paragraph is'})
            } 
        }
        catch(error){
            reject(error)
        }
    })
}

const  updateAllPageContent = (data) => {
    let pageQuery = 'UPDATE page SET title = ?, updated_at = ? WHERE page_id = ?'
    let paragraphQuery = `
        UPDATE paragraphs SET sub_title = ?, paragraph = ?, paragraph_pos = ?, sub_tile_pos =  
        WHERE paragraph_id = ?
    `
    let dbStmt, pageResult, newPageId, insertAllParagraphs, insertParagraph
    return new Promise((resolve, reject) => {
        try {
            dbStmt = db.prepare(pageQuery);
            pageResult = dbStmt.run(data.title, data.create_at, data.create_at,  data.page_id);
            newPageId = pageResult.lastInsertRowid;
            data.paragraphContents.forEach(element => {
                element.page_id = newPageId;
            });
            // console.log(data.paragraphContents);
            insertParagraph = db.prepare(paragraphQuery);
            insertAllParagraphs = db.transaction((paragraphs) => {
                // console.log(paragraphs);
                for (const item of paragraphs) insertParagraph.run(item.sub_title, item.paragraph, item.paragraph_pos, item.sub_title_pos,
                    item.paragraph_id
                );
            });
            insertAllParagraphs(data.paragraphContents);
            resolve({ status : true, message : 'All page content saved.'})
        }
        catch(error){
            reject(error);
        }
    })

}

const collectUserPages = (user_id) => {
    let query = 'SELECT page_id, title, create_at, page_number FROM page WHERE user_id = ? LIMIT 10';
    let maxQuery = 'SELECT MAX(page_number) max_page_number FROM page WHERE user_id = ?';
    return new Promise((resolve, reject) => {
        try{
            let dbStmt, result, data = {}
            dbStmt = db.prepare(maxQuery);
            result = dbStmt.get(user_id);
            data.max_page_number = result.max_page_number || 0
            dbStmt = db.prepare(query);
            result = dbStmt.all(user_id);
            data.pageContent = result;
            console.log('maxResult = ', data);
            resolve(data);
        }
        catch(error){reject(error)}
    })
}

const getAllPagesContent = (page_id) => {
    let query = 'SELECT paragraph_id, sub_title, sub_title_pos, paragraph, paragraph_pos FROM paragraphs WHERE page_id = ?'
    return new Promise((resolve, reject) => {
        const dbStmt = db.prepare(query);
        const result = dbStmt.all(page_id);
        resolve(result);
    })
}

module.exports = {
    savePageContent : (data) => {
        return saveAllPageContent(data);
    },
    saveSingleParagraph : (data) => {return saveNewParagraph(data).catch(err => console.error(err))},
    updatePageContent : (data) => { return updateAllPageContent(data).catch(err => console.error(err)); },
    collectUserPages : collectUserPages,
    getAllPagesContent : getAllPagesContent
}
