const { db } = require('./db')

function createUserTable(){
    let query = `
        create table if not exists users(
          user_id integer not null primary key,
          username varchar(255),
          password varchar(40)
        );
    `
    const statement = db.prepare(query);
    statement.run();
}

function createPageTable(){
    let query = `
        create table if not exists page(
            page_id integer not null primary key,
            title varchar(255),
            create_at datetime,
            update_at datatime,
            page_number integer,
            user_id integer,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        );
    `
    const statement = db.prepare(query);
    statement.run();
}

function createParagraphsTable(){
    let query = `
        create table if not exists paragraphs(
            paragraph_id integer not null primary key,
            sub_title varchar(150),
            paragraph varchar(400),
            paragraph_pos integer,
            sub_title_pos integer,
            page_id integer,
            FOREIGN KEY (page_id) REFERENCES page(page_id)
        );
    `
    const statement = db.prepare(query);
    statement.run();
}

module.exports.databaseModelMigration = () => {
    createUserTable();
    createPageTable();
    createParagraphsTable();
}


