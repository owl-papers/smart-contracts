import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  const ReviewHandler = await ethers.getContractFactory("ReviewHandler");
  const reviewHandler = ReviewHandler.connect(owner).attach(
    "0x00C4BE16D2A3Fd3FBa82fd3a8b3c1BF97F5B21F2"
  );
  const randomNumber = await reviewHandler.randomValue();
  console.log(randomNumber.toString());
}

// We recommend this pattern to be able to use async/await everywhere

// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
