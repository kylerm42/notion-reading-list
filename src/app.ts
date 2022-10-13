import * as notion from "@notionhq/client";
import { validateEnv } from "./config";
import { ensureDatabasePropertiesExist } from "./database";
import updateBooks from "./updateBooks";

function main() {
  const config = validateEnv();
  const client = new notion.Client({ auth: config.notionApiKey });
  ensureDatabasePropertiesExist(client, config.notionDatabaseId);

  updateBooks(client, config);
}

main();
