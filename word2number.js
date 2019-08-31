/**
 * Word2Number 
 * Author: Karim Saad
 * Month/Year: 08/2019
 */
const replaceString = require('replace-string');

const word2Number = function (inp) {
    data = {
        "eins": 1,
        "zwei": 2,
        "drei": 3,
        "vier": 4,
        "fünf": 5,
        "sechs": 6,
        "sieben": 7,
        "acht": 8,
        "neun": 9,
        "zehn": 10,
        "zwan": 2,
        "ein": 1,
        "eine": 1,
        "einen": 1
    }
    for (var i=0; i < 10000; i++ ) {
        data[i] = i;
    }

    var nstr = "";
    if(inp.includes(" und ")) {
        if (inp.includes("zig")){
            var spl = inp.split(" ");
            spl = spl.reverse();
            spl.forEach(function(el){
                if(el.includes("zig")) {
                    var nx= replaceString(el, "zig","");
                    nstr += data[nx];
                }
                if(data[el] != null && data[el] != undefined && el != "und")  {
                    nstr += data[el];
                }
            });
        }
    } else {
        if (inp.includes("zig")){
            var spl = inp.split(" ");
            var cintzigs = 0;
            spl = spl.reverse();
            spl.forEach(function(el){
                if(el.includes("zig")) {
                    cintzigs++;
                    var nx= replaceString(el, "zig","");
                    nstr += data[nx];
                }
                if(data[el] != null)  {
                    nstr += data[el];
                }
            });
            if(cintzigs == 1)nstr += "0";
        } else {
            var spl = inp.split(" ");
            spl.forEach(function(el){
                if(data[el] != null)  {
                    nstr  += data[el];
                }
            });
        }
    }

    return parseInt(nstr);
}

module.exports = word2Number;