import * as notion from "@notionhq/client";
import { validateEnv } from "./config";
import { ensureDatabasePropertiesExist } from "./database";
import updateBooks from "./updateBooks";

function main() {
  const config = validateEnv();
  const client = new notion.Client({ auth: config.notionApiKey });
  ensureDatabasePropertiesExist(client, config.notionDatabaseId);

  let errorCount = 0;
  try {
    updateBooks(client, config);
  } catch (e: any) {
    errorCount += 1;
    console.warn(`Error count: ${errorCount}`);
    console.warn(e);
    if (errorCount >= 10) {
      throw e;
    } else {
      updateBooks(client, config);
    }
  }
}

main();
