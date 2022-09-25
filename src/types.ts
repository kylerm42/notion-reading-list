export type NotionBookPage = {
  id: string;
  properties: {
    Title: { title: { plain_text: string }[] };
    "Author(s)": { multi_select: { name: string }[] };
    "Autofetch Status": { checkbox: boolean };
    "Autofetch Key": { number: number | null };
  };
};

export type BookMeta = {
  title: string;
  authors?: string[];
  genres?: string[];
  description?: string;
  link?: string;
  rating?: number;
  pageCount?: number;
  isbn?: string;
  coverImageUrl?: string;
  iconImageUrl?: string;
};

export type FetchMetaParams = {
  pageTitle: string;
  authors: string[];
  fetchKey: number | null;
};

export type GBooksResponse = {
  totalItems: number;
  items: GBooksItem[];
};

export type GBooksItem = {
  id: string;
  volumeInfo: {
    title: string;
    authors: string[];
    categories: string[];
    description: string;
    infoLink: string;
    averageRating?: number;
    pageCount?: number;
    industryIdentifiers: { type: string; identifier: string }[];
  };
};

export type OpenLibraryResponse = {
  numFound: number;
  docs: OpenLibraryItem[];
};

export type OpenLibraryItem = {
  title: string;
  number_of_pages_median: number;
  cover_i: number;
  author_name: string[];
  isbn: string[];
};
