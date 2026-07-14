// The magazine generator needs two things that live in different env files:
//   - OPENAI_API_KEY / OPENAI_MODEL  → .env.scripts
//   - the dev DATABASE_URL you view locally (has the magazine tables) → .env
// Load scripts first for the OpenAI creds, then let .env win for shared vars
// (notably DATABASE_URL) so generated drafts land in the DB `npm run dev` reads.
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.scripts") });
dotenv.config({ path: resolve(process.cwd(), ".env"), override: true });
