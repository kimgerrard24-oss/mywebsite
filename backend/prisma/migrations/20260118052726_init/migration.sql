CREATE EXTENSION IF NOT EXISTS citext;

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "DeleteSource" AS ENUM ('USER', 'ADMIN', 'SYSTEM');

-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('LOCAL', 'GOOGLE', 'FACEBOOK');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO');

-- CreateEnum
CREATE TYPE "PostVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "ChatReportReason" AS ENUM ('SPAM', 'HARASSMENT', 'HATE_SPEECH', 'SCAM', 'SEXUAL_CONTENT', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'ACTION_TAKEN', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('SPAM', 'HARASSMENT', 'HATE_SPEECH', 'SCAM', 'NSFW', 'MISINFORMATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('POST', 'COMMENT', 'USER', 'CHAT_MESSAGE');

-- CreateEnum
CREATE TYPE "ModerationTargetType" AS ENUM ('USER', 'POST', 'COMMENT', 'CHAT_MESSAGE');

-- CreateEnum
CREATE TYPE "ModerationActionType" AS ENUM ('HIDE', 'UNHIDE', 'DELETE', 'BAN_USER', 'WARN', 'NO_ACTION');

-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "AppealTargetType" AS ENUM ('POST', 'COMMENT', 'USER', 'CHAT_MESSAGE');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('EMAIL_VERIFY', 'EMAIL_CHANGE', 'PHONE_CHANGE', 'ACCOUNT_LOCK', 'PASSWORD_RESET', 'SENSITIVE_ACTION');

-- CreateEnum
CREATE TYPE "SecurityEventType" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'PASSWORD_CHANGED', 'EMAIL_CHANGE_REQUEST', 'EMAIL_CHANGED', 'PHONE_CHANGE_REQUEST', 'PHONE_CHANGED', 'USERNAME_CHANGED', 'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED', 'SESSION_REVOKED', 'SUSPICIOUS_ACTIVITY', 'CREDENTIAL_VERIFIED', 'PROFILE_EXPORTED', 'EMAIL_VERIFIED');

-- CreateEnum
CREATE TYPE "VerificationScope" AS ENUM ('ACCOUNT_LOCK', 'PROFILE_EXPORT', 'EMAIL_CHANGE', 'PASSWORD_CHANGE', 'PHONE_CHANGE', 'EMAIL_VERIFY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" CITEXT NOT NULL,
    "name" TEXT,
    "displayName" TEXT,
    "username" TEXT NOT NULL,
    "hashedPassword" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "countryCode" CHAR(2),
    "dateOfBirth" TIMESTAMP(3),
    "phoneNumber" TEXT,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "isAccountLocked" BOOLEAN NOT NULL DEFAULT false,
    "accountLockedAt" TIMESTAMP(3),
    "accountLockReason" TEXT,
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "disabledReason" TEXT,
    "disabledAt" TIMESTAMP(3),
    "bio" TEXT,
    "firebaseUid" TEXT,
    "avatarUrl" TEXT,
    "coverUrl" TEXT,
    "currentRefreshTokenHash" TEXT,
    "adminNote" TEXT,
    "lastSeenAt" TIMESTAMP(3),
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "bannedAt" TIMESTAMP(3),
    "banReason" TEXT,
    "bannedByAdminId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "revokedAt" TIMESTAMP(3),
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "detail" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "providerId" TEXT NOT NULL,
    "providerEmail" CITEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "OAuthAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "action" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "reason" TEXT,
    "targetId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "deletedById" TEXT,
    "content" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "hiddenAt" TIMESTAMP(3),
    "hiddenByAdminId" TEXT,
    "hiddenReason" TEXT,
    "deletedSource" "DeleteSource",
    "deleteReason" TEXT,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "visibility" "PostVisibility" NOT NULL DEFAULT 'PUBLIC',

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostLike" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostMedia" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "mimeType" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "cleanupAt" TIMESTAMP(3),
    "cleanupFailCount" INTEGER NOT NULL DEFAULT 0,
    "lastCleanupError" TEXT,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "content" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "hiddenAt" TIMESTAMP(3),
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),
    "hiddenByAdminId" TEXT,
    "hiddenReason" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,
    "deletedSource" "DeleteSource",
    "deleteReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- =====================================================
-- 🔒 Enforce ONE-LEVEL reply only (PRODUCTION SAFE)
-- - Applies ONLY on INSERT
-- - Prevents nested replies (reply of reply)
-- =====================================================

CREATE OR REPLACE FUNCTION enforce_one_level_reply()
RETURNS trigger AS $$
BEGIN
  -- Only validate when this is a reply
  IF NEW."parentId" IS NOT NULL THEN
    -- If parent itself is already a reply → reject
    IF EXISTS (
      SELECT 1
      FROM "Comment"
      WHERE id = NEW."parentId"
        AND "parentId" IS NOT NULL
    ) THEN
      RAISE EXCEPTION
        'Nested replies are not allowed (only 1-level replies supported)';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Trigger: INSERT ONLY (⚠️ DO NOT USE UPDATE)
-- =====================================================

DROP TRIGGER IF EXISTS trg_comment_one_level_reply ON "Comment";

CREATE TRIGGER trg_comment_one_level_reply
BEFORE INSERT ON "Comment"
FOR EACH ROW
EXECUTE FUNCTION enforce_one_level_reply();

-- CreateTable
CREATE TABLE "CommentLike" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentTag" (
    "commentId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "CommentTag_pkey" PRIMARY KEY ("commentId","tagId")
);

-- CreateTable
CREATE TABLE "CommentMention" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentMention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostTag" (
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "PostTag_pkey" PRIMARY KEY ("postId","tagId")
);

-- CreateTable
CREATE TABLE "Follow" (
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("followerId","followingId")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "actorUserId" TEXT,
    "entityId" TEXT,
    "payload" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "isGroup" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatParticipant" (
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "ChatParticipant_pkey" PRIMARY KEY ("chatId","userId")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessageMedia" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessageMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatReadState" (
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadMessageId" TEXT,
    "lastReadAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatReadState_pkey" PRIMARY KEY ("chatId","userId")
);

-- CreateTable
CREATE TABLE "ChatMessageReport" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessageReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatTypingState" (
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isTyping" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatTypingState_pkey" PRIMARY KEY ("chatId","userId")
);

-- CreateTable
CREATE TABLE "UserBlock" (
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBlock_pkey" PRIMARY KEY ("blockerId","blockedId")
);

-- CreateTable
CREATE TABLE "ChatReport" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" "ChatReportReason" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,

    CONSTRAINT "ChatReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminActionLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" TEXT,
    "detail" JSONB,
    "ip" TEXT,
    "reportId" TEXT,
    "appealId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetType" "ReportTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "withdrawnAt" TIMESTAMP(3),
    "resolvedByAdminId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationAction" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "actionType" "ModerationActionType" NOT NULL,
    "targetType" "ModerationTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appeal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" "AppealTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "moderationActionId" TEXT,
    "reportId" TEXT,
    "reason" TEXT NOT NULL,
    "detail" TEXT,
    "status" "AppealStatus" NOT NULL DEFAULT 'PENDING',
    "withdrawnAt" TIMESTAMP(3),
    "resolvedByAdminId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityVerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "VerificationType" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "target" TEXT,
    "scope" "VerificationScope" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "IdentityVerificationToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX uniq_active_identity_token
ON "IdentityVerificationToken"("userId", "type")
WHERE "usedAt" IS NULL;

-- CreateTable
CREATE TABLE "SecurityEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "SecurityEventType" NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserIdentityHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminId" TEXT,

    CONSTRAINT "UserIdentityHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");

-- CreateIndex
CREATE INDEX "User_isBanned_bannedAt_idx" ON "User"("isBanned", "bannedAt");

-- CreateIndex
CREATE INDEX "User_phoneNumber_idx" ON "User"("phoneNumber");

-- CreateIndex
CREATE INDEX "User_isAccountLocked_accountLockedAt_idx" ON "User"("isAccountLocked", "accountLockedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "OAuthAccount_provider_providerId_idx" ON "OAuthAccount"("provider", "providerId");

-- CreateIndex
CREATE INDEX "OAuthAccount_userId_provider_idx" ON "OAuthAccount"("userId", "provider");

-- CreateIndex
CREATE INDEX "OAuthAccount_userId_idx" ON "OAuthAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthAccount_userId_provider_key" ON "OAuthAccount"("userId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthAccount_provider_providerId_key" ON "OAuthAccount"("provider", "providerId");

-- CreateIndex
CREATE INDEX "LoginHistory_userId_createdAt_idx" ON "LoginHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "LoginHistory_provider_createdAt_idx" ON "LoginHistory"("provider", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "Post_authorId_publishedAt_idx" ON "Post"("authorId", "publishedAt");

-- CreateIndex
CREATE INDEX "Post_isPublished_isDeleted_isHidden_publishedAt_idx" ON "Post"("isPublished", "isDeleted", "isHidden", "publishedAt");

-- CreateIndex
CREATE INDEX "Post_isDeleted_deletedAt_idx" ON "Post"("isDeleted", "deletedAt");

-- CreateIndex
CREATE INDEX "Post_deletedSource_deletedAt_idx" ON "Post"("deletedSource", "deletedAt");

-- CreateIndex
CREATE INDEX "Post_deletedById_deletedAt_idx" ON "Post"("deletedById", "deletedAt");

-- CreateIndex
CREATE INDEX "PostLike_postId_idx" ON "PostLike"("postId");

-- CreateIndex
CREATE INDEX "PostLike_userId_idx" ON "PostLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PostLike_postId_userId_key" ON "PostLike"("postId", "userId");

-- CreateIndex
CREATE INDEX "PostMedia_postId_idx" ON "PostMedia"("postId");

-- CreateIndex
CREATE INDEX "PostMedia_mediaId_idx" ON "PostMedia"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "PostMedia_postId_mediaId_key" ON "PostMedia"("postId", "mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_objectKey_key" ON "Media"("objectKey");

-- CreateIndex
CREATE INDEX "Media_ownerUserId_idx" ON "Media"("ownerUserId");

-- CreateIndex
CREATE INDEX "Media_mediaType_idx" ON "Media"("mediaType");

-- CreateIndex
CREATE INDEX "Media_deletedAt_idx" ON "Media"("deletedAt");

-- CreateIndex
CREATE INDEX "Media_cleanupAt_idx" ON "Media"("cleanupAt");

-- CreateIndex
CREATE INDEX "Comment_postId_createdAt_idx" ON "Comment"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_parentId_createdAt_idx" ON "Comment"("parentId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");

-- CreateIndex
CREATE INDEX "Comment_isDeleted_parentId_idx" ON "Comment"("isDeleted", "parentId");

-- CreateIndex
CREATE INDEX "Comment_isDeleted_deletedAt_idx" ON "Comment"("isDeleted", "deletedAt");

-- CreateIndex
CREATE INDEX "Comment_deletedSource_deletedAt_idx" ON "Comment"("deletedSource", "deletedAt");

-- CreateIndex
CREATE INDEX "Comment_deletedById_deletedAt_idx" ON "Comment"("deletedById", "deletedAt");

-- CreateIndex
CREATE INDEX "CommentLike_commentId_idx" ON "CommentLike"("commentId");

-- CreateIndex
CREATE INDEX "CommentLike_userId_idx" ON "CommentLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentLike_commentId_userId_key" ON "CommentLike"("commentId", "userId");

-- CreateIndex
CREATE INDEX "CommentTag_tagId_idx" ON "CommentTag"("tagId");

-- CreateIndex
CREATE INDEX "CommentMention_commentId_idx" ON "CommentMention"("commentId");

-- CreateIndex
CREATE INDEX "CommentMention_userId_idx" ON "CommentMention"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentMention_commentId_userId_key" ON "CommentMention"("commentId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tag_name_idx" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "PostTag_tagId_idx" ON "PostTag"("tagId");

-- CreateIndex
CREATE INDEX "Follow_followingId_createdAt_idx" ON "Follow"("followingId", "createdAt");

-- CreateIndex
CREATE INDEX "Follow_followerId_createdAt_idx" ON "Follow"("followerId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Chat_isGroup_idx" ON "Chat"("isGroup");

-- CreateIndex
CREATE INDEX "Chat_updatedAt_idx" ON "Chat"("updatedAt");

-- CreateIndex
CREATE INDEX "ChatParticipant_userId_idx" ON "ChatParticipant"("userId");

-- CreateIndex
CREATE INDEX "ChatParticipant_chatId_idx" ON "ChatParticipant"("chatId");

-- CreateIndex
CREATE INDEX "ChatMessage_chatId_createdAt_idx" ON "ChatMessage"("chatId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_senderId_idx" ON "ChatMessage"("senderId");

-- CreateIndex
CREATE INDEX "ChatMessageMedia_messageId_idx" ON "ChatMessageMedia"("messageId");

-- CreateIndex
CREATE INDEX "ChatMessageMedia_mediaId_idx" ON "ChatMessageMedia"("mediaId");

-- CreateIndex
CREATE INDEX "ChatReadState_userId_idx" ON "ChatReadState"("userId");

-- CreateIndex
CREATE INDEX "ChatReadState_chatId_lastReadAt_idx" ON "ChatReadState"("chatId", "lastReadAt");

-- CreateIndex
CREATE INDEX "ChatMessageReport_messageId_idx" ON "ChatMessageReport"("messageId");

-- CreateIndex
CREATE INDEX "ChatMessageReport_reporterId_idx" ON "ChatMessageReport"("reporterId");

-- CreateIndex
CREATE INDEX "UserBlock_blockedId_idx" ON "UserBlock"("blockedId");

-- CreateIndex
CREATE INDEX "UserBlock_blockerId_idx" ON "UserBlock"("blockerId");

-- CreateIndex
CREATE INDEX "ChatReport_chatId_idx" ON "ChatReport"("chatId");

-- CreateIndex
CREATE INDEX "ChatReport_reporterId_idx" ON "ChatReport"("reporterId");

-- CreateIndex
CREATE INDEX "ChatReport_createdAt_idx" ON "ChatReport"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChatReport_chatId_reporterId_key" ON "ChatReport"("chatId", "reporterId");

-- CreateIndex
CREATE INDEX "AdminActionLog_adminId_createdAt_idx" ON "AdminActionLog"("adminId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminActionLog_action_idx" ON "AdminActionLog"("action");

-- CreateIndex
CREATE INDEX "AdminActionLog_reportId_idx" ON "AdminActionLog"("reportId");

-- CreateIndex
CREATE INDEX "AdminActionLog_appealId_idx" ON "AdminActionLog"("appealId");

-- CreateIndex
CREATE INDEX "Report_targetType_targetId_idx" ON "Report"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");

-- CreateIndex
CREATE INDEX "Report_status_withdrawnAt_idx" ON "Report"("status", "withdrawnAt");

-- CreateIndex
CREATE INDEX "Report_reporterId_status_idx" ON "Report"("reporterId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Report_reporterId_targetType_targetId_key" ON "Report"("reporterId", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "ModerationAction_targetType_targetId_idx" ON "ModerationAction"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "Appeal_userId_createdAt_idx" ON "Appeal"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Appeal_status_createdAt_idx" ON "Appeal"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Appeal_targetType_targetId_idx" ON "Appeal"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "Appeal_resolvedByAdminId_resolvedAt_idx" ON "Appeal"("resolvedByAdminId", "resolvedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Appeal_userId_moderationActionId_key" ON "Appeal"("userId", "moderationActionId");

-- CreateIndex
CREATE INDEX "IdentityVerificationToken_userId_type_idx" ON "IdentityVerificationToken"("userId", "type");

-- CreateIndex
CREATE INDEX "IdentityVerificationToken_expiresAt_idx" ON "IdentityVerificationToken"("expiresAt");

-- CreateIndex
CREATE INDEX "IdentityVerificationToken_tokenHash_idx" ON "IdentityVerificationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "IdentityVerificationToken_type_expiresAt_idx" ON "IdentityVerificationToken"("type", "expiresAt");

-- CreateIndex
CREATE INDEX "IdentityVerificationToken_usedAt_idx" ON "IdentityVerificationToken"("usedAt");

-- CreateIndex
CREATE INDEX "IdentityVerificationToken_userId_type_usedAt_idx" ON "IdentityVerificationToken"("userId", "type", "usedAt");

-- CreateIndex
CREATE INDEX "IdentityVerificationToken_tokenHash_type_idx" ON "IdentityVerificationToken"("tokenHash", "type");

-- CreateIndex
CREATE INDEX "SecurityEvent_userId_createdAt_idx" ON "SecurityEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SecurityEvent_type_idx" ON "SecurityEvent"("type");

-- CreateIndex
CREATE INDEX "UserIdentityHistory_userId_createdAt_idx" ON "UserIdentityHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserIdentityHistory_field_idx" ON "UserIdentityHistory"("field");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_bannedByAdminId_fkey" FOREIGN KEY ("bannedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuthAccount" ADD CONSTRAINT "OAuthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginHistory" ADD CONSTRAINT "LoginHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostMedia" ADD CONSTRAINT "PostMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostMedia" ADD CONSTRAINT "PostMedia_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentLike" ADD CONSTRAINT "CommentLike_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentLike" ADD CONSTRAINT "CommentLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentTag" ADD CONSTRAINT "CommentTag_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentTag" ADD CONSTRAINT "CommentTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentMention" ADD CONSTRAINT "CommentMention_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentMention" ADD CONSTRAINT "CommentMention_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTag" ADD CONSTRAINT "PostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTag" ADD CONSTRAINT "PostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessageMedia" ADD CONSTRAINT "ChatMessageMedia_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessageMedia" ADD CONSTRAINT "ChatMessageMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatReadState" ADD CONSTRAINT "ChatReadState_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatReadState" ADD CONSTRAINT "ChatReadState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessageReport" ADD CONSTRAINT "ChatMessageReport_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessageReport" ADD CONSTRAINT "ChatMessageReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatTypingState" ADD CONSTRAINT "ChatTypingState_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatTypingState" ADD CONSTRAINT "ChatTypingState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatReport" ADD CONSTRAINT "ChatReport_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatReport" ADD CONSTRAINT "ChatReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActionLog" ADD CONSTRAINT "AdminActionLog_appealId_fkey" FOREIGN KEY ("appealId") REFERENCES "Appeal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActionLog" ADD CONSTRAINT "AdminActionLog_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActionLog" ADD CONSTRAINT "AdminActionLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_resolvedByAdminId_fkey" FOREIGN KEY ("resolvedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appeal" ADD CONSTRAINT "Appeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appeal" ADD CONSTRAINT "Appeal_resolvedByAdminId_fkey" FOREIGN KEY ("resolvedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appeal" ADD CONSTRAINT "Appeal_moderationActionId_fkey" FOREIGN KEY ("moderationActionId") REFERENCES "ModerationAction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appeal" ADD CONSTRAINT "Appeal_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityVerificationToken" ADD CONSTRAINT "IdentityVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityEvent" ADD CONSTRAINT "SecurityEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserIdentityHistory" ADD CONSTRAINT "UserIdentityHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
