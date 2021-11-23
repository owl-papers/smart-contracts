import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  const ReviewHandler = await ethers.getContractFactory("ReviewHandler");
  const reviewHandler = ReviewHandler.connect(owner).attach(
    "0x0A31d74904804571cE89dF1A3Cc245fB52eA038C"
  );

  // // call this first. It takes a while so it's better to execute this script and
  // rerurn it with the line below commented.
  // await reviewHandler.assignReviewers();

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
