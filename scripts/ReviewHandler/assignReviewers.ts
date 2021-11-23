import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  const ReviewHandler = await ethers.getContractFactory("ReviewHandler");
  const reviewHandler = ReviewHandler.connect(owner).attach(
    "0x34d1d16244D2765f6d65F4A781CCFCE951c3a76c"
  );

  const randomNumber = await reviewHandler.randomValue();
  console.log(randomNumber.toString());

  // console.log(reviewHandler.selectedReviewers(0));
  // console.log(reviewHandler.selectedReviewers(1));
  const result = await reviewHandler.getSelectedReviewers();
  const position0 = await reviewHandler.selectedReviewers(0);
  console.log(position0.toString());
  console.log(result.toString());
}

// We recommend this pattern to be able to use async/await everywhere

// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
