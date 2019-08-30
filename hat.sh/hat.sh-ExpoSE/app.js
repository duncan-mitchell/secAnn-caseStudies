/**
 * START OF LIBRARY MOCKS
 * Remove Old Dependencies, add new mocks for ExpoSE
 */
//require the dependencies
//const bootstrap = require('bootstrap');
//var $ = require("jquery");
//const popperjs = require('popper.js');
//const zxcvbn = require('zxcvbn');
const URL        = require('./mocks/url-mock');
const document   = require('./mocks/document-mock');
const $          = require('./mocks/jquery-mock');
const window     = require('./mocks/window-mock');
const zxcvbn     = require('./mocks/zxcvbn-mock');
const FileReader = require('./mocks/FileReader-mock');
const Blob       = require('./mocks/Blob-mock');

/**
 * END OF LIBRARY MOCKS
 */

//file input events
const inputFile = document.getElementById("customFile"); //file input
inputFile.addEventListener("change", updateNameAndSize, false); //from the updateNameAndSize function

//generate key button events
const genBtn = document.getElementById("generateButton");
genBtn.addEventListener("click", generateKey, false); //from the generateKey function

//password input events
let password = document.getElementById('inputPassword');
password.addEventListener("input", keyCheckMeter, false);

//encryption decryption button events
const encryptBtn = document.getElementById("encryptBtn");
encryptBtn.addEventListener("click", encryptFile); //from the generateKey function

const decryptBtn = document.getElementById("decryptBtn");
decryptBtn.addEventListener("click", decryptFile); //from the generateKey function

const resetBtn = document.getElementById("resetBtn");
resetBtn.addEventListener("click", resetInputs); //reset inputs on click

//declarations
const DEC = {
  signature: "RW5jcnlwdGVkIFVzaW5nIEhhdC5zaA", //add a line in the file that says "encrypted by Hat.sh :)"
  hash: "SHA-256",
  algoName1: "PBKDF2",
  algoName2: "AES-GCM",
  algoLength: 256,
  itr: 100000,
  perms1: ["deriveKey"],
  perms2: ['encrypt', 'decrypt'],
}

//function to toggle tooltips for bootstrap
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

//error messages handler function
function errorMsg(msg) {
  let errTag =
    `<div class="alert alert-danger alert-error" role="alert">
    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
    <strong>Error!</strong> ${msg}
  </div>`;
  document.getElementById("error").insertAdjacentHTML('beforeEnd', errTag); //inserthtml
  window.setTimeout(function () {
    $(".alert-error").fadeTo(500, 0).slideUp(500, function () {
      $(this).remove();
    });
  }, 4000);
}


//determination of file name and size 
function updateNameAndSize() {
  showResetBtn();
  let nBytes = 0,
    oFiles = inputFile.files,
    nFiles = oFiles.length,
    placeHolder = document.getElementById("file-placeholder");
  for (let nFileId = 0; nFileId < nFiles; nFileId++) {
    nBytes += oFiles[nFileId].size;
    fileName = oFiles[nFileId].name;
  }
  let sOutput = nBytes + " bytes";
  // multiples approximation
  for (let aMultiples = ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"], nMultiple = 0, nApprox = nBytes / 1024; nApprox > 1; nApprox /= 1024, nMultiple++) {
    sOutput = nApprox.toFixed(2) + " " + aMultiples[nMultiple];
  }
  // console.log(fileName);
  //change placeholder text
  if (!inputFile.value) {
    placeHolder.innerHTML = "Choose a file to encrypt/decrypt";
  } else {
    placeHolder.innerHTML = fileName + '  <span class="text-success">' + sOutput + '</span>';
  }


}
 
//show and hide reset btn from html
function showResetBtn(){$("#resetBtn").css("display", "");}
function hideResetBtn(){$("#resetBtn").css("display", "none");}

//reset inputs
//if inputs are set reset them on click
function resetInputs(){
  if (inputFile.value != 0 || password.value != 0) {
    inputFile.value = "";
    password.value = "";
    updateNameAndSize();
    hideResetBtn();
    keyCheckMeter();
  } 
}


//check how strong is the password entered using zxcvbn.js
function keyCheckMeter() {
  let strength = {
    0: "Very Bad",
    1: "Bad",
    2: "Weak",
    3: "Good",
    4: "Strong"
  };
  let password = document.getElementById('inputPassword');
  let meter = document.getElementById('strength-meter');
  let text = document.getElementById('strength-text');
  let val = password.value;
  //console.log(val);
  let result = zxcvbn(val);
  //console.log(result);
  // Update the password strength meter
  meter.style.width = result.score * 25 + '%';
  //console.log(meter);
  // Update the text indicator
  if (val !== "") {
    text.innerHTML = strength[result.score];
    showResetBtn();
  } else {
    text.innerHTML = "none.";
  }
}

//better function to convert string to array buffer
//as done in the webcrypto documentation
//MODIFCATION: A LIBRARY FUNCTION, WE ANNOTATE IT
function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  //return buf
  return S$.cpAnn(str, buf);
}

//this function generates the html tag and provieds the file that needs to be downloaded as an html tag
function processFinished(name, data, method, dKey) {
  //methods 1->encryption , 2->decryption
  let msg;
  let status;
  let keyBtn;
  const randomId = Math.floor((Math.random() * 100) + 1);
  if (method == 1) {
    msg = "Successfully Encrypted";
    status = "encrypted";
    keyBtn = `<button type="button" class="btn btn-outline-secondary btn-sm" data-toggle="modal" data-target=".modal${randomId}"><i class="fas fa-key"></i>
    Decryption Key</button>`;
  } else {
    msg = "Successfully Decrypted";
    status = "decrypted"
    keyBtn = '';
  }
  const blob = new Blob(data, {
    type: 'application/octet-stream'
  }); // meaning download this file
  const url = URL.createObjectURL(blob); //create a url for blob
  const htmlTag = `<div class="result">
  <div class="modal fade bd-example-modal-sm modal${randomId}" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">decryption key</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            <div class="modal-body">
                  ${dKey}
            </div>
        </div>
      </div>
    </div>

  <div class="alert alert-outline ${status}" role="alert">
    <i class="fas fa-check"></i> ${name.replace('Encrypted-', '')} was <strong>${msg}</strong>
    <hr>
    <div class="btn-group">
      <a class="btn btn-outline-secondary btn-sm" href="${url}" download="${name}" role="button"><i class="fas fa-download"></i> ${status}
          file </a> ${keyBtn}
    </div>
  </div><!-- end alert -->
</div><!-- end result -->`;
  document.getElementById("results").insertAdjacentHTML('afterbegin', htmlTag); //inserthtml

}

//generate a random key for user
function generateKey() { 
  const usedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#_+=';
  let keyArray = new Uint8Array(16); //lenght of the key
  window.crypto.getRandomValues(keyArray); //randomize
  keyArray = keyArray.map(x => usedChars.charCodeAt(x % usedChars.length));
  const randomizedKey = String.fromCharCode.apply(null, keyArray);
  password.value = randomizedKey; //output the new key to the key input
  keyCheckMeter(); //run the key strength checker

}

//import key
// import the entered key from the password input
function importSecretKey() { 
  let rawPassword = str2ab(password.value); // convert the password entered in the input to an array buffer
  return window.crypto.subtle.importKey(
    "raw", //raw
    rawPassword, // array buffer password
    {
      length: DEC.algoLength,
      name: DEC.algoName1
    }, //the algorithm you are using
    false, //whether the derived key is extractable 
    DEC.perms1 //limited to the options encrypt and decrypt
  );

}

/**
 * MODIFICATION: REWRITTEN async/await CRYPTO
 */

function deriveSecretKey() { //derive the secret key from a master key.

  //ONLY CHANGE: Replace await with wrapping the whole function in .then
  return importSecretKey().then(function (getSecretKey) {
    let rawPassword = str2ab(password.value); // convert the password entered in the input to an array buffer
    return window.crypto.subtle.deriveKey({
        name: DEC.algoName1,
        salt: rawPassword, //use the entered password as a salt
        iterations: DEC.itr,
        hash: {
          name: DEC.hash
        },
      },
      getSecretKey, //your key from importKey
      { //the key type you want to create based on the derived bits
        name: DEC.algoName2,
        length: DEC.algoLength,
      },
      false, //whether the derived key is extractable 
      DEC.perms2 //limited to the options encrypt and decrypt
    )
    //console.log the key
    // .then(function(key){
    //     //returns the derived key
    //     console.log(key);
    // })
    // .catch(function(err){
    //     console.error(err);
    // });
  });
}

function encryptFile() {
  //check if file and password inputs are entered
  if (!inputFile.value || !password.value) {
    errorMsg("Please browse a file and enter a Key")
  } else {
    
    deriveSecretKey().then(function (derivedKey) { //requiring the key
      const file = inputFile.files[0]; //file input
      //CHANGED TO VAR FOR MOCK
      var fr = new FileReader(); //request a file read

      const n = new Promise((resolve, reject) => {

        //REMOVED ASYNC
        fr.onloadstart = (() => {
          $(".loader").css("display", "block"); //show spinner while loading a file
        });

        //REMOVED ASYNC/AWAIT, ADDED .THEN INSTEAD
        fr.onload = (() => { //load

          const iv = window.crypto.getRandomValues(new Uint8Array(16)); //generate a random iv
          const content = new Uint8Array(fr.result); //encoded file content
          // encrypt the file
          //REMOVED ASYNC, CREATED NAMED VARIABLE
          var enc = window.crypto.subtle.encrypt({
              iv,
              name: DEC.algoName2
            }, derivedKey, content) 
            .then(function (encrypted) {
              //returns an ArrayBuffer containing the encrypted data
              resolve(processFinished('Encrypted-' + file.name, [window.atob(DEC.signature), iv, new Uint8Array(encrypted)], 1, password.value)); //create the new file buy adding signature and iv and content
              //console.log("file has been successuflly encrypted");
              resetInputs(); // reset file and key inputs when done
            })
            .catch(function (err) {
              errorMsg("An error occured while Encrypting the file, try again!"); //reject
            });
          enc.then(function(res) {
            $(".loader").css("display", "none"); //hide spinner
          });
        })
        //read the file as buffer
        fr.readAsArrayBuffer(file)

      });
    });
  }
}

//file decryption function

function decryptFile() {

  if (!inputFile.value || !password.value) {
    errorMsg("Please browse a file and enter a Key")
  } else {

    deriveSecretKey().then(function(derivedKey) { //requiring the key
      const file = inputFile.files[0]; //file input
      var fr = new FileReader(); //request a file read

      const d = new Promise((resolve, reject) => {

        fr.onloadstart = () => {
          $(".loader").css("display", "block"); //show spinner while loading a file
        };

        fr.onload = () => { //load 
          //console.log(fr.result);
          const iv = new Uint8Array(fr.result.slice(22, 38)); //take out encryption iv

          const content = new Uint8Array(fr.result.slice(38)); //take out encrypted content
          //REMOVED ASYNC, CREATED NAMED VARIABLE
          var dec = window.crypto.subtle.decrypt({
              iv,
              name: DEC.algoName2
            }, derivedKey, content)
            .then(function (decrypted) {
              //returns an ArrayBuffer containing the decrypted data
              //CHANGE: REPLACED file.name TO "" SO MOCKING WORKS
              resolve(processFinished("".replace('Encrypted-', ''), [new Uint8Array(decrypted)], 2, password.value)); //create new file from the decrypted content
              //console.log("file has been successuflly decrypted");
              resetInputs(); // reset file and key inputs when done
            })
            .catch(function () {
              errorMsg("You have entered a wrong Decryption Key!");
            });
          dec.then(function(res) {
            $(".loader").css("display", "none"); //hide spinner
          });
        }

        fr.readAsArrayBuffer(file) //read the file as buffer

      });
    });
  }

}


/**
 * END OF REWRITTEN async/await CRYPTO
 */


/**
 * START OF DRIVER
 */
const shim       = require('./mocks/wcshim');
const stringShim = require('./mocks/StringShim')
const S$         = require('S$');
stringShim(String);
shim(window)

process.argv = ["node", "app.js", "MyData", ]




inputFile.change(process.argv[2]);
if(process.argv[3]) {
  password.input(process.argv[3]);
} else {
  genBtn.click();
}
encryptBtn.click();
let p = new Promise(function(resolve, reject) {
  setTimeout(function() {
    resolve(true);
  }, 5000);
});
p.then(() => {
  //If we have a decryption password decrypt
  if(process.argv[3] && URL.savedURL) {
    //savedURL is a mock to ensure we can recall the ciphertext because we can't click the download button
    inputFile.change(URL.savedURL); 
    password.input(process.argv[3]);
    decryptBtn.click();
    let p2 = new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve(true);
      }, 3000);
    });
    p2.then(() => { 
      console.log('decrypted message: ' + URL.savedURL);
    })
  } else {
    console.log('Random Password Used OR encryption failed');
  }
});

/**
 * END OF DRIVER
 */