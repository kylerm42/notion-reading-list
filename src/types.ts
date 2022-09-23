export type BookPage = {
  id: string;
  properties: {
    Title: { title: { plain_text: string }[] };
    "Author(s)": { multi_select: { name: string }[] };
    "Autofetch Status": { checkbox: boolean };
    "Autofetch Key": { number: number | null };
  };
};

export type GbookResponse = {
  totalItems: number;
  items: GbookItem[];
};

export type GbookItem = {
  id: string;
  volumeInfo: {
    title: string;
    authors: string[];
    categories: string[];
    description: string;
    infoLink: string;
    averageRating?: number;
    pageCount?: number;
    imageLinks: { thumbnail: string };
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
};
