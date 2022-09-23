import { validateEnv } from "./config";
import { fetchBooks } from "./fetchBooks";

function run() {
  const config = validateEnv();
  fetchBooks(config);
}

run();
