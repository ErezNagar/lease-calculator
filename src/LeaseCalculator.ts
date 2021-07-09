import { TaxationMethod, MAKES } from "./constants";

type LeaseValues = {
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

interface LeaseCalculator extends LeaseValues {
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
}

class LeaseCalculator {
  /*
    Validates required fields.
    Throws: Error | If there's an invalid required field
  */
  _validateData(): void {
    const requiredInputs = [
      "MSRP",
      "Selling Price",
      "Residual Value",
      "Money Factor",
    ];
    const requiredInput = [this.msrp, this.sellingPrice, this.rv, this.mf];
    requiredInput.forEach((field, i) => {
      if (!field || field === 0) {
        throw new Error(`Invalid Input: ${requiredInputs[i]}`);
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
    Calculates the lease' monthly payment, APR, total cost, etc.

    make           Make of the vehicle, for calculating fees
    msrp           Required, MSRP of the vehicle
    sellingPrice   Required, negotiated price of the vehicle
    rv             Required, Residual value of the vehicle
    isRVPercent    Whether the rv is absolute value of a percentage of MSRP
    mf             Required, The money factor of the lease
    leaseTerm      The length of the lease in months.
    salesTax       The state's sales tax in percentage.
    totalFees      Total fees of the lease
    rebates        Total discount from dealer and manufacturer
    downPayment    Down payment, if applicable
    taxMethod      Method of taxation to apply, based on state
    isZeroDriveoff Whether fees & tax are capitalized
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
  }: LeaseValues): void {
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

    this._validateData();
    this._calculateRV();

    const grossCapCost =
      this.sellingPrice +
      (this.isZeroDriveoff ? this.totalFees + this.getAcquisitionFee() : 0);

    const capCostReduction =
      this.rebates + (this.isZeroDriveoff ? 0 : this.downPayment);

    this._netCapCost = grossCapCost - capCostReduction;
    this.monthlyPaymentPreTax = this.calculateMonthlyPaymentPreTax();
    this.monthlyPayment = this.calculateMonthlyPaymentWithTax();
  }

  /*
    Calculates base monthly payment
  */
  calculateMonthlyPaymentPreTax(capAddon: number = 0): number {
    this._netCapCost += capAddon;
    this.depreciation = this._netCapCost - this.RVValue;
    this.basePayment =
      this.depreciation /
      (this.isZeroDriveoff ? this.leaseTerm - 1 : this.leaseTerm);
    this.rentCharge = (this._netCapCost + this.RVValue) * this.mf;
    return this.basePayment + this.rentCharge;
  }

  /*
    Calculates total monthly payment based on method of taxation
  */
  calculateMonthlyPaymentWithTax(): number {
    this.tax = this.calculateTax();
    if (this.taxMethod === TaxationMethod.TAX_ON_MONTHLY_PAYMENT) {
      if (this.isZeroDriveoff) {
        this.monthlyPaymentPreTax = this.calculateMonthlyPaymentPreTax(
          this.tax
        );
        return this.monthlyPaymentPreTax * (1 + this.salesTax / 100);
      }
      return this.monthlyPaymentPreTax + this.tax;
    }

    if (this.isZeroDriveoff) {
      // Capitalize the tax amount to account for zero drive-off
      this.monthlyPaymentPreTax = this.calculateMonthlyPaymentPreTax(this.tax);
    }
    return this.monthlyPaymentPreTax;
  }

  /*
    Calculates the lease tax amount based on method of taxation
  */
  calculateTax(): number {
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
        this.getAcquisitionFee() +
        this.getDispositionFee();
    }

    return taxableAmount * (this.salesTax / 100);
  }

  /*
    Calculates tax amount on drive off payment.
    Applicable when isZeroDriveoff is false
  */
  calculateDriveOffTaxes(): number {
    let taxableAmount;
    if (this.taxMethod === TaxationMethod.TAX_ON_MONTHLY_PAYMENT) {
      taxableAmount =
        this.downPayment +
        this.totalFees +
        this.rebates +
        this.getAcquisitionFee();
    } else if (this.taxMethod === TaxationMethod.TAX_ON_SALES_PRICE) {
      taxableAmount = this.sellingPrice;
    } else if (this.taxMethod === TaxationMethod.TAX_ON_TOTAL_LEASE_PAYMENT) {
      taxableAmount =
        this.monthlyPaymentPreTax * this.leaseTerm +
        this.downPayment +
        this.totalFees +
        this.rebates +
        this.getAcquisitionFee() +
        this.getDispositionFee();
    }

    return taxableAmount * (this.salesTax / 100);
  }

  /*
    Gets the residual value of the lease in percentage
  */
  getRVPercentage(): number {
    return Math.round(this.RVPercent);
  }

  /*
    Gets the residual value of the lease
  */
  getRVValue(): number {
    return Number.parseFloat(this.RVValue.toFixed(2));
  }

  /*
    Gets the monthly payment of the lease, not including taxes
  */
  getMonthlyPaymentPreTax(): number {
    return Math.round(this.monthlyPaymentPreTax * 100) / 100;
  }

  /*
    Gets the monthly payment of the lease, including taxes
  */
  getMonthlyPayment(): number {
    return Math.round(this.monthlyPayment * 100) / 100;
  }

  /*
    Gets the discount off of the MSRP, in percentage.
    Returns null if Selling Price >= MSRP
  */
  getDiscountOffMsrpPercentage(): number | null {
    const offMsrp = this.msrp - this.sellingPrice;
    const offMsrpPercentage = (offMsrp / this.msrp) * 100;
    return offMsrpPercentage <= 0
      ? null
      : Math.round(offMsrpPercentage * 100) / 100;
  }

  /*
    Gets the percentage of the monthly payment out of the MSRP
  */
  getMonthlyPaymentToMsrpPercentage(): number {
    const msrpPercentage = (this.monthlyPayment / this.msrp) * 100;
    return Math.round(msrpPercentage * 100) / 100;
  }

  /*
    Gets the total cost of the lease
  */
  getTotalLeaseCost(): number {
    const totalCost =
      // First monthly payment is included in drive-off
      this.monthlyPayment * (this.leaseTerm - 1) +
      this.getDriveOffPayment() +
      this.getDispositionFee();
    return Math.round(totalCost * 100) / 100;
  }

  /*
    Gets the APR value of the lease
  */
  getAPR(): number {
    if (!this.apr) {
      this.apr = this._MFToAPR();
    }
    return Math.round(this.apr * 100) / 100;
  }

  /*
    Gets the acquisition fee value by brand. If no brand sepcified, returns 0;
  */
  getAcquisitionFee(): number {
    const make = MAKES.filter((m) => m.displayName === this.make);
    if (make.length === 0) {
      return 0;
    }
    return make[0].acquisitionFee;
  }

  /*
    Gets the disposition fee value by brand. If no brand sepcified, returns 0;
  */
  getDispositionFee(): number {
    const make = MAKES.filter((m) => m.displayName === this.make);
    if (make.length === 0) {
      return 0;
    }
    return make[0].dispositionFee ? make[0].dispositionFee : 0;
  }

  /*
    Calculates total drive-off payment
  */
  getDriveOffPayment(): number {
    const driveoff = this.isZeroDriveoff
      ? 0
      : this.calculateDriveOffTaxes() +
        this.downPayment +
        this.totalFees +
        // First month payment
        this.monthlyPayment +
        this.getAcquisitionFee();

    return Math.round(driveoff * 100) / 100;
  }

  /*
    Returns a detailed list of all drive-off payments.
    Returns null if isZeroDriveoff is true.
  */
  getDriveOffPaymentDetails(): object[] | null {
    if (this.isZeroDriveoff) {
      return null;
    }
    const details = [
      {
        type: "taxes",
        label: "Taxes",
        amount: Math.round(this.calculateDriveOffTaxes() * 100) / 100,
      },
      {
        type: "firstMonth",
        label: "First month",
        amount: Math.round(this.monthlyPayment * 100) / 100,
      },
      {
        type: "acquisitionFee",
        label: "Acquisition Fee",
        amount: this.getAcquisitionFee(),
      },
    ];

    if (this.downPayment) {
      details.push({
        type: "downPayment",
        label: "Down Payment",
        amount: this.downPayment,
      });
    }

    if (this.totalFees) {
      details.push({
        type: "totalFees",
        label: "Dealer & Government Fees",
        amount: this.totalFees,
      });
    }

    return details;
  }

  /*
    Gets total depreciation value
  */
  getDepreciation(): number {
    return this.depreciation;
  }

  /*
    Gets the base monthly payment
  */
  getBaseMonthlyPayment(): number {
    return Math.round(this.basePayment * 100) / 100;
  }

  /*
    Gets the rent charge value ("monthly MF")
  */
  getRentCharge(): number {
    return Math.round(this.rentCharge * 100) / 100;
  }

  /*
    Gets total interest for the lease
  */
  getTotalInterest(): number {
    return Math.round(this.rentCharge * this.leaseTerm * 100) / 100;
  }

  /*
    Gets the monthly tax value. Applicable only when taxation method is TAX_ON_MONTHLY_PAYMENT.
    Otherwise, returns 0.
  */
  getMonthlyTax(): number {
    return this.taxMethod === TaxationMethod.TAX_ON_MONTHLY_PAYMENT
      ? Math.round(this.tax * 100) / 100
      : 0;
  }

  /*
    Gets the total tax for the lease
  */
  getTotalTax(): number {
    return this.taxMethod === TaxationMethod.TAX_ON_MONTHLY_PAYMENT
      ? Math.round(
          (this.tax * this.leaseTerm + this.calculateDriveOffTaxes()) * 100
        ) / 100
      : this.calculateDriveOffTaxes();
  }
}

export default LeaseCalculator;
