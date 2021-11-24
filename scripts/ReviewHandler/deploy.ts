// this code is intended for testing in mumbai testnet
import { ethers } from "hardhat";
import LinkTokenAbi from "../../abis/LinkToken";

async function main() {
  const [owner] = await ethers.getSigners();
  const ReviewHandler = await ethers.getContractFactory("ReviewHandler");
  const reviewHandler = await ReviewHandler.connect(owner).deploy(
    "0x8C7382F9D8f56b33781fE506E897a4F1e2d17255",
    "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
    "0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4",
    ethers.utils.parseUnits("0.011", "ether")
  );
  await reviewHandler.deployed();
  console.log("deployed to:", reviewHandler.address);

  // funds contract with link:
  const linkTokenContract = await new ethers.Contract(
    "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
    LinkTokenAbi,
    owner
  );
  const res = await linkTokenContract.connect(owner).balanceOf(owner.address);
  console.log("link balance:", res.toString());
  const tx1 = await linkTokenContract
    .connect(owner)
    .transfer(reviewHandler.address, ethers.utils.parseUnits("0.1", "ether"));
  await tx1.wait();

  // sets the random number from VRF.
  const tx2 = await reviewHandler.connect(owner).getRandomNumber();
  await tx2.wait();
}

// We recommend this pattern to be able to use async/await everywhere

// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
