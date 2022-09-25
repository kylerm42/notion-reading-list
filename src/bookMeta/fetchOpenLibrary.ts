import {
  BookMeta,
  FetchMetaParams,
  OpenLibraryItem,
  OpenLibraryResponse,
} from "../types";

export default async function fetchOpenLibrary({
  pageTitle,
  authors,
  fetchKey,
}: FetchMetaParams) {
  const openLibraryUrl = authors.length
    ? `http://openlibrary.org/search.json?title=${encodeURIComponent(
        pageTitle
      )}&author=${encodeURIComponent(authors.join(","))}`
    : `http://openlibrary.org/search.json?q=${encodeURIComponent(pageTitle)}`;

  const openlibraryResponse: OpenLibraryResponse = await (
    await fetch(openLibraryUrl)
  ).json();

  if (!openlibraryResponse.numFound) {
    console.warn(`No Open Library results found for ${pageTitle}`);
    return { title: pageTitle };
  }

  const openLibraryItem = openlibraryResponse.docs[fetchKey ?? 0];

  return transformOpenLibraryItem(openLibraryItem);
}

function transformOpenLibraryItem(openLibraryItem: OpenLibraryItem): BookMeta {
  const isbn = openLibraryItem.isbn[0];
  return {
    title: openLibraryItem.title,
    isbn,
    authors: openLibraryItem.author_name,
    link: `https://openlibrary.org/isbn/${isbn}`,
    pageCount: openLibraryItem.number_of_pages_median,
    coverImageUrl: `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`,
    iconImageUrl: `https://covers.openlibrary.org/b/isbn/${isbn}-S.jpg`,
  };
}
