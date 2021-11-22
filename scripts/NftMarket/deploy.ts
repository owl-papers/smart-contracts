import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  const balance = await owner.getBalance();
  console.log(balance.toString());
  const NftMarket = await ethers.getContractFactory("NFTMarket");
  const market = await NftMarket.deploy();
  await market.deployed();
  console.log("NftMarket deployed to:", market.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// on mumbai 0x5C7a5b0299C8df60949566eCA63e05800e90109F
