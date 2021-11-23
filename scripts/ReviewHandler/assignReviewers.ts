import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  const ReviewHandler = await ethers.getContractFactory("ReviewHandler");
  const reviewHandler = ReviewHandler.connect(owner).attach(
    "0xCA4D5e4C466100C3bBf407e28Cb5f8Fa1aD8C7dC"
  );

  const randomNumber = await reviewHandler.randomValue();
  console.log(randomNumber.toString());

  const result = await reviewHandler.getSelectedReviewers();
  console.log(result.toString());
}

// We recommend this pattern to be able to use async/await everywhere

// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
