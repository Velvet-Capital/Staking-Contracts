import { expect } from "chai";
import { ethers } from "hardhat";
import { setupTest } from "./fixture";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { calculateVotingPower, calculateDecayRate } from "./utils";

describe("veVirtual", function () {
    it("Should allow users to stake tokens", async () => {
        const { mockToken, veVirtual, user1 } = await setupTest();

        const stakeAmount = ethers.parseEther("100");
        const numWeeks = 26;

        // Check initial balances
        const initialTokenBalance = await mockToken.balanceOf(user1.address);
        expect(initialTokenBalance).to.equal(ethers.parseEther("1000"));
        const initialVeBalance = await veVirtual.balanceOf(user1.address);
        expect(initialVeBalance).to.equal(0n);

        // Approve and stake
        await mockToken.connect(user1).approve(veVirtual.target, stakeAmount);
        await veVirtual.connect(user1).stake(stakeAmount, numWeeks, false);

        // Check balances after stake
        const finalTokenBalance = await mockToken.balanceOf(user1.address);
        expect(finalTokenBalance).to.equal(ethers.parseEther("900"));
        const finalVeBalance = await veVirtual.balanceOf(user1.address);
        expect(finalVeBalance).to.equal(stakeAmount * 26n/30n); // 26 weeks = 50% of max voting power
    });

    it("Should allow users to withdraw after lock period", async () => {
        const { mockToken, veVirtual, user1 } = await setupTest();

        const stakeAmount = ethers.parseEther("100");
        const numWeeks = 1;

        // Approve and stake
        await mockToken.connect(user1).approve(veVirtual.target, stakeAmount);
        await veVirtual.connect(user1).stake(stakeAmount, numWeeks, false);

        // Fast forward time
        await time.increase(7 * 24 * 60 * 60); // 1 week

        // Get position ID
        const positions = await veVirtual.getPositions(user1.address, 0, 1);
        const positionId = positions[0].id;

        // Check balances before withdrawal
        const balanceBefore = await mockToken.balanceOf(user1.address);
        expect(balanceBefore).to.equal(ethers.parseEther("900"));

        // Withdraw
        await veVirtual.connect(user1).withdraw(positionId);

        // Check balances after withdrawal
        const balanceAfter = await mockToken.balanceOf(user1.address);
        expect(balanceAfter).to.equal(ethers.parseEther("1000"));
        const veBalance = await veVirtual.balanceOf(user1.address);
        expect(veBalance).to.equal(0n);
    });

    it("Should handle auto-renewal correctly", async () => {
        const { mockToken, veVirtual, user1 } = await setupTest();

        const stakeAmount = ethers.parseEther("100");
        const numWeeks = 26;

        // Approve and stake with auto-renewal
        await mockToken.connect(user1).approve(veVirtual.target, stakeAmount);
        await veVirtual.connect(user1).stake(stakeAmount, numWeeks, true);

        // Check initial balance
        const initialBalance = await veVirtual.balanceOf(user1.address);
        expect(initialBalance).to.equal(stakeAmount); // Full voting power with auto-renewal

        // Fast forward time
        await time.increase(26 * 7 * 24 * 60 * 60); // 26 weeks

        // Check balance after lock period
        const finalBalance = await veVirtual.balanceOf(user1.address);
        expect(finalBalance).to.equal(stakeAmount); // Should maintain full voting power
    });

    it("Should allow extending lock period", async () => {
        const { mockToken, veVirtual, user1 } = await setupTest();

        const stakeAmount = ethers.parseEther("100");
        const initialWeeks = 26;
        const extendWeeks = 2;

        // Approve and stake
        await mockToken.connect(user1).approve(veVirtual.target, stakeAmount);
        await veVirtual.connect(user1).stake(stakeAmount, initialWeeks, false);

        // Get position ID
        const positions = await veVirtual.getPositions(user1.address, 0, 1);
        const positionId = positions[0].id;

        // Extend lock
        await veVirtual.connect(user1).extend(positionId, extendWeeks);

        // Calculate expected voting power
        const duration = BigInt(39 * 7 * 24 * 60 * 60); // 39 weeks in seconds
        const decayRate = calculateDecayRate(stakeAmount*28n/30n, duration);
        const elapsed = 1n; // 1 second
        const expectedVotingPower = calculateVotingPower(stakeAmount*28n/30n, decayRate, elapsed);

        // Check voting power
        const balance = await veVirtual.balanceOf(user1.address);
        console.log("Expected voting power:", expectedVotingPower.toString());
        console.log("Actual voting power:", balance.toString());
        expect(balance).to.equal(expectedVotingPower);
    });

    it("Should handle multiple positions correctly", async () => {
        const { mockToken, veVirtual, user1 } = await setupTest();

        const stakeAmount1 = ethers.parseEther("100");
        const stakeAmount2 = ethers.parseEther("200");
        const numWeeks = 26;

        // First stake
        await mockToken.connect(user1).approve(veVirtual.target, stakeAmount1);
        await veVirtual.connect(user1).stake(stakeAmount1, numWeeks, false);

        // Second stake
        await mockToken.connect(user1).approve(veVirtual.target, stakeAmount2);
        await veVirtual.connect(user1).stake(stakeAmount2, numWeeks, false);

        // Calculate expected voting power for each position
        const duration = BigInt(numWeeks * 7 * 24 * 60 * 60); // weeks in seconds
        const decayRate1 = calculateDecayRate(stakeAmount1*26n/30n, duration);
        const decayRate2 = calculateDecayRate(stakeAmount2*26n/30n, duration);
        const elapsedTime1 = 2n; // 1 second
        const elapsedTime2 = 0n; // 1 second
        const expectedVotingPower1 = calculateVotingPower(stakeAmount1*26n/30n, decayRate1, elapsedTime1);
        const expectedVotingPower2 = calculateVotingPower(stakeAmount2*26n/30n, decayRate2, elapsedTime2);
        const totalExpectedVotingPower = expectedVotingPower1 + expectedVotingPower2;

        // Check total voting power
        const totalBalance = await veVirtual.balanceOf(user1.address);
        console.log("Expected total voting power:", totalExpectedVotingPower.toString());
        console.log("Actual total voting power:", totalBalance.toString());
        expect(totalBalance).to.equal(totalExpectedVotingPower);

        // Check number of positions
        const numPositions = await veVirtual.numPositions(user1.address);
        expect(numPositions).to.equal(2n);
    });
}); 