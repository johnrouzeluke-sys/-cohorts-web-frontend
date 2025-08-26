import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, setDoc, writeBatch, onSnapshot, updateDoc } from "firebase/firestore";
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
Slovakia Cohort 1: Session 3,2025-10-20,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Slovakia,,Slovak Materials,Local/Czech,,Martina Kuchtová,,
Slovakia Cohort 1: Session 4,2025-10-22,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Slovakia,,Slovak Materials,Local/Czech,,Martina Kuchtová,,
Greece Cohort 2: KICKOFF,2025-10-02,1:00 pm-2:00 pm EET,7:00 am-8:00 am,Greece,,English material,Greek,Alex Tantos,Alexandros Daniilidis,,
Greece Cohort 2: Session 1,2025-10-07,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Greece,,English material,Greek,Alex Tantos,Alexandros Daniilidis,,
Greece Cohort 2: Session 2,2025-10-09,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Greece,,English material,Greek,Alex Tantos,Alexandros Daniilidis,,
Greece Cohort 2: Session 3,2025-10-14,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Greece,,English material,Greek,Alex Tantos,Alexandros Daniilidis,,
Greece Cohort 2: Session 4,2025-10-16,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Greece,,English material,Greek,Alex Tantos,Alexandros Daniilidis,,
Czech Cohort 1: KICKOFF,2025-10-08,1:00 pm-2:00 pm CET,7:00 am-8:00 am,Czech,,Czech Material,Czech,,,,
Czech Cohort 1: Session 1,2025-10-15,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Czech,,Czech Material,Czech,,,,
Czech Cohort 1: Session 2,2025-10-16,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Czech,,Czech Material,Czech,,,,
Czech Cohort 1: Session 3,2025-10-22,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Czech,,Czech Material,Czech,,,,
Czech Cohort 1: Session 4,2025-10-23,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Czech,,Czech Material,Czech,,,,
Netherlands Cohort 2: KICKOFF,2025-10-09,1:00 pm-2:00 pm CET,7:00 am-8:00 am,Netherlands,TC,Dutch Material,Dutch,,Michelle Hogeveen,,
Netherlands Cohort 2: Session 1,2025-10-14,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Netherlands,TC,Dutch Material,Dutch,,Michelle Hogeveen,,
Netherlands Cohort 2: Session 2,2025-10-16,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Netherlands,TC,Dutch Material,Dutch,,Michelle Hogeveen,,
Netherlands Cohort 2: Session 3,2025-10-21,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Netherlands,TC,Dutch Material,Dutch,,Michelle Hogeveen,,
Netherlands Cohort 2: Session 4,2025-10-23,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Netherlands,TC,Dutch Material,Dutch,,Michelle Hogeveen,,
Japan Cohort 3: KICKOFF,2025-10-20,9:00 am-10:00 am JST,8:00 pm-9:00 pm,Japan,,Japanese Material,Japanese,,,,
Japan Cohort 3: Session 1,2025-10-27,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,
Japan Cohort 3: Session 2,2025-10-29,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,
Japan Cohort 3: Session 3,2025-11-04,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,
Japan Cohort 3: Session 4,2025-11-06,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,
Japan Cohort 4: KICKOFF,2025-10-21,9:00 am-10:00 am JST,8:00 pm-9:00 pm,Japan,,Japanese Material,Japanese,,,,
Japan Cohort 4: Session 1,2025-10-28,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,
Japan Cohort 4: Session 2,2025-10-30,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,
Japan Cohort 4: Session 3,2025-11-05,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,
Japan Cohort 4: Session 4,2025-11-10,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,
Poland Cohort 1: KICKOFF,2025-10-21,9:00 am-10:00 am CET,3:00 am-4:00 am,Poland,Clock change,English material,Polish,Anna M. Pastwa,,,
Poland Cohort 1: Session 1,2025-10-28,9:00 am-12:00 pm CET,4:00 am-7:00 am,Poland,Clock change,English material,Polish,Anna M. Pastwa,,,
Poland Coh 1: Session 2,2025-10-30,9:00 am-12:00 pm CET,4:00 am-7:00 am,Poland,Clock change,English material,Polish,Anna M. Pastwa,,,
Poland Cohort 1: Session 3,2025-11-04,9:00 am-12:00 pm CET,3:00 am-6:00 am,Poland,Clock change,English material,Polish,Anna M. Pastwa,,,
Poland Cohort 1: Session 4,2025-11-06,9:00 am-12:00 pm CET,3:00 am-6:00 am,Poland,Clock change,English material,Polish,Anna M. Pastwa,,,
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
Poland Cohort 2: KICKOFF,2025-11-05,1:00 pm-2:00 pm CET,7:00 am-8:00 am,Poland,,English material,Polish,,,,
Poland Cohort 2: Session 1,2025-11-12,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Poland,,English material,Polish,,,,
Poland Cohort 2: Session 2,2025-11-13,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Poland,,English material,Polish,,,,
Poland Cohort 2: Session 3,2025-11-19,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Poland,,English material,Polish,,,,
Poland Cohort 2: Session 4,2025-11-20,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Poland,,English material,Polish,,,,
Japan Cohort 6: KICKOFF,2025-11-05,9:00 am-10:00 am JST,8:00 pm-9:00 pm,Japan,,Japanese Material,Japanese,,,,
Japan Cohort 6: Session 1,2025-11-13,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,
Japan Cohort 6: Session 2,2025-11-18,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,
Japan Cohort 6: Session 3,2025-11-20,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,
Japan Cohort 6: Session 4,2025-11-25,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,
Netherlands Cohort 3: KICKOFF,2025-11-05,1:00 pm-2:00 pm CET,7:00 am-8:00 am,Netherlands,TC,Dutch Material,Dutch,,Michelle Hogeveen,,
Netherlands Cohort 3: Session 1,2025-11-13,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Netherlands,TC,Dutch Material,Dutch,,Michelle Hogeveen,,
Netherlands Cohort 3: Session 2,2025-11-18,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Netherlands,TC,Dutch Material,Dutch,,Michelle Hogeveen,,
Netherlands Cohort 3: Session 3,2025-11-20,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Netherlands,TC,Dutch Material,Dutch,,Michelle Hogeveen,,
Netherlands Cohort 3: Session 4,2025-11-25,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Netherlands,TC,Dutch Material,Dutch,,Michelle Hogeveen,,
Spain Cohort 2: KICKOFF,2025-11-12,1:00 pm-2:00 pm CET,7:00 am-8:00 am,Spain,,Spanish Materials,Spanish,Nico Lopez,,,
Spain Cohort 2: Session 1,2025-11-17,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Spain,,Spanish Materials,Spanish,Nico Lopez,,,
Spain Cohort 2: Session 2,2025-11-19,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Spain,,Spanish Materials,Spanish,Nico Lopez,,,
Spain Cohort 2: Session 3,2025-11-24,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Spain,,Spanish Materials,Spanish,Nico Lopez,,,
Spain Cohort 2: Session 4,2025-11-26,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Spain,,Spanish Materials,Spanish,Nico Lopez,,,
Czech Cohort 2: KICKOFF,2025-11-12,1:00 pm-2:00 pm CET,7:00 am-8:00 am,Czech,,Czech Material,Czech,,,,
Czech Cohort 2: Session 1,2025-11-19,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Czech,,Czech Material,Czech,,,,
Czech Cohort 2: Session 2,2025-11-24,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Czech,,Czech Material,Czech,,,,
Czech Cohort 2: Session 3,2025-11-26,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Czech,,Czech Material,Czech,,,,
Czech Cohort 2: Session 4,2025-12-01,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Czech,,Czech Material,Czech,,,,
Slovakia Cohort 2: KICKOFF,2025-11-13,1:00 pm-2:00 pm CET,7:00 am-8:00 am,Slovakia,,Slovak Materials,Local/Czech,,Martina Kuchtová,,
Slovakia Cohort 2: Session 1,2025-11-18,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Slovakia,,Slovak Materials,Local/Czech,,Martina Kuchtová,,
Slovakia Cohort 2: Session 2,2025-11-20,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Slovakia,,Slovak Materials,Local/Czech,,Martina Kuchtová,,
Slovakia Cohort 2: Session 3,2025-11-25,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Slovakia,,Slovak Materials,Local/Czech,,Martina Kuchtová,,
Slovakia Cohort 2: Session 4,2025-11-26,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Slovakia,,Slovak Materials,Local/Czech,,Martina Kuchtová,,
Netherlands Cohort 4: KICKOFF,2025-11-13,9:00 am-10:00 am CET,3:00-4:00 am,Netherlands,TC,Dutch Material,Dutch,,Michelle Hogeveen,,
Netherlands Cohort 4: Session 1,2025-11-18,9:00 am-12:00 pm CET,3:00 am