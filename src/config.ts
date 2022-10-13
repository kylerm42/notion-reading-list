export type Env = {
  notionDatabaseId: string;
  notionApiKey: string;
  fetchInterval: number;
};

export function validateEnv(): Env {
  const env = process.env;
  if (!env.NOTION_DATABASE_ID) {
    throw new Error("NOTION_DATABASE_ID environment variable must be defined");
  } else if (!env.NOTION_API_KEY) {
    throw new Error("NOTION_API_KEY environment variable must be defined");
  } else if (!env.FETCH_INTERVAL) {
    console.warn("FETCH_INTERVAL not set, defaulting to 10 seconds");
  }

  return {
    notionDatabaseId: env.NOTION_DATABASE_ID,
    notionApiKey: env.NOTION_API_KEY,
    fetchInterval: Number(env.FETCH_INTERVAL) || 10,
  };
}
