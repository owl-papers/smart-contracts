import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  const ReviewHandler = await ethers.getContractFactory("ReviewHandler");
  const reviewHandler = ReviewHandler.connect(owner).attach(
    "0x4f871213D796748b158E62098e8F60D9Dcde9fa6"
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
