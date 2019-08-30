const fs = require('fs');
class FileReader {
    ReadFile(filename) {
        try {
        const data = fs.readFileSync(filename, 'utf8')
        return data;
        } catch (err) {
        console.error(err)
        }
        return null;
    }
  
    SaveFile(filename, data){
        fs.writeFile(filename, data, function (err) {
        if (err) throw err;
        console.log('Saved!');
        });
    }
}

module.exports = new FileReader;