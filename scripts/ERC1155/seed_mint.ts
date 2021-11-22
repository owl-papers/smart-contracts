import { ethers } from "hardhat";

const uris = [
  {
    ipnft: "bafyreigosgj3ywdtl27isdjw2gqgyq5wc6ddmtfi4padzgf4g4yzhocn4q",
    url: "ipfs://bafyreigosgj3ywdtl27isdjw2gqgyq5wc6ddmtfi4padzgf4g4yzhocn4q/metadata.json",
  },
  {
    ipnft: "bafyreicf46sn6mw4zm6kutehtrrgfdzcfu3y4jqc6f2agjduimapepcghe",
    url: "ipfs://bafyreicf46sn6mw4zm6kutehtrrgfdzcfu3y4jqc6f2agjduimapepcghe/metadata.json",
  },
  {
    ipnft: "bafyreiejdv7v3uf5jiss5gn3ecdjh72ppq4k6n4lthjfm5kb7cdo7l6rae",
    url: "ipfs://bafyreiejdv7v3uf5jiss5gn3ecdjh72ppq4k6n4lthjfm5kb7cdo7l6rae/metadata.json",
  },
  {
    ipnft: "bafyreidyui3hgzksgxs7436n6rw6m6mlhkcvgab556pfmzwc2r5p5rzgfu",
    url: "ipfs://bafyreidyui3hgzksgxs7436n6rw6m6mlhkcvgab556pfmzwc2r5p5rzgfu/metadata.json",
  },
  {
    ipnft: "bafyreib6n2lwma3l4bczjlhjdzdwwvmrdjbpvdb6vgmpit3oe52bgxi4dm",
    url: "ipfs://bafyreib6n2lwma3l4bczjlhjdzdwwvmrdjbpvdb6vgmpit3oe52bgxi4dm/metadata.json",
  },
  {
    ipnft: "bafyreiaugrqt7ei64smti73muu63vew4m4l5gpa3guei3vhuv5gju5pv4e",
    url: "ipfs://bafyreiaugrqt7ei64smti73muu63vew4m4l5gpa3guei3vhuv5gju5pv4e/metadata.json",
  },
  {
    ipnft: "bafyreieotyp4zfrlavvv446v3uzhduwetxrqagjemts5yp6p52snrkpwfa",
    url: "ipfs://bafyreieotyp4zfrlavvv446v3uzhduwetxrqagjemts5yp6p52snrkpwfa/metadata.json",
  },
  {
    ipnft: "bafyreihhnezf2wanxqwdq5enghhhie2bakpgti5cn53y2bmo5zzi573fhu",
    url: "ipfs://bafyreihhnezf2wanxqwdq5enghhhie2bakpgti5cn53y2bmo5zzi573fhu/metadata.json",
  },
  {
    ipnft: "bafyreifeslhwtahikp2h3hpkctqj3n5pfbtv6ylkb5pfwphfrcatavzary",
    url: "ipfs://bafyreifeslhwtahikp2h3hpkctqj3n5pfbtv6ylkb5pfwphfrcatavzary/metadata.json",
  },
  {
    ipnft: "bafyreibr4jco2g6xg3n5nrnuscfin35ejqfihzwsluzyazqqn5dlbfg46u",
    url: "ipfs://bafyreibr4jco2g6xg3n5nrnuscfin35ejqfihzwsluzyazqqn5dlbfg46u/metadata.json",
  },
  {
    ipnft: "bafyreibfwky2egu4s3irpwqwsktepknz6htv6yae5236lbtkyffnlg4kau",
    url: "ipfs://bafyreibfwky2egu4s3irpwqwsktepknz6htv6yae5236lbtkyffnlg4kau/metadata.json",
  },
];

async function main() {
  const [owner] = await ethers.getSigners();
  const balance = await owner.getBalance();
  console.log(balance.toString());
  const Articles = await ethers.getContractFactory("Articles");
  const articles = Articles.attach(
    String(process.env.ARTICLES_ADDRESS_MUMBAI) // address in mumbai
  );
  const lastId = await articles.getLatestId();
  console.log("latestId", lastId.toString());

  // mint a few NFTs:
  // const promisesToAwait: Promise<any>[] = [];
  // uris.forEach((uri) => {
  //   promisesToAwait.push(articles.create("10", uri.url));
  // });
  // const responses = await Promise.all(promisesToAwait);
  // console.log(responses);w
  articles.create("10", uris[0].url);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// on mumbai 0xd822B99D59816Ba967a0CE56790147bfaBbAB7AC
