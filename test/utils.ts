import { BigNumberish } from "ethers";

const DENOM = 10000n; // 1e18

export function calculateVotingPower(
    value: bigint,
    decayRate: bigint,
    elapsed: bigint
): bigint {
    // value - (elapsed * decayRate) / DENOM
    return value - (elapsed * decayRate) / DENOM;
}

// Helper function to calculate decay rate for a given duration
export function calculateDecayRate(
    value: bigint,
    duration: bigint
): bigint {
    // decayRate = (value * DENOM) / duration
    return (value * DENOM) / duration;
}
