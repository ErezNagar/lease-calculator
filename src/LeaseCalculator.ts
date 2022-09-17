import { TaxationMethod, MAKES } from "./constants";

type LeaseParams = {
  make: string;
  msrp: number;
  sellingPrice: number;
  rv: number;
  isRVPercent: boolean;
  mf: number;
  leaseTerm: number;
  salesTax: number;
  totalFees: number;
  rebates: number;
  downPayment: number;
  taxMethod: TaxationMethod;
  isZeroDriveoff: boolean;
};

type FinanceParams = {
  make: string;
  sellingPrice: number;
  salesTax: number;
  rebates: number;
  downPayment: number;
  taxableFees: number;
  untaxableFees: number;
  APR: number;
  financeTerm: number;
  tradeIn: number;
};

interface LeaseCalculator extends LeaseParams, FinanceParams {
  RVValue: number;
  RVPercent: number;
  apr: number;
  monthlyPaymentPreTax: number;
  monthlyPayment: number;
  _netCapCost: number;
  depreciation: number;
  basePayment: number;
  rentCharge: number;
  tax: number;
  finance: FinanceParams;
  financeMonthlyPayment: number;
  financeTotalCost: number;
  amountToFinance: number;
}

class LeaseCalculator {
  /*
    Validates required fields for leasing.
    Throws: Error | If there's an invalid required field
  */
  _validateLeaseParams(): void {
    const requiredParamNames = [
      "MSRP",
      "Selling Price",
      "Residual Value",
      "Money Factor",
    ];
    const params = [this.msrp, this.sellingPrice, this.rv, this.mf];
    params.forEach((param, i) => {
      if (!param || param === 0) {
        throw new Error(`Invalid Input: ${requiredParamNames[i]}`);
      }
    });
  }

  /*
    Validates required fields for financing.
    Throws: Error | If there's an invalid required field
  */
  _validateFinanceParams(): void {
    const requiredParamNames = ["Selling Price", "APR", "Finance Term"];
    const params = [
      this.finance.sellingPrice,
      this.finance.APR,
      this.finance.financeTerm,
    ];
    params.forEach((param, i) => {
      if (!param || param === 0) {
        throw new Error(`Invalid Input: ${requiredParamNames[i]}`);
      }
    });
  }

  /*
    Calculates the absolute and relative residual value of the vehicle
  */
  _calculateRV(): void {
    if (this.isRVPercent) {
      this.RVValue = this.msrp * (this.rv / 100);
      this.RVPercent = this.rv;
    } else {
      this.RVValue = this.rv;
      this.RVPercent = (this.rv / this.msrp) * 100;
    }
  }

  /*
    Converts the lease' money factor to APR.
    Note: To keep calculation accruate, we might need to truncate this value only on consumer read
  */
  _MFToAPR(): number {
    return this.mf * 2400;
  }

  /*
    Gets the acquisition fee value by brand. If no brand sepcified, returns 0;
  */
  _getAcquisitionFee = (): number => {
    const make = MAKES.filter((m) => m.displayName === this.make);
    if (make.length === 0) {
      return 0;
    }
    return make[0].acquisitionFee;
  };

  /*
    Gets the disposition fee value by brand. If no brand sepcified, returns 0;
  */
  _getDispositionFee = (): number => {
    const make = MAKES.filter((m) => m.displayName === this.make);
    if (make.length === 0) {
      return 0;
    }
    return make[0].dispositionFee ? make[0].dispositionFee : 0;
  };

  /*
    Calculates base monthly payment
  */
  _calculateMonthlyPaymentPreTax = (capAddon: number = 0): number => {
    this._netCapCost += capAddon;
    this.depreciation = this._netCapCost - this.RVValue;
    this.basePayment =
      this.depreciation /
      (this.isZeroDriveoff ? this.leaseTerm - 1 : this.leaseTerm);
    this.rentCharge = (this._netCapCost + this.RVValue) * this.mf;
    return this.basePayment + this.rentCharge;
  };

  /*
    Calculates the lease tax amount based on method of taxation
  */
  _calculateTax = (): number => {
    let taxableAmount;
    if (this.taxMethod === TaxationMethod.TAX_ON_MONTHLY_PAYMENT) {
      taxableAmount =
        this.monthlyPaymentPreTax + (this.isZeroDriveoff ? this.rebates : 0);
    } else if (this.taxMethod === TaxationMethod.TAX_ON_SALES_PRICE) {
      taxableAmount = this.sellingPrice;
    } else if (this.taxMethod === TaxationMethod.TAX_ON_TOTAL_LEASE_PAYMENT) {
      taxableAmount =
        this.monthlyPaymentPreTax * this.leaseTerm +
        this.downPayment +
        this.totalFees +
        this._getAcquisitionFee() +
        this._getDispositionFee();
    }

    return taxableAmount * (this.salesTax / 100);
  };

  /*
    Calculates total monthly payment based on method of taxation
  */
  _calculateMonthlyPaymentWithTax = (): number => {
    this.tax = this._calculateTax();
    if (this.taxMethod === TaxationMethod.TAX_ON_MONTHLY_PAYMENT) {
      if (this.isZeroDriveoff) {
        this.monthlyPaymentPreTax = this._calculateMonthlyPaymentPreTax(
          this.tax
        );
        return this.monthlyPaymentPreTax * (1 + this.salesTax / 100);
      }
      return this.monthlyPaymentPreTax + this.tax;
    }

    if (this.isZeroDriveoff) {
      // Capitalize the tax amount to account for zero drive-off
      this.monthlyPaymentPreTax = this._calculateMonthlyPaymentPreTax(this.tax);
    }
    return this.monthlyPaymentPreTax;
  };

  /*
    Calculates tax amount on drive off payment.
    Applicable when isZeroDriveoff is false
  */
  _calculateDriveOffTaxes = (): number => {
    let taxableAmount;
    if (this.taxMethod === TaxationMethod.TAX_ON_MONTHLY_PAYMENT) {
      taxableAmount =
        this.downPayment +
        this.totalFees +
        this.rebates +
        this._getAcquisitionFee();
    } else if (this.taxMethod === TaxationMethod.TAX_ON_SALES_PRICE) {
      taxableAmount = this.sellingPrice;
    } else if (this.taxMethod === TaxationMethod.TAX_ON_TOTAL_LEASE_PAYMENT) {
      taxableAmount =
        this.monthlyPaymentPreTax * this.leaseTerm +
        this.downPayment +
        this.totalFees +
        this.rebates +
        this._getAcquisitionFee() +
        this._getDispositionFee();
    }

    return taxableAmount * (this.salesTax / 100);
  };

  /*
    Calculates total drive-off payment
  */
  _getDriveOffPayment = (): number => {
    const driveoff = this.isZeroDriveoff
      ? 0
      : this._calculateDriveOffTaxes() +
        this.downPayment +
        this.totalFees +
        // First month payment
        this.monthlyPayment +
        this._getAcquisitionFee();

    return Math.round(driveoff * 100) / 100;
  };

  /*
    Gets the residual value of the lease in percentage
  */
  _getRVPercentage = (): number => Math.round(this.RVPercent);

  /*
    Gets the residual value of the lease
  */
  _getRVValue = (): number => Number.parseFloat(this.RVValue.toFixed(2));

  /*
    Gets the monthly payment of the lease, not including taxes
  */
  _getMonthlyPaymentPreTax = (): number =>
    Math.round(this.monthlyPaymentPreTax * 100) / 100;

  /*
    Gets the monthly payment of the lease, including taxes
  */
  _getMonthlyPayment = (): number =>
    Math.round(this.monthlyPayment * 100) / 100;

  /*
    Gets the discount off of the MSRP, in percentage.
    Returns null if Selling Price >= MSRP
  */
  _getDiscountOffMsrpPercentage = (): number | null => {
    const offMsrp = this.msrp - this.sellingPrice;
    const offMsrpPercentage = (offMsrp / this.msrp) * 100;
    const offMsrpPercentageRound = Math.round(offMsrpPercentage * 100) / 100;
    return offMsrpPercentageRound <= 0 ? null : offMsrpPercentageRound;
  };

  /*
    Gets the percentage of the monthly payment out of the MSRP
  */
  _getMonthlyPaymentToMsrpPercentage = (): number => {
    const msrpPercentage = (this.monthlyPayment / this.msrp) * 100;
    return Math.round(msrpPercentage * 100) / 100;
  };

  /*
    Gets the total cost of the lease
  */
  _getTotalLeaseCost = (): number => {
    const totalCost =
      // First monthly payment is included in drive-off
      this.monthlyPayment * (this.leaseTerm - 1) +
      this._getDriveOffPayment() +
      this._getDispositionFee();
    return Math.round(totalCost * 100) / 100;
  };

  /*
    Gets the APR value of the lease
  */
  _getAPR = (): number => {
    if (!this.apr) {
      this.apr = this._MFToAPR();
    }
    return Math.round(this.apr * 100) / 100;
  };

  /*
    Returns a list of all drive-off payments.
    Returns null if isZeroDriveoff is true.
  */
  _getDriveOffPaymentBreakdown = (): object[] | null => {
    if (this.isZeroDriveoff) {
      return null;
    }
    const payments = [
      {
        type: "taxes",
        label: "Taxes",
        amount: Math.round(this._calculateDriveOffTaxes() * 100) / 100,
      },
      {
        type: "firstMonth",
        label: "First month",
        amount: Math.round(this.monthlyPayment * 100) / 100,
      },
      {
        type: "acquisitionFee",
        label: "Acquisition Fee",
        amount: this._getAcquisitionFee(),
      },
    ];

    if (this.downPayment) {
      payments.push({
        type: "downPayment",
        label: "Down Payment",
        amount: this.downPayment,
      });
    }

    if (this.totalFees) {
      payments.push({
        type: "totalFees",
        label: "Dealer & Government Fees",
        amount: this.totalFees,
      });
    }

    return payments;
  };

  /*
    Gets total depreciation value
  */
  _getDepreciation = (): number => this.depreciation;

  /*
    Gets the base monthly payment
  */
  _getBaseMonthlyPayment = (): number =>
    Math.round(this.basePayment * 100) / 100;

  /*
    Gets the rent charge value ("monthly MF")
  */
  _getRentCharge = (): number => Math.round(this.rentCharge * 100) / 100;

  /*
    Gets total interest for the lease
  */
  _getTotalInterest = (): number =>
    Math.round(this.rentCharge * this.leaseTerm * 100) / 100;

  /*
    Gets the monthly tax value. Applicable only when taxation method is TAX_ON_MONTHLY_PAYMENT.
    Otherwise, returns 0.
  */
  _getMonthlyTax = (): number =>
    this.taxMethod === TaxationMethod.TAX_ON_MONTHLY_PAYMENT
      ? Math.round(this.tax * 100) / 100
      : 0;

  /*
    Gets the total tax for the lease
  */
  _getTotalTax = (): number =>
    this.taxMethod === TaxationMethod.TAX_ON_MONTHLY_PAYMENT
      ? Math.round(
          (this.tax * this.leaseTerm + this._calculateDriveOffTaxes()) * 100
        ) / 100
      : this._calculateDriveOffTaxes();

  /*
    Calculates the lease' monthly payment, APR, total cost, etc.

    make           Make of the vehicle, for calculating fees
    msrp           Required, MSRP of the vehicle
    sellingPrice   Required, negotiated price of the vehicle
    rv             Required, Residual value of the vehicle
    isRVPercent    Whether the rv is absolute value of a percentage of MSRP. Defaults to true
    mf             Required, The money factor of the lease
    leaseTerm      The length of the lease in months. Defaults to 36
    salesTax       The state's sales tax in percentage. Defaults to 0
    totalFees      Total fees of the lease. Defaults to 0
    rebates        Total discount from dealer and manufacturer. Defaults to 0
    downPayment    Down payment, if applicable. Defaults to 0
    taxMethod      Method of taxation to apply, based on state. Defaults to TaxationMethod.TAX_ON_MONTHLY_PAYMENT
    isZeroDriveoff Whether fees & tax are capitalized. Defaults to false
  */
  calculate({
    make = "",
    msrp,
    sellingPrice,
    rv,
    isRVPercent = true,
    mf,
    leaseTerm = 36,
    salesTax = 0,
    totalFees = 0,
    rebates = 0,
    downPayment = 0,
    taxMethod = TaxationMethod.TAX_ON_MONTHLY_PAYMENT,
    isZeroDriveoff = false,
  }: LeaseParams) {
    this.make = make;
    this.msrp = msrp;
    this.sellingPrice = sellingPrice;
    this.rv = rv;
    this.isRVPercent = isRVPercent;
    this.mf = mf;
    this.leaseTerm = leaseTerm;
    this.salesTax = salesTax;
    this.totalFees = totalFees;
    this.rebates = rebates;
    this.downPayment = downPayment;
    this.taxMethod = taxMethod;
    this.isZeroDriveoff = isZeroDriveoff;

    this._validateLeaseParams();
    this._calculateRV();

    const grossCapCost =
      this.sellingPrice +
      (this.isZeroDriveoff ? this.totalFees + this._getAcquisitionFee() : 0);

    const capCostReduction =
      this.rebates + (this.isZeroDriveoff ? 0 : this.downPayment);

    this._netCapCost = grossCapCost - capCostReduction;
    this.monthlyPaymentPreTax = this._calculateMonthlyPaymentPreTax();
    this.monthlyPayment = this._calculateMonthlyPaymentWithTax();

    return {
      calculateMonthlyPaymentPreTax: (): number =>
        this._calculateMonthlyPaymentPreTax(),
      calculateMonthlyPaymentWithTax: (): number =>
        this._calculateMonthlyPaymentWithTax(),
      calculateTax: (): number => this._calculateTax(),
      calculateDriveOffTaxes: (): number => this._calculateDriveOffTaxes(),
      getAcquisitionFee: (): number => this._getAcquisitionFee(),
      getDispositionFee: (): number => this._getDispositionFee(),
      getDriveOffPayment: (): number => this._getDriveOffPayment(),
      getDriveOffPaymentBreakdown: (): object[] | null =>
        this._getDriveOffPaymentBreakdown(),
      getRVPercentage: (): number => this._getRVPercentage(),
      getRVValue: (): number => this._getRVValue(),
      getDepreciation: (): number => this._getDepreciation(),
      getBaseMonthlyPayment: (): number => this._getBaseMonthlyPayment(),
      getRentCharge: (): number => this._getRentCharge(),
      getTotalInterest: (): number => this._getTotalInterest(),
      getMonthlyTax: (): number => this._getMonthlyTax(),
      getTotalTax: (): number => this._getTotalTax(),
      getMonthlyPayment: (): number => this._getMonthlyPayment(),
      getDiscountOffMsrpPercentage: (): number | null =>
        this._getDiscountOffMsrpPercentage(),
      getMonthlyPaymentPreTax: (): number => this._getMonthlyPaymentPreTax(),
      getMonthlyPaymentToMsrpPercentage: (): number =>
        this._getMonthlyPaymentToMsrpPercentage(),
      getTotalLeaseCost: (): number => this._getTotalLeaseCost(),
      getAPR: (): number => this._getAPR(),
    };
  }

  /*
    Calculates the finance monthly payment, total cost, etc.

    make           Make of the vehicle, for calculating fees
    sellingPrice   Required, negotiated price of the vehicle
    financeTerm    The length of the loan in months.
    salesTax       The state's sales tax in percentage.
    taxableFees    Total taxable fees (non government)
    untaxableFees  Total fees that are not taxable (government fees)
    APR            The Annual Percentage Rate of the loan
    downPayment    Down payment, if applicable
    tradeIn        Trade-in value, if applicable 
    rebates        Total discount from manufacturer
  */
  calculateFinance({
    make = "",
    sellingPrice,
    financeTerm,
    salesTax = 0,
    taxableFees = 0,
    untaxableFees = 0,
    APR,
    downPayment = 0,
    tradeIn = 0,
    rebates = 0,
  }: FinanceParams) {
    this.finance = {
      make,
      sellingPrice,
      financeTerm,
      salesTax,
      taxableFees,
      untaxableFees,
      rebates,
      downPayment,
      APR,
      tradeIn,
    };

    this._validateFinanceParams();

    const taxAmount = this.finance.sellingPrice * (this.finance.salesTax / 100);
    const taxableFeesAmount =
      this.finance.taxableFees * (this.finance.salesTax / 100);

    this.amountToFinance =
      this.finance.sellingPrice -
      this.finance.downPayment -
      this.finance.tradeIn -
      this.finance.rebates +
      this.finance.untaxableFees +
      this.finance.taxableFees +
      taxableFeesAmount +
      taxAmount;
    const interestPerMonth = this.finance.APR / 100 / 12;

    const interestComponent = Math.pow(
      1 + interestPerMonth,
      this.finance.financeTerm
    );

    this.financeMonthlyPayment =
      (this.amountToFinance * interestPerMonth * interestComponent) /
      (interestComponent - 1);

    this.financeTotalCost =
      this.financeMonthlyPayment * this.finance.financeTerm +
      this.finance.downPayment +
      this.finance.tradeIn;

    return {
      /*
        Gets the finance monthly payment, inc. tax.
      */
      getFinanceMonthlyPayment: (): number =>
        Math.round(this.financeMonthlyPayment * 100) / 100,

      /*
        Gets the total cost of finance. Comprised of the monthly payment over the life of
        the load plus down payment and any trade-in value.
      */
      getFinanceTotalCost: (): number =>
        Math.round(this.financeTotalCost * 100) / 100,

      /*
        Gets the total financed amount. Comprised of the selling price plus any fees and taxes
        minus down payment, trade-in value and any rebates.
      */
      getTotalAmountFinanced: (): number =>
        Math.round(this.amountToFinance * 100) / 100,

      /*
        Gets the total interest paid for finance.
        Throws Error if calculateFinance() wasn't invoked prior to calling it
      */
      getFinanceTotalInterest: (): number => {
        const interest =
          this.financeTotalCost -
          this.amountToFinance -
          this.finance.downPayment -
          this.finance.tradeIn;
        return Math.round(interest * 100) / 100;
      },
    };
  }
}

export default LeaseCalculator;
