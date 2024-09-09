const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;
const { Client } = require("@notionhq/client");
const utils = require('./utils');
require('dotenv').config();

const notionToken = process.env.NOTION_TOKEN;
const notion = new Client({ auth: notionToken });
const databaseId = process.env.DATABASE_ID;
// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());
// Serve static files from the "public" directory
app.use(express.static('public'));

// Define a route for the root URL
app.get('/', (req, res) => {
    console.log(req.body);
});

// Define a route to handle log messages
app.post('/', async (req, res) => {
    let msg = req.body;
    console.log('Received message:', msg);
    switch (msg.type) {
        case "parseUrlAndContents": {
            if (await utils.pageExists(msg.link) != true) {
                await utils.createNewDatabaseEntry(msg);
            }
            break;
        }
        case 'verdict-accepted': {
            await utils.updateStatus(msg.link);
            break;
        }
        case 'handleVerdict': {
            if(await utils.isQuestionSolved(msg.link) === false && msg.verdict === "Accepted") {
                console.log("updating status");
                await utils.updateStatus(msg.link);
            }
        }
        
    }

    res.json({ status: 'success' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
