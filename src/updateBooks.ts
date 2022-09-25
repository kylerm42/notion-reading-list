import * as notion from "@notionhq/client";
import { Env } from "./config";
import fetchBookMeta from "./bookMeta";
import { NotionBookPage } from "./types";
import { transformErrorUpdate, transformUpdate } from "./transformUpdates";

export default async function updateBooks(config: Env) {
  const client = new notion.Client({ auth: config.NOTION_API_KEY });
  client.databases.update({
    database_id: config.NOTION_DATABASE_ID,
    properties: {
      "Autofetch Status": {
        checkbox: {},
      },
      "Autofetch Key": {
        number: {},
      },
    },
  });

  const notionResponse = (await notion.collectPaginatedAPI(
    client.databases.query,
    {
      database_id: config.NOTION_DATABASE_ID,
      filter: {
        property: "Autofetch Status",
        checkbox: {
          equals: false,
        },
      },
    }
  )) as unknown as NotionBookPage[];
  console.info(`Found ${notionResponse.length} book(s) to update`);

  for (const notionBookPage of notionResponse) {
    const pageTitle = notionBookPage.properties.Title.title[0].plain_text;
    const authors = notionBookPage.properties["Author(s)"].multi_select.map(
      (x) => x.name
    );
    const fetchKey = notionBookPage.properties["Autofetch Key"].number;

    const bookMeta = await fetchBookMeta({ pageTitle, authors, fetchKey });
    if (!bookMeta) {
      await client.pages.update(
        transformErrorUpdate(notionBookPage, "No results found")
      );
      continue;
    }

    const updates = transformUpdate(
      notionBookPage,
      bookMeta,
      pageTitle,
      fetchKey
    );

    try {
      await client.pages.update(updates);
    } catch (e: any) {
      console.error(`Error on ${pageTitle}: [${e.status}] ${e.message}`);
      if (e.status === 409) {
        continue;
      } else {
        await client.pages.update(
          transformErrorUpdate(notionBookPage, `[${e.status}] ${e.message}`)
        );
        continue;
      }
    }

    console.info(`Updated ${pageTitle}`);
  }

  setTimeout(() => updateBooks(config), config.FETCH_INTERVAL);
}

// TODO:
// update readme
// handle double no results found
