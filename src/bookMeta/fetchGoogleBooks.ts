import {
  BookMeta,
  FetchMetaParams,
  GBooksItem,
  GBooksResponse,
} from "../types";
import fetch from "node-fetch";

export default async function fetchGBooks({
  pageTitle,
  authors,
  fetchKey,
}: FetchMetaParams): Promise<BookMeta> {
  const gbooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
    `${pageTitle} ${authors.join(",")}`
  )}`;
  const gbooksResponse: GBooksResponse = await (await fetch(gbooksUrl)).json();

  if (!gbooksResponse.totalItems) {
    console.warn(`No Google Books results found for ${pageTitle}`);
    return { title: pageTitle };
  }

  const gbooksItem = gbooksResponse.items[fetchKey ?? 0];

  return transformGBooksItem(gbooksItem);
}

function transformGBooksItem(gbooksItem: GBooksItem): BookMeta {
  const isbn = gbooksItem.volumeInfo.industryIdentifiers.find((isbn) =>
    ["ISBN_10", "ISBN_13"].includes(isbn.type)
  )?.identifier;

  return {
    title: gbooksItem.volumeInfo.title,
    isbn,
    authors: gbooksItem.volumeInfo.authors,
    link: gbooksItem.volumeInfo.infoLink,
    pageCount: gbooksItem.volumeInfo.pageCount,
    coverImageUrl: `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`,
    iconImageUrl: `https://covers.openlibrary.org/b/isbn/${isbn}-S.jpg`,
    genres: gbooksItem.volumeInfo.categories,
    rating: gbooksItem.volumeInfo.averageRating,
  };
}
