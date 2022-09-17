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
        const lease = leaseCalculator.calculate({
          ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
          msrp: null,
        });
      }).toThrow(Error);
    });
    it("should throw an error when MSRP field is missing", () => {
      expect(() => {
        const lease = leaseCalculator.calculate({
          ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
          msrp: null,
        });
      }).toThrowError(`Invalid Input: MSRP`);
    });
    it("should throw an error when Selling Price field is missing", () => {
      expect(() => {
        const lease = leaseCalculator.calculate({
          ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
          sellingPrice: null,
        });
      }).toThrowError(`Invalid Input: Selling Price`);
    });
    it("should throw an error when RV field is missing", () => {
      expect(() => {
        const lease = leaseCalculator.calculate({
          ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
          rv: null,
        });
      }).toThrowError(`Invalid Input: Residual Value`);
    });
    it("should throw an error when MF field is missing", () => {
      expect(() => {
        const lease = leaseCalculator.calculate({
          ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
          mf: null,
        });
      }).toThrowError(`Invalid Input: Money Factor`);
    });
  });

  describe("Acquisition fee", () => {
    it("is 0 when Make is not specified", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
        make: "",
      });
      expect(lease.getAcquisitionFee()).toEqual(0);
    });
    it("is based on Make, when specified", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      expect(lease.getAcquisitionFee()).toEqual(ACQUISITION_FEE_TOYOTA);
    });
  });

  describe("Disposition fee", () => {
    it("is 0 when Make is not specified", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
        make: "",
      });
      expect(lease.getDispositionFee()).toEqual(0);
    });
    it("is based on Make, when specified", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      expect(lease.getDispositionFee()).toEqual(DISPOSITION_FEE_TOYOTA);
    });
  });

  describe("RV", () => {
    it("is the correct percentage off MSRP", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      expect(lease.getRVPercentage()).toEqual(RV_PERCENTAGE);
    });
    it("is the correct absolute value when passed as percentage", () => {
      const lease = leaseCalculator.calculate(DUMMY_LEASE_WITH_PERCENTAGE_RV);
      expect(lease.getRVValue()).toEqual(RV_VALUE);
    });
    it("should get correct monthly payment when passed as percentage", () => {
      const lease = leaseCalculator.calculate(DUMMY_LEASE_WITH_PERCENTAGE_RV);
      expect(lease.getMonthlyPayment()).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.PAYMENT_ZERO_DOWN
      );
    });
  });

  describe("When tax applied on monthly payment", () => {
    it("should get correct monthly payment w/ $0 down", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      expect(lease.getMonthlyPayment()).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.PAYMENT_ZERO_DOWN
      );
    });
    it("should get correct monthly payment w/ a down payment", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_WITH_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      expect(lease.getMonthlyPayment()).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.PAYMENT_WITH_DOWN
      );
    });
    it("should get correct discount off msrp", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      expect(lease.getDiscountOffMsrpPercentage()).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.OFF_MSRP
      );
    });
    it("Off msrp should be null when Selling Price equals MSRP", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
        sellingPrice: DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT.msrp,
      });
      expect(lease.getDiscountOffMsrpPercentage()).toBeNull();
    });
    it("Off msrp should be null when Selling Price > MSRP", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
        sellingPrice:
          DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT.msrp + 1,
      });
      expect(lease.getDiscountOffMsrpPercentage()).toBeNull();
    });
    it("should get correct MSRP percentage (1% rule)", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      expect(lease.getMonthlyPaymentToMsrpPercentage()).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.MSRP_PERCENTAGE
      );
    });
    it("should get correct pre-tax monthly payment", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      expect(lease.getMonthlyPaymentPreTax()).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.PAYMENT_ZERO_DOWN_PRE_TAX
      );
    });
    it("should get correct APR", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      expect(lease.getAPR()).toEqual(WHEN_TAXED_ON_MONTHLY_PAYMENT.APR);
    });
    it("should get correct total lease cost w/ $0 down", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      expect(lease.getTotalLeaseCost()).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.TOTAL_LEASE_COST_ZERO_DOWN
      );
    });
    it("should get correct total lease cost w/ a down payment", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_WITH_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      expect(lease.getTotalLeaseCost()).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.TOTAL_LEASE_COST_WITH_DOWN
      );
    });
    it("should get correct drive-off amount", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      expect(lease.getDriveOffPayment()).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.DRIVEOFF_AMOUNT
      );
    });
    it("should get correct monthly payment pre-tax when zero drive-off", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
        isZeroDriveoff: true,
      });
      expect(lease.getMonthlyPaymentPreTax()).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.PAYMENT_ZERO_DOWN_ZERO_DRIVEOFF_PRE_TAX
      );
    });
    it("should get correct monthly payment when zero drive-off", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
        isZeroDriveoff: true,
      });
      expect(lease.getMonthlyPayment()).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.PAYMENT_ZERO_DOWN_ZERO_DRIVEOFF
      );
    });
    it("should get correct total lease cost when zero drive-off", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
        isZeroDriveoff: true,
      });
      expect(lease.getTotalLeaseCost()).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.TOTAL_LEASE_COST_ZERO_DOWN_ZERO_DRIVEOFF
      );
    });
    it("should have all base payments equal depreciation", () => {
      const { leaseTerm } = DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT;
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
      });
      const basePayment = lease.getBaseMonthlyPayment();
      const depreciation = lease.getDepreciation();
      expect(Math.round(basePayment * leaseTerm)).toEqual(depreciation);
    });
    it("should get the correct base payment", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
      });
      expect(lease.getBaseMonthlyPayment()).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.BASE_PAYMENT
      );
    });
    it("should get the correct rent charge", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
      });
      expect(lease.getRentCharge()).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.RENT_CHARGE
      );
    });
    it("should have base payment plus rent charge equal monthly payment pre-tax", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
      });
      const value = lease.getBaseMonthlyPayment() + lease.getRentCharge();
      const monthlyPreTax = lease.getMonthlyPaymentPreTax();
      expect(Math.round(value * 100) / 100).toEqual(monthlyPreTax);
    });
    it("should have base payment plus rent charge & tax equal monthly payment", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
      });
      const value =
        lease.getBaseMonthlyPayment() +
        lease.getRentCharge() +
        lease.getMonthlyTax();
      const monthlyPayment = lease.getMonthlyPayment();
      expect(Math.round(value * 100) / 100).toEqual(monthlyPayment);
    });
    it("should have total taxes equal to monthly tax plus drive off taxes", () => {
      const { leaseTerm } = DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT;
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
      });
      const value =
        lease.getMonthlyTax() * leaseTerm + lease.calculateDriveOffTaxes();
      const totalTaxes = Math.round(lease.getTotalTax());
      expect(Math.round(value)).toEqual(totalTaxes);
    });
  });

  describe("When tax applied on sales price", () => {
    it("should get correct monthly payment w/ $0 down", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE
      );
      expect(lease.getMonthlyPayment()).toEqual(
        WHEN_TAXED_ON_SALES_PRICE.PAYMENT_ZERO_DOWN
      );
    });

    it("should get correct monthly payment w/ a down payment", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_WITH_DOWN_WITH_TAX_ON_SALES_PRICE
      );
      expect(lease.getMonthlyPayment()).toEqual(
        WHEN_TAXED_ON_SALES_PRICE.PAYMENT_WITH_DOWN
      );
    });

    it("total monthly payment should match monthly payment pre tax", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_WITH_DOWN_WITH_TAX_ON_SALES_PRICE
      );
      expect(lease.getMonthlyPayment()).toEqual(
        lease.getMonthlyPaymentPreTax()
      );
    });

    it("should get correct MSRP percentage (1% rule)", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE
      );
      expect(lease.getMonthlyPaymentToMsrpPercentage()).toEqual(
        WHEN_TAXED_ON_SALES_PRICE.MSRP_PERCENTAGE
      );
    });

    it("should get correct total lease cost w/ $0 down", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE
      );
      expect(lease.getTotalLeaseCost()).toEqual(
        WHEN_TAXED_ON_SALES_PRICE.TOTAL_LEASE_COST_ZERO_DOWN
      );
    });
    it("should get correct total lease cost w/ a down payment", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_WITH_DOWN_WITH_TAX_ON_SALES_PRICE
      );
      expect(lease.getTotalLeaseCost()).toEqual(
        WHEN_TAXED_ON_SALES_PRICE.TOTAL_LEASE_COST_WITH_DOWN
      );
    });
    it("should get correct drive-off amount", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE
      );
      expect(lease.getDriveOffPayment()).toEqual(
        WHEN_TAXED_ON_SALES_PRICE.DRIVEOFF_AMOUNT
      );
    });
    it("should get correct monthly payment pre-tax when zero drive-off", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
        isZeroDriveoff: true,
      });
      expect(lease.getMonthlyPaymentPreTax()).toEqual(
        WHEN_TAXED_ON_SALES_PRICE.PAYMENT_ZERO_DOWN_ZERO_DRIVEOFF_PRE_TAX
      );
    });
    it("should get correct monthly payment when zero drive-off", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
        isZeroDriveoff: true,
      });
      expect(lease.getMonthlyPayment()).toEqual(
        WHEN_TAXED_ON_SALES_PRICE.PAYMENT_ZERO_DOWN_ZERO_DRIVEOFF
      );
    });
    it("should get correct total lease cost when zero drive-off", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
        isZeroDriveoff: true,
      });
      expect(lease.getTotalLeaseCost()).toEqual(
        WHEN_TAXED_ON_SALES_PRICE.TOTAL_LEASE_COST_ZERO_DOWN_ZERO_DRIVEOFF
      );
    });
    it("should have all base payments equal depreciation", () => {
      const { leaseTerm } = DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE;
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      const basePayment = lease.getBaseMonthlyPayment();
      const depreciation = lease.getDepreciation();
      expect(Math.round(basePayment * leaseTerm)).toEqual(depreciation);
    });
    it("should get the correct base payment", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      expect(lease.getBaseMonthlyPayment()).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.BASE_PAYMENT
      );
    });
    it("should get the correct rent charge", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      expect(lease.getRentCharge()).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.RENT_CHARGE
      );
    });
    it("should have base payment plus rent charge equal monthly payment pre-tax", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      const value = lease.getBaseMonthlyPayment() + lease.getRentCharge();
      const monthlyPreTax = lease.getMonthlyPaymentPreTax();
      expect(Math.round(value * 100) / 100).toEqual(monthlyPreTax);
    });
    it("should have base payment plus rent charge equal monthly payment", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      const value = lease.getBaseMonthlyPayment() + lease.getRentCharge();
      const monthlyPayment = lease.getMonthlyPayment();
      expect(Math.round(value * 100) / 100).toEqual(monthlyPayment);
    });
    it("should have 0 monthly tax", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      expect(lease.getMonthlyTax()).toEqual(0);
    });
    it("should have total taxes equal to the sales price on Selling Price", () => {
      const { salesTax, sellingPrice } =
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE;
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      const tax = (salesTax / 100) * sellingPrice;
      const totalTaxes = Math.round(lease.getTotalTax());
      expect(Math.round(tax)).toEqual(totalTaxes);
    });
  });

  describe("When tax applied on total lease payment", () => {
    it("should get correct monthly payment w/ $0 down", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_LEASE_PAYMENT
      );
      expect(lease.getMonthlyPayment()).toEqual(
        WHEN_TAXED_ON_LEASE_PAYMENT.PAYMENT_ZERO_DOWN
      );
    });

    it("should get correct monthly payment w/ a down payment", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_WITH_DOWN_WITH_TAX_ON_LEASE_PAYMENT
      );
      expect(lease.getMonthlyPayment()).toEqual(
        WHEN_TAXED_ON_LEASE_PAYMENT.PAYMENT_WITH_DOWN
      );
    });

    it("total monthly payment should match monthly payment pre tax", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_LEASE_PAYMENT
      );
      const paymentPreTax = lease.getMonthlyPaymentPreTax();
      const payment = lease.getMonthlyPayment();
      expect(payment).toEqual(paymentPreTax);
    });

    it("should get correct MSRP percentage (1% rule)", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_LEASE_PAYMENT
      );
      expect(lease.getMonthlyPaymentToMsrpPercentage()).toEqual(
        WHEN_TAXED_ON_LEASE_PAYMENT.MSRP_PERCENTAGE
      );
    });

    it("should get correct total lease cost w/ $0 down", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_LEASE_PAYMENT
      );
      expect(lease.getTotalLeaseCost()).toEqual(
        WHEN_TAXED_ON_LEASE_PAYMENT.TOTAL_LEASE_COST_ZERO_DOWN
      );
    });

    it("should get correct total lease cost w/ a down payment", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_WITH_DOWN_WITH_TAX_ON_LEASE_PAYMENT
      );
      expect(lease.getTotalLeaseCost()).toEqual(
        WHEN_TAXED_ON_LEASE_PAYMENT.TOTAL_LEASE_COST_WITH_DOWN
      );
    });
    it("should get correct drive-off amount", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_LEASE_PAYMENT
      );
      expect(lease.getDriveOffPayment()).toEqual(
        WHEN_TAXED_ON_LEASE_PAYMENT.DRIVEOFF_AMOUNT
      );
    });
    it("should get correct monthly payment pre-tax when zero drive-off", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_LEASE_PAYMENT,
        isZeroDriveoff: true,
      });
      expect(lease.getMonthlyPaymentPreTax()).toEqual(
        WHEN_TAXED_ON_LEASE_PAYMENT.PAYMENT_ZERO_DOWN_ZERO_DRIVEOFF_PRE_TAX
      );
    });
    it("should get correct monthly payment when zero drive-off", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_LEASE_PAYMENT,
        isZeroDriveoff: true,
      });
      expect(lease.getMonthlyPayment()).toEqual(
        WHEN_TAXED_ON_LEASE_PAYMENT.PAYMENT_ZERO_DOWN_ZERO_DRIVEOFF
      );
    });
    it("should get correct total lease cost when zero drive-off", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_LEASE_PAYMENT,
        isZeroDriveoff: true,
      });
      expect(lease.getTotalLeaseCost()).toEqual(
        WHEN_TAXED_ON_LEASE_PAYMENT.TOTAL_LEASE_COST_ZERO_DOWN_ZERO_DRIVEOFF
      );
    });
    it("should have all base payments equal depreciation", () => {
      const { leaseTerm } = DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE;
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      const basePayment = lease.getBaseMonthlyPayment();
      const depreciation = lease.getDepreciation();
      expect(Math.round(basePayment * leaseTerm)).toEqual(depreciation);
    });
    it("should get the correct base payment", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      expect(lease.getBaseMonthlyPayment()).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.BASE_PAYMENT
      );
    });
    it("should get the correct rent charge", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      expect(lease.getRentCharge()).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.RENT_CHARGE
      );
    });
    it("should have base payment plus rent charge equal monthly payment pre-tax", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      const value = lease.getBaseMonthlyPayment() + lease.getRentCharge();
      const monthlyPreTax = lease.getMonthlyPaymentPreTax();
      expect(Math.round(value * 100) / 100).toEqual(monthlyPreTax);
    });
    it("should have base payment plus rent charge equal monthly payment", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      const value = lease.getBaseMonthlyPayment() + lease.getRentCharge();
      const monthlyPayment = lease.getMonthlyPayment();
      expect(Math.round(value * 100) / 100).toEqual(monthlyPayment);
    });
    it("should have 0 monthly tax", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      expect(lease.getMonthlyTax()).toEqual(0);
    });
    it("should have total taxes equal to the sales price on Selling Price", () => {
      const { salesTax, sellingPrice } =
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE;
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_SALES_PRICE,
      });
      const tax = (salesTax / 100) * sellingPrice;
      const totalTaxes = Math.round(lease.getTotalTax());
      expect(Math.round(tax)).toEqual(totalTaxes);
    });
  });

  describe("Drive off amount", () => {
    it("should be the correct non-zero amount by default", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      expect(lease.getDriveOffPayment()).toEqual(
        WHEN_TAXED_ON_MONTHLY_PAYMENT.DRIVEOFF_AMOUNT
      );
    });
    it("should include all payments and taxes", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );

      const acqFee = lease.getAcquisitionFee();
      const downPayment = 0;
      const totalFees =
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT.totalFees;
      const monthlyPayment = lease.getMonthlyPayment();
      const taxAmount =
        (acqFee +
          downPayment +
          totalFees +
          DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT.rebates) *
        (DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT.salesTax / 100);

      const driveOffPayment = lease.getDriveOffPayment();
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
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
        isZeroDriveoff: true,
      });
      const driveOffPayment = lease.getDriveOffPayment();
      expect(driveOffPayment).toEqual(0);
    });

    const defaultDriveOffDetails = (lease) => [
      {
        type: "taxes",
        label: "Taxes",
        amount: Math.round(lease.calculateDriveOffTaxes() * 100) / 100,
      },
      {
        type: "firstMonth",
        label: "First month",
        amount: lease.getMonthlyPayment(),
      },
      {
        type: "acquisitionFee",
        label: "Acquisition Fee",
        amount: lease.getAcquisitionFee(),
      },
    ];

    it("details should be null when isZeroDriveOff is true", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
        isZeroDriveoff: true,
      });
      expect(lease.getDriveOffPaymentBreakdown()).toBe(null);
    });
    it("details should include taxes, first month and Acq fee by default", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
        totalFees: 0,
      });
      expect(lease.getDriveOffPaymentBreakdown()).toEqual(
        defaultDriveOffDetails(lease)
      );
    });
    it("details should include fees when dealer/government fees existclear", () => {
      const lease = leaseCalculator.calculate(
        DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT
      );
      expect(lease.getDriveOffPaymentBreakdown()).toEqual([
        ...defaultDriveOffDetails(lease),
        {
          type: "totalFees",
          label: "Dealer & Government Fees",
          amount: DUMMY_LEASE_ZERO_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT.totalFees,
        },
      ]);
    });
    it("details should include down payment when it exists", () => {
      const lease = leaseCalculator.calculate({
        ...DUMMY_LEASE_WITH_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT,
        totalFees: 0,
      });
      expect(lease.getDriveOffPaymentBreakdown()).toEqual([
        ...defaultDriveOffDetails(lease),
        {
          type: "downPayment",
          label: "Down Payment",
          amount: DUMMY_LEASE_WITH_DOWN_WITH_TAX_ON_MONTHLY_PAYMENT.downPayment,
        },
      ]);
    });
  });
});
