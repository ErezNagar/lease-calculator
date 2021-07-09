# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [3.0.0](https://github.com/ErezNagar/lease-calculator/compare/v2.2.0...v3.0.0) - 08/7/2021

### Fixed

- Fixed getDiscountOffMsrpPercentage() to return null when Selling Price
  - `getDriveOffPaymentDetails(): object[] | null`

## [2.2.0](https://github.com/ErezNagar/lease-calculator/compare/v2.1.0...v2.2.0) - 04/6/2021

### Added

- An ability to get a detailed list of all drive-off payments
  - `getDriveOffPaymentDetails(): object[] | null`

## [2.1.0](https://github.com/ErezNagar/lease-calculator/compare/v2.0.0...v2.1.0) - 31/1/2021

### Added

- More granular details on different price components:
  - `getDepreciation(): number` - Gets the total depreciation value of the lease
  - `getBaseMonthlyPayment(): number` - Gets the base monthly payment
  - `getRentCharge(): number` - Gets the rent charge value
  - `getTotalInterest(): number` - Gets total interest for the lease
  - `getMonthlyTax(): number` - Gets the monthly tax value
  - `getTotalTax(): number` - Gets the total tax for the lease

## [2.0.0](https://github.com/ErezNagar/lease-calculator/compare/v1.2.2...v2.0.0) - 3/1/2021

### Added

- Support for zero drive-off

### Updated

- Acquisition fee is no longer capitalized by default
- Acquisition fee and disposition fee are included in drive-off payment when taxMethod = TaxationMethod.TAX_ON_TOTAL_LEASE_PAYMENT
- Total fees and rebates calculation

### Removed

- Support for trade-in value

## [1.2.1](https://github.com/ErezNagar/lease-calculator/compare/v1.2.0...v1.2.1) - 8/11/2020

### Added

- TypeScript support

## [1.2.0](https://github.com/ErezNagar/lease-calculator/compare/v1.1.0...v1.2.0) - 27/7/2020

### Added

- Support for different taxation methods:
  Tax levied on monthly payment (most states)
  Tax levied on selling/sales price (Virginia)
  Tax levied on total lease ppayment (New York, New Jersy, Minnesota, Ohio, Georgia)

## [1.1.0](https://github.com/ErezNagar/lease-calculator/compare/v1.0.1...v1.1.0) - 29/6/2020

### Added

- Acquisition and disposition fee support for 35 manufacturers:
  calculate() now accepts a `make` field for calculating manufacturer-based fees.
- getAcquisitionFeeValue(), returns acquisition fee value
- getDispositionFeeValue(), returns disposition fee value

## [1.0.1](https://github.com/ErezNagar/lease-calculator/compare/v1.0.0...v1.0.1) - 27/4/2020

### Fixed

- Removed required support for the experimental classProperties syntax
- Fixed package.json/main property

## [1.0.0](https://github.com/ErezNagar/lease-calculator/compare/v0.1.0...v1.0.0) - 27/4/2020

- Version official version

## [0.1.0](https://github.com/ErezNagar/lease-calculator/releases/tag/v0.1.0) - 14/4/2020

Initial version
