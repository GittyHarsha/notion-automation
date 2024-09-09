// Function to handle DOM changes
const protocols= {
    "parseUrlAndContents": function parseUrlAndContents(url) {
        const problemId = getProblemId(url);
        if(problemId==="") {
            let problemUrl = getProblemUrlFromTable();
            let verdict = getVerdictFromTable();
            console.log("verdict: ", verdict);
            sendToServer(
                {
                    type: "handleVerdict",
                    link: problemUrl,
                    verdict: verdict,
                }
            );
            return;
        }
        let tagBoxes = document.querySelectorAll('span.tag-box');
        let tags = [];
        let difficulty = 800;
        tagBoxes.forEach(span => {
            // Check if the <span> has a title attribute with the value "Difficulty"
            let textContent = span.textContent.trim();
            if (span.getAttribute('title') === 'Difficulty') {
                difficulty = textContent;
            }
            else {
                tags.push(textContent);
            }
        });
        if(problemId === "") {
            return;
        }
        sendToServer({
            type: "parseUrlAndContents",
            id: problemId, 
            tags: tags,
            difficulty: difficulty,
            platform: "codeforces",
            link: url,
        });
    },
    "verdict-accepted": function () {
        const problemId = getProblemId(getProblemUrlFromTable());
        sendToServer( {
            type: 'verdict-accepted',
            id: problemId,
            status: 'AC',
            link: problemUrl,
        });
    },
    
};

protocols.parseUrlAndContents(window.location.href, document);

function getProblemUrlFromTable() {
    var table = document.querySelector('.status-frame-datatable');
    if (table) {
        var row = table.querySelectorAll('tr')[1];
        if (row) {
            var cells = row.querySelectorAll('td');
            if (cells.length >= 4) {
                var fourthColumnCell = cells[3];
                console.log(fourthColumnCell);
                var problemUrl = fourthColumnCell.querySelector('a').href;
                console.log(problemUrl);
                return problemUrl;
            } else {
                console.error('The first row does not have 4 columns.');
            }
        } else {
            console.error('No rows found in the table.');
        }
    } else {
        console.error('No table found.');
    }
    return "";
}

function getVerdictFromTable() {
    var table = document.querySelector('.status-frame-datatable');
    if (table) {
        var row = table.querySelectorAll('tr')[1];
        if (row) {
            var cells = row.querySelectorAll('td');
            if (cells.length >= 6) {
                var col = cells[5];
                console.log(col);
                var verdict = col.innerText;
                return verdict;
            } else {
                console.error('The first row does not have 6 columns.');
            }
        } else {
            console.error('No rows found in the table.');
        }
    } else {
        console.error('No table found.');
    }
    return "";
}
function handleDomChanges(mutationsList) {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            console.log(mutation.addedNodes);
            if (mutation.addedNodes.length>0 && mutation.addedNodes[0].className in protocols) {
                protocols[mutation.addedNodes[0].className]();
            }
        }
    }
}

// Function to send data to the server
function sendToServer(data) {
    console.log('data to server: ', data);
    fetch('http://localhost:3000/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => response.json())
      .then(data => console.log('Success:', data))
      .catch((error) => console.error('Error:', error));
}

// Create an observer instance linked to the callback function
const observer = new MutationObserver(handleDomChanges);

// Configuration of the observer
const config = {
    attributes: true,    // Observe changes to attributes
    childList: true,     // Observe changes to children
    subtree: true        // Observe changes to all descendants
};

// Start observing the document body
observer.observe(document.body, config);

console.log('MutationObserver is now observing DOM changes.');

//********************************************************************************************************************** */
function getProblemId(url) {
    console.log("f: getProblemId", "url: ", url);
    let id = "";
    if(!url.includes('problem/')) return "";
    if (url.includes("problemset")) {
        return url.split("problem/")[1];
    }
    else{
        let items = url.split('/');
        let n = items.length;
        return items[n-3]+"/"+items[n-1];
    }
}
