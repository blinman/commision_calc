// initial requires for test and function operations
const expect = require('chai').expect;
const calculations = require('../calculations');

// dummy API settings
const cashInSettings = {
  "percents": 0.03,
  "max": {
    "amount": 5
  }
};

const cashOutSettingsLegal = {
  "percents": 0.3,
  "min": {
    "amount": 0.5
  }
};

const cashOutSettingsNatural = {
  "percents": 0.3,
  "week_limit": {
    "amount": 1000
  }
};

// dummy transactions
const mockTransactions = [
  { "date": "2015-12-29", "user_id": 1, "operation": { "amount": 200.00 } },
  { "date": "2016-01-02", "user_id": 2, "operation": { "amount": 300.00 } },
  { "date": "2016-01-03", "user_id": 1, "operation": { "amount": 30000 } },
  { "date": "2016-01-07", "user_id": 1, "operation": { "amount": 1000.00 } },
  { "date": "2016-01-07", "user_id": 1, "operation": { "amount": 100.00 } },
  { "date": "2016-01-10", "user_id": 1, "operation": { "amount": 100.00 } },
  { "date": "2016-01-10", "user_id": 2, "operation": { "amount": 1000000.00 } },
  { "date": "2016-01-10", "user_id": 3, "operation": { "amount": 1000.00 } },
  { "date": "2016-02-15", "user_id": 1, "operation": { "amount": 300.00 } },
  { "date": "2016-02-16", "user_id": 1, "operation": { "amount": 50.00 } },
  { "date": "2016-02-17", "user_id": 1, "operation": { "amount": 20.28 } },
  { "date": "2016-02-18", "user_id": 1, "operation": { "amount": 638.29 } }
];

// dummy input parameters
const percentages = 0.4;
const currencyForRounding = [0.8423, 1.23, 120, 4, 0.422, 0.4, 4000.9999, 4, 1.20000001, 0.21, 0.08112, 2.55316];
const currentWeeklyTotals = [200, 300, 30200, 31200, 900, 950, 1000300, 1000, 300, 350, 370.28, 1008.57];

// arrays of expected results
const cashInExpectations = [0.06, 0.09, 5.00, 0.30, 0.03, 0.03, 5.00, 0.30, 0.09, 0.02, 0.01, 0.20];
const cashOutExpectationsLegal = [0.60, 0.90, 90.00, 3.00, 0.50, 0.50, 3000.00, 3.00, 0.90, 0.50, 0.50, 1.92];
const cashOutExpectationsNatural = [0.00, 0.00, 87.60, 0.00, 0.30, 0.30, 2997, 0.00, 0.00, 0.00, 0.00, 0.03];
const percentCalcExpectations = [0.8, 1.2, 120, 4, 0.4, 0.4, 4000, 4, 1.2, 0.2, 0.08112, 2.55316];
const roundToSmallestCurrencyItemExpectations = [0.85, 1.23, 120, 4, 0.43, 0.4, 4001, 4, 1.21, 0.21, 0.09, 2.56];
const weeklyApplicableAmountExpectations = [0, 0, 30000, 1000, 0, 50, 1000000, 1000, 0, 0, 0, 638.29];
const currentWeeklyCashOutTotalExpectations = [0, 0, 200, 0, 1000, 1100, 0, 0, 0, 300, 350, 370.28];

function feeForCashOutNaturalTest() {
  describe('cash out test for natural', () => {
    for (let i = 0; i < mockTransactions.length; i += 1) {
      it(`should return ${cashOutExpectationsNatural[i]}`, () => {
        const result = calculations.feeForCashOutNatural(mockTransactions[i], cashOutSettingsNatural);
        expect(result).to.equal(cashOutExpectationsNatural[i]);
      });
    }
  });
}

function feeForCashInTest() {
  describe('cash in test', () => {
    for (let i = 0; i < mockTransactions.length; i += 1) {
      it(`should return ${cashInExpectations[i]}`, () => {
        const result = calculations.feeForCashIn(mockTransactions[i], cashInSettings);
        expect(result).to.equal(cashInExpectations[i]);
      });
    }
  });
}

function feeForCashOutLegalTest() {
  describe('cash out test for legal', () => {
    for (let i = 0; i < mockTransactions.length; i += 1) {
      it(`should return ${cashOutExpectationsLegal[i]}`, () => {
        const result = calculations.feeForCashOutLegal(mockTransactions[i], cashOutSettingsLegal);
        expect(result).to.equal(cashOutExpectationsLegal[i]);
      });
    }
  });
}

function percentageCalculationTest() {
  describe('test for percentage calculation', () => {
    for (let i = 0; i < mockTransactions.length; i += 1) {
      it(`should return ${percentCalcExpectations[i]}`, () => {
        const result = calculations.percentageCalc(mockTransactions[i].operation.amount, percentages);
        expect(result).to.equal(percentCalcExpectations[i]);
      });
    }
  });
}

function currencyRoundingTest() {
  describe('test for currency rounding', () => {
    for (let i = 0; i < mockTransactions.length; i += 1) {
      it(`should return ${roundToSmallestCurrencyItemExpectations[i]}`, () => {
        const result = calculations.roundToSmallestCurrencyItem(currencyForRounding[i]);
        expect(result).to.equal(roundToSmallestCurrencyItemExpectations[i]);
      });
    }
  });
}

function applicableForFeeAmountTest() {
  describe('test for amount applicable for a fee', () => {
    for (let i = 0; i < mockTransactions.length; i += 1) {
      it(`should return ${weeklyApplicableAmountExpectations[i]}`, () => {
        const result = calculations.weeklyApplicableAmount(mockTransactions[i], currentWeeklyTotals[i], cashOutSettingsNatural);
        expect(result).to.equal(weeklyApplicableAmountExpectations[i]);
      });
    }
  });
}

function weeklyCashOutAmountTest() {
  delete require.cache[require.resolve('../calculations.js')];
  const calculations = require('../calculations');
  describe('test for current cash out amount for a given user in a given week', () => {
    for (let i = 0; i < mockTransactions.length; i += 1) {
      it(`should return ${currentWeeklyCashOutTotalExpectations[i]}`, () => {
        const result = calculations.currentWeeklyCashOutTotal(mockTransactions[i]);
        expect(result).to.equal(currentWeeklyCashOutTotalExpectations[i]);
      });
    }
  });
}

// tests, test names are pretty self-explanatory
describe('Calculations test', () => {
  feeForCashInTest();
  feeForCashOutLegalTest();
  feeForCashOutNaturalTest();
  percentageCalculationTest();
  currencyRoundingTest();
  applicableForFeeAmountTest();
  weeklyCashOutAmountTest();
});
