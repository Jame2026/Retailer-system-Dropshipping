import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const rows = await p.adminUser.findMany({ select: { id:true, email:true, name:true, avatarUrl:true } });
for (const r of rows) {
  const len = r.avatarUrl ? r.avatarUrl.length : 0;
  console.log(r.email, "| name=", r.name, "| avatarLen=", len, "| prefix=", (r.avatarUrl||"").slice(0,30));
}
await p.$disconnect();
