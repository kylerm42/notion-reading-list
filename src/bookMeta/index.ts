import { BookMeta, FetchMetaParams } from "../types";
import fetchGBooks from "./fetchGoogleBooks";
import fetchOpenLibrary from "./fetchOpenLibrary";

export default async function fetchBookMeta(
  fetchParams: FetchMetaParams
): Promise<BookMeta> {
  console.info(
    `Fetching ${fetchParams.pageTitle}, key ${fetchParams.fetchKey}`
  );

  const openLibraryMeta = await fetchOpenLibrary(fetchParams);
  const gbooksMeta = await fetchGBooks(fetchParams);

  return { ...gbooksMeta, ...openLibraryMeta };
}
