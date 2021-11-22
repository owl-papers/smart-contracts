import { ethers } from "hardhat";

const uris = [
  {
    ipnft: "bafyreib6n2lwma3l4bczjlhjdzdwwvmrdjbpvdb6vgmpit3oe52bgxi4dm",
    url: "ipfs://bafyreib6n2lwma3l4bczjlhjdzdwwvmrdjbpvdb6vgmpit3oe52bgxi4dm/metadata.json",
  },
];
async function main() {
  const [owner] = await ethers.getSigners();
  const balance = await owner.getBalance();
  console.log(balance.toString());
  const Market = await ethers.getContractFactory("NFTMarket");
  const market = Market.attach(String(process.env.MARKET_ADDRESS_MUMBAI));
  const Articles = await ethers.getContractFactory("Articles");
  const articles = Articles.attach(
    String(process.env.ARTICLES_ADDRESS_MUMBAI) // address in mumbai
  );
  await articles.connect(owner).create("10", uris[0].url);
  const latestId = await articles.getLatestId();

  articles.setApprovalForAll(market.address, true);
  market.sell(
    String(process.env.ARTICLES_ADDRESS_MUMBAI),
    latestId.toString(),
    "1009",
    "5"
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
