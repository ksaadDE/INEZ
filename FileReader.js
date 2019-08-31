const fs = require('fs');

/**
 * FileReader Class - Reads Files
 * Author: Karim Saad
 * Month/Year: 08/2019
 */
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