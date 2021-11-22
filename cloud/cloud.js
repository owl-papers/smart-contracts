Moralis.Cloud.beforeSave("ArticlesMinted", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  async function httpGet2(uri) {
    return await Moralis.Cloud.httpRequest({
      method: "GET",
      url: `https://ipfs.moralis.io:2053/ipfs/${uri.replace("ipfs://", "")}`,
      headers: {
        method: "GET",
        accept: "application/json",
      },
    })
      .then((httpResponse) => {
        logger.info(httpResponse.text);
        const data = JSON.parse(httpResponse.text);
        return data;
      })
      .catch((error) => logger.info(error));
  }

  logger.info("here in articles Minted");

  const uri = request.object.get("uri");

  if (uri) {
    const data = await httpGet2(uri);
    request.object.set("name", String(data.name));
    request.object.set("description", String(data.description));
    request.object.set("image", String(data.image));
  } else {
    logger.error("failed to set");
  }
});
