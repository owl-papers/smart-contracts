import { NFTStorage, File } from "nft.storage";
import * as fs from "fs/promises";
import path from "path";
const apiKey = String(process.env.NFT_STORAGE_API_KEY);
const client = new NFTStorage({ token: apiKey });

const names = [
  "Study about of genetic of colors and bread",
  "Industrial uses for sea shells on the sea Shore",
  "New paradigms in cryptography",
  "An approach for classification of types of bananas using neural networks",
  "DNA sequencing using some king of new approach that no one has definetly tried before",
  "Water purification using horse hairs",
  "Study on reverting SHA family hashes considerably fast",
  "Matching dogs and cats DNA",
  "Merging human and machine as one",
  "Hybrid smart contracts and it's consequences for the future",
  "A bunch of statistics about reproduction of racoons",
];

async function storeImage() {
  const content = await fs.readFile(
    path.resolve(__dirname, "../images/owl_articles.png")
  );

  const promisesToAwait: Promise<any>[] = [];

  names.forEach((name) => {
    promisesToAwait.push(
      client.store({
        name,
        description: `At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.`,
        image: new File([content], "owl_articles.png", { type: "image/*" }),
      })
    );
  });

  const responses = await Promise.all(promisesToAwait);
  console.log(responses);
}

async function main() {
  await storeImage();
}

main();

// feito o deploy do URI

// [
//   Token {
//     ipnft: 'bafyreigosgj3ywdtl27isdjw2gqgyq5wc6ddmtfi4padzgf4g4yzhocn4q',
//     url: 'ipfs://bafyreigosgj3ywdtl27isdjw2gqgyq5wc6ddmtfi4padzgf4g4yzhocn4q/metadata.json'
//   },
//   Token {
//     ipnft: 'bafyreicf46sn6mw4zm6kutehtrrgfdzcfu3y4jqc6f2agjduimapepcghe',
//     url: 'ipfs://bafyreicf46sn6mw4zm6kutehtrrgfdzcfu3y4jqc6f2agjduimapepcghe/metadata.json'
//   },
//   Token {
//     ipnft: 'bafyreiejdv7v3uf5jiss5gn3ecdjh72ppq4k6n4lthjfm5kb7cdo7l6rae',
//     url: 'ipfs://bafyreiejdv7v3uf5jiss5gn3ecdjh72ppq4k6n4lthjfm5kb7cdo7l6rae/metadata.json'
//   },
//   Token {
//     ipnft: 'bafyreidyui3hgzksgxs7436n6rw6m6mlhkcvgab556pfmzwc2r5p5rzgfu',
//     url: 'ipfs://bafyreidyui3hgzksgxs7436n6rw6m6mlhkcvgab556pfmzwc2r5p5rzgfu/metadata.json'
//   },
//   Token {
//     ipnft: 'bafyreib6n2lwma3l4bczjlhjdzdwwvmrdjbpvdb6vgmpit3oe52bgxi4dm',
//     url: 'ipfs://bafyreib6n2lwma3l4bczjlhjdzdwwvmrdjbpvdb6vgmpit3oe52bgxi4dm/metadata.json'
//   },
//   Token {
//     ipnft: 'bafyreiaugrqt7ei64smti73muu63vew4m4l5gpa3guei3vhuv5gju5pv4e',
//     url: 'ipfs://bafyreiaugrqt7ei64smti73muu63vew4m4l5gpa3guei3vhuv5gju5pv4e/metadata.json'
//   },
//   Token {
//     ipnft: 'bafyreieotyp4zfrlavvv446v3uzhduwetxrqagjemts5yp6p52snrkpwfa',
//     url: 'ipfs://bafyreieotyp4zfrlavvv446v3uzhduwetxrqagjemts5yp6p52snrkpwfa/metadata.json'
//   },
//   Token {
//     ipnft: 'bafyreihhnezf2wanxqwdq5enghhhie2bakpgti5cn53y2bmo5zzi573fhu',
//     url: 'ipfs://bafyreihhnezf2wanxqwdq5enghhhie2bakpgti5cn53y2bmo5zzi573fhu/metadata.json'
//   },
//   Token {
//     ipnft: 'bafyreifeslhwtahikp2h3hpkctqj3n5pfbtv6ylkb5pfwphfrcatavzary',
//     url: 'ipfs://bafyreifeslhwtahikp2h3hpkctqj3n5pfbtv6ylkb5pfwphfrcatavzary/metadata.json'
//   },
//   Token {
//     ipnft: 'bafyreibr4jco2g6xg3n5nrnuscfin35ejqfihzwsluzyazqqn5dlbfg46u',
//     url: 'ipfs://bafyreibr4jco2g6xg3n5nrnuscfin35ejqfihzwsluzyazqqn5dlbfg46u/metadata.json'
//   },
//   Token {
//     ipnft: 'bafyreibfwky2egu4s3irpwqwsktepknz6htv6yae5236lbtkyffnlg4kau',
//     url: 'ipfs://bafyreibfwky2egu4s3irpwqwsktepknz6htv6yae5236lbtkyffnlg4kau/metadata.json'
//   }
// ]
