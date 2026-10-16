-- Track the automatic drop of a closed session's learner to upGrad's referral form.
ALTER TABLE "Lead" ADD COLUMN "referralStatus" TEXT;
ALTER TABLE "Lead" ADD COLUMN "referralSentAt" TIMESTAMP(3);
