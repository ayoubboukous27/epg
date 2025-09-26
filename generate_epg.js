const fs = require('fs');
const path = require('path');
const { create } = require('xmlbuilder2');

const sitesDir = path.join(__dirname, 'sites');

// Create the XML root
const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('tv');

/**
 * Function to extract channels from JS files
 * Converts JS to JSON safely to avoid using eval
 */
function extractChannelsFromJS(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const regex = /const channels\s*=\s*(\[[\s\S]*?\]);/m;
    const match = content.match(regex);
    if (!match) return [];

    let channels = [];
    try {
        // Convert JS object keys and quotes to valid JSON
        let jsArray = match[1]
            .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":') // keys to JSON keys
            .replace(/'/g, '"') // single quotes to double quotes
            .replace(/,\s*]/g, ']'); // remove trailing comma before array end

        channels = JSON.parse(jsArray);
    } catch (e) {
        console.error('Error parsing JS:', filePath, e);
    }
    return channels;
}

// Loop through each subfolder in sites/
fs.readdirSync(sitesDir).forEach(siteFolder => {
    const folderPath = path.join(sitesDir, siteFolder);
    if (fs.statSync(folderPath).isDirectory()) {
        const jsFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
        jsFiles.forEach(jsFile => {
            const jsPath = path.join(folderPath, jsFile);
            const channels = extractChannelsFromJS(jsPath);

            channels.forEach(ch => {
                const chEle = root.ele('channel', { id: ch.name });
                chEle.ele('display-name').txt(ch.name || '');
                chEle.ele('icon').txt(ch.icon || '');
                chEle.ele('url').txt(ch.url || '');

                // Add programs if available
                if (ch.programs && Array.isArray(ch.programs)) {
                    ch.programs.forEach(p => {
                        root.ele('programme', {
                            start: p.start || '',
                            stop: p.stop || '',
                            channel: ch.name || ''
                        }).ele('title').txt(p.title || '');
                    });
                }
            });
        });
    }
});

// Write the final epg.xml
const xml = root.end({ prettyPrint: true });
fs.writeFileSync('epg.xml', xml);
console.log('epg.xml has been successfully created!');
