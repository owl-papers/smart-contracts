import { expect } from "chai";
import { ethers } from "hardhat";
import { Articles } from "../typechain";

describe("Article ERC1155", function () {
  let articles: Articles;

  it("Should deploy ERC1155", async () => {
    const Articles = await ethers.getContractFactory("Articles");
    articles = await Articles.deploy();
    await articles.deployed();
    expect(articles).to.not.be.undefined;
    expect((await articles.getLatestId()).toString()).to.be.equal("0");
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
  });

  it("owner should be able to check all the NFTs that he owns", async () => {
    const [owner] = await ethers.getSigners();
    const lastId = await articles.getLatestId();

    const ids = Array.from({ length: lastId.toNumber() }, (v, k) => k);
    const balances = [];
    for (let i = 0; i < ids.length; i++)
      balances.push(
        (await articles.balanceOf(owner.address, ids[i])).toNumber()
      );

    expect(balances).deep.equal([10, 100]);
  });

  it("should be able to check total supply of a token", async () => {
    const totalBalance = await articles.totalSupply(0);
    expect(totalBalance).to.be.equal(10);
  });
});
