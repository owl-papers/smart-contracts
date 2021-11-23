import { expect } from "chai";
import { ethers } from "hardhat";
import { ReviewHandler } from "../typechain";
import LinkTokenAbi from "../abis/LinkToken";
// this file is intended for testing in mumbai testnet

describe("Review Handler", function () {
  let reviewHandler: ReviewHandler;
  let linkTokenContract: any;

  it("Should deploy ReviewHandler", async () => {
    const [owner] = await ethers.getSigners();
    const ReviewHandler = await ethers.getContractFactory("ReviewHandler");
    reviewHandler = await ReviewHandler.connect(owner).deploy(
      "0x8C7382F9D8f56b33781fE506E897a4F1e2d17255",
      "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
      "0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4",
      ethers.utils.parseUnits("0.011", "ether")
    );
    await reviewHandler.deployed();
    console.log("deployed to:", reviewHandler.address);
  });

  it("Should fund contract with LINK", async () => {
    const [owner] = await ethers.getSigners();

    linkTokenContract = await new ethers.Contract(
      "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
      LinkTokenAbi,
      owner
    );
    const res = await linkTokenContract.connect(owner).balanceOf(owner.address);
    console.log(res.toString());
    const tx1 = await linkTokenContract
      .connect(owner)
      .transfer(reviewHandler.address, "1000000000000000");
    await tx1.wait();
  });

  it("Should call getRandomNumber and it should set the randomValue", async () => {
    const [owner] = await ethers.getSigners();
    const tx1 = await reviewHandler.connect(owner).getRandomNumber();
    await tx1.wait();
    const randomNumber = await reviewHandler.randomValue();
    console.log(randomNumber.toString());
  });
});
