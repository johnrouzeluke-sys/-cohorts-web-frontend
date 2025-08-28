import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, writeBatch, onSnapshot, updateDoc } from "firebase/firestore";
import { ListTodo, CheckCircle2, CalendarDays, Globe, User, Users, Loader2, Clock, BookOpen, MessageSquareText } from 'lucide-react';


// Your Firebase configuration provided in the conversation
const firebaseConfig = {
  apiKey: "AIzaSyCgy6LKKcQiS6NQ7lJuDibq4-UGh4ofV88",
  authDomain: "cohorts-1a014.firebaseapp.com",
  databaseURL: "https://cohorts-1a014-default-rtdb.firebaseio.com",
  projectId: "cohorts-1a014",
  storageBucket: "cohorts-1a014.firebasestorage.app",
  messagingSenderId: "936864039890",
  appId: "1:936864039890:web:361783e8aecdca9ef3fe0b",
  measurementId: "G-GHX7H6KF9Y"
};

// Initialize Firebase App and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


// Raw data for cohort sessions provided by the user (from CSV)
const rawCohortSessionData = `Cohort/Session,Date,Local Time,Time (ET),Country,Time Notes,Materials,Instruction Language,Instructor,TA,Notes,Zoom Link
Belgium Cohort 1: KICKOFF,2025-09-16,1:00 pm-2:00 pm CET ,7:00 am-8:00 am,Belgium,,English material,French/Dutch,Marlene Boura,Joël Hogeveen,"Marlene rudimentary dutch, TA may need to take lead on dutch questions.  But cohort to be largely english",https://datasociety.zoom.us/j/84532058897?pwd=jOlqHTvbf0xqskUYm5rIcqFbOtxv9Z.1
Belgium Cohort 1: Session 1,2025-09-22,1:00 pm-4:00 pm CET ,7:00 am-10:00 am,Belgium,,English material,French/Dutch,Marlene Boura,Joël Hogeveen,,Meeting ID: 845 3205 8897
Belgium Cohort 1: Session 2,2025-09-24,1:00 pm-4:00 pm CET ,7:00 am-10:00 am,Belgium,,English material,French/Dutch,Marlene Boura,Joël Hogeveen,,Passcode: 637708
Belgium Cohort 1: Session 3,2025-09-29,1:00 pm-4:00 pm CET ,7:00 am-10:00 am,Belgium,,English material,French/Dutch,Marlene Boura,Joël Hogeveen,,
Belgium Cohort 1: Session 4,2025-10-01,1:00 pm-4:00 pm CET ,7:00 am-10:00 am,Belgium,,English material,French/Dutch,Marlene Boura,Joël Hogeveen,,
Belgium Cohort 2: KICKOFF,2025-10-28,1:00-2:00 pm CET,8:00 am-9:00 am,Belgium,Clock change,English material,French/Dutch,,Joël Hogeveen,10/28/2025 Originally changed per client,
Belgium Cohort 2: Session 1,2025-11-03,1:00 pm-4:00 pm CET ,7:00 am-10:00 am,Belgium,,English material,French/Dutch,,Joël Hogeveen,11/3/2025 Originally changed per client,
Belgium Cohort 2: Session 2,2025-11-05,1:00 pm-4:00 pm CET ,7:00 am-10:00 am,Belgium,,English material,French/Dutch,,Joël Hogeveen,11/5/2025 Originally changed per client,
Belgium Cohort 2: Session 3,2025-11-10,1:00 pm-4:00 pm CET ,7:00 am-10:00 am,Belgium,,English material,French/Dutch,,Joël Hogeveen,11/10/2025 Originally changed per client,
Belgium Cohort 2: Session 4,2025-11-12,1:00 pm-4:00 pm CET ,7:00 am-10:00 am,Belgium,,English material,French/Dutch,,Joël Hogeveen,11/12/2025 Originally changed per client,
Romania Cohort 1: KICKOFF,2025-09-02,1:00 pm-2:00 pm EET,7:00 am-8:00 am,Romania,TC,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,"Instructor signed and met with NN, TA Contracted",https://datasociety.zoom.us/j/89337495913?pwd=jlhwxFaTi6XWmd4PxavmkFaWpFaaoT.1
Romania Cohort 1: Session 1,2025-09-09,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Romania,TC,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,Meeting ID: 893 3749 5913
Romania Cohort 1: Session 2,2025-09-11,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Romania,TC,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,Passcode: 994577
Romania Cohort 1: Session 3,2025-09-16,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Romania,TC,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,
Romania Cohort 1: Session 4,2025-09-18,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Romania,TC,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,
Greece Cohort 1: KICKOFF,2025-09-03,1:00 pm-2:00 pm EET,7:00 am-8:00 am,Greece,TC,English material,Greek,Alex Tantos,Alexandros Daniilidis,"Instructor signed and met with NN, TA Contracted",https://datasociety.zoom.us/j/82193492193?pwd=kLN5qwdTAlW9IiIqO9YZpRU2VoQmI8.1
Greece Cohort 1: Session 1,2025-09-08,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Greece,TC,English material,Greek,Alex Tantos,Alexandros Daniilidis,,Meeting ID: 821 9349 2193
Greece Cohort 1: Session 2,2025-09-10,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Greece,TC,English material,Greek,Alex Tantos,Alexandros Daniilidis,,Passcode: 873968
Greece Cohort 1: Session 3,2025-09-15,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Greece,TC,English material,Greek,Alex Tantos,Alexandros Daniilidis,,
Greece Cohort 1: Session 4,2025-09-17,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Greece,TC,English material,Greek,Alex Tantos,Alexandros Daniilidis,,
Netherlands Cohort 1: KICKOFF,2025-09-17,1:00 pm-2:00 pm CET,7:00 am-8:00 am,Netherlands,TC,Dutch Material,Dutch,Jan Mathijs Harleman,Michelle Hogeveen,,https://datasociety.zoom.us/j/82747440665?pwd=QjN7ZVL8zszxCSTbbnnavobZsYxe50.1
Netherlands Cohort 1: Session 1,2025-09-22,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Netherlands,TC,Dutch Material,Dutch,Jan Mathijs Harleman,Michelle Hogeveen,,Meeting ID: 827 4744 0665
Netherlands Cohort 1: Session 2,2025-09-24,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Netherlands,TC,Dutch Material,Dutch,Jan Mathijs Harleman,Michelle Hogeveen,,Passcode: 912452
Netherlands Cohort 1: Session 3,2025-09-29,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Netherlands,TC,Dutch Material,Dutch,Jan Mathijs Harleman,Michelle Hogeveen,,
Netherlands Cohort 1: Session 4,2025-10-01,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Netherlands,TC,Dutch Material,Dutch,Jan Mathijs Harleman,Michelle Hogeveen,,
English Cohort 1: KICKOFF,2025-09-22,1:00 pm-2:00 pm CET,7:00 am-8:00 am,English,TC,English material,English,Ryan Ellison,Ashfin Enayet,,https://datasociety.zoom.us/j/85494174536?pwd=Qd6lZRpTwd3qYMbfVx7tMplP9OdDW2.1
English Cohort 1: Session 1,2025-09-30,1:00 pm-4:00 pm CET,7:00 am-10:00 am,English,TC,English material,English,Ryan Ellison,Ashfin Enayet,,Meeting ID: 854 9417 4536
English Cohort 1: Session 2,2025-10-02,1:00 pm-4:00 pm CET,7:00 am-10:00 am,English,TC,English material,English,Ryan Ellison,Ashfin Enayet,,Passcode: 914855
English Cohort 1: Session 3,2025-10-07,1:00 pm-4:00 pm CET,7:00 am-10:00 am,English,TC,English material,English,Ryan Ellison,Ashfin Enayet,,
English Cohort 1: Session 4,2025-10-09,1:00 pm-4:00 pm CET,7:00 am-10:00 am,English,TC,English material,English,Ryan Ellison,Ashfin Enayet,,
Japan Cohort 1: KICKOFF,2025-09-22,9:00 am-10:00 am JST,8:00 pm-9:00 pm,Japan,TC,Japanese Material,Japanese,,Yoshihara Keisuke,Need to add I and TA to Zoom and TC when selected,https://datasociety.zoom.us/j/83247839734?pwd=X46XS9Cagb9loTf0PO5eEM4qxap0i2.1
Japan Cohort 1: Session 1,2025-09-29,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,TC,Japanese Material,Japanese,,Yoshihara Keisuke,,Meeting ID: 832 4783 9734
Japan Cohort 1: Session 2,2025-10-01,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,TC,Japanese Material,Japanese,,Yoshihara Keisuke,,Passcode: 228762
Japan Cohort 1: Session 3,2025-10-08,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,TC,Japanese Material,Japanese,,Yoshihara Keisuke,,
Japan Cohort 1: Session 4,2025-10-14,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,TC,Japanese Material,Japanese,,Yoshihara Keisuke,,
Japan Cohort 2: KICKOFF,2025-09-22,10:30 am-11:30 am JST,9:30 pm-10:30 pm,Japan,,Japanese Material,Japanese,,,,https://datasociety.zoom.us/j/88959359003?pwd=bTPXQ4daPUwGPEdtbsGDHhkpKQbSSm.1
Japan Cohort 2: Session 1,2025-09-30,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,Meeting ID: 889 5935 9003
Japan Cohort 2: Session 2,2025-10-02,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,Passcode: 775325
Japan Cohort 2: Session 3,2025-10-07,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,
Japan Cohort 2: Session 4,2025-10-09,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,
Romania Cohort 2: KICKOFF,2025-10-01,1:00 pm-2:00 pm EET,7:00 am-8:00 am,Romania,,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,https://datasociety.zoom.us/j/82680745159?pwd=1vSLJB6r8vCMbQRZVxjPCGbPwgtK5E.1
Romania Cohort 2: Session 1,2025-10-06,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Romania,,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,Meeting ID: 826 8074 5159
Romania Cohort 2: Session 2,2025-10-08,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Romania,,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,Passcode: 799089
Romania Cohort 2: Session 3,2025-10-20,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Romania,,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,
Romania Cohort 2: Session 4,2025-10-22,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Romania,,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,
Slovakia Cohort 1: KICKOFF,2025-10-01,1:00 pm-2:00 pm CET,7:00 am-8:00 am,Slovakia,,Slovak Materials,Local/Czech,,Martina Kuchtová,,
Slovakia Cohort 1: Session 1,2025-10-06,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Slovakia,,Slovak Materials,Local/Czech,,Martina Kuchtová,,
Slovakia Cohot 1: Session 2,2025-10-08,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Slovakia,,Slovak Materials,Local/Czech,,Martina Kuchtová,,
Slovakia Cohort 1: Session 3,2025-11-04,9:00 am-12:00 pm CET,3:00 am-6:00 am,Poland,Clock change,English material,Polish,Anna M. Pastwa,,,
Slovakia Cohort 1: Session 4,2025-11-06,9:00 am-12:00 pm CET,3:00 am-6:00 am,Poland,Clock change,English material,Polish,Anna M. Pastwa,,,
Spain Cohort 1: KICKOFF,2025-10-22,1:00 pm-2:00 pm CET,7:00 am-8:00 am,Spain,,Spanish Materials,Spanish,Nico Lopez,,,
Spain Cohort 1: Session 1,2025-11-03,1:00 pm-4:00 pm CET,8:00 am-11:00 am,Spain,Clock change,Spanish Materials,Spanish,Nico Lopez,,,
Spain Cohort 1: Session 2,2025-11-05,1:00 pm-4:00 pm CET,8:00 am-11:00 am,Spain,Clock change,Spanish Materials,Spanish,Nico Lopez,,,
Spain Cohort 1: Session 3,2025-11-10,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Spain,Clock change,Spanish Materials,Spanish,Nico Lopez,,,
Spain Cohort 1: Session 4,2025-11-12,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Spain,Clock change,Spanish Materials,Spanish,Nico Lopez,,,
Belgium Cohort 3: KICKOFF,2025-11-03,1:00-2:00 pm CET,8:00 am-9:00 am,Belgium,Clock change,English material,French/Dutch,,Joël Hogeveen,10/28/2025 Originally changed per client,
Belgium Cohort 3: Session 1,2025-11-10,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Belgium,,English material,French/Dutch,,Joël Hogeveen,11/3/2025 Originally changed per client,
Belgium Cohort 3: Session 2,2025-11-12,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Belgium,,English material,French/Dutch,,Joël Hogeveen,11/5/2025 Originally changed per client,
Belgium Cohort 3: Session 3,2025-11-17,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Belgium,,English material,French/Dutch,,Joël Hogeveen,11/10/2025 Originally changed per client,
Belgium Cohort 3: Session 4,2025-11-19,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Belgium,,English material,French/Dutch,,Joël Hogeveen,11/12/2025 Originally changed per client,
Romania Cohort 3: KICKOFF,2025-11-03,1:00 pm-2:00 pm EET,7:00 am-8:00 am,Romania,,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,
Romania Cohort 3: Session 1,2025-11-10,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Romania,,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,
Romania Cohort 3: Session 2,2025-11-12,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Romania,,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,
Romania Cohort 3: Session 3,2025-11-17,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Romania,,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,
Romania Cohort 3: Session 4,2025-11-19,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Romania,,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,
Greece Cohort 3: KICKOFF,2025-11-04,9:00 am-10:00 am CET,3:00-4:00 am,Greece,,English material,Greek,Alex Tantos,Alexandros Daniilidis,,
Greece Cohort 3: Session 1,2025-11-10,9:00 am-12:00 pm CET,3:00 am-6:00 am,Greece,,English material,Greek,Alex Tantos,Alexandros Daniilidis,,
Greece Cohort 3: Session 2,2025-11-13,9:00 am-12:00 pm CET,3:00 am-6:00 am,Greece,,English material,Greek,Alex Tantos,Alexandros Daniilidis,,
Greece Cohort 3: Session 3,2025-11-18,9:00 am-12:00 pm CET,3:00 am-6:00 am,Greece,,English material,Greek,Alex Tantos,Alexandros Daniilidis,,
Greece Cohort 3: Session 4,2025-11-20,9:00 am-12:00 pm CET,3:00 am-6:00 am,Greece,,English material,Greek,Alex Tantos,Alexandros Daniilidis,,
Japan Cohort 5: KICKOFF,2025-11-04,9:00 am-10:00 am JST,8:00 pm-9:00 pm,Japan,,Japanese Material,Japanese,,,,
Japan Cohort 5: Session 1,2025-11-10,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,
Japan Cohort 5: Session 2,2025-11-12,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,
Japan Cohort 5: Session 3,2025-11-17,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,
Japan Cohort 5: Session 4,2025-11-19,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,
Poland Cohort 2: KICKOFF,2026-03-09,9:00 am-10:00 am,4:00 am-5:00 am,Poland,Clock change,English material,Polish,,,,
Poland Cohort 2: Session 1,2026-03-16,9:00 am-12:00 pm,4:00 am-6:00 am,Poland,Clock change,English material,Polish,,,,
Poland Cohort 2: Session 2,2026-03-18,9:00 am-12:00 pm,4:00 am-6:00 am,Poland,Clock change,English material,Polish,,,,
Poland Cohort 2: Session 3,2026-03-23,9:00 am-12:00 pm,4:00 am-6:00 am,Poland,Clock change,English material,Polish,,,,
Poland Cohort 2: Session 4,2026-03-25,9:00 am-12:00 pm,4:00 am-6:00 am,Poland,Clock change,English material,Polish,,,,
Netherlands Cohort 16: KICKOFF,2026-03-10,9:00 am-10:00 am,4:00 am-5:00 am,Netherlands,Clock change,Dutch Material,Dutch,,Michelle Hogeveen,,
Netherlands Cohort 16: Session 1,2026-03-17,9:00 am-12:00 pm,4:00 am-6:00 am,Netherlands,Clock change,Dutch Material,Dutch,,Michelle Hogeveen,,
Netherlands Cohort 16: Session 2,2026-03-19,9:00 am-12:00 pm,4:00 am-6:00 am,Netherlands,Clock change,Dutch Material,Dutch,,Michelle Hogeveen,,
Netherlands Cohort 16: Session 3,2026-03-25,9:00 am-12:00 pm,4:00 am-6:00 am,Netherlands,Clock change,Dutch Material,Dutch,,Michelle Hogeveen,,
Netherlands Cohort 16: Session 4,2026-03-26,9:00 am-12:00 pm,4:00 am-6:00 am,Netherlands,Clock change,Dutch Material,Dutch,,Michelle Hogeveen,,`;


// Common tasks and responsible roles from the uploaded image
const commonTasksData = [
  { name: 'Kick-off Instructor Reminder Email', roles: 'EH' },
  { name: 'PM uploads kickoff chat, attend...', roles: 'JR' },
  { name: 'Kick-off instructor debrief message ...', roles: 'EH' },
  { name: 'Session 1 & 2 instructor/TA reminde...', roles: 'EH' },
  { name: 'PM uploads Session 1 chat, attenda...', roles: 'JR' },
  { name: 'PM uploads Session 2 chat, atte...', roles: 'JR' },
  { name: 'Sessions 3 & 4 instructor/TA remin...', roles: 'EH' },
  { name: 'PM uploads Session 3 chat, atte...', roles: 'JR' },
  { name: 'PM uploads Session 4 chat, atte...', roles: 'JR' },
  { name: 'Export Zoom Whiteboard and upload...', roles: 'PW' },
  { name: 'Check attendance', roles: 'JR' },
  { name: 'Post-Programme instructor/TA deb...', roles: 'PW, EH' },
  { name: 'Instructor debrief', roles: 'PW, EH' },
  { name: 'Check recordings and move', roles: 'JR' },
  { name: 'Success metrics analysis', roles: 'PW, ER' },
];

// New data structure for C13 specific common task dates from the image
const cohort13CommonTaskDates = {
  'Kick-off Instructor Reminder Email': 'Aug 29',
  'PM uploads kickoff chat, attend...': 'Sep 2',
  'Kick-off instructor debrief message ...': 'Sep 3',
  'Session 1 & 2 instructor/TA reminde...': 'Sep 5',
  'PM uploads Session 1 chat, attenda...': 'Sep 9',
  'PM uploads Session 2 chat, atte...': 'Sep 11',
  'Sessions 3 & 4 instructor/TA remin...': 'Sep 12',
  'PM uploads Session 3 chat, atte...': 'Sep 16',
  'PM uploads Session 4 chat, atte...': 'Sep 18',
  'Export Zoom Whiteboard and upload...': 'Sep 18',
  'Check attendance': 'Sep 18',
  'Post-Programme instructor/TA deb...': 'Sep 19',
  'Instructor debrief': 'Sep 23',
  'Check recordings and move': 'Sep 22',
  'Success metrics analysis': 'Sep 22',
};

// Specific hex codes for card colors
const ROMANIAN_CARD_COLOR = '#fbbc04';
const GREEK_CARD_COLOR = '#4285f4';
const BELGIUM_CARD_COLOR = '#34a853';


// Helper to parse date string (e.g., "Sep 2") into a Date object, assuming appropriate year
function parseDateString(dateStr) {
  if (!dateStr) return null;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth(); // 0-11

  const monthMap = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };

  const parts = dateStr.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*(\d{1,2})/);
  if (!parts) return null;

  const monthAbbr = parts[1];
  const day = parseInt(parts[2], 10);
  const monthIndex = monthMap[monthAbbr];

  let year = currentYear;

  // Heuristic for year: If the parsed month is earlier than the current month,
  // it's likely for the next year (e.g., today is Oct, task is Jan -> next year's Jan).
  // If the month is the same but the day is in the past, also assume next year.
  if (monthIndex < currentMonthIndex || (monthIndex === currentMonthIndex && day < now.getDate())) {
    year++;
  }

  const parsedDate = new Date(year, monthIndex, day);
  return parsedDate;
}


// Function to parse a single line from the raw cohort session data
function parseLineDetails(line) {
  const details = {};

  // Split by comma, ignoring commas inside double quotes
  const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

  // Expected CSV columns: Cohort/Session,Date,Local Time,Time (ET),Country,Time Notes,Materials,Instruction Language,Instructor,TA,Notes,Zoom Link
  if (values.length < 10) { // Ensure enough columns for all new header info
      console.warn("Skipping malformed line (less than 10 columns):", line);
      return null;
  }

  const fullCohortSession = values[0].trim();
  const rawDate = values[1].trim();
  const country = values[4].trim(); // Country is at index 4
  const materials = values[6].trim(); // Materials is at index 6
  const instructionLanguage = values[7].trim(); // Instruction Language is at index 7
  const instructor = values[8].trim(); // Instructor is at index 8
  const ta = values[9].trim(); // TA is at index 9

  // Format date to "Mon Day"
  const dateObj = new Date(rawDate);
  details.date = dateObj.toLocaleString('en-US', { month: 'short', day: 'numeric' });

  // Extract full cohort name (e.g., "Cohort 13 (English/Romanian)") and session type (e.g., "KICKOFF")
  const cohortNameMatch = fullCohortSession.match(/^(.*?)\s*(KICKOFF|Session \d+)$/);
  details.fullCohortName = cohortNameMatch ? cohortNameMatch[1].trim() : fullCohortSession.trim();
  details.sessionType = cohortNameMatch ? cohortNameMatch[2].trim() : '';

  details.country = country;
  details.materials = materials;
  details.instructionLanguage = instructionLanguage;
  details.instructor = instructor;
  details.ta = ta;

  return details;
}


// Function to parse the raw session data and structure it into cohorts
const parseAndStructureData = (rawSessionData, commonTasksData) => {
  const lines = rawSessionData.split('\n').filter(line => line.trim() !== '');
  // Skip the header line for data processing
  const dataLines = lines.slice(1);

  const cohortsMap = new Map();
  let uniqueTaskIdCounter = 0;

  dataLines.forEach(line => {
    const parsedDetails = parseLineDetails(line);

    if (!parsedDetails) {
      return;
    }

    const { fullCohortName, sessionType, date, country, instructor, ta, materials, instructionLanguage } = parsedDetails;
    const cohortKey = fullCohortName.replace(/[\s().,\/&]/g, '-').toLowerCase();

    if (!cohortsMap.has(cohortKey)) {
      cohortsMap.set(cohortKey, {
        id: `cohort-${cohortsMap.size + 1}`,
        docId: cohortKey,
        name: fullCohortName,
        headerInfo: {
          date: '',
          country: '',
          materials: '',
          instructionLanguage: '',
          instructor: '',
          ta: '',
        },
        sessions: [],
      });
    }

    const currentCohort = cohortsMap.get(cohortKey);

    // Set header info for the first session encountered for this cohort
    if (currentCohort.sessions.length === 0) {
      currentCohort.headerInfo.date = date;
      currentCohort.headerInfo.country = country;
      currentCohort.headerInfo.materials = materials;
      currentCohort.headerInfo.instructionLanguage = instructionLanguage;
      currentCohort.headerInfo.instructor = instructor;
      currentCohort.headerInfo.ta = ta;
    }

    currentCohort.sessions.push({
      id: `session-${++uniqueTaskIdCounter}`,
      name: `${sessionType} - ${date}`,
      status: 'todo',
      type: 'session',
      toggleable: false,
      dueDate: parseDateString(date) ? parseDateString(date).toISOString() : null,
    });
  });

  const finalCohorts = Array.from(cohortsMap.values());

  const baseCommonTasks = commonTasksData.map((task, index) => {
    const responsibleRole = task.roles === undefined || task.roles === '' ? 'EH' : task.roles;
    return {
      id: `common-task-${index}`,
      name: `${task.name} (Responsible: ${responsibleRole})`,
      status: 'todo',
      type: 'common',
      toggleable: true,
      dueDate: null,
    };
  });

  return finalCohorts.map(cohort => {
    const tasksForThisCohort = [...cohort.sessions];

    baseCommonTasks.forEach(baseTask => {
      let taskName = baseTask.name;
      let dueDate = null;

      if (cohort.name.includes('Cohort 13 (English/Romanian)')) {
        const baseTaskNameWithoutRoles = baseTask.name.split(' (Responsible:')[0].trim();
        const c13DateStr = cohort13CommonTaskDates[baseTaskNameWithoutRoles];
        if (c13DateStr) {
          const parsedC13Date = parseDateString(c13DateStr);
          if (parsedC13Date) {
            dueDate = parsedC13Date.toISOString();
            taskName = `(${parsedC13Date.toLocaleString('en-US', { month: 'short', day: 'numeric' })}) ${baseTaskNameWithoutRoles} (Responsible: ${baseTask.name.match(/\(Responsible: (.*?)\)/)?.[1] || 'EH'})`;
          }
        }
      }
      tasksForThisCohort.push({
        ...baseTask,
        id: `common-${cohort.docId}-${baseTask.id}`,
        name: taskName,
        status: 'todo',
        dueDate: dueDate,
      });
    });

    return {
      ...cohort,
      tasks: tasksForThisCohort,
    };
  });
};


// TaskItem Component: Represents a single task with its status toggle or as a static item
const TaskItem = ({ task, onToggleStatus }) => {
  const isCompleted = task.status === 'completed';

  return (
    <div className={`flex items-center justify-between p-1 border-b border-gray-200 last:border-b-0 ${task.type === 'session' ? 'py-0.5' : 'py-1'}`}>
      <div className="flex items-center space-x-2">
        {task.type === 'session' ? (
          <CalendarDays className="text-black w-4 h-4" />
        ) : isCompleted ? (
          <CheckCircle2 className="text-emerald-500 w-5 h-5" />
        ) : (
          <ListTodo className="text-slate-500 w-5 h-5" />
        )}
        <span className={`font-medium ${task.type === 'session' ? 'text-xs' : 'text-sm'} ${isCompleted && task.toggleable ? 'line-through text-gray-500' : 'text-gray-800'}`}>
          {task.name}
        </span>
      </div>

      {/* Render toggle switch only if the task is toggleable */}
      {task.toggleable && (
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={isCompleted}
              onChange={() => onToggleStatus(task.id)}
            />
            <div className={`block w-10 h-6 rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-gray-300'}`}></div>
            <div
              className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${
                isCompleted ? 'translate-x-4' : 'translate-x-0'
              }`}
            ></div>
          </div>
          <span className="ml-3 text-xs font-semibold text-gray-600">
            {isCompleted ? 'Completed' : 'To Do'}
          </span>
        </label>
      )}
    </div>
  );
};

// CohortCard Component: Displays a cohort and its list of tasks
const CohortCard = ({ cohort, onToggleTaskStatus }) => {
  const { headerInfo } = cohort;
  
  // Calculate completion percentage for toggleable tasks
  const toggleableTasks = cohort.tasks.filter(task => task.toggleable);
  const completedToggleableTasks = toggleableTasks.filter(task => task.status === 'completed');
  const percentageComplete = toggleableTasks.length > 0 
    ? Math.round((completedToggleableTasks.length / toggleableTasks.length) * 100) 
    : 0;

  // Determine background color based on cohort name
  let cardBgColor = '';
  if (cohort.name.includes('Romania')) { // Check for Romania in the name
    cardBgColor = ROMANIAN_CARD_COLOR;
  } else if (cohort.name.includes('Greece')) { // Check for Greece in the name
    cardBgColor = GREEK_CARD_COLOR;
  } else if (cohort.name.includes('Belgium')) { // Check for Belgium in the name
    cardBgColor = BELGIUM_CARD_COLOR;
  }

  const cardStyle = cardBgColor ? { backgroundColor: cardBgColor } : {};

  return (
    <div id={cohort.docId} className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100`} style={cardStyle}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold text-gray-900">
          {cohort.name}
        </h3>
        <span className="text-sm text-gray-600 font-semibold px-2 py-1 rounded-full bg-gray-200">
          {percentageComplete}% Complete
        </span>
      </div>
      <div className="text-sm text-gray-600 mb-4 pb-2 border-b border-gray-200">
        {headerInfo.date && (
          <p className="flex items-center gap-1 mb-1">
            <CalendarDays className="w-4 h-4 text-black" />
            <span className="font-semibold">Date:</span> {headerInfo.date}
          </p>
        )}
        {headerInfo.country && (
          <p className="flex items-center gap-1 mb-1">
            <Globe className="w-4 h-4 text-black" />
            <span className="font-semibold">Country:</span> {headerInfo.country}
          </p>
        )}
        {headerInfo.materials && ( // Display materials
          <p className="flex items-center gap-1 mb-1">
            <BookOpen className="w-4 h-4 text-black" />
            <span className="font-semibold">Materials:</span> {headerInfo.materials}
          </p>
        )}
        {headerInfo.instructionLanguage && ( // Display Instruction Language
          <p className="flex items-center gap-1 mb-1">
            <MessageSquareText className="w-4 h-4 text-black" />
            <span className="font-semibold">Language Used:</span> {headerInfo.instructionLanguage}
          </p>
        )}
        {headerInfo.instructor && (
          <p className="flex items-center gap-1 mb-1">
            <User className="w-4 h-4 text-black" />
            <span className="font-semibold">Instructor:</span> {headerInfo.instructor}
          </p>
        )}
        {headerInfo.ta && (
          <p className="flex items-center gap-1">
            <Users className="w-4 h-4 text-black" />
            <span className="font-semibold">TA:</span> {headerInfo.ta}
          </p>
        )}
        {(!headerInfo.date && !headerInfo.country && !headerInfo.materials && !headerInfo.instructionLanguage && !headerInfo.instructor && !headerInfo.ta) && (
            <p className="text-gray-500 italic">No specific header info available.</p>
        )}
      </div>

      <div className="space-y-1">
        {cohort.tasks.length > 0 ? (
          cohort.tasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggleStatus={(taskId) => onToggleTaskStatus(cohort.docId, taskId)} />
          ))
        ) : (
          <p className="text-gray-500 text-sm italic">No tasks assigned yet.</p>
        )}
      </div>
    </div>
  );
};

// Main App Component: Manages the overall dashboard
function App() {
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userIdentifier, setUserIdentifier] = useState('Signing in...');
  const [dueTasksNext7Days, setDueTasksNext7Days] = useState([]);
  const cohortsCollectionRef = collection(db, 'cohorts');

  // New state to manage seeding status
  const [isSeeded, setIsSeeded] = useState(false);

  // This effect handles authentication and initial data seeding.
  useEffect(() => {
    // This function will be called on mount to sign in and check for data
    const setupAndSeed = async () => {
      try {
        await signInAnonymously(auth);
        setUserIdentifier(auth.currentUser.uid);

        const data = await getDocs(cohortsCollectionRef);
        if (data.empty) {
          console.log("Firestore is empty. Initializing and uploading data.");
          const initialData = parseAndStructureData(rawCohortSessionData, commonTasksData);
          const batch = writeBatch(db);
          initialData.forEach(cohort => {
            const cohortDocRef = doc(db, 'cohorts', cohort.docId);
            batch.set(cohortDocRef, cohort);
          });
          await batch.commit();
          console.log("Initial data upload complete.");
        }
      } catch (error) {
        console.error("Failed to authenticate or initialize data:", error);
      }
    };
    setupAndSeed();
  }, [cohortsCollectionRef]); // Empty dependency array ensures this runs only once

  // This effect handles the real-time data listener.
  useEffect(() => {
    const unsubscribe = onSnapshot(cohortsCollectionRef, (snapshot) => {
      const fetchedCohorts = snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
      setCohorts(fetchedCohorts);
      setLoading(false);
    }, (error) => {
      console.error("Failed to listen for real-time updates:", error);
      setLoading(false);
    });

    // Cleanup function for the listener
    return () => unsubscribe();
  }, [cohortsCollectionRef]); 

  const toggleTaskStatus = async (cohortDocId, taskId) => {
    try {
      const cohortRef = doc(db, 'cohorts', cohortDocId);
      
      const newCohorts = cohorts.map(cohort => {
        if (cohort.docId === cohortDocId) {
          const updatedTasks = cohort.tasks.map(task => {
            if (task.id === taskId && task.toggleable) {
              const newStatus = task.status === 'todo' ? 'completed' : 'todo';
              return { ...task, status: newStatus };
            }
            return task;
          });
          return { ...cohort, tasks: updatedTasks };
        }
        return cohort;
      });
      
      const newTasksArray = newCohorts.find(c => c.docId === cohortDocId)?.tasks;
      await updateDoc(cohortRef, { tasks: newTasksArray });

      // onSnapshot listener handles the state update, so no need for setCohorts here.
    } catch (error) {
      console.error("Failed to update task status:", error);
      // The onSnapshot listener will revert optimistic UI changes on error, so no explicit revert needed.
    }
  };


  useEffect(() => {
    if (cohorts.length === 0) {
      setDueTasksNext7Days([]);
      return;
    }

    const calculateDueTasks = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sevenDaysFromNow = new Date(today);
      sevenDaysFromNow.setDate(today.getDate() + 7);
      sevenDaysFromNow.setHours(23, 59, 59, 999);

      const upcomingTasks = [];
      cohorts.forEach(cohort => {
        cohort.tasks.forEach(task => {
          if (task.toggleable && task.status === 'todo' && task.dueDate) {
            const taskDueDate = new Date(task.dueDate);
            taskDueDate.setHours(0, 0, 0, 0);

            if (taskDueDate >= today && taskDueDate <= sevenDaysFromNow) {
              upcomingTasks.push({
                ...task,
                cohortName: cohort.name,
                cohortDocId: cohort.docId,
              });
            }
          }
        });
      });

      upcomingTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      setDueTasksNext7Days(upcomingTasks);
    };

    calculateDueTasks();

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeToMidnight = tomorrow.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      calculateDueTasks();
    }, timeToMidnight);

    return () => clearTimeout(timeoutId);
  }, [cohorts]);

  const handleSkipToChange = (event) => {
    const selectedCohortDocId = event.target.value;
    if (selectedCohortDocId) {
      const element = document.getElementById(selectedCohortDocId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6 font-sans">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-6 drop-shadow-sm">
          Cohort Task Dashboard
        </h1>
        <p className="text-center text-gray-600 mb-4 text-sm">
          Logged in as: <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">{userIdentifier}</span>
        </p>

        {/* Skip to Cohort Dropdown */}
        <div className="flex justify-center mb-10">
          <label htmlFor="skip-to-cohort" className="mr-3 text-lg font-semibold text-gray-700">
            Skip to:
          </label>
          <select
            id="skip-to-cohort"
            onChange={handleSkipToChange}
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-800"
          >
            <option value="">Select Cohort</option>
            {cohorts.map((cohort) => (
              <option key={cohort.docId} value={cohort.docId}>
                {cohort.name.match(/Cohort (\d+)/)?.[1] || cohort.name}
              </option>
            ))}
          </select>
        </div>

        {/* Upcoming Tasks (Next 7 Days) Section */}
        {!loading && dueTasksNext7Days.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-600" />
              Upcoming Tasks (Next 7 Days)
            </h2>
            <div className="space-y-2">
              {dueTasksNext7Days.map(task => {
                const isCompleted = task.status === 'completed';
                return (
                  <div key={task.id} className="flex items-center justify-between p-2 bg-indigo-50 rounded-md">
                    <div className="flex items-center space-x-2">
                      <ListTodo className="text-indigo-500 w-5 h-5" />
                      <span className="text-sm font-medium text-gray-800">
                        <span className="font-semibold">{task.cohortName.split('(')[0].trim()}:</span> {task.name}
                      </span>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isCompleted}
                          onChange={() => toggleTaskStatus(task.cohortDocId, task.id)}
                        />
                        <div className={`block w-10 h-6 rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-gray-300'}`}></div>
                        <div
                          className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${
                            isCompleted ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        ></div>
                      </div>
                      <span className="ml-3 text-xs font-semibold text-gray-600">
                        {isCompleted ? 'Completed' : 'To Do'}
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            <p className="ml-4 text-lg text-gray-700">Loading cohorts and tasks...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cohorts.length > 0 ? (
              cohorts.map((cohort) => (
                <CohortCard key={cohort.docId} cohort={cohort} onToggleTaskStatus={toggleTaskStatus} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 text-lg">No cohorts available. Data will be initialized shortly.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
