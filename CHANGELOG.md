# Changelog

## [0.2.0](https://github.com/0xProject/0x-sdk/compare/v0.1.1...v0.2.0) (2022-08-17)


### ⚠ BREAKING CHANGES

* fillOrder fillRfqmOrder and getRfqmTxStatus take single object as parameter instead of spread parameters.

### Features

* generalize sdk instance, moving provider, signer and chainId to method parameters. ([#29](https://github.com/0xProject/0x-sdk/issues/29)) ([8cae5a2](https://github.com/0xProject/0x-sdk/commit/8cae5a2e0841c51e809aeaba4ac1941a68d575bd))

## [0.1.1](https://github.com/0xProject/0x-sdk/compare/v0.1.0...v0.1.1) (2022-07-29)


### Bug Fixes

* move typechain command to prepare hook instead of postinstall. ([#25](https://github.com/0xProject/0x-sdk/issues/25)) ([09413b1](https://github.com/0xProject/0x-sdk/commit/09413b1ffb0e2fa5ae1b3fa78687d360e7d9e025))

## 0.1.0 (2022-07-25)


### Features

* add approve and allowance methods ([#7](https://github.com/0xProject/0x-sdk/issues/7)) ([0e96b4d](https://github.com/0xProject/0x-sdk/commit/0e96b4df3021c1e20d95283999d9657f671feb30))
* add fill order method for market swaps ([#8](https://github.com/0xProject/0x-sdk/issues/8)) ([5738457](https://github.com/0xProject/0x-sdk/commit/57384576ce62f49fbe3b06354e211d64f0f57b56))
* add RFQm fill order and transaction status methods ([#11](https://github.com/0xProject/0x-sdk/issues/11)) ([d5e3ff1](https://github.com/0xProject/0x-sdk/commit/d5e3ff145d3ca7d0dadf0739caee3c094b7bf4d5))
* add rfqm type to price and quote methods ([#10](https://github.com/0xProject/0x-sdk/issues/10)) ([743cffa](https://github.com/0xProject/0x-sdk/commit/743cffa07a1f3a54c6b9d08e44e794cb93bbff44))
* initial project setup ([f5046b3](https://github.com/0xProject/0x-sdk/commit/f5046b3dc5c89f5c2684bb39f11c00cd9394816c))
* introduce base class & methods for swap ([#5](https://github.com/0xProject/0x-sdk/issues/5)) ([214edf8](https://github.com/0xProject/0x-sdk/commit/214edf8fc75368c8ba74d61af082dac14a2804ff))


### Bug Fixes

* remove prettier ([#4](https://github.com/0xProject/0x-sdk/issues/4)) ([0977a87](https://github.com/0xProject/0x-sdk/commit/0977a8720bf39b86937e93658da150b8e2a4fd0f))


### Miscellaneous Chores

* automate releases ([#15](https://github.com/0xProject/0x-sdk/issues/15)) ([81d80b0](https://github.com/0xProject/0x-sdk/commit/81d80b0c7093ad5b5e05218a2f0ad5e5c2971fcb))
