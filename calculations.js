const moment = require('moment');

function feeForCashIn(singleTrans, cashInSettings) {
    let calculatedFee = singleTrans.operation.amount * cashInSettings.percents / 100;
    if (calculatedFee > cashInSettings.max.amount) {
        calculatedFee = cashInSettings.max.amount;
    }
    return (Math.ceil(calculatedFee * 100) / 100);
}

function feeForCashOutLegal(singleTrans, cashOutSettingsLegal) {
    let calculatedFee = singleTrans.operation.amount * cashOutSettingsLegal.percents / 100;
    if (calculatedFee < cashOutSettingsLegal.min.amount) {
        calculatedFee = cashOutSettingsLegal.min.amount;
    }
    return (Math.ceil(calculatedFee * 100) / 100);
}

function feeForCashOutNatural(singleTrans, cashOutSettingsNatural, userCashOuts) {
    let transDate = singleTrans.date;
    let userID = singleTrans.user_id;
    let cashOutAmount = singleTrans.operation.amount;
    let transYear = moment(transDate).format('YYYY');
    let transWeek = moment(transDate).format('W');
    if ((transWeek == 53 || transWeek == 52) && (moment(transDate).format(MM) == 01)) {
        transYear = parseInt(transYear) - 1;
    }
    if (userCashOuts[userID] == undefined) {
        userCashOuts[userID] = {};
    }
    if (userCashOuts[userID][transYear] == undefined) {
        userCashOuts[userID][transYear] = {};
    }
    if (userCashOuts[userID][transYear][transWeek] == undefined) {
        userCashOuts[userID][transYear][transWeek] = 0;
    }
    let calculatedFee = 0;
    if (userCashOuts[userID][transYear][transWeek] >= cashOutSettingsNatural.week_limit.amount) {
        calculatedFee = cashOutAmount * cashOutSettingsNatural.percents / 100;
        userCashOuts[userID][transYear][transWeek] += cashOutAmount;
    } else if ((userCashOuts[userID][transYear][transWeek] + cashOutAmount) <= cashOutSettingsNatural.week_limit.amount) {
        userCashOuts[userID][transYear][transWeek] += cashOutAmount;
    } else {
        userCashOuts[userID][transYear][transWeek] += cashOutAmount;
        let nonFreeAmount = userCashOuts[userID][transYear][transWeek] - cashOutSettingsNatural.week_limit.amount;
        calculatedFee = nonFreeAmount * cashOutSettingsNatural.percents / 100;
    }
    return [userCashOuts, (Math.ceil(calculatedFee * 100) / 100)];
}

module.exports.feeForCashIn = feeForCashIn;
module.exports.feeForCashOutLegal = feeForCashOutLegal;
module.exports.feeForCashOutNatural = feeForCashOutNatural;