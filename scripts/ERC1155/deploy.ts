import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  const balance = await owner.getBalance();
  console.log(balance.toString());
  const Articles = await ethers.getContractFactory("Articles");
  const articles = await Articles.deploy();
  await articles.deployed();
  console.log("Articles deployed to:", articles.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// on mumbai 0x7B262522e042AA846cE7CD24d978ae35a02A3C4C
