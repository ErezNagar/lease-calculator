import LeaseCalculator from "../src/LeaseCalculator";
import {
  DUMMY_FINANCE_WITH_ZERO_DOWN_WITH_ZERO_TAX_WITH_ZERO_FEES,
  DUMMY_FINANCE_WITH_DOWN_PAYMENT_WITH_ZERO_TAX_WITH_ZERO_FEES,
  DUMMY_FINANCE_WITH_ZERO_DOWN_WITH_TAX_WITH_ZERO_FEES,
  DUMMY_FINANCE_WITH_ZERO_DOWN_WITH_ZERO_TAX_WITH_FEES,
  DUMMY_FINANCE_WITH_DOWN_PAYMENT_WITH_TAX_WITH_FEES,
  DUMMY_FINANCE_WITH_TRADE_IN,
  WHEN_ZERO_DOWN_ZERO_TAX_ZERO_FEES,
  WHEN_DOWN_PAYMENT_ZERO_TAX_ZERO_FEES,
  WHEN_ZERO_DOWN_TAX_ZERO_FEES,
  WHEN_ZERO_DOWN_ZERO_TAX_AND_FEES,
  WHEN_DOWN_PAYMENT_TAX_AND_FEES,
} from "./constants";

describe("FinanceCalculator", () => {
  let leaseCalculator;
  beforeAll(() => {
    leaseCalculator = new LeaseCalculator();
  });

  describe("Validation", () => {
    it("should throw an error when Selling Price field is missing", () => {
      expect(() => {
        leaseCalculator.calculateFinance({
          ...DUMMY_FINANCE_WITH_ZERO_DOWN_WITH_ZERO_TAX_WITH_ZERO_FEES,
          sellingPrice: null,
        });
      }).toThrowError(`Invalid Input: Selling Price`);
    });
    it("should throw an error when APR field is missing", () => {
      expect(() => {
        leaseCalculator.calculateFinance({
          ...DUMMY_FINANCE_WITH_ZERO_DOWN_WITH_ZERO_TAX_WITH_ZERO_FEES,
          APR: null,
        });
      }).toThrowError(`Invalid Input: APR`);
    });
    it("should throw an error when RV field is missing", () => {
      expect(() => {
        leaseCalculator.calculateFinance({
          ...DUMMY_FINANCE_WITH_ZERO_DOWN_WITH_ZERO_TAX_WITH_ZERO_FEES,
          financeTerm: null,
        });
      }).toThrowError(`Invalid Input: Finance Term`);
    });
  });

  describe("When zero down, zero tax and zero fees", () => {
    let result;
    beforeEach(() => {
      result = leaseCalculator.calculateFinance(
        DUMMY_FINANCE_WITH_ZERO_DOWN_WITH_ZERO_TAX_WITH_ZERO_FEES
      );
    });
    it("should get correct monthly payment", () => {
      expect(result.getFinanceMonthlyPayment()).toEqual(
        WHEN_ZERO_DOWN_ZERO_TAX_ZERO_FEES.MONTHLY_PAYMENT
      );
    });
    it("should get correct finance total cost", () => {
      expect(result.getFinanceTotalCost()).toEqual(
        WHEN_ZERO_DOWN_ZERO_TAX_ZERO_FEES.TOTAL_COST
      );
    });
    it("total amount to finance should match sellilng price", () => {
      expect(result.getTotalAmountFinanced()).toEqual(
        DUMMY_FINANCE_WITH_ZERO_DOWN_WITH_ZERO_TAX_WITH_ZERO_FEES.sellingPrice
      );
    });
    it("should get correct total interest on finance", () => {
      expect(result.getFinanceTotalInterest()).toEqual(
        WHEN_ZERO_DOWN_ZERO_TAX_ZERO_FEES.TOTAL_INTEREST
      );
    });
  });

  describe("When down payment, zero tax and zero fees", () => {
    let result;
    beforeEach(() => {
      result = leaseCalculator.calculateFinance(
        DUMMY_FINANCE_WITH_DOWN_PAYMENT_WITH_ZERO_TAX_WITH_ZERO_FEES
      );
    });
    it("should get correct monthly payment", () => {
      expect(result.getFinanceMonthlyPayment()).toEqual(
        WHEN_DOWN_PAYMENT_ZERO_TAX_ZERO_FEES.MONTHLY_PAYMENT
      );
    });
    it("should get correct finance total cost", () => {
      expect(result.getFinanceTotalCost()).toEqual(
        WHEN_DOWN_PAYMENT_ZERO_TAX_ZERO_FEES.TOTAL_COST
      );
    });
    it("total amount to finance should be selling price minus down payment", () => {
      expect(result.getTotalAmountFinanced()).toEqual(
        DUMMY_FINANCE_WITH_DOWN_PAYMENT_WITH_ZERO_TAX_WITH_ZERO_FEES.sellingPrice -
          DUMMY_FINANCE_WITH_DOWN_PAYMENT_WITH_ZERO_TAX_WITH_ZERO_FEES.downPayment
      );
    });
    it("should get correct total interest on finance", () => {
      expect(result.getFinanceTotalInterest()).toEqual(
        WHEN_DOWN_PAYMENT_ZERO_TAX_ZERO_FEES.TOTAL_INTEREST
      );
    });
  });

  describe("When zero down, tax and zero fees", () => {
    let result;
    beforeEach(() => {
      result = leaseCalculator.calculateFinance(
        DUMMY_FINANCE_WITH_ZERO_DOWN_WITH_TAX_WITH_ZERO_FEES
      );
    });
    it("should get correct monthly payment", () => {
      expect(result.getFinanceMonthlyPayment()).toEqual(
        WHEN_ZERO_DOWN_TAX_ZERO_FEES.MONTHLY_PAYMENT
      );
    });
    it("should get correct finance total cost", () => {
      expect(result.getFinanceTotalCost()).toEqual(
        WHEN_ZERO_DOWN_TAX_ZERO_FEES.TOTAL_COST
      );
    });
    it("should get correct total amount to finance", () => {
      expect(result.getTotalAmountFinanced()).toEqual(
        WHEN_ZERO_DOWN_TAX_ZERO_FEES.TOTAL_AMOUNT_TO_FINANCE
      );
    });
    it("should get correct total interest on finance", () => {
      expect(result.getFinanceTotalInterest()).toEqual(
        WHEN_ZERO_DOWN_TAX_ZERO_FEES.TOTAL_INTEREST
      );
    });
  });

  describe("When zero down, zero tax and fees", () => {
    let result;
    beforeEach(() => {
      result = leaseCalculator.calculateFinance(
        DUMMY_FINANCE_WITH_ZERO_DOWN_WITH_ZERO_TAX_WITH_FEES
      );
    });
    it("should get correct monthly payment", () => {
      expect(result.getFinanceMonthlyPayment()).toEqual(
        WHEN_ZERO_DOWN_ZERO_TAX_AND_FEES.MONTHLY_PAYMENT
      );
    });
    it("should get correct finance total cost", () => {
      expect(result.getFinanceTotalCost()).toEqual(
        WHEN_ZERO_DOWN_ZERO_TAX_AND_FEES.TOTAL_COST
      );
    });
    it("should get correct total amount to finance", () => {
      expect(result.getTotalAmountFinanced()).toEqual(
        WHEN_ZERO_DOWN_ZERO_TAX_AND_FEES.TOTAL_AMOUNT_TO_FINANCE
      );
    });
    it("should get correct total interest on finance", () => {
      expect(result.getFinanceTotalInterest()).toEqual(
        WHEN_ZERO_DOWN_ZERO_TAX_AND_FEES.TOTAL_INTEREST
      );
    });
  });

  describe("When down payment, tax and fees", () => {
    let result;
    beforeEach(() => {
      result = leaseCalculator.calculateFinance(
        DUMMY_FINANCE_WITH_DOWN_PAYMENT_WITH_TAX_WITH_FEES
      );
    });
    it("should get correct monthly payment", () => {
      expect(result.getFinanceMonthlyPayment()).toEqual(
        WHEN_DOWN_PAYMENT_TAX_AND_FEES.MONTHLY_PAYMENT
      );
    });
    it("should get correct finance total cost", () => {
      expect(result.getFinanceTotalCost()).toEqual(
        WHEN_DOWN_PAYMENT_TAX_AND_FEES.TOTAL_COST
      );
    });
    it("should get correct total amount to finance", () => {
      expect(result.getTotalAmountFinanced()).toEqual(
        WHEN_DOWN_PAYMENT_TAX_AND_FEES.TOTAL_AMOUNT_TO_FINANCE
      );
    });
    it("should get correct total interest on finance", () => {
      expect(result.getFinanceTotalInterest()).toEqual(
        WHEN_DOWN_PAYMENT_TAX_AND_FEES.TOTAL_INTEREST
      );
    });
  });

  describe("When trade-in value", () => {
    let result;
    beforeEach(() => {
      result = leaseCalculator.calculateFinance(DUMMY_FINANCE_WITH_TRADE_IN);
    });
    it("should get the same monthly payment as with down", () => {
      expect(result.getFinanceMonthlyPayment()).toEqual(
        WHEN_DOWN_PAYMENT_ZERO_TAX_ZERO_FEES.MONTHLY_PAYMENT
      );
    });
    it("should get the same finance total cost as with down", () => {
      expect(result.getFinanceTotalCost()).toEqual(
        WHEN_DOWN_PAYMENT_ZERO_TAX_ZERO_FEES.TOTAL_COST
      );
    });
    it("should get the same total amount to finance as with down", () => {
      expect(result.getTotalAmountFinanced()).toEqual(
        DUMMY_FINANCE_WITH_TRADE_IN.sellingPrice -
          DUMMY_FINANCE_WITH_TRADE_IN.tradeIn
      );
    });
    it("should get the same total interest on finance  as with down", () => {
      expect(result.getFinanceTotalInterest()).toEqual(
        WHEN_DOWN_PAYMENT_ZERO_TAX_ZERO_FEES.TOTAL_INTEREST
      );
    });
  });
});
