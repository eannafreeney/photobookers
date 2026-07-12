import { assertE2eTargetAllowed } from "./helpers/env";

export default async function globalSetup() {
  assertE2eTargetAllowed();
}
