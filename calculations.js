//moment js to work with dates
const moment = require('moment');

//object that stores amounts for each user at a given year and a given week (user>year>week>amount)
let userCashOuts = {};

//calculates fee for cash ins
function feeForCashIn(singleTrans, cashInSettings) {
    let calculatedFee = percentageCalc(singleTrans.operation.amount, cashInSettings.percents); //calculates fee based on given percentage
    if (calculatedFee > cashInSettings.max.amount) {
        calculatedFee = cashInSettings.max.amount; //adjusts fee according to given limits
    }
    return roundToSmallestCurrencyItem(calculatedFee); //rounds to the smallest currency item and returns the cash in fee
}

//calculates fee for cash out for legal
function feeForCashOutLegal(singleTrans, cashOutSettingsLegal) {
    let calculatedFee = percentageCalc(singleTrans.operation.amount, cashOutSettingsLegal.percents); //calculates fee based on given percentage
    if (calculatedFee < cashOutSettingsLegal.min.amount) {
        calculatedFee = cashOutSettingsLegal.min.amount; //adjusts fee according to given limits
    }
    return roundToSmallestCurrencyItem(calculatedFee); //rounds to the smallest currency item and returns the cash out for legal fee
}

//calculates fee for cash out for legal
function feeForCashOutNatural(singleTrans, cashOutSettingsNatural) {
    let currentWeeklyTotal = currentWeeklyCashOutTotal(singleTrans); //retrieves the current weekly cash out total for that particular user
    let applicableAmount = weeklyApplicableAmount(singleTrans, currentWeeklyTotal, cashOutSettingsNatural); //check what amount the fees are applicable for
    let calculatedFee = percentageCalc(applicableAmount, cashOutSettingsNatural.percents); //calculates fee based on given percentage
    return roundToSmallestCurrencyItem(calculatedFee); //rounds to the smallest currency item and returns the cash out for natural fee
}

//provides info on the weekly cash out total for a particular user when he/she submits a transaction
function currentWeeklyCashOutTotal(singleTrans) {
    let transDate = singleTrans.date; //setting local variables for ease of use
    let userID = singleTrans.user_id;
    let cashOutAmount = singleTrans.operation.amount;
    let transYear = moment(transDate).format('YYYY'); //getting the year the transaction is taking place
    let transWeek = moment(transDate).format('W'); //getting the weel the transaction is taking place
    if ((transWeek == 53 || transWeek == 52) && (moment(transDate).format('MM') == 01)) { //check if the week is the last week of the previous year
        transYear = parseInt(transYear) - 1; //change the year for storage to reflect the week it belongs to
    }
    if (userCashOuts[userID] == undefined) { //check if anything is stored for that user
        userCashOuts[userID] = {}; //if not, creates an object for storage
    }
    if (userCashOuts[userID][transYear] == undefined) { //check if anything is stored for that user for that year
        userCashOuts[userID][transYear] = {}; //if not, creates an object for storage
    }
    if (userCashOuts[userID][transYear][transWeek] == undefined) { //check if anything is stored for that user for that year for that week
        userCashOuts[userID][transYear][transWeek] = 0; //if not, stores zero for that week as a starting point
    }
    let currentTotal = userCashOuts[userID][transYear][transWeek]; //set the currentTotal to whatever value the total was when the transaction was taking place
    userCashOuts[userID][transYear][transWeek] += cashOutAmount; //updates the total to reflect the change in value when the transaction will have completed
    return currentTotal; //returns the the weekly cash out total for a particular user when he/she submits a transaction
}

//calculates the amount to which fees are applicable
function weeklyApplicableAmount(singleTrans, currentWeeklyTotal, cashOutSettingsNatural) {
    let cashOutAmount = singleTrans.operation.amount;
    let applicableAmount = 0; //sets the amount to 0 at start
    if (currentWeeklyTotal >= cashOutSettingsNatural.week_limit.amount) { //if weekly total already exceeds the specified limit
        applicableAmount = cashOutAmount; //the fee can be applied to the whole transaction amount
    } else if ((currentWeeklyTotal + cashOutAmount) > cashOutSettingsNatural.week_limit.amount) { //if the weekly total and the transaction amount exceed the specified limt
        applicableAmount = currentWeeklyTotal + cashOutAmount - cashOutSettingsNatural.week_limit.amount; //the fee can be applied to the portion that exceeds the limit
    }
    return applicableAmount; //returns the amount to which fees are applicable
}

//calculates values when percentages are given as percents instead of pure decimals
function percentageCalc(amount, percentage) {
    return amount * percentage / 100;
}

//rounds a given amount to a hundreadth (2 decimal points)
function roundToSmallestCurrencyItem(amount) {
    return (Math.ceil(amount * 100) / 100);
}

//function exports for using and testing
module.exports.feeForCashIn = feeForCashIn;
module.exports.feeForCashOutLegal = feeForCashOutLegal;
module.exports.feeForCashOutNatural = feeForCashOutNatural;
module.exports.percentageCalc = percentageCalc;
module.exports.roundToSmallestCurrencyItem = roundToSmallestCurrencyItem;
module.exports.weeklyApplicableAmount = weeklyApplicableAmount;
module.exports.currentWeeklyCashOutTotal = currentWeeklyCashOutTotal;