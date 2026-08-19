/**
 * Celebration wishes delivered through Google Chat.
 *
 * The employee's work email is used as their Google Chat identity. This is a
 * mocked client-side send — a real integration would POST to the Chat API.
 */

export type CelebrationType = "birthday" | "anniversary";

export interface CelebrationTarget {
  id: string;
  name: string;
  email?: string;
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function defaultBirthdayMessage(name: string): string {
  return `Happy Birthday, ${firstName(name)}! 🎉 Wishing you a wonderful year ahead and a great day!`;
}

export function defaultAnniversaryMessage(name: string, years: number): string {
  const label = `${years} year${years === 1 ? "" : "s"}`;
  return `Congratulations on ${label} with the team, ${firstName(name)}! 🎉 Thank you for everything you've contributed and wishing you many more great milestones ahead.`;
}

export function defaultMessageFor(type: CelebrationType, name: string, years = 0): string {
  return type === "birthday" ? defaultBirthdayMessage(name) : defaultAnniversaryMessage(name, years);
}

/** True when the employee can receive a Google Chat message (work email mapped). */
export function canChat(employee: { email?: string }): boolean {
  return Boolean(employee.email);
}

/**
 * Send a celebration message to an employee via Google Chat.
 * Resolves on success, rejects on failure (so callers can offer retry).
 */
export async function sendCelebrationMessage(
  employee: CelebrationTarget,
  _type: CelebrationType,
  message: string,
): Promise<void> {
  if (!employee.email) throw new Error("Google Chat account not available");
  if (!message.trim()) throw new Error("Message is empty");
  // Mock delivery — a real integration would call the Google Chat API using
  // employee.email as the recipient identity.
  await new Promise<void>((resolve) => setTimeout(resolve, 550));
}
