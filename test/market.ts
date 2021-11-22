import { expect } from "chai";
import { ethers } from "hardhat";
import { Articles, NFTMarket } from "../typechain";

describe("Article Marketplace", function () {
  let articles: Articles;
  let market: NFTMarket;

  it("Should deploy ERC1155", async () => {
    const Articles = await ethers.getContractFactory("Articles");
    articles = await Articles.deploy();
    await articles.deployed();
    expect(articles).to.not.be.undefined;
    expect((await articles.getLatestId()).toString()).to.be.equal("0");
  });

  it("Should deploy NFTMarketplace", async () => {
    const Market = await ethers.getContractFactory("NFTMarket");
    market = await Market.deploy();
    await market.deployed();
    expect(market).to.not.be.undefined;
    expect((await market.getLatestItemId()).toString()).to.be.equal("0");
  });

  it("should be able to mint some NFTs with an URI", async () => {
    const [owner] = await ethers.getSigners();
    await articles
      .connect(owner)
      .create(
        10,
        "ipfs://bafyreicfzjkprrcv7uvogrj72tfspdeylb3axd6rxkssvbshllyc64xkni/metadata.json"
      );
    await articles
      .connect(owner)
      .create(
        100,
        "ipfs://bafyreibw75mqtwztq52fnbvdmsf2dvpw5g2jwyg47wl3n3e6zz5nk46dkm/metadata.json"
      );
    await articles
      .connect(owner)
      .create(
        2000,
        "ipfs://bafyreibw75mqtwztq52fnbvdmsf2dvpw5g2jwyg47wl3n3e6zz5nk46dkm/metadata.json"
      );
  });

  it("wallet should be able to puts it's nfts on sell", async () => {
    const [owner] = await ethers.getSigners();
    await articles.connect(owner).setApprovalForAll(market.address, true);
    await market
      .connect(owner)
      .sell(articles.address, "0", ethers.BigNumber.from(10), 1);
    const balance = await articles.balanceOf(owner.address, "0");
    expect(balance.toString()).to.be.equal("9");
  });

  it("wallet should be able to buy some of the nfts", async () => {
    const [owner, addr2] = await ethers.getSigners();
    await market.connect(addr2).buy("0", "1", { value: 10 });
    const balance = await articles.balanceOf(addr2.address, "0");
    expect(balance.toString()).to.be.equal("1");
  });
});
