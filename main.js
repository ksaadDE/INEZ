/**
 * INEZ Intelligente Einkaufsliste als Chatbot Version
 * Author: Karim Saad 
 * Month/Year: 08/2019
 */

// Modules to control application life and create native browser window
const electron = require('electron');
const {app, BrowserWindow} = require('electron');
const globalShortcut = electron.globalShortcut;
const path = require('path');
const os = require('os');
const fetch = require('electron-fetch').default
const { parse } = require('node-html-parser');
const replaceString = require('replace-string');
const Product = require('./product.js');
const fs = require('fs');
const bayes = require('classificator');
const classifier = bayes();

const FileReader = require('./FileReader.js');
const JsonParser = require('./JsonParser.js');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

global.products = [];
global.classifier = classifier;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

app.on('ready', function() {
  let platform = os.platform()
    if (platform === 'darwin') {
      globalShortcut.register('Control+D', () => {
        if(!mainWindow.webContents.isDevToolsOpened()) {
          mainWindow.webContents.openDevTools()
        } else {
          mainWindow.webContents.closeDevTools()
        }
      })
    } else if (platform === 'linux' || platform === 'win32') {
      globalShortcut.register('Control+D', () => {
        if(!mainWindow.webContents.isDevToolsOpened()) {
          mainWindow.webContents.openDevTools()
        } else {
          mainWindow.webContents.closeDevTools()
        }
      })
    }
    TeachData();
    TriggerDownloadEDEKAProducts();
  })

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function TriggerDownloadEDEKAProducts(){
  let data = "";
  if(!CheckFileExists("./cache.html")) {
    console.log("fetching");
    fetch('https://www.edekanord-shop.de/jens/products?pageSize=99999')
        .then(res =>  res.text())
        .then(body => FilterProducts(body));
  } else {
    data=FileReader.ReadFile("./cache.html")
    FilterProducts(data);
  }
}

function CheckFileExists(filename){
  try {
    if (fs.existsSync(filename)) {
      //file exists
      return true;
    }
  } catch(err) {
    console.error(err)
    return false;
  }
}

function FilterProducts(body){
  var locally= true;
  if(!CheckFileExists("./cache.html")) {
    FileReader.SaveFile("./cache.html", body);
    locally = false;
  }
  var html = parse(body, {
    lowerCaseTagName: false,  // convert tag name to lower case (hurt performance heavily)
    script: false,            // retrieve content in <script> (hurt performance slightly)
    style: false,             // retrieve content in <style> (hurt performance slightly)
    pre: false                // retrieve content in <pre> (hurt performance slightly)
  });

  var infowrapperclassname = ".info-wrapper"; 
  var productitleclassname = ".product-title";
  var productpriceclassname = ".base-price";

  var allwrappers = html.querySelectorAll(infowrapperclassname);
  
  allwrappers.forEach(async function(element){
    var title = element.querySelector(productitleclassname);
    var price = element.querySelector(productpriceclassname);

    if(title === null || title === undefined) {
      console.log("No Title found");
      return;
    }

    if(price === null || price === undefined) {
      console.log(element.toString());
      console.log("No Price found");
      return;
    }
    title = title.text;
    price = price.text;
    console.log(title, price);
    price = replaceString(replaceString(price, "\t", "").replace("Grundpreis:",""),"\n","");
    var decode = require('unescape');
    title= ConvertToRightStrings(title);
    price = ConvertToRightStrings(price);
    currency = price;   // Converted later in the class
    unitweight = price; // Converted in the class from string to n
    title = replaceString(title, "\t", "");
    weight = title;
    p = new Product(title, weight, null, currency, unitweight);
    products.push(p);
  });

  products.push(p);
}

function ConvertToRightStrings(i){
  i=replaceString(i, '\n', '')
  i=replaceString(i,"├£","ü")
  i=replaceString(i, "Ôé¼", "€")
  i=replaceString(i, "€", "EUR")
  i=replaceString(i, "Ü", "UE")
  return i;
}

function TeachData() {
    var data = new JsonParser("classificationsamples.json").getData();
    for (var i =0; i < 5; i++) {
      data.forEach(function (el) {
        // All combinations of Classifier strings.
        classifier.learn(el[0].toLowerCase(), el[1]);
        classifier.learn(el[0].toUpperCase(), el[1]);
        classifier.learn(el[0], el[1]);
      });
    }
  // classifier.learn('Ich brauche Milch', 'product');
}
