const rmQuery = require('./database/removeDBRows')
const dbPage = require('./database/pageContent')
const dbUser = require('./database/user')
const now = require('./helpers/timeHelpers')
const removeDBRows = require('./database/removeDBRows')
const dbHelper = require('./helpers/dbHelpers')

let testUserData = [
  {
    username : "test user1",
    password : "passtest1"
  },
  {
    username : "test user2",
    password : "passtest2"
  },
  {
    username : "test user3",
    password : "test3pass"
  }
]

let testPageData = {
  title : 'third 2 test page',
  create_at : now.getCurrentDateTime(),
  page_number : 2,
  user_id : 3,
  paragraphContents : [{
    sub_title : 'test sub title 22',
    sub_title_pos : 1,
    paragraph : `Your laptop performance is reborn with the Snapdragon® X Elite Platform. Built for AI, 
      Snapdragon X Elite is the most powerful, intelligent, and efficient processor ever created for Windows 
      in its class. With cutting edge responsiveness, navigate demanding multi-tasking workloads across
      productivity, creativity, immersive entertainment, and more. `,
    paragraph_pos : 1
  },
  {
    // sub_title : 'test sub title 23',
    sub_title_pos : 2,
    paragraph : `Your laptop performance is reborn with the Snapdragon® X Elite Platform. Built for AI, 
      Snapdragon X Elite is the most powerful, intelligent, and efficient processor ever created for Windows 
      in its class. With cutting edge responsiveness, navigate demanding multi-tasking workloads across
      productivity, creativity, immersive entertainment, and more. `,
    paragraph_pos : 2
  },
  {
    sub_title : 'test sub title 24',
    sub_title_pos : 3,
    paragraph : `Your laptop performance is reborn with the Snapdragon® X Elite Platform. Built for AI, 
      Snapdragon X Elite is the most powerful, intelligent, and efficient processor ever created for Windows 
      in its class. With cutting edge responsiveness, navigate demanding multi-tasking workloads across
      productivity, creativity, immersive entertainment, and more. `,
    paragraph_pos : 3
  },
  {
    sub_title : 'test sub title 25',
    sub_title_pos : 4,
    paragraph : `Your laptop performance is reborn with the Snapdragon® X Elite Platform. Built for AI, 
      Snapdragon X Elite is the most powerful, intelligent, and efficient processor ever created for Windows 
      in its class. With cutting edge responsiveness, navigate demanding multi-tasking workloads across
      productivity, creativity, immersive entertainment, and more. `,
    paragraph_pos : 4
  }]
}

async function testFunction() {
  let result
  // result = await dbPage.savePageContent(testPageData)
  // result = await dbUser.addUser('testUser3', 'passthree');
  // result = await dbPage.getAllPagesContent(6)
  // result = await removeDBRows.removeUser(3);
  result = dbHelper.validatePageContent(testPageData, update = false)
  console.log('result = ', result)
}

testFunction()
