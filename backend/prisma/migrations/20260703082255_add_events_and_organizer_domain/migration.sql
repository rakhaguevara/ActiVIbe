-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'WAITLISTED', 'CHECKED_IN', 'COMPLETED', 'NO_SHOW', 'CANCELLED_BY_ORGANIZER', 'CANCELLED_BY_VOLUNTEER');

-- CreateEnum
CREATE TYPE "SkillRequirementType" AS ENUM ('REQUIRED', 'OPTIONAL');

-- CreateEnum
CREATE TYPE "RequirementType" AS ENUM ('READ_ACKNOWLEDGE', 'CHECKLIST', 'UPLOAD_PROOF');

-- CreateEnum
CREATE TYPE "RequirementStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "CheckInMethod" AS ENUM ('QR', 'MANUAL');

-- CreateTable
CREATE TABLE "SkillProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "xpTotal" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "quota" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "impactMetricLabel" TEXT NOT NULL,
    "impactMetricUnit" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSkill" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "EventSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventInterest" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "interestId" TEXT NOT NULL,

    CONSTRAINT "EventInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,
    "availability" TEXT[],
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "attended" BOOLEAN,
    "impactValue" DOUBLE PRECISION,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpactLog" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "metricLabel" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "aiHeadline" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImpactLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRole" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,
    "roleDescription" TEXT,
    "maxVolunteers" INTEGER NOT NULL,
    "notesForVolunteer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRoleSkill" (
    "id" TEXT NOT NULL,
    "eventRoleId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "requirementType" "SkillRequirementType" NOT NULL DEFAULT 'REQUIRED',

    CONSTRAINT "EventRoleSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventShift" (
    "id" TEXT NOT NULL,
    "eventRoleId" TEXT NOT NULL,
    "shiftDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "quota" INTEGER NOT NULL,
    "locationPoint" TEXT,
    "checkInWindowStart" TIMESTAMP(3),
    "checkInWindowEnd" TIMESTAMP(3),
    "instructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventShift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerAssignment" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "eventRoleId" TEXT NOT NULL,
    "eventShiftId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedById" TEXT NOT NULL,

    CONSTRAINT "VolunteerAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRequirement" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "RequirementType" NOT NULL,
    "description" TEXT,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerRequirementStatus" (
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" "RequirementStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "VolunteerRequirementStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizerNote" (
    "id" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizerNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationLog" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "targetSegment" TEXT NOT NULL,
    "deliveryChannel" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentById" TEXT NOT NULL,

    CONSTRAINT "CommunicationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceLog" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "eventRoleId" TEXT,
    "eventShiftId" TEXT,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" "CheckInMethod" NOT NULL,
    "checkedById" TEXT,

    CONSTRAINT "AttendanceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "targetLabel" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SkillProgress_userId_idx" ON "SkillProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillProgress_userId_skillId_key" ON "SkillProgress"("userId", "skillId");

-- CreateIndex
CREATE INDEX "Event_organizerId_idx" ON "Event"("organizerId");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "EventSkill_eventId_idx" ON "EventSkill"("eventId");

-- CreateIndex
CREATE INDEX "EventSkill_skillId_idx" ON "EventSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "EventSkill_eventId_skillId_key" ON "EventSkill"("eventId", "skillId");

-- CreateIndex
CREATE INDEX "EventInterest_eventId_idx" ON "EventInterest"("eventId");

-- CreateIndex
CREATE INDEX "EventInterest_interestId_idx" ON "EventInterest"("interestId");

-- CreateIndex
CREATE UNIQUE INDEX "EventInterest_eventId_interestId_key" ON "EventInterest"("eventId", "interestId");

-- CreateIndex
CREATE INDEX "Application_userId_idx" ON "Application"("userId");

-- CreateIndex
CREATE INDEX "Application_eventId_idx" ON "Application"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_userId_eventId_key" ON "Application"("userId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "ImpactLog_applicationId_key" ON "ImpactLog"("applicationId");

-- CreateIndex
CREATE INDEX "EventRole_eventId_idx" ON "EventRole"("eventId");

-- CreateIndex
CREATE INDEX "EventRoleSkill_eventRoleId_idx" ON "EventRoleSkill"("eventRoleId");

-- CreateIndex
CREATE UNIQUE INDEX "EventRoleSkill_eventRoleId_skillId_key" ON "EventRoleSkill"("eventRoleId", "skillId");

-- CreateIndex
CREATE INDEX "EventShift_eventRoleId_idx" ON "EventShift"("eventRoleId");

-- CreateIndex
CREATE INDEX "VolunteerAssignment_applicationId_idx" ON "VolunteerAssignment"("applicationId");

-- CreateIndex
CREATE INDEX "VolunteerAssignment_eventRoleId_idx" ON "VolunteerAssignment"("eventRoleId");

-- CreateIndex
CREATE INDEX "VolunteerAssignment_eventShiftId_idx" ON "VolunteerAssignment"("eventShiftId");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerAssignment_applicationId_eventShiftId_key" ON "VolunteerAssignment"("applicationId", "eventShiftId");

-- CreateIndex
CREATE INDEX "EventRequirement_eventId_idx" ON "EventRequirement"("eventId");

-- CreateIndex
CREATE INDEX "VolunteerRequirementStatus_applicationId_idx" ON "VolunteerRequirementStatus"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerRequirementStatus_requirementId_applicationId_key" ON "VolunteerRequirementStatus"("requirementId", "applicationId");

-- CreateIndex
CREATE INDEX "OrganizerNote_applicationId_idx" ON "OrganizerNote"("applicationId");

-- CreateIndex
CREATE INDEX "CommunicationLog_eventId_idx" ON "CommunicationLog"("eventId");

-- CreateIndex
CREATE INDEX "AttendanceLog_applicationId_idx" ON "AttendanceLog"("applicationId");

-- CreateIndex
CREATE INDEX "AttendanceLog_eventShiftId_idx" ON "AttendanceLog"("eventShiftId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "SkillProgress" ADD CONSTRAINT "SkillProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillProgress" ADD CONSTRAINT "SkillProgress_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSkill" ADD CONSTRAINT "EventSkill_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSkill" ADD CONSTRAINT "EventSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventInterest" ADD CONSTRAINT "EventInterest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventInterest" ADD CONSTRAINT "EventInterest_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "Interest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactLog" ADD CONSTRAINT "ImpactLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRole" ADD CONSTRAINT "EventRole_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRoleSkill" ADD CONSTRAINT "EventRoleSkill_eventRoleId_fkey" FOREIGN KEY ("eventRoleId") REFERENCES "EventRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRoleSkill" ADD CONSTRAINT "EventRoleSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventShift" ADD CONSTRAINT "EventShift_eventRoleId_fkey" FOREIGN KEY ("eventRoleId") REFERENCES "EventRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerAssignment" ADD CONSTRAINT "VolunteerAssignment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerAssignment" ADD CONSTRAINT "VolunteerAssignment_eventRoleId_fkey" FOREIGN KEY ("eventRoleId") REFERENCES "EventRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerAssignment" ADD CONSTRAINT "VolunteerAssignment_eventShiftId_fkey" FOREIGN KEY ("eventShiftId") REFERENCES "EventShift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerAssignment" ADD CONSTRAINT "VolunteerAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRequirement" ADD CONSTRAINT "EventRequirement_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerRequirementStatus" ADD CONSTRAINT "VolunteerRequirementStatus_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "EventRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerRequirementStatus" ADD CONSTRAINT "VolunteerRequirementStatus_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizerNote" ADD CONSTRAINT "OrganizerNote_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizerNote" ADD CONSTRAINT "OrganizerNote_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationLog" ADD CONSTRAINT "CommunicationLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationLog" ADD CONSTRAINT "CommunicationLog_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceLog" ADD CONSTRAINT "AttendanceLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceLog" ADD CONSTRAINT "AttendanceLog_eventShiftId_fkey" FOREIGN KEY ("eventShiftId") REFERENCES "EventShift"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceLog" ADD CONSTRAINT "AttendanceLog_checkedById_fkey" FOREIGN KEY ("checkedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
