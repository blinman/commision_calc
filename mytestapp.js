// initial requires for operations
const fs = require('fs');
const request = require('request');
const calculations = require('./calculations');

// retrieves everything from the 3rd parameter onwards
const transDataFile = process.argv.slice(2);

// sets global variables to store settings from API
let cashInSettings = {};
let cashOutSettingsLegal = {};
let cashOutSettingsNatural = {};

// function to display fees
function displayFee(amount) {
  if (!isNaN(amount)) {
    amount = amount.toFixed(2); // if the fee is a number as expected, convert it to string with fixed 2 decimal points
  }
  process.stdout.write(amount + '\n'); // displays the fee or whatever status the transaction returned
}

// function to the file with transactions
function readTransFile() {
  return new Promise(((resolve, reject) => {
    fs.readFile(transDataFile[0], (err, data) => {
      if (err) {
        reject('failed to read file' + '\n' + err);
      } else {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject('read the file, but it appears to be invalid JSON' + '\n' + err);
        }
      };
    });
  }));
}

// function for data from API retrieval
function retrieveSettingsFromAPI(url) {
  return new Promise(((resolve, reject) => {
    request(url, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          reject('read the API, but it appears to be invalid JSON' + '\n' + err);
        }
      } else {
        reject('failed to get commision setting' + '\n' + response.statusCode);
      }
    });
  }));
}

// generates fee depending on transactional data
function feeGenerator(singleTransData) {
  if (singleTransData.operation.currency != 'EUR') { // checks if currency is EUR, as only EUR transactions are permitted
    return ('only transaction in EUR are supported' + '\n' + 'transaction info=> date: ' + singleTransData.date + ' user ID: ' + singleTransData.user_id + ' currency: ' + singleTransData.operation.currency); // if the transaction is in EUR, inform the user
  } if (singleTransData.type == 'cash_in') {
    return calculations.feeForCashIn(singleTransData, cashInSettings);
  } if (singleTransData.type == 'cash_out' && singleTransData.user_type == 'juridical') {
    return calculations.feeForCashOutLegal(singleTransData, cashOutSettingsLegal);
  } if (singleTransData.type == 'cash_out' && singleTransData.user_type == 'natural') {
    return calculations.feeForCashOutNatural(singleTransData, cashOutSettingsNatural);
  } // if the transaction did not satisfy any expected parameter settings, inform the user
  return ('unsupported transaction or user type' + '\n' + 'transaction info=> date: ' + singleTransData.date + ' user ID: ' + singleTransData.user_id + ' transaction type: ' + singleTransData.type + ' user type: ' + singleTransData.user_type);
}

// simplied main logic to work with data from file
function mainLogic(transData) {
  transData.forEach((singleTransData) => { // for each entry in the data
    const resultingFee = feeGenerator(singleTransData); // generate a fee based in the transactional data
    displayFee(resultingFee); // display the fee in the required format
  });
}

// starts the whole transaction fee counting process
if (transDataFile.length !== 0) { // if the 3rd parameter (presumably transaction file part) was given, start the program
  const promises = [];
  promises.push(retrieveSettingsFromAPI('http://private-38e18c-uzduotis.apiary-mock.com/config/cash-in'));
  promises.push(retrieveSettingsFromAPI('http://private-38e18c-uzduotis.apiary-mock.com/config/cash-out/juridical'));
  promises.push(retrieveSettingsFromAPI('http://private-38e18c-uzduotis.apiary-mock.com/config/cash-out/natural'));

  Promise.all(promises).then((retrievedSettings) => { // requests settings from APIs concurrently
    cashInSettings = retrievedSettings[0];
    cashOutSettingsLegal = retrievedSettings[1];
    cashOutSettingsNatural = retrievedSettings[2];
  }).then(() => // once all the API have been read and settings stored, read the transactions file
    // eslint-disable-next-line implicit-arrow-linebreak
    readTransFile(), // retruns file contents
  ).then((dataFromFile) => { // once the file has been read start working with the data
    mainLogic(dataFromFile);
  })
    .catch((error) => {
      process.stdout.write(error);
    });
} else {
  process.stdout.write('have not received the filepath\n'); // if no argument were submitted when launching the program, inform the user
}
