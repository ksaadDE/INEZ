const PDefaults = {
    name: null,
    baseprice: null,
    currency: null,
    weight: " ",
    unitweight: null
}
const replaceString = require('replace-string');

const hashcode = require("./hashcode.js");

/*
    Class of a Product Object
    Parses the data from a html file & gives the basic structure for a product e.g. baseprice etc.
*/
class Product {
        constructor(name, weight, baseprice, currency, unitweight){
                this.name = name || PDefaults.name ;
                this.baseprice = baseprice || PDefaults.baseprice ;
                this.currency = currency || PDefaults.currency;
                this.weight = weight || " 500g ";
                this.unitweight = unitweight || PDefaults.unitweight;

                this.namehash = hashcode(name);

                this.unitweight = this.detectUnitWeight(unitweight);
                this.weight = this.detectWeight(weight);
                this.currency = this.detectCurrency(currency);

                if(this.baseprice === null){
                    this.baseprice = Number.parseFloat(currency.split("EUR")[0].replace(",", "."));
                }
        }
        
        toString(){
            return this.name;
        }

        calcRealPrice(){
            if(this.weight == null)return this.baseprice;
            return (this.weight*this.baseprice);
        }

        detectWeight(str){
            if(str === undefined)return;
            var sta=null;
            var strs=str.split(" ");
            var spli = 0
            var thus = this;
            strs.forEach(function (element) {
              if(element != undefined) {
                    spli+=1
                    if(thus.howOftenInString(element, 'ST') == 1 && thus.isLastCharAndBeforeNumber(element, 'ST')) {
                        sta = Number(element.split("ST")[0]);
                    }
                
                    if(thus.howOftenInString(element, 'l') == 1 && thus.isLastCharAndBeforeNumber(element, 'l')) {
                        sta = Number(element.split("l")[0]);
                    }
                
                    if(thus.howOftenInString(element,'g') == 1 && thus.isLastCharAndBeforeNumber(element, 'g')) {
                        // Mostly 250g, 500g etc.
                        sta = Number(element.split("g")[0]);
                    }
                
                    if(element == "g") {
                        // Mostly 250g, 500g etc.
                        console.log(strs[spli-2])
                        sta = Number(strs[spli-2]);
                    }
                }
            });
            return sta;
        }
        
        detectUnitWeight(str){
            var unitweight = "";
            unitweight = str.split("/");
            if(unitweight !== undefined && unitweight !== null){
              unitweight = unitweight[1]
              if(unitweight === undefined || unitweight === null) return null;
              if(unitweight.includes("kg"))return "kg";
              if(unitweight.includes('Liter'))return 'Liter';
              if(unitweight.includes("g"))return "kg"; // Later around calculated
            }
            return unitweight;
        }

        detectCurrency(str){
            if (str.includes('EUR'))return "EUR";
            return null;
        }

        isString(str){
            return (typeof myVar === str || str instanceof String);
        }
        
        isLastCharAndBeforeNumber = function (str, k){
            str=replaceString(str, ' ', '');
            return (str[str.length-1] == k && Number(str[str.length-2]) >= 0);
        }
          
        howOftenInString = function (str, k){
            if(str === null || k === null)return 0;
            var i=0;
            str = str.split("");
            str.forEach(function (el) {
              if(el == k)i++;
            });
            return i;
        }
}


module.exports = Product