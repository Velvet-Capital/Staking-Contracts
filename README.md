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

## 🚀 Deployment workflow

1. **Deploy the contract**  
   - Choose a `transferAllowedTimestamp` equal to your planned TGE (Unix seconds).  
   - Compile & broadcast using Hardhat or Remix, then verify on BSCScan for transparency.

2. **Mint initial supply (≤ 1 Billion VLT)**  
   - From the owner wallet call `mintTo(address,uint256)` for every recipient (treasury, liquidity, launchpad escrow, etc.).  
   - For large airdrops, mint once to an admin wallet and distribute with a multisender dApp to save gas.

3. **(Optional) Whitelist early participants**  
   - Before the timestamp elapses, only whitelisted addresses can transfer.  
   - Use `addToWhitelist(address)` for launchpad contracts, market-maker bots, or partners.  

4. **Token Generation Event (TGE)**  
   - When `block.timestamp ≥ transferAllowedTimestamp`, the gate opens automatically—no further action required.  

5. **Post-TGE hardening**  
   - After all airdrops, liquidity adds, and housekeeping are complete, call `renounceOwnership()` (from OpenZeppelin `Ownable`).  
   - This permanently disables `onlyOwner` functions (minting, whitelist edits), making the token trustless

## 🔧 Quick start

```bash
# Install deps
npm install           # Hardhat, Ethers, etc.

# Compile
npx hardhat compile
