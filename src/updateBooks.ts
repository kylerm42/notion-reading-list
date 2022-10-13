import * as notion from "@notionhq/client";
import { Env } from "./config";
import fetchBookMeta from "./bookMeta";
import { NotionBookPage } from "./types";
import { transformErrorUpdate, transformUpdate } from "./transformUpdates";
import { ensureDatabasePropertiesExist } from "./database";

export default async function updateBooks(client: notion.Client, config: Env) {
  const now = new Date();
  now.setMinutes(now.getMinutes() - 1);
  const notionResponse = (await notion.collectPaginatedAPI(
    client.databases.query,
    {
      database_id: config.notionDatabaseId,
      filter: {
        and: [
          {
            property: "Autofetch Status",
            checkbox: {
              equals: false,
            },
          },
          {
            property: "Updated At",
            date: {
              on_or_before: now.toISOString(),
            },
          },
        ],
      },
    }
  )) as unknown as NotionBookPage[];
  console.info(`Found ${notionResponse.length} book(s) to update`);

  for (const notionBookPage of notionResponse) {
    console.log(notionBookPage.properties["Original Title"]);
    const pageTitle =
      notionBookPage.properties["Original Title"].rich_text[0].text.content ||
      notionBookPage.properties.Title.title[0].plain_text;
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
      } else if (
        e.code === notion.APIErrorCode.ValidationError &&
        (e.message as string).includes("is not a property that exists")
      ) {
        ensureDatabasePropertiesExist(client, config.notionDatabaseId);
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

  setTimeout(() => updateBooks(client, config), config.fetchInterval * 1000);
}

// TODO:
// update readme
// handle double no results found
