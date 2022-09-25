import { validateEnv } from "./config";
import updateBooks from "./updateBooks";

function run() {
  const config = validateEnv();
  updateBooks(config);
}

run();
