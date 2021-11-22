import * as fs from "fs/promises";
import path from "path";
import axios from "axios";
import { FormData } from "nft.storage";

const pinataApiKey = String(process.env.PINATA_API_KEY);
const pinataSecretKey = String(process.env.PINATA_APP_SECRET);
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

  // we gather a local file for this example, but any valid readStream source will work here.
  const data = new FormData();
  data.append(
    "file",
    fs.createReadStream(path.resolve(__dirname, "../images/owl_articles.png"))
  );

  // You'll need to make sure that the metadata is in the form of a JSON object that's been convered to a string
  // metadata is optional
  const metadata = JSON.stringify({
    name: "testname",
    keyvalues: {
      exampleKey: "exampleValue",
    },
  });
  data.append("pinataMetadata", metadata);
  // pinataOptions are optional
  const pinataOptions = JSON.stringify({
    cidVersion: 0,
    customPinPolicy: {
      regions: [
        {
          id: "FRA1",
          desiredReplicationCount: 1,
        },
        {
          id: "NYC1",
          desiredReplicationCount: 2,
        },
      ],
    },
  });

  data.append("pinataOptions", pinataOptions);
  console.log(data);

  const result = axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    data,
    {
      maxBodyLength: "Infinity", // this is needed to prevent axios from erroring out with large files
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretKey,
      },
    }
  );

  console.log(result);
}

async function main() {
  await storeImage();
}

main();
