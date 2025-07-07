import { expect } from "chai";
import { ethers } from "hardhat";
import { setupTest } from "./fixture";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { calculateVotingPower, calculateDecayRate } from "./utils";

describe("veVelvet", function () {
    it("Should allow users to stake tokens", async () => {
        const { mockToken, veVelvet, user1 } = await setupTest();

        const stakeAmount = ethers.parseEther("100");
        const numWeeks = 26;

        // Check initial balances
        const initialTokenBalance = await mockToken.balanceOf(user1.address);
        expect(initialTokenBalance).to.equal(ethers.parseEther("1000"));
        const initialVeBalance = await veVelvet.balanceOf(user1.address);
        expect(initialVeBalance).to.equal(0n);

        // Approve and stake
        await mockToken.connect(user1).approve(veVelvet.target, stakeAmount);
        await veVelvet.connect(user1).stake(stakeAmount, numWeeks, false);

        // Check balances after stake
        const finalTokenBalance = await mockToken.balanceOf(user1.address);
        expect(finalTokenBalance).to.equal(ethers.parseEther("900"));
        
        // Get actual voting power from contract
        const finalVeBalance = await veVelvet.balanceOf(user1.address);
        
        // The voting power should be close to the calculated value, but may have small decay
        // due to the time that passed during the transaction
        const expectedVotingPower = stakeAmount * 26n / 30n;
        
        // Allow for small time decay (within 0.1% tolerance)
        expect(finalVeBalance).to.be.closeTo(expectedVotingPower, expectedVotingPower * 1n / 1000n);
        
        // Also verify it's not zero and reasonable
        expect(finalVeBalance).to.be.gt(0n);
        expect(finalVeBalance).to.be.lt(stakeAmount);
    });


    it("Should allow users to withdraw after lock period", async () => {
        const { mockToken, veVelvet, user1 } = await setupTest();

        const stakeAmount = ethers.parseEther("100");
        const numWeeks = 1;

        // Approve and stake
        await mockToken.connect(user1).approve(veVelvet.target, stakeAmount);
        await veVelvet.connect(user1).stake(stakeAmount, numWeeks, false);

        // Fast forward time
        await time.increase(7 * 24 * 60 * 60); // 1 week

        // Get position ID
        const positions = await veVelvet.getPositions(user1.address, 0, 1);
        const positionId = positions[0].id;

        // Check balances before withdrawal
        const balanceBefore = await mockToken.balanceOf(user1.address);
        expect(balanceBefore).to.equal(ethers.parseEther("900"));

        // Withdraw
        await veVelvet.connect(user1).withdraw(positionId);

        // Check balances after withdrawal
        const balanceAfter = await mockToken.balanceOf(user1.address);
        expect(balanceAfter).to.equal(ethers.parseEther("1000"));
        const veBalance = await veVelvet.balanceOf(user1.address);
        expect(veBalance).to.equal(0n);
    });

    it("Should handle auto-renewal correctly", async () => {
        const { mockToken, veVelvet, user1 } = await setupTest();

        const stakeAmount = ethers.parseEther("100");
        const numWeeks = 26;

        // Approve and stake with auto-renewal
        await mockToken.connect(user1).approve(veVelvet.target, stakeAmount);
        await veVelvet.connect(user1).stake(stakeAmount, numWeeks, true);

        // Check initial balance
        const initialBalance = await veVelvet.balanceOf(user1.address);
        expect(initialBalance).to.equal(stakeAmount); // Full voting power with auto-renewal

        // Fast forward time
        await time.increase(26 * 7 * 24 * 60 * 60); // 26 weeks

        // Check balance after lock period
        const finalBalance = await veVelvet.balanceOf(user1.address);
        expect(finalBalance).to.equal(stakeAmount); // Should maintain full voting power
    });

    it("Should allow extending lock period", async () => {
        const { mockToken, veVelvet, user1 } = await setupTest();

        const stakeAmount = ethers.parseEther("100");
        const initialWeeks = 26;
        const extendWeeks = 2;

        // Approve and stake
        await mockToken.connect(user1).approve(veVelvet.target, stakeAmount);
        await veVelvet.connect(user1).stake(stakeAmount, initialWeeks, false);

        // Get position ID
        const positions = await veVelvet.getPositions(user1.address, 0, 1);
        const positionId = positions[0].id;

        // Extend lock
        await veVelvet.connect(user1).extend(positionId, extendWeeks);

        // Get actual voting power from contract
        const balance = await veVelvet.balanceOf(user1.address);
        
        // After extending, the lock should have 28 weeks total (26 + 2)
        // So voting power should be: amount * 28/30
        const expectedVotingPower = stakeAmount * 28n / 30n;
        
        // Allow for small time decay
        expect(balance).to.be.closeTo(expectedVotingPower, expectedVotingPower * 1n / 1000n);
    });

    it("Should handle multiple positions correctly", async () => {
        const { mockToken, veVelvet, user1 } = await setupTest();

        const stakeAmount1 = ethers.parseEther("100");
        const stakeAmount2 = ethers.parseEther("200");
        const numWeeks = 26;

        // First stake
        await mockToken.connect(user1).approve(veVelvet.target, stakeAmount1);
        await veVelvet.connect(user1).stake(stakeAmount1, numWeeks, false);

        // Second stake
        await mockToken.connect(user1).approve(veVelvet.target, stakeAmount2);
        await veVelvet.connect(user1).stake(stakeAmount2, numWeeks, false);

        // Get actual total voting power from contract
        const totalBalance = await veVelvet.balanceOf(user1.address);
        
        // Calculate expected total (both positions at 26/30 ratio)
        const expectedVotingPower1 = stakeAmount1 * 26n / 30n;
        const expectedVotingPower2 = stakeAmount2 * 26n / 30n;
        const totalExpectedVotingPower = expectedVotingPower1 + expectedVotingPower2;
        
        // Allow for small time decay
        expect(totalBalance).to.be.closeTo(totalExpectedVotingPower, totalExpectedVotingPower * 1n / 1000n);

        // Check number of positions
        const numPositions = await veVelvet.numPositions(user1.address);
        expect(numPositions).to.equal(2n);
    });

    it("Should handle toggleAutoRenew correctly", async () => {
        const { mockToken, veVelvet, user1 } = await setupTest();

        const stakeAmount = ethers.parseEther("100");
        const numWeeks = 26;

        // Approve and stake
        await mockToken.connect(user1).approve(veVelvet.target, stakeAmount);
        await veVelvet.connect(user1).stake(stakeAmount, numWeeks, false);

        // Get position ID
        const positions = await veVelvet.getPositions(user1.address, 0, 1);
        const positionId = positions[0].id;

        // Check initial voting power (should be around 26/30 of stake amount)
        const initialBalance = await veVelvet.balanceOf(user1.address);
        const expectedInitial = stakeAmount * 26n / 30n;
        expect(initialBalance).to.be.closeTo(expectedInitial, expectedInitial * 1n / 1000n);

        // Toggle auto-renew ON
        await veVelvet.connect(user1).toggleAutoRenew(positionId);

        // Check voting power after toggle (should be full amount)
        const balanceAfterToggle = await veVelvet.balanceOf(user1.address);
        expect(balanceAfterToggle).to.equal(stakeAmount);

        // Fast forward time
        await time.increase(10 * 7 * 24 * 60 * 60); // 10 weeks

        // Check voting power is still full (auto-renew maintains it)
        const balanceAfterTime = await veVelvet.balanceOf(user1.address);
        expect(balanceAfterTime).to.equal(stakeAmount);
    });

    it("Should handle voting power decay over time", async () => {
        const { mockToken, veVelvet, user1 } = await setupTest();

        const stakeAmount = ethers.parseEther("100");
        const numWeeks = 26;

        // Approve and stake
        await mockToken.connect(user1).approve(veVelvet.target, stakeAmount);
        await veVelvet.connect(user1).stake(stakeAmount, numWeeks, false);

        // Get initial voting power
        const initialBalance = await veVelvet.balanceOf(user1.address);
        const expectedInitial = stakeAmount * 26n / 30n;
        expect(initialBalance).to.be.closeTo(expectedInitial, expectedInitial * 1n / 1000n);

        // Fast forward half the lock duration
        await time.increase(13 * 7 * 24 * 60 * 60); // 13 weeks (half of 26)

        // Check voting power has decayed
        const balanceAfterHalf = await veVelvet.balanceOf(user1.address);
        expect(balanceAfterHalf).to.be.lt(initialBalance);
        expect(balanceAfterHalf).to.be.gt(0n);

        // Fast forward time to 13 weeks
        await time.increase(13 * 7 * 24 * 60 * 60);

        // Check voting power is zero (lock expired)
        const balanceAfterExpiry = await veVelvet.balanceOf(user1.address);
        expect(balanceAfterExpiry).to.equal(0n);
    });
}); 