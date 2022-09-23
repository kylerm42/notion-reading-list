const express = require("express");
const app = express();
const { fetchAndUpdate } = require("./modules");
require("dotenv").config();

async function main() {
  if (!process.env.NOTION_API_KEY || !process.env.DATABASE_ID) {
    throw new Error("Please fill in your API key and database ID in repl.it");
  }

  app.get("/", (_req, res) => {
    res.sendFile(__dirname + "/index.html");
  });

  app.get("/fetch", async (_req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.json(await fetchAndUpdate());
  });

  app.listen(process.env.PORT || 8080, () => {
    console.log("Server started");
  });
}

main().catch(async (e) => {
  logger.error("Error from main function", e);
  throw e;
});
