import LeaseCalculator from "../src/LeaseCalculator";
import {
  // Tax applied on monthly payment
  DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
  DUMMY_LEASE_WITH_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
  WHEN_TAXED_ON_MONTHLY_PAYMENT,
  // Tax applied on sales price
  DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
  DUMMY_LEASE_WITH_DOWN_WITH_TAX_ON_SALES_PRICE,
  WHEN_TAXED_ON_SALES_PRICE,
  // Tax applied on total lease payment
  DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_LEASE_PAYMENT,
  DUMMY_LEASE_WITH_DOWN_WITH_TAX_ON_LEASE_PAYMENT,
  WHEN_TAXED_ON_LEASE_PAYMENT,
  // RV
  DUMMY_LEASE_WITH_PERCENTAGE_RV,
  RV_VALUE,
  RV_PERCENTAGE,
  ACQUISITION_FEE_TOYOTA,
  DISPOSITION_FEE_TOYOTA,
} from "./constants";

describe("LeaseCalculator", () => {
  let leaseCalculator;
  beforeAll(() => {
    leaseCalculator = new LeaseCalculator();
  });

  describe("Validation", () => {
    it("should throw an error when missing a required field", () => {
      expect(() => {
        leaseCalculator.calculate({
          ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
          msrp: null,
        });
      }).toThrow(Error);
    });
    it("should throw an error when MSRP field is missing", () => {
      expect(() => {
        leaseCalculator.calculate({
          ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
          msrp: null,
        });
      }).toThrowError(`Invalid Input: MSRP`);
    });
    it("should throw an error when Selling Price field is missing", () => {
      expect(() => {
        leaseCalculator.calculate({
          ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
          sellingPrice: null,
        });
      }).toThrowError(`Invalid Input: Selling Price`);
    });
    it("should throw an error when RV field is missing", () => {
      expect(() => {
        leaseCalculator.calculate({
          ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
          rv: null,
        });
      }).toThrowError(`Invalid Input: Residual Value`);
    });
    it("should throw an error when MF field is missing", () => {
      expect(() => {
        leaseCalculator.calculate({
          ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
          mf: null,
        });
      }).toThrowError(`Invalid Input: Money Factor`);
    });
  });

  describe("Acquisition fee", () => {
    it("is 0 when Make is not specified", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
        make: "",
      });
      const acquisitionFee = leaseCalculator.getAcquisitionFee();
      expect(acquisitionFee).toEqual(0);
    });
    it("is based on Make, when specified", () => {
      leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      const acquisitionFee = leaseCalculator.getAcquisitionFee();
      expect(acquisitionFee).toEqual(ACQUISITION_FEE_TOYOTA);
    });
  });

  describe("Disposition fee", () => {
    it("is 0 when Make is not specified", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
        make: "",
      });
      const acquisitionFee = leaseCalculator.getDispositionFee();
      expect(acquisitionFee).toEqual(0);
    });
    it("is based on Make, when specified", () => {
      leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      const acquisitionFee = leaseCalculator.getDispositionFee();
      expect(acquisitionFee).toEqual(DISPOSITION_FEE_TOYOTA);
    });
  });

  describe("RV", () => {
    it("is the correct percentage off MSRP", () => {
      leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      const rv = leaseCalculator.getRVPercentage();
      expect(rv).toEqual(RV_PERCENTAGE);
    });
    it("is the correct absolute value when passed as percentage", () => {
      leaseCalculator.calculate(DUMMY_LEASE_WITH_PERCENTAGE_RV);
      const rv = leaseCalculator.getRVValue();
      expect(rv).toEqual(RV_VALUE);
    });
    it("should get correct monthly payment when passed as percentage", () => {
      leaseCalculator.calculate(DUMMY_LEASE_WITH_PERCENTAGE_RV);
      const payment = leaseCalculator.getMonthlyPayment();
      expect(payment).toEqual(WHEN_TAXED_ON_MONTHLY_PAYMENT.PAYMENT_ZERO_DOWN);
    });
  });

  describe("When tax applied on monthly payment", () => {
    it("should get correct monthly payment w/ $0 down", () => {
      leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      const payment = leaseCalculator.getMonthlyPayment();
      expect(payment).toEqual(WHEN_TAXED_ON_MONTHLY_PAYMENT.PAYMENT_ZERO_DOWN);
    });
    it("should get correct monthly payment w/ a down payment", () => {
      leaseCalculator.calculate(
        DUMMY_LEASE_WITH_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      const payment = leaseCalculator.getMonthlyPayment();
      expect(payment).toEqual(WHEN_TAXED_ON_MONTHLY_PAYMENT.PAYMENT_WITH_DOWN);
    });
    it("should get correct discount off msrp", () => {
      leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      const offMsrp = leaseCalculator.getDiscountOffMsrpPercentage();
      expect(offMsrp).toEqual(WHEN_TAXED_ON_MONTHLY_PAYMENT.OFF_MSRP);
    });
    it("Off msrp should be null when Selling Price equals MSRP", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
        sellingPrice: DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT.msrp,
      });
      const offMsrp = leaseCalculator.getDiscountOffMsrpPercentage();
      expect(offMsrp).toBeNull();
    });
    it("Off msrp should be null when Selling Price > MSRP", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
        sellingPrice:
          DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT.msrp + 1,
      });
      const offMsrp = leaseCalculator.getDiscountOffMsrpPercentage();
      expect(offMsrp).toBeNull();
    });
    it("should get correct MSRP percentage (1% rule)", () => {
      leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      const msrpPercentage =
        leaseCalculator.getMonthlyPaymentToMsrpPercentage();
      expect(msrpPercentage).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.MSRP_PERCENTAGE
      );
    });
    it("should get correct pre-tax monthly payment", () => {
      leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      const paymentPreTax = leaseCalculator.getMonthlyPaymentPreTax();
      expect(paymentPreTax).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.PAYMENT_ZERO_DOWN_PRE_TAX
      );
    });
    it("should get correct APR", () => {
      leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      const apr = leaseCalculator.getAPR();
      expect(apr).toEqual(WHEN_TAXED_ON_MONTHLY_PAYMENT.APR);
    });
    it("should get correct total lease cost w/ $0 down", () => {
      leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      const totalCost = leaseCalculator.getTotalLeaseCost();
      expect(totalCost).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.TOTAL_LEASE_COST_ZERO_DOWN
      );
    });
    it("should get correct total lease cost w/ a down payment", () => {
      leaseCalculator.calculate(
        DUMMY_LEASE_WITH_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      const totalCost = leaseCalculator.getTotalLeaseCost();
      expect(totalCost).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.TOTAL_LEASE_COST_WITH_DOWN
      );
    });
    it("should get correct drive-off amount", () => {
      leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      const driveoff = leaseCalculator.getDriveOffPayment();
      expect(driveoff).toEqual(WHEN_TAXED_ON_MONTHLY_PAYMENT.DRIVEOFF_AMOUNT);
    });
    it("should get correct monthly payment pre-tax when zero drive-off", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
        isZeroDriveoff: true,
      });
      const monthlyPreTax = leaseCalculator.getMonthlyPaymentPreTax();
      expect(monthlyPreTax).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.PAYMENT_ZERO_DOWN_ZERO_DRIVEOFF_PRE_TAX
      );
    });
    it("should get correct monthly payment when zero drive-off", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
        isZeroDriveoff: true,
      });
      const monthlyPayment = leaseCalculator.getMonthlyPayment();
      expect(monthlyPayment).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.PAYMENT_ZERO_DOWN_ZERO_DRIVEOFF
      );
    });
    it("should get correct total lease cost when zero drive-off", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
        isZeroDriveoff: true,
      });
      const totalCost = leaseCalculator.getTotalLeaseCost();
      expect(totalCost).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.TOTAL_LEASE_COST_ZERO_DOWN_ZERO_DRIVEOFF
      );
    });
    it("should have all base payments equal depreciation", () => {
      const { leaseTerm } = DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT;
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
      });
      const basePayment = leaseCalculator.getBaseMonthlyPayment();
      const depreciation = leaseCalculator.getDepreciation();
      expect(Math.round(basePayment * leaseTerm)).toEqual(depreciation);
    });
    it("should get the correct base payment", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
      });
      const basePayment = leaseCalculator.getBaseMonthlyPayment();
      expect(basePayment).toEqual(WHEN_TAXED_ON_MONTHLY_PAYMENT.BASE_PAYMENT);
    });
    it("should get the correct rent charge", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
      });
      const rentCharge = leaseCalculator.getRentCharge();
      expect(rentCharge).toEqual(WHEN_TAXED_ON_MONTHLY_PAYMENT.RENT_CHARGE);
    });
    it("should have base payment plus rent charge equal monthly payment pre-tax", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
      });
      const value =
        leaseCalculator.getBaseMonthlyPayment() +
        leaseCalculator.getRentCharge();
      const monthlyPreTax = leaseCalculator.getMonthlyPaymentPreTax();
      expect(Math.round(value * 100) / 100).toEqual(monthlyPreTax);
    });
    it("should have base payment plus rent charge & tax equal monthly payment", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
      });
      const value =
        leaseCalculator.getBaseMonthlyPayment() +
        leaseCalculator.getRentCharge() +
        leaseCalculator.getMonthlyTax();
      const monthlyPayment = leaseCalculator.getMonthlyPayment();
      expect(Math.round(value * 100) / 100).toEqual(monthlyPayment);
    });
    it("should have total taxes equal to monthly tax plus drive off taxes", () => {
      const { leaseTerm } = DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT;
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
      });
      const value =
        leaseCalculator.getMonthlyTax() * leaseTerm +
        leaseCalculator.calculateDriveOffTaxes();
      const totalTaxes = Math.round(leaseCalculator.getTotalTax());
      expect(Math.round(value)).toEqual(totalTaxes);
    });
  });

  describe("When tax applied on sales price", () => {
    it("should get correct monthly payment w/ $0 down", () => {
      leaseCalculator.calculate(DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE);
      const payment = leaseCalculator.getMonthlyPayment();
      expect(payment).toEqual(WHEN_TAXED_ON_SALES_PRICE.PAYMENT_ZERO_DOWN);
    });

    it("should get correct monthly payment w/ a down payment", () => {
      leaseCalculator.calculate(DUMMY_LEASE_WITH_DOWN_WITH_TAX_ON_SALES_PRICE);
      const payment = leaseCalculator.getMonthlyPayment();
      expect(payment).toEqual(WHEN_TAXED_ON_SALES_PRICE.PAYMENT_WITH_DOWN);
    });

    it("total monthly payment should match monthly payment pre tax", () => {
      leaseCalculator.calculate(DUMMY_LEASE_WITH_DOWN_WITH_TAX_ON_SALES_PRICE);
      const paymentPreTax = leaseCalculator.getMonthlyPaymentPreTax();
      const payment = leaseCalculator.getMonthlyPayment();
      expect(payment).toEqual(paymentPreTax);
    });

    it("should get correct MSRP percentage (1% rule)", () => {
      leaseCalculator.calculate(DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE);
      const msrpPercentage =
        leaseCalculator.getMonthlyPaymentToMsrpPercentage();
      expect(msrpPercentage).toEqual(WHEN_TAXED_ON_SALES_PRICE.MSRP_PERCENTAGE);
    });

    it("should get correct total lease cost w/ $0 down", () => {
      leaseCalculator.calculate(DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE);
      const totalCost = leaseCalculator.getTotalLeaseCost();
      expect(totalCost).toEqual(
        WHEN_TAXED_ON_SALES_PRICE.TOTAL_LEASE_COST_ZERO_DOWN
      );
    });
    it("should get correct total lease cost w/ a down payment", () => {
      leaseCalculator.calculate(DUMMY_LEASE_WITH_DOWN_WITH_TAX_ON_SALES_PRICE);
      const totalCost = leaseCalculator.getTotalLeaseCost();
      expect(totalCost).toEqual(
        WHEN_TAXED_ON_SALES_PRICE.TOTAL_LEASE_COST_WITH_DOWN
      );
    });
    it("should get correct drive-off amount", () => {
      leaseCalculator.calculate(DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE);
      const driveoff = leaseCalculator.getDriveOffPayment();
      expect(driveoff).toEqual(WHEN_TAXED_ON_SALES_PRICE.DRIVEOFF_AMOUNT);
    });
    it("should get correct monthly payment pre-tax when zero drive-off", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
        isZeroDriveoff: true,
      });
      const monthlyPreTax = leaseCalculator.getMonthlyPaymentPreTax();
      expect(monthlyPreTax).toEqual(
        WHEN_TAXED_ON_SALES_PRICE.PAYMENT_ZERO_DOWN_ZERO_DRIVEOFF_PRE_TAX
      );
    });
    it("should get correct monthly payment when zero drive-off", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
        isZeroDriveoff: true,
      });
      const monthlyPayment = leaseCalculator.getMonthlyPayment();
      expect(monthlyPayment).toEqual(
        WHEN_TAXED_ON_SALES_PRICE.PAYMENT_ZERO_DOWN_ZERO_DRIVEOFF
      );
    });
    it("should get correct total lease cost when zero drive-off", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
        isZeroDriveoff: true,
      });
      const totalCost = leaseCalculator.getTotalLeaseCost();
      expect(totalCost).toEqual(
        WHEN_TAXED_ON_SALES_PRICE.TOTAL_LEASE_COST_ZERO_DOWN_ZERO_DRIVEOFF
      );
    });
    it("should have all base payments equal depreciation", () => {
      const { leaseTerm } = DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE;
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      const basePayment = leaseCalculator.getBaseMonthlyPayment();
      const depreciation = leaseCalculator.getDepreciation();
      expect(Math.round(basePayment * leaseTerm)).toEqual(depreciation);
    });
    it("should get the correct base payment", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      const basePayment = leaseCalculator.getBaseMonthlyPayment();
      expect(basePayment).toEqual(WHEN_TAXED_ON_MONTHLY_PAYMENT.BASE_PAYMENT);
    });
    it("should get the correct rent charge", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      const rentCharge = leaseCalculator.getRentCharge();
      expect(rentCharge).toEqual(WHEN_TAXED_ON_MONTHLY_PAYMENT.RENT_CHARGE);
    });
    it("should have base payment plus rent charge equal monthly payment pre-tax", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      const value =
        leaseCalculator.getBaseMonthlyPayment() +
        leaseCalculator.getRentCharge();
      const monthlyPreTax = leaseCalculator.getMonthlyPaymentPreTax();
      expect(Math.round(value * 100) / 100).toEqual(monthlyPreTax);
    });
    it("should have base payment plus rent charge equal monthly payment", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      const value =
        leaseCalculator.getBaseMonthlyPayment() +
        leaseCalculator.getRentCharge();
      const monthlyPayment = leaseCalculator.getMonthlyPayment();
      expect(Math.round(value * 100) / 100).toEqual(monthlyPayment);
    });
    it("should have 0 monthly tax", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      expect(leaseCalculator.getMonthlyTax()).toEqual(0);
    });
    it("should have total taxes equal to the sales price on Selling Price", () => {
      const { salesTax, sellingPrice } =
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE;
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      const tax = (salesTax / 100) * sellingPrice;
      const totalTaxes = Math.round(leaseCalculator.getTotalTax());
      expect(Math.round(tax)).toEqual(totalTaxes);
    });
  });

  describe("When tax applied on total lease payment", () => {
    it("should get correct monthly payment w/ $0 down", () => {
      leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_LEASE_PAYMENT
      );
      const payment = leaseCalculator.getMonthlyPayment();
      expect(payment).toEqual(WHEN_TAXED_ON_LEASE_PAYMENT.PAYMENT_ZERO_DOWN);
    });

    it("should get correct monthly payment w/ a down payment", () => {
      leaseCalculator.calculate(
        DUMMY_LEASE_WITH_DOWN_WITH_TAX_ON_LEASE_PAYMENT
      );
      const payment = leaseCalculator.getMonthlyPayment();
      expect(payment).toEqual(WHEN_TAXED_ON_LEASE_PAYMENT.PAYMENT_WITH_DOWN);
    });

    it("total monthly payment should match monthly payment pre tax", () => {
      leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_LEASE_PAYMENT
      );
      const paymentPreTax = leaseCalculator.getMonthlyPaymentPreTax();
      const payment = leaseCalculator.getMonthlyPayment();
      expect(payment).toEqual(paymentPreTax);
    });

    it("should get correct MSRP percentage (1% rule)", () => {
      leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_LEASE_PAYMENT
      );
      const msrpPercentage =
        leaseCalculator.getMonthlyPaymentToMsrpPercentage();
      expect(msrpPercentage).toEqual(
        WHEN_TAXED_ON_LEASE_PAYMENT.MSRP_PERCENTAGE
      );
    });

    it("should get correct total lease cost w/ $0 down", () => {
      leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_LEASE_PAYMENT
      );
      const totalCost = leaseCalculator.getTotalLeaseCost();
      expect(totalCost).toEqual(
        WHEN_TAXED_ON_LEASE_PAYMENT.TOTAL_LEASE_COST_ZERO_DOWN
      );
    });

    it("should get correct total lease cost w/ a down payment", () => {
      leaseCalculator.calculate(
        DUMMY_LEASE_WITH_DOWN_WITH_TAX_ON_LEASE_PAYMENT
      );
      const totalCost = leaseCalculator.getTotalLeaseCost();
      expect(totalCost).toEqual(
        WHEN_TAXED_ON_LEASE_PAYMENT.TOTAL_LEASE_COST_WITH_DOWN
      );
    });
    it("should get correct drive-off amount", () => {
      leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_LEASE_PAYMENT
      );
      const driveoff = leaseCalculator.getDriveOffPayment();
      expect(driveoff).toEqual(WHEN_TAXED_ON_LEASE_PAYMENT.DRIVEOFF_AMOUNT);
    });
    it("should get correct monthly payment pre-tax when zero drive-off", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_LEASE_PAYMENT,
        isZeroDriveoff: true,
      });
      const payment = leaseCalculator.getMonthlyPaymentPreTax();
      expect(payment).toEqual(
        WHEN_TAXED_ON_LEASE_PAYMENT.PAYMENT_ZERO_DOWN_ZERO_DRIVEOFF_PRE_TAX
      );
    });
    it("should get correct monthly payment when zero drive-off", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_LEASE_PAYMENT,
        isZeroDriveoff: true,
      });
      const payment = leaseCalculator.getMonthlyPayment();
      expect(payment).toEqual(
        WHEN_TAXED_ON_LEASE_PAYMENT.PAYMENT_ZERO_DOWN_ZERO_DRIVEOFF
      );
    });
    it("should get correct total lease cost when zero drive-off", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_LEASE_PAYMENT,
        isZeroDriveoff: true,
      });
      const totalCost = leaseCalculator.getTotalLeaseCost();
      expect(totalCost).toEqual(
        WHEN_TAXED_ON_LEASE_PAYMENT.TOTAL_LEASE_COST_ZERO_DOWN_ZERO_DRIVEOFF
      );
    });
    it("should have all base payments equal depreciation", () => {
      const { leaseTerm } = DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE;
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      const basePayment = leaseCalculator.getBaseMonthlyPayment();
      const depreciation = leaseCalculator.getDepreciation();
      expect(Math.round(basePayment * leaseTerm)).toEqual(depreciation);
    });
    it("should get the correct base payment", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      const basePayment = leaseCalculator.getBaseMonthlyPayment();
      expect(basePayment).toEqual(WHEN_TAXED_ON_MONTHLY_PAYMENT.BASE_PAYMENT);
    });
    it("should get the correct rent charge", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      const rentCharge = leaseCalculator.getRentCharge();
      expect(rentCharge).toEqual(WHEN_TAXED_ON_MONTHLY_PAYMENT.RENT_CHARGE);
    });
    it("should have base payment plus rent charge equal monthly payment pre-tax", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      const value =
        leaseCalculator.getBaseMonthlyPayment() +
        leaseCalculator.getRentCharge();
      const monthlyPreTax = leaseCalculator.getMonthlyPaymentPreTax();
      expect(Math.round(value * 100) / 100).toEqual(monthlyPreTax);
    });
    it("should have base payment plus rent charge equal monthly payment", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      const value =
        leaseCalculator.getBaseMonthlyPayment() +
        leaseCalculator.getRentCharge();
      const monthlyPayment = leaseCalculator.getMonthlyPayment();
      expect(Math.round(value * 100) / 100).toEqual(monthlyPayment);
    });
    it("should have 0 monthly tax", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      expect(leaseCalculator.getMonthlyTax()).toEqual(0);
    });
    it("should have total taxes equal to the sales price on Selling Price", () => {
      const { salesTax, sellingPrice } =
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE;
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      const tax = (salesTax / 100) * sellingPrice;
      const totalTaxes = Math.round(leaseCalculator.getTotalTax());
      expect(Math.round(tax)).toEqual(totalTaxes);
    });
  });

  describe("Drive off amount", () => {
    it("should be the correct non-zero amount by default", () => {
      leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      const driveOffPayment = leaseCalculator.getDriveOffPayment();
      expect(driveOffPayment).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.DRIVEOFF_AMOUNT
      );
    });
    it("should include all payments and taxes", () => {
      leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );

      const acqFee = leaseCalculator.getAcquisitionFee();
      const downPayment = 0;
      const totalFees =
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT.totalFees;
      const monthlyPayment = leaseCalculator.getMonthlyPayment();
      const taxAmount =
        (acqFee +
          downPayment +
          totalFees +
          DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT.rebates) *
        (DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT.salesTax / 100);

      const driveOffPayment = leaseCalculator.getDriveOffPayment();
      expect(driveOffPayment).toEqual(
        Number.parseFloat(
          (
            acqFee +
            downPayment +
            totalFees +
            monthlyPayment +
            taxAmount
          ).toFixed(2)
        )
      );
    });
    it("should be zero when zero drive-off", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
        isZeroDriveoff: true,
      });
      const driveOffPayment = leaseCalculator.getDriveOffPayment();
      expect(driveOffPayment).toEqual(0);
    });

    const defaultDriveOffDetails = (leaseCalculator) => [
      {
        type: "taxes",
        label: "Taxes",
        amount:
          Math.round(leaseCalculator.calculateDriveOffTaxes() * 100) / 100,
      },
      {
        type: "firstMonth",
        label: "First month",
        amount: leaseCalculator.getMonthlyPayment(),
      },
      {
        type: "acquisitionFee",
        label: "Acquisition Fee",
        amount: leaseCalculator.getAcquisitionFee(),
      },
    ];

    it("details should be null when isZeroDriveOff is true", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
        isZeroDriveoff: true,
      });
      const driveOffDetails = leaseCalculator.getDriveOffPaymentBreakdown();
      expect(driveOffDetails).toBe(null);
    });
    it("details should include taxes, first month and Acq fee by default", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
        totalFees: 0,
      });
      const driveOffDetails = leaseCalculator.getDriveOffPaymentBreakdown();
      expect(driveOffDetails).toEqual(defaultDriveOffDetails(leaseCalculator));
    });
    it("details should include fees when dealer/government fees exist", () => {
      leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      const driveOffDetails = leaseCalculator.getDriveOffPaymentBreakdown();
      expect(driveOffDetails).toEqual([
        ...defaultDriveOffDetails(leaseCalculator),
        {
          type: "totalFees",
          label: "Dealer & Government Fees",
          amount: DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT.totalFees,
        },
      ]);
    });
    it("details should include down payment when it exist", () => {
      leaseCalculator.calculate({
        ...DUMMY_LEASE_WITH_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
        totalFees: 0,
      });
      const driveOffDetails = leaseCalculator.getDriveOffPaymentBreakdown();
      expect(driveOffDetails).toEqual([
        ...defaultDriveOffDetails(leaseCalculator),
        {
          type: "downPayment",
          label: "Down Payment",
          amount: DUMMY_LEASE_WITH_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT.downPayment,
        },
      ]);
    });
  });
});
