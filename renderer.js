// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
electron = require('electron');
const Product = require('./product.js');
const remote = require('electron').remote
const app = remote.app

window.$ = window.jQuery = require('jquery');
// window.Tether = require('tether')
window.Bootstrap = require('bootstrap');

window.products = remote.getGlobal("products");
window.classifier = remote.getGlobal("classifier");
const word2Number = require('./word2number.js');
const replaceString = require('replace-string');

window.lastUsedName = "";
window.buyList = [];
window.chatItems = [];
window.chatItemsFull = [];
window.upselector = 0;
window.suggestions = [];
window.suggestionsitemamount = 0;
window.suggestionsbyunitweight = false;

$("body").keydown(function (event) {
  var keypressed = event.keyCode || event.which;
  if(keypressed == 38){
    if(window.chatItemsFull.length > 0) {
      var ownMessages = [];
      window.chatItemsFull.forEach(function (el) {
        if(!el["sender"])ownMessages.push(el);
      });

      var l = ownMessages.length;
      if(ownMessages[l-1] == undefined)return;
      if(window.upselector == 0) {
        window.upselector = l-1;
      } else {
        window.upselector--;
      }
      if(l-window.upselector < 0 )window.upselector = 0;
      var content = ownMessages[window.upselector]["contentplain"];
      $("#productinp").val(content);
      ownMessages = [];
    }
  }
});

$("#productinp").keydown(function (event) {
  var keypressed = event.keyCode || event.which;
  if (keypressed == 13) {
    sendButton();
  }
});

function suggestionsByProductname(name, exactunit=false, unit="L", amount=0){
  var suggestions=[];
  products.forEach(function (el) {
    var pName = el.toString(); // productname
    var isSimilar = pName.includes(name);
    if (exactunit){
      if(el.unitweight != unit && el.unitweight != unit[0]){
        // !! not !! Liter or L for example 
        isSimilar = false;
      }

      //console.log((amount/el.weight), amount);
      console.log(unit);
      var div = (amount/el.weight)*1000;
      window.suggestionsitemamount = parseInt(div);
      if(div < amount ||  div < 1) isSimilar=false;
    }


    if(isSimilar){
      suggestions.push(el);
    }
  });
  return suggestions;
}

function suggestionSelector(id){
  id=id-1;
  if(id >= 0 && id <=window.suggestions.length && window.suggestions.length > 0) {
    var item = window.suggestions[id];
    item.amount = parseInt(window.suggestionsitemamount);
    return item;
  }
  return null;
}

function calcAnswer(inp, cat){
  if(inp.length == 0)return null;
  if(window.suggestions.length > 0 ){
    // console.log("Suggestions checking");
    var selectedItem = suggestionSelector(inp);
    if(selectedItem != null && selectedItem != undefined){
      addToBuyList(selectedItem, selectedItem.amount);
      window.suggestions = [];
      window.suggestionsitemamount = 0;
      window.suggestionsbyunitweight = false;
      return "Versuche das Produkt \' " + selectedItem.toString() + " \' der Einkaufliste hinzuzufügen.";
    } else {
      return "Das Produkt konnte leider nicht hinzugefügt werden :/";
    }
  }
  
  if(cat == "showoffers") {
    return showOffers();
  }

  if(cat == "greeting"){
    return "Hey, ich bin der EDEKA INEZ Einkaufslistenbot.<br>Ich verwalte diese Einkaufsliste! Bitte schreiben Sie mir einfach, was Sie möchten.";
  } else if(cat == "removeitem") {
    var productname = "";
    if(inp.includes("keinen"))productname = inp.split("keinen")[1];
    if(productname == undefined || productname.length == 0)productname = inp.split("keine")[1];
    if(productname == undefined || productname.length == 0)productname = inp.split("kein")[1];
    // console.log(productname);
    if(productname == null || undefined)return "Sorry, da ist irgendetwas schief gelaufen, konnte das Produkt nicht entfernen!";
    if(productname.length == 0)productname = inp.split("nicht")[1];
    if(productname == null || undefined)return "Sorry, da ist irgendetwas schief gelaufen, konnte das Produkt nicht entfernen!";
    productname = replaceString(productname, " ","");
    var buyListCopy = window.buyList;
    var nstr = "";
    buyListCopy.forEach(function (el) {
      var lstr = el.toString();
      if(lstr.includes(productname)) {
        if(el.amount > 1){
          window.buyList[window.buyList.indexOf(el)].amount--;
          nstr= el.toString() + "ist nun nur noch " + window.buyList[window.buyList.indexOf(el)].amount + " enthalten!";
          return;
        } else {
          delete window.buyList[window.buyList.indexOf(el)];
          nstr= el.toString() + " wurde aus der Einkaufsliste entfernt!";
          return;
        }
      }
    });
    if(nstr.length == 0)nstr="Kein derartiges Produkt ('" + productname + "') in der Einkaufsliste gefunden!";
    return nstr;
  }
  else if (cat == "product"){
    var productname = "";
    if(inp.includes("brauche"))productname = inp.split("brauche")[1].replace(".","").replace("!","").replace(",","");
    if(inp.includes("benötige"))productname = inp.split("benötige")[1].replace(".","").replace("!","").replace(",","");
    // console.log(productname);
    if(productname == null || productname == undefined || productname.length == 0)return "Tut mir leid, dass habe ich leider nicht verstanden!"
    if(productname.split(" ").length >= 3){
       // Muster <anzahl> (<liter/kg etc>) <produktname>
       if(productname.includes("Liter") || productname.includes("L")) {
        //  console.log(inp);
         var liter = word2Number(inp);
        //  console.log(liter);
        var oldproductname = productname;
        var spl1 = oldproductname.split("Liter");
        if(spl1 != undefined && spl1.length > 1) {
          productname = spl1[1].split(" ")[1];
        } else productname = "";
        if(productname == undefined || productname.length == 0)productname = oldproductname.split("L")[1].split(" ")[1];
         return productsView(replaceString(productname, " ",""), liter, true, "Liter")
       }
       if(productname.includes("g") || productname.includes("gramm")) {
        //  console.log(inp);
         var g = word2Number(inp);
        //  console.log(liter);
        var oldproductname = productname;
        var spl1 = oldproductname.split("gramm");
        if(spl1 != undefined && spl1.length > 1) {
          productname = spl1[1].split(" ")[1];
        } else productname = "";
        if(productname == undefined || productname.length == 0)productname = oldproductname.split("g")[1].split(" ")[1];
        console.log(productname);
        console.log(g);
        window.suggestionsbyunitweight = true;
         return productsView(replaceString(productname, " ",""), (g), true, "kg")
       }
       var amount = word2Number(inp);
       productname = productname.split(" ")[2];
       return productsView(replaceString(productname, " ",""), amount)
    }
    //Muster <produktname>
    return productsView(replaceString(productname, " ",""), 1);
  }
  else if (cat == "endgreeting") {
    return "Danke für Ihre Zeit. <br> Ich wünsche Ihnen einen angenehmen Tag!<br>Ihr EDEKA INEZ Bot!"
  } else if(cat == "setsname"){
    var name=inp.split("ist") [1];
    if(name == undefined || name.length == 0 || name == null)return "Tut mir leid, das habe ich nicht verstanden!";
    window.lastUsedName = name.replace(".","").replace(",","");
    return "Hallo, " + window.lastUsedName + "!";
  } else if(cat == "setname2") {
    var name = inp.split("heiße")[1];
    window.lastUsedName = name.replace(".","").replace(",","");
    return "Hallo, " + window.lastUsedName + "!";
  } else if(cat == "setname3") {
    var name = inp.split("bin")[1];
    window.lastUsedName = name.replace(".","").replace(",","");
    return "Hallo, " + window.lastUsedName + "!";
  } else if(cat == "nameasking") {
    return "Ihr Name lautet: " + window.lastUsedName;
  } else if(cat == "listproducts"){
    var str = "Ihre Einkaufsliste enthält:<hr>";
    return str + buyListToStr();
  } else if(cat == "chatclear") {
    clearChat();
    $("#productinp").val("");
    return null;
  }
  else {
    return "Tut mir leid, dass habe ich leider nicht verstanden!"
  }
  return "";
}

function productsView(productname, amount,  exactunit=false, unit=""){
  amount = parseInt(amount);
  console.log(amount);
  var suggestions=suggestionsByProductname(productname, exactunit, unit, amount);
  var strv = "Folgende Produkte stehen zur Auswahl: <br> <small>Einfach die Zahl eingeben!</small> <br>";
  if (suggestions.length > 1 ) {
    var i = 0;
    suggestions.forEach( function(el) {
      i++;
      strv += "<b>"+i+"</b>: " + el.toString() + " ("+ (((el.calcRealPrice()/10)).toFixed(2)+"").replace(".", ",") +" "+el.currency+") <br>";
    });
  }
  if(suggestions.length > 1 ) {
    window.suggestions = suggestions;
    window.suggestionsitemamount = parseInt(amount);
    return strv;
  } else {
    if(suggestions.length == 1) {
      productname = suggestions[0].toString();
      addToBuyList(suggestions[0], parseInt(amount));
      return "Versuche das Produkt \' " + productname + " \' der Einkaufliste hinzuzufügen."
      window.suggestionsbyunitweight = false;
    } else {
      return "Entschuldigung leider kein vergleichbares Produkt gefunden!."
    }
  }
}

function sendButton(){
  var text = $("#productinp").val();
  // console.log(text);
  var cat = window.classifier.categorize(text).predictedCategory;
  // console.log(cat);
  var answer = calcAnswer(text, cat);
  if(answer == null)return;
  clearChat();
  if(suggestions.length > 0){
    addToChat(text, false);
  }
  addToChat(answer, true);
  $("#productinp").val("");
}


function clearChat(){
  if(window.chatItemsFull.length > 1000)window.chatItemsFull = [];
  window.chatItems = [];
  $("#chat").html(" ");
}
function addToChat(message, edeka=false){
  if(message == undefined || message.length == 0)return;
  if(window.chatItems.length > 4)clearChat();
  var str ="";
  if(edeka){
    str = '<div class="d-flex flex-row"> \
      <div class="p-1 chatsender"><small>EDEKA:</small></div> \
    </div>  \
    <div class="d-flex flex-row"> \
        <div class="p-8 chatmsgedeka"><small>'+message+'</small></div> \
    </div>';
  } else {
    str = '<div class="d-flex flex-row-reverse"> \
      <div class="p-1 chatsender"><small>Ich:</small></div> \
    </div>  \
    <div class="d-flex flex-row-reverse"> \
        <div class="p-8 chatmsg"><small>'+message+'</small></div> \
    </div>';
    var vData = {"sender": edeka, "content": str, "contentplain": message};
    window.chatItems.push(vData); // Up to 4
    window.chatItemsFull.push(vData); //Up to 1000 even after clear
  }

  var val = $("#chat").html();
  $("#chat").html(val+str);
}

function buyListToStr () {
  var str = "";
  buyList.forEach(function (el) {
    str += el.toString() + " ( "+ el.amount +" Stk)<br>";
  });
  return str;
}

function addToBuyList (item, amount) {
  amount = parseInt(amount);
  if(window.suggestionsbyunitweight) {
    // console.log(amount, item.weight);
    amount = (amount / item.weight);
    amount = parseInt(amount);
    window.suggestionsbyunitweight = false;
    console.log("ttt", amount)
  }
  amount = parseInt(amount);
  var itemid = window.buyList.indexOf(item);
  if(amount == 0)return;
  if(window.buyList.includes(item)){
    console.log(itemid, window.buyList[itemid].amount, amount);
    window.buyList[itemid].amount += amount;
    console.log(itemid, window.buyList[itemid].amount, amount);
  } else {
    window.buyList.push(item);
    window.buyList[window.buyList.indexOf(item)].amount = parseInt(amount);
  }
}

function showOffers(){
  return "Hey, wir haben gerade nichts im Angebot!";
}