# Car Lease Calculator :red_car:

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Npm Version](https://img.shields.io/npm/v/lease-calculator?color=blue&logo=npm-version)](https://www.npmjs.com/package/lease-calculator)
![](https://github.com/ErezNagar/lease-calculator/workflows/Tests/badge.svg)

A simple auto lease calculator for calculating your monthly lease payment, APR, total lease cost, percentage off MSRP, etc.

See it used in the Auto Lease app: https://github.com/ErezNagar/lease-calculator-app

## Features

- Calculates car lease payments including total monthly payment, monthly payment pre-tax, total lease cost, APR, percentage off MSRP and drive-off fees.
- Supports methods of taxation by state
- Includes acquisition fee for supported manufacturers
- Includes disposition fee for supported manufacturers
- Supports zero down payment
- Supports zero drive-off payments

## How To Use

```bash
npm install lease-calculator
```

```javascript
const leaseCalculator = new LeaseCalculator();
leaseCalculator.calculate({
  make: "Toyota",
  msrp: 23000,
  sellingPrice: 21000,
  rv: 13110,
  isRVPercent: false,
  mf: 0.00125,
  salesTax: 6.25,
  totalFees: 1200,
});

// Get the lease monthly payment
const monthlyPayment = leaseCalculator.getMonthlyPayment();
```

## API

### `calculate(leaseValues: Object): void`

Main function to calculate lease payments. Must be run prior to any other function in order to first calculate the lease numbers.

Arguments:
leaseValues Object, with the following attributes:

- `make: string = ""`
  Make of the vehicle, for calculating manufacturer-based fees.

- `msrp: number`
  Required, MSRP of the vehicle

- `sellingPrice: number`
  Required, negotiated price of the vehicle

- `rv: number`
  Required, residual value of the vehicle. If isRVPercent is true, value must be a percentage, e.g., if RV is 65%, rv should be 65.

- `isRVPercent: boolean = true`
  Whether the RV is an absolute value or a percentage of MSRP

- `mf: number`
  Required, the money factor of the lease (e.g. 0.00125)

- `leaseTerm: number = 36`
  The length of the lease in months

- `salesTax: number = 0`
  The state's sales tax in percentage

- `totalFees: number = 0`
  Total fees of the lease

- `rebates: number = 0`
  Total discount from dealer and manufacturer

- `downPayment: number = 0`
  Down payment, if applicable

- `taxMethod: TaxationMethod = TaxationMethod.TAX_ON_MONTHLY_PAYMENT`
  Method of taxation to apply, based on state

- `isZeroDriveoff: boolean = false`
  Added in v1.3.0. Whether the lease should be calculated with zero drive-off amount. If true, all fees and taxes are rolled into the monthly payment.

### `getMonthlyPayment(): number`

Gets the monthly payment of the lease, including taxes

### `getMonthlyPaymentPreTax(): number`

Gets the monthly payment of the lease, not including taxes

### `getTotalLeaseCost(): number`

Gets the total cost of the lease. This includes all monthly payments, down payment, disposition fee, acquisition fee, dealer fees and lease taxes.

### `getDriveOffPayment(): number`

Gets total drive-off payment

### `getDiscountOffMsrpPercentage(): number`

Gets the discount off of MSRP, in percentage

### `getMonthlyPaymentToMsrpPercentage(): number`

Gets the percentage of the monthly payment out of the MSRP

### `getAPR()`

Gets the APR value of the lease

### `getAcquisitionFee(): number`

Gets the acquisition fee value by brand. If no brand sepcified, returns 0

### `getDispositionFee(): number`

Gets the disposition fee value by brand. If no brand sepcified, returns 0

### `getRVValue(): number`

Gets the residual value of the lease

### `getRVPercentage(): number`

Gets the residual value of the lease in percentage

### `getDepreciation(): number`

Gets the total depreciation value of the lease. Added in v2.1.0.

### `getBaseMonthlyPayment(): number`

Gets the base monthly payment. Added in v2.1.0.

### `getRentCharge(): number`

Gets the rent charge value. Added in v2.1.0.

### `getTotalInterest(): number`

Gets total interest for the lease. Added in v2.1.0.

### `getMonthlyTax(): number`

Gets the monthly tax value. Applicable on for taxatino method is TAX_ON_MONTHLY_PAYMENT. Otherwise, returns 0. Added in v2.1.0.

### `getTotalTax(): number`

Gets the total tax for the lease. Added in v2.1.0.

### `getDriveOffPaymentDetails(): Array<Object> | null`

Returns a detailed list of all drive-off payments. Returns null if isZeroDriveoff is true.

## Supported manufacturers

Lease Calculator supports acquisition and disposition fee calculation for the following brands:

Acura, Alfa Romeo, Audi, Bmw, Buick, Cadillac, Chevrolet, Chrysler, Dodge, Fiat, Ford, Genesis, GMC, Honda, Hyundai, Infiniti, Jaguar, Jeep, Kia, land rover, Lexus, Lincoln, Mini, Mazda, Mercedes benz, Mitsubishi, Nissan, Ram, Scion, Smart, Subaru, Tesla, Toyota, Volkswagen, Volvo
