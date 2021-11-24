import { expect } from "chai";
import { ethers } from "hardhat";
import { Articles, PrototypeReviewHandler } from "../typechain";

describe("Review Handler", function () {
  let reviewHandler: PrototypeReviewHandler;
  let articles: Articles;

  it("should connect to reviewer article", async () => {
    const Articles = await ethers.getContractFactory("Articles");
    articles = await Articles.deploy();
    await articles.deployed();
  });

  it("Should deploy PrototypeReviewHandler", async () => {
    const [owner] = await ethers.getSigners();
    const PrototypeReviewHandler = await ethers.getContractFactory(
      "PrototypeReviewHandler"
    );
    reviewHandler = await PrototypeReviewHandler.connect(owner).deploy(
      "0x8C7382F9D8f56b33781fE506E897a4F1e2d17255",
      "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
      "0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4",
      ethers.utils.parseUnits("0.011", "ether")
    );
    await reviewHandler.deployed();
    console.log("deployed to:", reviewHandler.address);
  });

  it("Should send some ether value", async () => {
    const [owner] = await ethers.getSigners();
    await reviewHandler.connect(owner).accReward({
      value: ethers.utils.parseUnits("2", "ether"),
    });
  });

  // it("Should fund contract with LINK", async () => {
  //   const [owner] = await ethers.getSigners();

  //   linkTokenContract = await new ethers.Contract(
  //     "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
  //     LinkTokenAbi,
  //     owner
  //   );
  //   const res = await linkTokenContract.connect(owner).balanceOf(owner.address);
  //   console.log(res.toString());
  //   const tx1 = await linkTokenContract
  //     .connect(owner)
  //     .transfer(reviewHandler.address, ethers.utils.parseUnits("0.1", "ether"));
  //   await tx1.wait();
  // });

  it("PrototypeReviewHandler creator should send an paper NFT to be reviewed", async () => {
    const [owner] = await ethers.getSigners();

    const res = await articles
      .connect(owner)
      .create(
        "10",
        "ipfs://bafyreibfwky2egu4s3irpwqwsktepknz6htv6yae5236lbtkyffnlg4kau/metadata.json"
      );
    await res.wait();
    const lastId = await articles.getLatestId();
    console.log("latestId", lastId.toString());

    const toReview = await reviewHandler.setPaperToReview(
      articles.address,
      lastId.sub(1).toString()
    );
    await toReview.wait();
  });

  it("should allow 10 wallets to register as reviewers", async () => {
    const accounts = await ethers.getSigners();

    for (let i = 1; i < 9; i++) {
      const res = await reviewHandler.connect(accounts[i]).joinAsReviewer();
      await res.wait();
    }
  });

  it("Should call getRandomNumber and it should set the randomValue", async () => {
    const [owner] = await ethers.getSigners();
    const tx1 = await reviewHandler.connect(owner).getRandomNumber();
    await tx1.wait();
    const randomNumber = await reviewHandler.randomValue();
    console.log(randomNumber.toString());
  });

  let reviewers: string[] = [];
  it("should allow author to get assign reviewers", async () => {
    const [owner] = await ethers.getSigners();
    const tx1 = await reviewHandler.connect(owner).assignReviewers();
    await tx1.wait();
    reviewers = await reviewHandler.getSelectedReviewers();
  });

  it("Reviewers should be able to send reviews", async () => {
    const accounts = await ethers.getSigners();

    for (let i = 1; i < 9; i++) {
      if (reviewers.indexOf(accounts[i].address) >= 0) {
        const articleCreation = await articles
          .connect(accounts[i])
          .create(
            "1",
            "ipfs://bafyreibfwky2egu4s3irpwqwsktepknz6htv6yae5236lbtkyffnlg4kau/metadata.json"
          );
        await articleCreation.wait();
        const latestId = await articles.getLatestId();
        await reviewHandler
          .connect(accounts[i])
          .sendReview(articles.address, latestId.sub(1).toString());
      }
    }
  });

  it("Reviewers should claim their reward for reviewing", async () => {
    const accounts = await ethers.getSigners();
    for (let i = 1; i < 9; i++) {
      if (reviewers.indexOf(accounts[i].address) >= 0) {
        const balanceBefore = await accounts[i].getBalance();
        await reviewHandler.connect(accounts[i]).claimReward();
        const balanceAfter = await accounts[i].getBalance();
        expect(balanceAfter).to.be.not.equal(balanceBefore);
      }
    }
  });
});
