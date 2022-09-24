import * as notion from "@notionhq/client";
import { UpdatePageParameters } from "@notionhq/client/build/src/api-endpoints";
import fetch from "node-fetch";
import { Env } from "./config";
import { BookPage, GbookItem, GbookResponse } from "./types";

export async function fetchBooks(config: Env) {
  const client = new notion.Client({ auth: config.NOTION_API_KEY });

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
  )) as unknown as BookPage[];
  console.info(`Found ${notionResponse.length} book(s) to update`);

  for (const bookPage of notionResponse) {
    const pageTitle = bookPage.properties.Title.title[0].plain_text.replace(
      ";",
      ""
    );
    const fetchKey = bookPage.properties["Autofetch Key"].number;
    console.info(`Fetching ${pageTitle}, key ${fetchKey}`);

    const gbookUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      pageTitle +
        " " +
        bookPage.properties["Author(s)"].multi_select
          .map((x) => x.name)
          .join(", ")
    )}`;
    const gbookResponse: GbookResponse = await (await fetch(gbookUrl)).json();

    if (!gbookResponse.totalItems) {
      console.warn(`No results found for ${pageTitle}`);
      return;
    }

    const gbook = gbookResponse.items[fetchKey ?? 0];

    const updates = calculateUpdates(bookPage, gbook, fetchKey);

    try {
      await client.pages.update(updates);
    } catch (e1: any) {
      console.error(`Error on ${pageTitle}: [${e1.status}] ${e1.message}`);

      if (e1.status === 409) {
        console.log("Saving conflict, scheduling retry in 3 seconds");
        setTimeout(async () => {
          try {
            console.log(`Retrying ${pageTitle}`);
            await client.pages.update(updates);
          } catch (e2: any) {
            console.error(
              `Subsequent error while resolving saving conflict on ${pageTitle}: [${e2.status}] ${e2.message}`
            );
            await client.pages.update(
              calculateErrorUpdate(bookPage, `[${e2.status}] ${e2.message}`)
            );
          }
        }, config.FETCH_INTERVAL / 2);
      }
    }

    console.info(`Updated ${pageTitle}`);
  }

  setTimeout(() => fetchBooks(config), config.FETCH_INTERVAL);
}

function calculateUpdates(
  bookPage: BookPage,
  gbook: GbookItem,
  fetchKey: number | null
): UpdatePageParameters {
  const isbn = gbook.volumeInfo.industryIdentifiers.find((isbn) =>
    ["ISBN_10", "ISBN_13"].includes(isbn.type)
  )?.identifier;
  console.log(`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`);
  const coverProp = isbn
    ? {
        cover: {
          external: {
            url: `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`,
          },
        },
      }
    : {};

  return {
    page_id: bookPage.id,

    properties: {
      Title: {
        title: [
          {
            type: "text",
            text: {
              content:
                gbook.volumeInfo.title ||
                bookPage.properties.Title.title[0].plain_text.replace(";", ""),
            },
          },
        ],
      },

      "Author(s)": {
        multi_select: gbook.volumeInfo.authors.map((author) => ({
          name: author.replace(",", "'"),
        })),
      },

      "Genre(s)": {
        multi_select: (gbook.volumeInfo.categories || []).map((x) => ({
          name: x.replace(",", ""),
        })),
      },

      Description: {
        rich_text: [
          {
            text: {
              content:
                (gbook.volumeInfo.description || "").length < 500
                  ? gbook.volumeInfo.description || ""
                  : gbook.volumeInfo.description.substring(0, 500) + "...",
            },
          },
        ],
      },

      Link: {
        url: `https://openlibrary.org/isbn/${isbn}`,
      },

      Pages: {
        number: gbook.volumeInfo.pageCount ?? 0,
      },

      Rating: {
        number: gbook.volumeInfo.averageRating ?? 0,
      },

      "Autofetch Status": {
        checkbox: true,
      },

      "Autofetch Key": {
        number: fetchKey ?? 0,
      },
    },

    icon: isbn
      ? {
          external: {
            url: `https://covers.openlibrary.org/b/isbn/${isbn}-S.jpg`,
          },
        }
      : {
          emoji: "📖",
        },

    ...coverProp,
  };
}

function calculateErrorUpdate(bookPage: BookPage, description: string) {
  return {
    page_id: bookPage.id,

    properties: {
      Description: {
        rich_text: [
          {
            text: {
              content: `Book info could not be automatically fetched, ${description}`,
            },
          },
        ],
      },
      "Autofetch Status": {
        checkbox: true,
      },
    },
  };
}

// TODO:
// update readme
// figure out better google books results
