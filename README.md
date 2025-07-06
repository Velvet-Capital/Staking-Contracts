# Staking Contracts

## Overview

This repository contains a modified version of the Virtual Protocol's veVirtual staking contract for development and testing purposes.

## Important Modifications

The staking contract here has the minimum time period for staking set to be 1 minute which is hardcoded in the contract. The original contract is here: https://github.com/Virtual-Protocol/protocol-contracts/blob/main/contracts/token/veVirtual.sol

### To Restore Original Behavior

To get this contract like the original one please update the hardcoded values that are in mint back to weeks like the original one.

In the deployment file also you can instead of using 30 as max number of lock period use 52 like for the original one.

## Usage

This modified version is intended for testing purposes with shorter time periods to facilitate faster development cycles. 

# VelvetToken Contract (VLT)

A minimal BEP-20 token with a **time-locked launch** and **owner-controlled whitelist**.

## ✨ Key features
- **Launch lock** – transfers are blocked until `transferAllowedTimestamp`.
- **Whitelist** – owner can add/remove addresses that bypass the lock.
- **ETA guard** – once the lock has started, the owner can *only* move the launch **earlier** (never later).
- **Minting** – owner-only `mintTo()` for treasury, airdrops, etc.

## 🔧 Quick start

```bash
# Install deps
npm install           # Hardhat, Ethers, etc.

# Compile
npx hardhat compile
