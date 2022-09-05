import LeaseCalculator from "../src/LeaseCalculator";
import {
  DUMMY_FINANCE_WITH_ZERO_DOWN_WITH_ZERO_TAX_WITH_ZERO_FEES,
  DUMMY_FINANCE_WITH_DOWN_PAYMENT_WITH_ZERO_TAX_WITH_ZERO_FEES,
  DUMMY_FINANCE_WITH_ZERO_DOWN_WITH_TAX_WITH_ZERO_FEES,
  DUMMY_FINANCE_WITH_ZERO_DOWN_WITH_ZERO_TAX_WITH_FEES,
  DUMMY_FINANCE_WITH_DOWN_PAYMENT_WITH_TAX_WITH_FEES,
  DUMMY_FINANCE_WITH_TRADE_IN,
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
    beforeEach(() => {
      leaseCalculator.calculateFinance(
        DUMMY_FINANCE_WITH_ZERO_DOWN_WITH_ZERO_TAX_WITH_ZERO_FEES
      );
    });
    it("should get correct monthly payment", () => {
      const payment = leaseCalculator.getFinanceMonthlyPayment();
      expect(payment).toEqual(848.18);
    });
    it("should get correct finance total cost", () => {
      const totalCost = leaseCalculator.getFinanceTotalCost();
      expect(totalCost).toEqual(50891.07);
    });
    it("total amount to finance should match sellilng price", () => {
      const amountFinanced = leaseCalculator.getTotalAmountFinanced();
      expect(amountFinanced).toEqual(
        DUMMY_FINANCE_WITH_ZERO_DOWN_WITH_ZERO_TAX_WITH_ZERO_FEES.sellingPrice
      );
    });
    it("should get correct total interest on finance", () => {
      const totalInterest = leaseCalculator.getFinanceTotalInterest();
      expect(totalInterest).toEqual(1891.07);
    });
  });

  describe("When down payment, zero tax and zero fees", () => {
    beforeEach(() => {
      leaseCalculator.calculateFinance(
        DUMMY_FINANCE_WITH_DOWN_PAYMENT_WITH_ZERO_TAX_WITH_ZERO_FEES
      );
    });
    it("should get correct monthly payment", () => {
      const payment = leaseCalculator.getFinanceMonthlyPayment();
      expect(payment).toEqual(813.56);
    });
    it("should get correct finance total cost", () => {
      const totalCost = leaseCalculator.getFinanceTotalCost();
      expect(totalCost).toEqual(50813.88);
    });
    it("total amount to finance should be selling price minus down payment", () => {
      const amountFinanced = leaseCalculator.getTotalAmountFinanced();
      expect(amountFinanced).toEqual(
        DUMMY_FINANCE_WITH_DOWN_PAYMENT_WITH_ZERO_TAX_WITH_ZERO_FEES.sellingPrice -
          DUMMY_FINANCE_WITH_DOWN_PAYMENT_WITH_ZERO_TAX_WITH_ZERO_FEES.downPayment
      );
    });
    it("should get correct total interest on finance", () => {
      const totalInterest = leaseCalculator.getFinanceTotalInterest();
      expect(totalInterest).toEqual(1813.88);
    });
  });

  describe("When zero down, tax and zero fees", () => {
    beforeEach(() => {
      leaseCalculator.calculateFinance(
        DUMMY_FINANCE_WITH_ZERO_DOWN_WITH_TAX_WITH_ZERO_FEES
      );
    });
    it("should get correct monthly payment", () => {
      const payment = leaseCalculator.getFinanceMonthlyPayment();
      expect(payment).toEqual(901.2);
    });
    it("should get correct finance total cost", () => {
      const totalCost = leaseCalculator.getFinanceTotalCost();
      expect(totalCost).toEqual(54071.76);
    });
    it("should get correct total amount to finance", () => {
      const amountFinanced = leaseCalculator.getTotalAmountFinanced();
      expect(amountFinanced).toEqual(52062.5);
    });
    it("should get correct total interest on finance", () => {
      const totalInterest = leaseCalculator.getFinanceTotalInterest();
      expect(totalInterest).toEqual(2009.26);
    });
  });

  describe("When zero down, zero tax and fees", () => {
    beforeEach(() => {
      leaseCalculator.calculateFinance(
        DUMMY_FINANCE_WITH_ZERO_DOWN_WITH_ZERO_TAX_WITH_FEES
      );
    });
    it("should get correct monthly payment", () => {
      const payment = leaseCalculator.getFinanceMonthlyPayment();
      expect(payment).toEqual(874.15);
    });
    it("should get correct finance total cost", () => {
      const totalCost = leaseCalculator.getFinanceTotalCost();
      expect(totalCost).toEqual(52448.96);
    });
    it("should get correct total amount to finance", () => {
      const amountFinanced = leaseCalculator.getTotalAmountFinanced();
      expect(amountFinanced).toEqual(50500);
    });
    it("should get correct total interest on finance", () => {
      const totalInterest = leaseCalculator.getFinanceTotalInterest();
      expect(totalInterest).toEqual(1948.96);
    });
  });

  describe("When down payment, tax and fees", () => {
    beforeEach(() => {
      leaseCalculator.calculateFinance(
        DUMMY_FINANCE_WITH_DOWN_PAYMENT_WITH_TAX_WITH_FEES
      );
    });
    it("should get correct monthly payment", () => {
      const payment = leaseCalculator.getFinanceMonthlyPayment();
      expect(payment).toEqual(893.62);
    });
    it("should get correct finance total cost", () => {
      const totalCost = leaseCalculator.getFinanceTotalCost();
      expect(totalCost).toEqual(55617.38);
    });
    it("should get correct total amount to finance", () => {
      const amountFinanced = leaseCalculator.getTotalAmountFinanced();
      expect(amountFinanced).toEqual(51625);
    });
    it("should get correct total interest on finance", () => {
      const totalInterest = leaseCalculator.getFinanceTotalInterest();
      expect(totalInterest).toEqual(1992.38);
    });
  });

  describe("When trade-in value", () => {
    beforeEach(() => {
      leaseCalculator.calculateFinance(DUMMY_FINANCE_WITH_TRADE_IN);
    });
    it("should get the same monthly payment as with down", () => {
      const payment = leaseCalculator.getFinanceMonthlyPayment();
      expect(payment).toEqual(813.56);
    });
    it("should get the same finance total cost as with down", () => {
      const totalCost = leaseCalculator.getFinanceTotalCost();
      expect(totalCost).toEqual(50813.88);
    });
    it("should get the same total amount to finance as with down", () => {
      const amountFinanced = leaseCalculator.getTotalAmountFinanced();
      expect(amountFinanced).toEqual(
        DUMMY_FINANCE_WITH_TRADE_IN.sellingPrice -
          DUMMY_FINANCE_WITH_TRADE_IN.tradeIn
      );
    });
    it("should get the same total interest on finance  as with down", () => {
      const totalInterest = leaseCalculator.getFinanceTotalInterest();
      expect(totalInterest).toEqual(1813.88);
    });
  });
});
