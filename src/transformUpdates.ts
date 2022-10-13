import { UpdatePageParameters } from "@notionhq/client/build/src/api-endpoints";
import { BookMeta, NotionBookPage } from "./types";

export function transformUpdate(
  notionBookPage: NotionBookPage,
  bookMeta: BookMeta,
  pageTitle: string,
  fetchKey: number | null
): UpdatePageParameters {
  const coverProp = bookMeta.coverImageUrl
    ? {
        cover: {
          external: {
            url: bookMeta.coverImageUrl,
          },
        },
      }
    : {};

  return {
    page_id: notionBookPage.id,

    properties: {
      Title: {
        title: [
          {
            type: "text",
            text: {
              content: bookMeta.title || pageTitle,
            },
          },
        ],
      },

      "Author(s)": {
        multi_select: (bookMeta.authors || []).map((author) => ({
          name: author.replace(",", ""),
        })),
      },

      "Genre(s)": {
        multi_select: (bookMeta.genres || []).map((x) => ({
          name: x.replace(",", ""),
        })),
      },

      Description: {
        rich_text: [
          {
            text: {
              content:
                (bookMeta.description || "").length < 500
                  ? bookMeta.description || ""
                  : bookMeta.description?.substring(0, 500) + "...",
            },
          },
        ],
      },

      Link: {
        url: bookMeta.link || "TODO: something needs to go here",
      },

      Pages: {
        number: bookMeta.pageCount ?? 0,
      },

      Rating: {
        number: bookMeta.rating ?? 0,
      },

      "Autofetch Status": {
        checkbox: true,
      },

      "Autofetch Key": {
        number: fetchKey ?? 0,
      },

      "Original Title": {
        rich_text: [{ text: { content: pageTitle } }],
      },
    },

    icon: bookMeta.iconImageUrl
      ? {
          external: {
            url: bookMeta.iconImageUrl,
          },
        }
      : {
          emoji: "📖",
        },

    ...coverProp,
  };
}

export function transformErrorUpdate(
  notionBookPage: NotionBookPage,
  description: string
) {
  return {
    page_id: notionBookPage.id,

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
