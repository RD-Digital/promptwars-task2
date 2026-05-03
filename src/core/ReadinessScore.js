export const calculateReadinessScore = (context) => {
  const { isRegistered, hasCheckedPolling, hasValidID, daysRemaining } = context;
  let score = 0;
  
  if (isRegistered) score += 30;
  if (hasCheckedPolling) score += 20;
  if (hasValidID) score += 20;
  if (daysRemaining !== null && daysRemaining > 0) score += 30;

  return score;
};
