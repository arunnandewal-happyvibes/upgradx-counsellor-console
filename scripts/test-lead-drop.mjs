// One-off check that the automatic Lead Drop submission works end to end.
// Submits ONE clearly-marked test lead ("Test PleaseIgnore", phone 9999999999)
// to https://referrals.upgrad.com/lc — it WILL create a row in upGrad's CRM,
// so run it deliberately:  node scripts/test-lead-drop.mjs
// Override the details:    node scripts/test-lead-drop.mjs "Full Name" email phone city
import { execSync } from "node:child_process";

const [name = "Test PleaseIgnore", email = "upgradx.portal.test@example.com", phone = "+91 9999999999", city = "Pune"] =
  process.argv.slice(2);

const code = `
  import { submitLeadDrop } from "./lib/leadDrop";
  submitLeadDrop({ name: ${JSON.stringify(name)}, email: ${JSON.stringify(email)}, phone: ${JSON.stringify(phone)}, city: ${JSON.stringify(city)} })
    .then((r) => { console.log(r.ok ? "✅" : "❌", r.status); process.exit(r.ok ? 0 : 1); });
`;
execSync(`npx tsx -e ${JSON.stringify(code)}`, { stdio: "inherit", cwd: new URL("..", import.meta.url).pathname });
