/*
    Ory will return a variety of messages and errors
    in English, with a specific ID, full overview: (TODO: replace with docs in v0.8)
    https://github.com/ory/kratos/commit/5e3a2cdbedf0005c89db717d1136c56ab3304ede#diff-5f1e3c37dcbc9b67dcd9232b60da1183b9aea1670a02c5aadb1a373bcdb98c12R1027
    Relevant user-facing messages are mapped to whatever string you'd like here, which allows you to
    match client and server validation messages, lets you choose tone of voice/communication style
    and add i18n if you need it
    If no mapping is available, it will fall back to the message returned from Ory
*/

type MessageId = number;
export enum AuthMessage {
  /* SUCCESS */
  // Your changes have been saved!
  CHANGES_SAVED = 1050001,

  // You successfully recovered your account. Please change your password or set up an alternative login method (e.g. social sign in) within the next {context.privilegedSessionExpiresAt} minutes.
  SUCCESSFULLY_RECOVERED_ACCOUNT = 1060001,

  // You successfully verified your email address.
  SUCCESSFULLY_VERIFIED_EMAIL = 1060001,

  // An email containing a recovery link has been sent to the email address you provided.
  RECOVERY_EMAIL_SENT = 1060002,

  // An email containing a verification link has been sent to the email address you provided.
  VERIFICATION_EMAIL_SENT = 1070001,

  /* 4xx errors */
  // Length must be {context.expected_length}, but got {context.actual_length}
  BAD_LENGTH_SUPPLIED = 4000003,

  // The provided credentials are invalid, check for spelling mistakes in your password or username, email address, or phone number.
  INVALID_CREDENTIALS_SUPPLIED = 4000006,

  // An account with the same identifier (email, phone, username, ...) exists already.
  UNIQUE_IDENTIFIER_TAKEN = 4000007,

  // Account not active yet. Did you forget to verify your email address?
  ACCOUNT_NOT_YET_ACTIVE = 4000010,

  // The request was already completed successfully and can not be retried.
  SUCCESSFUL_REQUEST_NO_RETRY = 4060001,

  // The recovery flow reached a failure state and must be retried.
  FAILED_REQUEST_NO_RETRY = 4060002,

  // The recovery token is invalid or has already been used. Please retry the flow.
  RECOVERY_TOKEN_INVALID = 4060004,

  // The verification token is invalid or has already been used. Please retry the flow.
  VERIFICATION_TOKEN_INVALID = 4070001
}

const messageMap: { [key: MessageId]: string } = {
  [AuthMessage.BAD_LENGTH_SUPPLIED]:
    '{field} should be at least {expected_length} characters (currently {actual_length})',
  [AuthMessage.INVALID_CREDENTIALS_SUPPLIED]: 'The password or email you entered was incorrect'
};

// Interpolators are key-value pairs required to construct the custom message
// For message '{field} should be at least {requiredLength} characters'
// The interpolator would be { field: 'email', requiredLength: 5 }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Interpolators = { [key: string]: any };
export const getCustomMessage = (id: MessageId, interpolators?: Interpolators) => {
  const message = messageMap[id];

  if (!message) return null;
  if (!interpolators || Object.keys(interpolators).length === 0) return message;

  const pattern = Object.keys(interpolators)
    .map((k) => `{${k}}`)
    .join('|');
  const regex = new RegExp(pattern, 'gi');

  const lookupTable = Object.keys(interpolators).reduce((acc, key) => {
    acc[`{${key}}`] = interpolators[key];
    return acc;
  }, {});
  return message.replace(regex, (matched) => lookupTable[matched]);
};

export const getMessageWithId = (id: MessageId, interpolators?: Interpolators) => {
  return getCustomMessage(id, interpolators);
};

type BaseMessage = {
  id: MessageId;
  text: string;
  type?: string;
  context?: Interpolators;
};
export const getMessage = (message: BaseMessage, additionalInterpolators: Interpolators = {}) => {
  const interpolators = message.context
    ? { ...message.context, ...additionalInterpolators }
    : { ...additionalInterpolators };
  return getCustomMessage(message.id, interpolators) || message.text;
};
