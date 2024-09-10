const { Client } = require("@notionhq/client");

require('dotenv').config();

const notionToken = process.env.NOTION_TOKEN;
const notion = new Client({ auth: notionToken });
const databaseId = process.env.DATABASE_ID;

async function updateStatus(link) {
  try {
    // Fetch the page with the specified link
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Link',
        url: {
          equals: link,
        },
      },
    });

    // Check if any pages were found
    if (response.results.length > 0) {
      const pageId = response.results[0].id;
      if(response.results[0].Status=="AC") {
        return;
      }
      
      // Update the Status property of the page to "AC"
      const currentStartDate = response.results[0].properties.Date?.date?.start;
      await notion.pages.update({
        page_id: pageId,
        properties: {
          Status: {
            select: {
              name: "AC",
            },
          },
          "Date": {
          date: {
            start: currentStartDate,
            end: new Date().toISOString(),
          }
        },
      }});

      console.log('Page status updated to AC:', pageId);
    } else {
      console.log('No page found with this link.');
    }
  } catch (error) {
    console.error('Error updating page status:', error);
  }
}


async function pageExists(link) {
  if( typeof(await getPage(link)) === 'object') {
    return true;
  }
  else {
    return false;
  }
}
async function isQuestionSolved(link) {
  try {
    // Query the database to find a page with the specified link and Status = "AC"
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            property: 'Link',
            url: {
              equals: link,
            },
          },
          {
            property: 'Status',
            select: {
              equals: 'AC', // Checking if the Status is "AC"
            },
          },
        ],
      },
    });

    // Check if any pages were found
    if (response.results.length > 0) {
      return true
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error checking if page exists:', error);
    throw error;
  }
}

async function getPage(link) {
  try {
    // Query the database to find a page with the specified link
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Link',
        url: {
          equals: link,
        },
      },
    });

    // Check if any pages were found
    if (response.results.length > 0) {
      return response.results[0];
    } else {
      console.log('No page found with this link.');
      return null;
    }
  } catch (error) {
    console.error('Error checking if page exists:', error);
    throw error;
  }
}
async function createNewDatabaseEntry(data) {
  console.log("inside: ",data, data.id, data.difficulty);
  try {
    // Create a new page in the database with the given properties
    const response = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        'id': {
          title: [
            {
              text: {
                content: data.id,
              },
            },
          ],
        },
        Platform: {
          select: {
            name: data.platform,
          },
        },
        Tags: {
          multi_select: data.tags.map(tag => ({ name: tag })), // assuming tags is an array of strings
        },
        Difficulty: {
          select: 
            {
              name: data.difficulty,
            },
        },
        Status: {
          select: {
            name: "WA",
          },
        },
        Link: {
          url: data.link,
        },
        "Date": {
          date: {
            start: new Date().toISOString(),
            end: null,
          }
        }
      },
    });

    // The pageId is automatically generated and returned in the response
    const pageId = response.id;

    // Add the content (Knowns, Approaches, and Discussions) to the newly created page
    await notion.blocks.children.append({
      block_id: pageId,
      children: [
        {
          object: 'block',
          type: 'heading_1',
          heading_1: {
            rich_text: [{ type: 'text', text: { content: 'Knowns' } }],
          },
        },
        {
          object: 'block',
          type: 'heading_1',
          heading_1: {
            rich_text: [{ type: 'text', text: { content: 'Approaches' } }],
          },
        },
        {
          object: 'block',
          type: 'toggle',
          toggle: {
            rich_text: [{ type: 'text', text: { content: 'Approach 1' } }],
            children: [
              {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                  rich_text: [{ type: 'text', text: { content: 'Details for Approach 1 go here.' } }],
                },
              },
            ],
          },
        },
        {
          object: 'block',
          type: 'heading_1',
          heading_1: {
            rich_text: [{ type: 'text', text: { content: 'Discussions' } }],
          },
        },
      ],
    });

    console.log('New page created successfully:', response);
  } catch (error) {
    console.error('Error creating new page:', error);
  }
}


module.exports = {createNewDatabaseEntry, pageExists, updateStatus, isQuestionSolved};