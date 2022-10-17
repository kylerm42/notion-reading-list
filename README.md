# Self-Hosted Notion Reading List Backend

First, thanks to [shaunakg](https://github.com/shaunakg/notion-reading-list) for getting this started and providing a base to build upon.

## Purpose

The goal of this project is to provide a simple, yet powerful, way to automatically populate metadata for a reading list Notion database. It's powered by the [Open Library API](https://openlibrary.org/developers/api), [Google Books API](https://developers.google.com/books/docs/v1/reference/volumes/list), and of course the [Notion API](https://developers.notion.com/reference/intro).

## Requirements

- You'll need you Notion database id. It is a 32-character string that can be found in the URL when viewing the database: `https://www.notion.so/username/database-id`.
- You need to create a Notion integration.
  - Navigate to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations) and click "New Integration".
  - Name your integration whatever you like, and give it permission for reading and updating content. It does not require inserting or any user permissions. Click "Submit".
  - Note the "Internal Integration Token", as we'll need that later.
  - Return to your database, click the three dots in the top right, select "Add Connections", and find the integration you just created.
- This app requires only the following fields on your Notion database to run. They will be created automatically on first run if they don't already exist, but can be hidden.
  - "Author(s)": Multi-select - the list of authors for the book
  - "Genre(s)": Multi-select - the list of genres/categories for the book
  - "Description": Rich text - the book description
  - "Pages": Number - the average number of pages for the book
  - "Link": URL - a link to find more information of the book (courtesy of Open Library)
  - "Rating": Number - average user rating for the book
  - "Autofetch Status": Checkbox - this field determines whether the app has scanned this book.
  - "Autofetch Key": Number - this field determines the index of the results to use from the API search (defaults to 0).
  - "Updated At": Lasted edited time - this field helps prevent looking up metadata before you've finished typing
  - "Original Title": Rich text - in case the service finds a wildly incorrect match, you can refer to this for the original page name

## Running the container

- Copy `.env.example` to `.env` and fill in the appropriate values
  - `NOTION_API_KEY` - the "Internal Integration Token" we got from our integration above.
  - `NOTION_DATABASE_ID` - the database id that can be found in the URL
  - `FETCH_INTERVAL` - time in seconds between checks to your database for pages to update
- In your terminal of choice, create the docker image by running ``docker build -t notion-reading-list .`.
- Next, run the container with `docker run --env-file=.env notion-reading-list`.
- Congratulations, you have a service that will automatically detect new books in your database and add metadata!

## Usage

- This app can fetch a variety of fields
  - Title - this is obviously the title of the page
  - Author(s) - Multi-select
  - Description - Text
  - Genre(s) - Multi-select
  - Link - URL
  - Pages - Number
  - Average rating - Number
  - Cover image and icon

## Development

Clone this repo, run `npm install` and then `npm run start`.
