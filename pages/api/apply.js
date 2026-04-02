import { addSubmission, getSubmissionByEmail, updateSubmission, getManagerSubscriptions } from "../../lib/storage";
import { v4 as uuidv4 } from "uuid";
const bcrypt = require("bcryptjs");
const webpush = require("web-push");

if (process.env.VAPID_SUBJECT && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

async function notifyManager(applicantName, isUpdate) {
  try {
    const subs = await getManagerSubscriptions();
    if (!subs.length) return;
    const payload = JSON.stringify({
      title: isUpdate ? "Application Updated" : "New Application",
      body: applicantName + " just " + (isUpdate ? "updated their" : "submitted an") + " application for Junior League staff.",
      url: "/manager",
    });
    await Promise.allSettled(subs.map(sub => webpush.sendNotification(sub, payload)));
  } catch (e) {
    console.error("Push notify error:", e);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { fullName, email, phone, juniorExperience, golfExperience, returning, bagRoom, availableDates, password } = req.body;

  if (!fullName?.trim() || !email?.trim() || !phone?.trim())
    return res.status(400).json({ error: "Missing required fields" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: "Invalid email" });
  if (!Array.isArray(availableDates))
    return res.status(400).json({ error: "Invalid dates" });
  if (!password || password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });

  try {
    const normalEmail = email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, 10);
    const existing = await getSubmissionByEmail(normalEmail);

    if (existing) {
      await updateSubmission(normalEmail, {
        availableDates,
        passwordHash,
        juniorExperience: (juniorExperience || "").trim(),
        golfExperience: (golfExperience || "").trim(),
        returning: Boolean(returning),
        bagRoom: Boolean(bagRoom),
        phone: phone.trim(),
        fullName: fullName.trim(),
      });
      await notifyManager(fullName.trim(), true);
      return res.status(200).json({ success: true, updated: true });
    }

    const submission = {
      id: uuidv4(),
      fullName: fullName.trim(),
      email: normalEmail,
      phone: phone.trim(),
      juniorExperience: (juniorExperience || "").trim(),
      golfExperience: (golfExperience || "").trim(),
      returning: Boolean(returning),
      bagRoom: Boolean(bagRoom),
      availableDates,
      passwordHash,
      hours: [],
      submittedAt: new Date().toISOString(),
    };
    await addSubmission(submission);
    await notifyManager(fullName.trim(), false);
    return res.status(200).json({ success: true, updated: false });
  } catch (e) {
    console.error("Submission error:", e);
    return res.status(500).json({ error: "Failed to save submission" });
  }
}
