const replaceString = require('replace-string');
const FileReader = require('./FileReader.js');

/*
    JsonReader Class (reads for example classificationsamples.json)
    splits between "," (file) and ":" (per line) 
    Author: Karim Saad
    Month/Year: 08/2019
*/
class JsonReader {
        
        constructor(filename) {
            this.filename = filename;
            this.data=[];
            this.readdata();
        }

        readdata() {
            this.data=[];
            var kdata = this.data;

            var d=FileReader.ReadFile("./classificationsamples.json");
            d = d.replace("{","").replace("}","");
            d=d.replace('",', '').split("\n");
          
            d.forEach(function (el) {
              var t = el.split(":")
              if(t.length == 2){
                var str = t[0];
                var dt = t[1];
                 dt = dt.split('"')[1].replace('"',"");
                 str = str.split('"')[1].replace('"',"");
                 console.log(str, dt);
                 kdata.push([str, dt]);
              }
            });
        }

        getData(){
          return this.data;
        }
}


module.exports = JsonReader