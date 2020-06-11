'use strict'

const fs = require('fs');
const request = require('request');
const moment = require('moment');
const calculations = require('./calculations');
const transDataFile = process.argv.slice(2);
let userCashOuts = {};
let cashInSettings = {};
let cashOutSettingsLegal = {};
let cashOutSettingsNatural = {};

function readTransFile() {
  fs.readFile(transDataFile[0], function (err, data) {
    if (err) {
      process.stdout.write('failed to read file' + '\n');
      throw err;
    };
    try {
      let transData = JSON.parse(data);
      mainLogic(transData);
    } catch (err) {
      process.stdout.write('read the file, but it appears to be invalid JSON' + '\n' + err);
    }
  });
}


function retrieveCashInSettings() {
  request('http://private-38e18c-uzduotis.apiary-mock.com/config/cash-in', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      try {
        cashInSettings = JSON.parse(body);
        retrieveCashOutSettingsLegal();
      } catch (err) {
        process.stdout.write('read the API for cash in, but it appears to be invalid JSON' + '\n' + err);
      }
    } else {
      process.stdout.write('failed to get commision setting for cash ins' + '\n');
    }
  });
}

function retrieveCashOutSettingsLegal() {
  request('http://private-38e18c-uzduotis.apiary-mock.com/config/cash-out/juridical', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      try {
        cashOutSettingsLegal = JSON.parse(body);
        retrieveCashOutSettingsNatural();
      } catch (error) {
        process.stdout.write('read the API for cash out (legal), but it appears to be invalid JSON' + '\n' + err);
      }
    } else {
      process.stdout.write('failed to get commision setting for cash out for legal' + '\n');
    }
  });
}

function retrieveCashOutSettingsNatural() {
  request('http://private-38e18c-uzduotis.apiary-mock.com/config/cash-out/natural', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      try {
        cashOutSettingsNatural = JSON.parse(body);
        readTransFile();
      } catch (error) {
        process.stdout.write('read the API for cash out (legal), but it appears to be invalid JSON' + '\n' + error);
      }
    } else {
      process.stdout.write('failed to get commision setting for cash out for natural' + '\n');
    }
  });
}

function mainLogic(transData) {
  for (let i = 0; i < transData.length; i++) {
    if (transData[i]['operation']['currency'] != 'EUR') {
      process.stdout.write('only transaction in EUR are supported' + '\n');
    } else if (transData[i]['type'] == 'cash_in') {
      let cashInFee = calculations.feeForCashIn(transData[i], cashInSettings);
      process.stdout.write(cashInFee.toFixed(2) + '\n');
    } else if (transData[i]['type'] == 'cash_out' && transData[i]['user_type'] == 'juridical') {
      let cashOutFeeLegal = calculations.feeForCashOutLegal(transData[i], cashOutSettingsLegal);
      process.stdout.write(cashOutFeeLegal.toFixed(2) + '\n');
    } else if (transData[i]['type'] == 'cash_out' && transData[i]['user_type'] == 'natural') {
      let cashOutFeeNatural = calculations.feeForCashOutNatural(transData[i],cashOutSettingsNatural, userCashOuts);
      userCashOuts = cashOutFeeNatural[0];
      process.stdout.write(cashOutFeeNatural[1].toFixed(2) + '\n');
    } else {
      process.stdout.write('unsupported transaction or user type' + '\n');
    }
  }
}


if (transDataFile.length != 0) {
  retrieveCashInSettings();
} else {
  process.stdout.write('have not received the filepath' + '\n');
}