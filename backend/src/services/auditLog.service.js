import AuditLog from "../models/AuditLog.js";

const createAuditLog = async ({
  action,
  userId,
  referralId,
  adEventId,
  metadata = {},
  ipAddress,
  userAgent,
  session,
}) => {
  const auditLog = new AuditLog({
    action,
    userId,
    referralId,
    adEventId,
    metadata,
    ipAddress,
    userAgent,
  });

  await auditLog.save({ session });

  return auditLog;
};

export { createAuditLog };