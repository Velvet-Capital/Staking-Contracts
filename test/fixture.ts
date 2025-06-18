import { ethers, deployments } from "hardhat";
import { Signer } from "ethers";


export async function setupTest() {
    await deployments.fixture(["MockERC20", "veVirtual"]);
    
    const [deployer, user1, user2] = await ethers.getSigners();
    
    const mockToken = await getContract("MockERC20", deployer);
    const veVirtual = await getContract("veVirtual", deployer);
    
    // Transfer initial tokens to users
    await mockToken.transfer(user1.address, ethers.parseEther("1000"));
    await mockToken.transfer(user2.address, ethers.parseEther("1000"));
    
    return {
        mockToken,
        veVirtual,
        deployer,
        user1,
        user2
    };
} 

async function getContract(name: string, signer?: Signer) {
    const c = await deployments.get(name);
    return await ethers.getContractAt(c.abi, c.address, signer);
}