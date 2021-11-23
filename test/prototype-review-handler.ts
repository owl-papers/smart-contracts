import { expect } from "chai";
import { ethers } from "hardhat";
import { PrototypeReviewHandler } from "../typechain";
// this file is intended for testing in mumbai testnet

describe("Prototype Review Handler", function () {
  let reviewHandler: PrototypeReviewHandler;

  it("Should deploy PrototypeReviewHandler", async () => {
    const [owner] = await ethers.getSigners();
    const ReviewHandler = await ethers.getContractFactory(
      "PrototypeReviewHandler"
    );
    reviewHandler = await ReviewHandler.connect(owner).deploy();
    await reviewHandler.deployed();
    console.log("deployed to:", reviewHandler.address);
  });

  it("should allow 5 wallets to register as reviewers", async () => {
    const [owner, addr1, addr2, addr3, addr4, addr5] =
      await ethers.getSigners();

    const tx1 = await reviewHandler.connect(addr1).joinAsReviewer();
    const tx2 = await reviewHandler.connect(addr2).joinAsReviewer();
    const tx3 = await reviewHandler.connect(addr3).joinAsReviewer();
    const tx4 = await reviewHandler.connect(addr4).joinAsReviewer();
    const tx5 = await reviewHandler.connect(addr5).joinAsReviewer();

    await tx1.wait();
    await tx2.wait();
    await tx3.wait();
    await tx4.wait();
    await tx5.wait();
  });

  it("Should execute assignReviewers", async () => {
    await reviewHandler.fullfill();
    const tx = await reviewHandler.assignReviewers();
    await tx.wait();
  });

  it("should get the list of reviewers assigned", async () => {
    const res = await reviewHandler.getSelectedReviewers();
    const addresses = res.toString().split(",");
    console.log(addresses);
  });
});
