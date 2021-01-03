# Car Lease Calculator :red_car:

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Npm Version](https://img.shields.io/npm/v/lease-calculator?color=blue&logo=npm-version)](https://www.npmjs.com/package/lease-calculator)
![](https://github.com/ErezNagar/lease-calculator/workflows/Tests/badge.svg)

A simple auto lease calculator for calculating your monthly lease payment, APR, total lease cost, percentage off MSRP, etc.

See it used in the Auto Lease app: https://github.com/ErezNagar/lease-calculator-app

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

|                                        | Description                                                                                                                       |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `calculate(leaseValues: Object): void` | Main function to calculate lease payments. Must be run prior to any other function in order to first calculate the lease numbers. |

Arguments:
leaseValues Object, with the following attributes:

make: string = ""
Make of the vehicle, for calculating manufacturer-based fees.

msrp: number
Required, MSRP of the vehicle

sellingPrice: number,
Required, negotiated price of the vehicle

rv: number,
Required, residual value of the vehicle
If isRVPercent is true, value must be a percentage, e.g., if RV is 65%, rv should be 65.

isRVPercent: boolean = true,
Whether the RV is an absolute value or a percentage of MSRP

mf: number,
Required, the money factor of the lease (e.g. 0.00125)

leaseTerm: number = 36,
The length of the lease in months

salesTax: number = 0,
The state's sales tax in percentage

totalFees: number = 0,
Total fees of the lease

rebates: number = 0,
Total discount from dealer and manufacturer

tradeIn: number = 0,
Total trade-in value

downPayment: number = 0,
Down payment, if applicable

taxMethod: TaxationMethod = TaxationMethod.TAX_ON_MONTHLY_PAYMENT,
Method of taxation to apply, based on state

isZeroDriveoff: boolean = false,
Added in v1.3.0. Whether the lease should be calculated with zero drive-off amount. If true, all fees and taxes are rolled into the monthly payment. |

|                                               |                                                                                                                                                    |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getRVValue(): number`                        | Gets the residual value of the lease                                                                                                               |
| `getRVPercentage(): number`                   | Gets the residual value of the lease in percentage                                                                                                 |
| `getMonthlyPaymentPreTax(): number`           | Gets the monthly payment of the lease, not including taxes                                                                                         |
| `getMonthlyPayment(): number`                 | Gets the monthly payment of the lease, including taxes                                                                                             |
| `getDiscountOffMsrpPercentage(): number`      | Gets the discount off of MSRP, in percentage                                                                                                       |
| `getMonthlyPaymentToMsrpPercentage(): number` | Gets the percentage of the monthly payment out of the MSRP                                                                                         |
| `getTotalLeaseCost(): number`                 | Gets the total cost of the lease. This includes all monthly payments, down payment, disposition fee, acquisition fee, dealer fees and lease taxes. |
| `getAPR()`                                    | Gets the APR value of the lease                                                                                                                    |
| `getAcquisitionFee(): number`                 | Gets the acquisition fee value by brand. If no brand sepcified, returns 0                                                                          |
| `getDispositionFee(): number`                 | Gets the disposition fee value by brand. If no brand sepcified, returns 0                                                                          |
| `getDriveOffPayment(): number`                | Gets total drive-off payment                                                                                                                       |

## Supported manufacturers

Lease Calculator supports acquisition and disposition fee calculation for the following brands:

Acura, Alfa Romeo, Audi, Bmw, Buick, Cadillac, Chevrolet, Chrysler, Dodge, Fiat, Ford, Genesis, GMC, Honda, Hyundai, Infiniti, Jaguar, Jeep, Kia, land rover, Lexus, Lincoln, Mini, Mazda, Mercedes benz, Mitsubishi, Nissan, Ram, Scion, Smart, Subaru, Tesla, Toyota, Volkswagen, Volvo
