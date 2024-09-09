# Notion Upsolve tracker 
Automates tracking problem solving in programming platforms.
Currently supported platforms
- Codeforces

## Usage guidelines 
- create a notion database as shown here: [database](https://developing-attraction-d78.notion.site/d047377db17344f183652806cc601690?v=6f2878dc56eb456aa9082cc0bf410fea)
- replace `notion_token` and `databaseId` in utils.js file by your credentials.
- load unpacked the repo in the extension store.
- run the server

This software automatically updates the database as you open a problem and solve it.fdfd

## System Design 
- Create a database in Notion
- Using Notion Javascript API, connect to the notion database.
- The extension observes the programming platforms and handles updates to the database.

##  Architecture
Client Server.
- The extension parses the web page and provides data in a speciic format to the server.
- the server also handles API calls.

### Trigger-Action-Data
- this is the protocol used by the client and server.
- for a trigger, client does action and sends data to server.
- MutationObserver API of chrome is used to detect changes in the web page.

- maintain a dictionary of trigger and corresponding action and run them everytime changes are detected after getting the database from the notion server.
- aggregate the pairs and do a single udpate in a batch.

### Use case
#### codeforces
possible trigger-action pairs
- pasre the url of the webpage: add the problem to the database / get only that from the database if it already exists.
- when problem is submitted: update the database accordingly depending on AC or other status.
- parse the problem tags: update the database.
