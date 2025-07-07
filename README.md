# veVelvet Staking Contract

A vote-escrowed (ve) staking system that allows users to lock tokens for voting power with time-based decay.

## Features

- **Token Locking**: Lock ERC20 tokens for 1-30 weeks
- **Voting Power**: Earn voting power based on amount and lock duration
- **Auto-Renewal**: Optional perpetual locking with max voting power
- **Position Extension**: Extend existing locks before expiration
- **Multiple Positions**: Up to 200 concurrent locks per user

## Key Parameters

- **Max Lock Duration**: 30 weeks
- **Max Positions**: 200 per user
- **Voting Power**: `amount * (lockWeeks / 30)`
- **Time Decay**: Linear decrease over lock period

## Quick Start

```bash
npm install
npm run compile
npm test
```

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
