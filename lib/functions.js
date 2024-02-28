const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const EditDocx = (inputPath, outputPath, data) => {
    // Load the docx file as binary content
    const content = fs.readFileSync("data/"+inputPath, 'binary');

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,

    });

    // Set the templateVariables
    doc.setData(data);

    try {
        // Render the document (replace all occurrences of placeholders by their values)
        doc.render();
    } catch (error) {
        // Catch rendering errors
        const e = {
            message: error.message,
            name: error.name,
            stack: error.stack,
            properties: error.properties,
        };
        console.log(JSON.stringify({error: e}));
        throw error;
    }

    const buf = doc.getZip()
        .generate({type: 'nodebuffer'});

    // Write the document back to a file
    fs.writeFileSync("edited/"+outputPath, buf);
    return "edited/"+outputPath;
}

module.exports = { EditDocx: EditDocx };