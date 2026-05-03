export const evaluateUserContext = (context) => {
  const {
    age,
    isRegistered,
    daysRemaining,
    hasCheckedPolling,
    hasValidID,
  } = context;

  // 1. Eligibility Layer
  if (age !== null && age < 18) {
    return { state: "NOT_ELIGIBLE", message: "You must be 18 or older to vote." };
  }

  // 2. Registration Layer
  if (isRegistered === false) {
    return { state: "REGISTRATION_FLOW", message: "Let's get you registered to vote." };
  }

  // 3. Urgency Engine (daysRemaining)
  if (daysRemaining !== null && daysRemaining <= 3) {
    return { state: "URGENT_VOTING", message: "Election day is almost here! Urgent action required." };
  }
  if (daysRemaining !== null && daysRemaining <= 10) {
    return { state: "PREPARE_TO_VOTE", message: "Election is coming up. Let's make sure you're ready." };
  }

  // 4. Readiness Evaluation
  if (hasCheckedPolling === false) {
    return { state: "SHOW_POLLING", message: "You need to find your polling station." };
  }
  if (hasValidID === false) {
    return { state: "ID_PREPARATION", message: "Make sure you have a valid ID for voting." };
  }

  // 5. Final State
  return { state: "READY_TO_VOTE", message: "You are fully prepared to vote! Great job." };
};
