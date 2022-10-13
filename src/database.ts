import * as notion from "@notionhq/client";
import { UpdateDatabaseParameters } from "@notionhq/client/build/src/api-endpoints";

const defaultFields: NonNullable<UpdateDatabaseParameters["properties"]> = {
  "Autofetch Status": { checkbox: {} },
  "Autofetch Key": { number: {} },
  "Original Title": { rich_text: {} },
  "Updated At": { last_edited_time: {} },
  "Author(s)": { multi_select: {} },
  "Genre(s)": { multi_select: {} },
  Description: { rich_text: {} },
  Link: { url: {} },
  Pages: { number: {} },
  Rating: { number: {} },
};

export async function ensureDatabasePropertiesExist(
  client: notion.Client,
  databaseId: string
) {
  console.info("Checking for necessary database properties...");
  const database = await client.databases.retrieve({ database_id: databaseId });
  const missingFields = Object.fromEntries(
    Object.entries(defaultFields).filter(
      ([field]) => !Object.keys(database.properties).includes(field)
    )
  );

  if (Object.keys(missingFields).length) {
    console.log(
      `Creating missing fields: ${Object.keys(missingFields).join(", ")}`
    );
    return client.databases.update({
      database_id: databaseId,
      properties: missingFields,
    });
  }
}
