-- Add nullable creator attribution so existing alerts remain intact.
ALTER TABLE "Alert" ADD COLUMN "userId" TEXT;

CREATE INDEX "Alert_userId_idx" ON "Alert"("userId");

ALTER TABLE "Alert"
ADD CONSTRAINT "Alert_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("userId")
ON DELETE SET NULL ON UPDATE CASCADE;
