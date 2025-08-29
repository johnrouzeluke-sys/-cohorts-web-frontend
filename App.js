import React, { useState, useEffect, useRef } from 'react'; // Import useRef
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
const rawCohortSessionData = `Cohort/Session,Date,Local Time,Time (ET),Country,Time Notes,Langague for Materials,Instruction Language,Instructor,TA,DS Support,Notes,Zoom Link
Cohort 13 (English/Romanian) KICKOFF,Sep 2,1:00 pm-2:00 pm EET,7:00 am-8:00 am,Romania,TC,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,Payton Worth,"Instructor signed and met with NN, TA Contracted",https://datasociety.zoom.us/j/89337495913?pwd=jlhwxFaTi6XWmd4PxavmkFaWpFaaoT.1
Cohort 13 (English/Romanian) Session 1,Sep 9,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Romania,TC,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,Meeting ID: 893 3749 5913
Cohort 13 (English/Romanian) Session 2,Sep 11,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Romania,TC,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,Passcode: 994577
Cohort 13 (English/Romanian) Session 3,Sep 16,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Romania,TC,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,
Cohort 13 (English/Romanian) Session 4,Sep 18,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Romania,TC,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,
Cohort 14(English/Greek) KICKOFF,Sep 3,1:00 pm-2:00 pm EET,7:00 am-8:00 am,Greece,TC,English material,Greek,Alex Tantos,Alexandros Daniilidis,,Instructor signed and met with NN, TA Contracted,https://datasociety.zoom.us/j/82193492193?pwd=kLN5qwdTAlW9IiIqO9YZpRU2VoQmI8.1
Cohort 14(English/Greek) Session 1,Sep 8,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Greece,TC,English material,Greek,Alex Tantos,Alexandros Daniilidis,,Meeting ID: 821 9349 2193
Cohort 14(English/Greek) Session 2,Sep 10,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Greece,TC,English material,Greek,Alex Tantos,Alexandros Daniilidis,,Passcode: 873968
Cohort 14(English/Greek) Session 3,Sep 15,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Greece,TC,English material,Greek,Alex Tantos,Alexandros Daniilidis,,
Cohort 14(English/Greek) Session 4,Sep 17,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Greece,TC,English material,Greek,Alex Tantos,Alexandros Daniilidis,,
Cohort 15Belgium (English/ French & Dutch) KICKOFF,Sep 16,1:00 pm-2:00 pm CET,7:00 am-8:00 am,Belgium,TC,English material,French/Dutch,Marlene Boura,Joël Hogeveen,,Marlene rudimentary dutch, TA may need to take lead on dutch questions. But cohort to be largely english,https://datasociety.zoom.us/j/84532058897?pwd=jOlqHTvbf0xqskUYm5rIcqFbOtxv9Z.1
Cohort 15Belgium (English/ French & Dutch) Session 1,Sep 22,12:30 pm-3:30 pm CET,6:30 am-9:30 am,Belgium,TC,English material,French/Dutch,Marlene Boura,Joël Hogeveen,,Meeting ID: 845 3205 8897
Cohort 15Belgium (English/ French & Dutch) Session 2,Sep 24,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Belgium,TC,English material,French/Dutch,Marlene Boura,Joël Hogeveen,,Passcode: 637708
Cohort 15Belgium (English/ French & Dutch) Session 3,Sep 29,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Belgium,TC,English material,French/Dutch,Marlene Boura,Joël Hogeveen,,
Cohort 15Belgium (English/ French & Dutch) Session 4,Oct 1,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Belgium,TC,English material,French/Dutch,Marlene Boura,Joël Hogeveen,,
Cohort 16(Dutch) KICKOFF,Sep 17,1:00 pm-2:00 pm CET,7:00 am-8:00 am,Netherlands,TC,Dutch Material,Dutch,Jan Mathijs Harleman,Michelle Hogeveen,,https://datasociety.zoom.us/j/82747440665?pwd=QjN7ZVL8zszxCSTbbnnavobZsYxe50.1
Cohort 16(Dutch) Session 1,Sep 22,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Netherlands,TC,Dutch Material,Dutch,Jan Mathijs Harleman,Michelle Hogeveen,,Meeting ID: 827 4744 0665
Cohort 16(Dutch) Session 2,Sep 24,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Netherlands,TC,Dutch Material,Dutch,Jan Mathijs Harleman,Michelle Hogeveen,,Passcode: 912452
Cohort 16(Dutch) Session 3,Sep 29,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Netherlands,TC,Dutch Material,Dutch,Jan Mathijs Harleman,Michelle Hogeveen,,
Cohort 16(Dutch) Session 4,Oct 1,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Netherlands,TC,Dutch Material,Dutch,Jan Mathijs Harleman,Michelle Hogeveen,,
Cohort 17 (English) KICKOFF,Sep 22,1:00 pm-2:00 pm CET,7:00 am-8:00 am,English,TC,English material,English,Ryan Ellison,Ashfin Enayet,,Need to add I and TA to Zoom and TC when selected,https://datasociety.zoom.us/j/85494174536?pwd=Qd6lZRpTwd3qYMbfVx7tMplP9OdDW2.1
Cohort 17 (English) Session 1,Sep 30,1:00 pm-4:00 pm CET,7:00 am-10:00 am,English,TC,English material,English,Ryan Ellison,Ashfin Enayet,,Meeting ID: 854 9417 4536
Cohort 17 (English) Session 2,Oct 2,1:00 pm-4:00 pm CET,7:00 am-10:00 am,English,TC,English material,English,Ryan Ellison,Ashfin Enayet,,Passcode: 914855
Cohort 17 (English) Session 3,Oct 7,1:00 pm-4:00 pm CET,7:00 am-10:00 am,English,TC,English material,English,Ryan Ellison,Ashfin Enayet,,
Cohort 17 (English) Session 4,Oct 9,1:00 pm-4:00 pm CET,7:00 am-10:00 am,English,TC,English material,English,Ryan Ellison,Ashfin Enayet,,
Cohort 18(Japanese) KICKOFF,Sep 22,9:00 am-10:00 am JST,8:00 pm-9:00 pm,Japan,TC,Japanese Material,Japanese,So Nozaki,Yoshihara Keisuke,,Need to add I and TA to Zoom and TC when selected,https://datasociety.zoom.us/j/83247839734?pwd=X46XS9Cagb9loTf0PO5eEM4qxap0i2.1
Cohort 18(Japanese) Session 1,Sep 29,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,TC,Japanese Material,Japanese,So Nozaki,Yoshihara Keisuke,,Meeting ID: 832 4783 9734
Cohort 18(Japanese) Session 2,Oct 1,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,TC,Japanese Material,Japanese,So Nozaki,Yoshihara Keisuke,,Passcode: 228762
Cohort 18(Japanese) Session 3,Oct 8,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,TC,Japanese Material,Japanese,So Nozaki,Yoshihara Keisuke,,
Cohort 18(Japanese) Session 4,Oct 14,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,TC,Japanese Material,Japanese,So Nozaki,Yoshihara Keisuke,,
Cohort 19(Japanese) KICKOFF,Sep 22,10:30 am-11:30 am JST,9:30 pm-10:30 pm,Japan,,Japanese Material,Japanese,So Nozaki,Harkura Namaizumi,,https://datasociety.zoom.us/j/88959359003?pwd=bTPXQ4daPUwGPEdtbsGDHhkpKQbSSm.1
Cohort 19(Japanese) Session 1,Sep 30,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,So Nozaki,Harkura Namaizumi,,Meeting ID: 889 5935 9003
Cohort 19(Japanese) Session 2,Oct 2,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,So Nozaki,Harkura Namaizumi,,Passcode: 775325
Cohort 19(Japanese) Session 3,Oct 7,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,So Nozaki,Harkura Namaizumi,,
Cohort 19(Japanese) Session 4,Oct 9,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,So Nozaki,Harkura Namaizumi,,
Cohort 20 (English/Romanian) KICKOFF,Oct 1,1:00 pm-2:00 pm EET,7:00 am-8:00 am,Romania,,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,https://datasociety.zoom.us/j/82680745159?pwd=1vSLJB6r8vCMbQRZVxjPCGbPwgtK5E.1
Cohort 20 (English/Romanian) Session 1,Oct 6,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Romania,,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,Meeting ID: 826 8074 5159
Cohort 20 (English/Romanian) Session 2,Oct 8,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Romania,,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,Passcode: 799089
Cohort 20 (English/Romanian) Session 3,Oct 20,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Romania,,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,
Cohort 20 (English/Romanian) Session 4,Oct 22,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Romania,,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,
Cohort 21(Slovak/Czech) KICKOFF,Oct 1,1:00 pm-2:00 pm CET,7:00 am-8:00 am,Slovakia,,Slovak Materials,Local/Czech,Martina Kuchtová,Will need to add instructor and TA to TC and Instructor as Cohost on Zoom,https://datasociety.zoom.us/j/84876784076?pwd=8mfOKXxT4LH6PcguXXg20SqWTaSuyw.1
Cohort 21(Slovak/Czech) Session 1,Oct 1,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Slovakia,,Slovak Materials,Local/Czech,Martina Kuchtová,,Meeting ID: 848 7678 4076
Cohort 21(Slovak/Czech) Session 2,Oct 1,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Slovakia,,Slovak Materials,Local/Czech,Martina Kuchtová,,Passcode: 285897
Cohort 21(Slovak/Czech) Session 3,Oct 1,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Slovakia,,Slovak Materials,Local/Czech,Martina Kuchtová,,
Cohort 21(Slovak/Czech) Session 4,Oct 1,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Slovakia,,Slovak Materials,Local/Czech,Martina Kuchtová,,
Cohort 22(English/Greek) KICKOFF,Oct 2,1:00 pm-2:00 pm EET,7:00 am-8:00 am,Greece,,English material,Greek,Alex Tantos,Alexandros Daniilidis,Will need to add instructor and TA to TC and Instructor as Cohost on Zoom,https://datasociety.zoom.us/j/89982354173?pwd=OUB0IdHQmJdq2Bos3rObAUxlI3MuO5.1
Cohort 22(English/Greek) Session 1,Oct 7,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Greece,,English material,Greek,Alex Tantos,Alexandros Daniilidis,,Meeting ID: 899 8235 4173
Cohort 22(English/Greek) Session 2,Oct 9,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Greece,,English material,Greek,Alex Tantos,Alexandros Daniilidis,,Passcode: 347740
Cohort 22(English/Greek) Session 3,Oct 14,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Greece,,English material,Greek,Alex Tantos,Alexandros Daniilidis,,
Cohort 22(English/Greek) Session 4,Oct 16,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Greece,,English material,Greek,Alex Tantos,Alexandros Daniilidis,,
Cohort 23(Czech) KICKOFF,Oct 8,1:00 pm-2:00 pm CET,7:00 am-8:00 am,Czech,,Czech Material,Czech,Lenka Kolarikova,,Will need to add instructor and TA to TC and Instructor as Cohost on Zoom,https://datasociety.zoom.us/j/81680018265?pwd=JJsFdPmZTsCGobzISzyXvkE4Z7msru.1
Cohort 23(Czech) Session 1,Oct 15,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Czech,,Czech Material,Czech,Lenka Kolarikova,,Meeting ID: 816 8001 8265
Cohort 23(Czech) Session 2,Oct 16,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Czech,,Czech Material,Czech,Lenka Kolarikova,,Passcode: 010994
Cohort 23(Czech) Session 3,Oct 22,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Czech,,Czech Material,Czech,Lenka Kolarikova,,
Cohort 23(Czech) Session 4,Oct 23,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Czech,,Czech Material,Czech,Lenka Kolarikova,,
Cohort 24(Dutch) KICKOFF,Oct 9,1:00 pm-2:00 pm CET,7:00 am-8:00 am,Netherlands,TC,Dutch Material,Dutch,Jan Mathijs Harleman,Michelle Hogeveen,,https://datasociety.zoom.us/j/84406590203?pwd=FMNCUWgut4Iz3Eab7baXVdJ0WPwXvS.1
Cohort 24(Dutch) Session 1,Oct 14,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Netherlands,TC,Dutch Material,Dutch,Jan Mathijs Harleman,Michelle Hogeveen,,Meeting ID: 844 0659 0203
Cohort 24(Dutch) Session 2,Oct 16,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Netherlands,TC,Dutch Material,Dutch,Jan Mathijs Harleman,Michelle Hogeveen,,Passcode: 892694
Cohort 24(Dutch) Session 3,Oct 21,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Netherlands,TC,Dutch Material,Dutch,Jan Mathijs Harleman,Michelle Hogeveen,,
Cohort 24(Dutch) Session 4,Oct 23,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Netherlands,TC,Dutch Material,Dutch,Jan Mathijs Harleman,Michelle Hogeveen,,
Cohort 25(Japanese) English Forward-KICKOFF,Oct 20,9:00 am-10:00 am JST,8:00 pm-9:00 pm,Japan,,English material,Japanese (English Focused),Jens Svensmark,"Need to Add Jens as cohort to zoom, email was not yet activated.",https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 25(Japanese) English Forward Session 1,Oct 27,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,English material,Japanese (English Focused),Jens Svensmark,Will need to add TA to to TC,Meeting ID: 890 0299 8467
Cohort 25(Japanese) English Forward Session 2,Oct 29,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,English material,Japanese (English Focused),Jens Svensmark,,Passcode: 622385
Cohort 25(Japanese) English Forward Session 3,Nov 4,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,English material,Japanese (English Focused),Jens Svensmark,,
Cohort 25(Japanese) English ForwardSession 4,Nov 6,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,English material,Japanese (English Focused),Jens Svensmark,,
Cohort 26(Japanese) KICKOFF,Oct 21,9:00 am-10:00 am JST,8:00 pm-9:00 pm,Japan,,Japanese Material,Japanese,So Nozaki,,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 26(Japanese) Session 1,Oct 28,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,So Nozaki,,Meeting ID: 890 0299 8467
Cohort 26(Japanese) Session 2,Oct 30,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,So Nozaki,,Passcode: 622385
Cohort 26(Japanese) Session 3,Nov 5,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,So Nozaki,,
Cohort 26(Japanese) Session 4,Nov 10,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,So Nozaki,,
Cohort 27(English/Polish) KICKOFF,Oct 21,9:00 am-10:00 am CET,3:00 am-4:00 am,Poland,,English material,Polish,Anna M. Pastwa,,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 27(English/Polish) Session 1,Oct 28,9:00 am-12:00 pm CET,4:00 am-7:00 am,Poland,Clock change,English material,Polish,Anna M. Pastwa,,Meeting ID: 890 0299 8467
Cohort 27(English/Polish) Session 2,Oct 30,9:00 am-12:00 pm CET,4:00 am-7:00 am,Poland,Clock change,English material,Polish,Anna M. Pastwa,,Passcode: 622385
Cohort 27(English/Polish) Session 3,Nov 4,9:00 am-12:00 pm CET,3:00 am-6:00 am,Poland,,English material,Polish,Anna M. Pastwa,,
Cohort 27(English/Polish) Session 4,Nov 6,9:00 am-12:00 pm CET,3:00 am-6:00 am,Poland,,English material,Polish,Anna M. Pastwa,,
Cohort 28(Spanish) KICKOFF,Oct 22,1:00 pm-2:00 pm CET,7:00 am-8:00 am,Spain,,Spanish Materials,Spanish,Nico Lopez,,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 28(Spanish) Session 1,Oct 27,1:00 pm-4:00 pm CET,8:00 am-11:00 am,Spain,Clock change,Spanish Materials,Spanish,Nico Lopez,,Meeting ID: 890 0299 8467
Cohort 28(Spanish) Session 2,Oct 29,1:00 pm-4:00 pm CET,8:00 am-11:00 am,Spain,Clock change,Spanish Materials,Spanish,Nico Lopez,,Passcode: 622385
Cohort 28(Spanish) Session 3,Nov 3,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Spain,,Spanish Materials,Spanish,Nico Lopez,,
Cohort 28(Spanish) Session 4,Nov 5,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Spain,,Spanish Materials,Spanish,Nico Lopez,,
Cohort 29Belgium (English/ French & Dutch) KICKOFF,Nov 3,1:00-2:00 pm CET,8:00 am-9:00 am,Belgium,Clock change,English material,French/Dutch,,,10/28/2025 Originally changed per client,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 29Belgium (English/ French & Dutch) Session 1,Nov 10,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Belgium,,English material,French/Dutch,,,11/3/2025 Originally changed per client,Meeting ID: 890 0299 8467
Cohort 29Belgium (English/ French & Dutch) Session 2,Nov 12,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Belgium,,English material,French/Dutch,,,11/5/2025 Originally changed per client,Passcode: 622385
Cohort 29Belgium (English/ French & Dutch) Session 3,Nov 17,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Belgium,,English material,French/Dutch,,,11/10/2025 Originally changed per client,
Cohort 29Belgium (English/ French & Dutch) Session 4,Nov 19,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Belgium,,English material,French/Dutch,,,11/12/2025 Originally changed per client,
Cohort 30 (English/Romanian) KICKOFF,Nov 3,1:00 pm-2:00 pm EET,7:00 am-8:00 am,Romania,,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 30 (English/Romanian) Session 1,Nov 10,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Romania,,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,Meeting ID: 890 0299 8467
Cohort 30 (English/Romanian) Session 2,Nov 12,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Romania,,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,Passcode: 622385
Cohort 30 (English/Romanian) Session 3,Nov 17,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Romania,,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,
Cohort 30 (English/Romanian) Session 4,Nov 19,1:00 pm-4:00 pm EET,7:00 am-10:00 am,Romania,,English material,Romanian,Tudor Galos,Agnes Szakacs-Laszlo,,
Cohort 31(English/Greek) KICKOFF,Nov 4,9:00 am-10:00 am CET,3:00-4:00 am,Greece,,English material,Greek,Alex Tantos,Alexandros Daniilidis,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 31(English/Greek) Session 1,Nov 10,9:00 am-12:00 pm CET,3:00 am-6:00 am,Greece,,English material,Greek,Alex Tantos,Alexandros Daniilidis,,Meeting ID: 890 0299 8467
Cohort 31(English/Greek) Session 2,Nov 13,9:00 am-12:00 pm CET,3:00 am-6:00 am,Greece,,English material,Greek,Alex Tantos,Alexandros Daniilidis,,Passcode: 622385
Cohort 31(English/Greek) Session 3,Nov 18,9:00 am-12:00 pm CET,3:00 am-6:00 am,Greece,,English material,Greek,Alex Tantos,Alexandros Daniilidis,,
Cohort 31(English/Greek) Session 4,Nov 20,9:00 am-12:00 pm CET,3:00 am-6:00 am,Greece,,English material,Greek,Alex Tantos,Alexandros Daniilidis,,
Cohort 32(Japanese) KICKOFF,Nov 4,9:00 am-10:00 am JST,8:00 pm-9:00 pm,Japan,,Japanese Material,Japanese,,,,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 32(Japanese) Session 1,Nov 10,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,,Meeting ID: 890 0299 8467
Cohort 32(Japanese) Session 2,Nov 12,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,,Passcode: 622385
Cohort 32(Japanese) Session 3,Nov 17,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,,
Cohort 32(Japanese) Session 4,Nov 19,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,,
Cohort 33(English/Polish) KICKOFF,Nov 5,1:00 pm-2:00 pm CET,7:00 am-8:00 am,Poland,,English material,Polish,,,,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 33(English/Polish) Session 1,Nov 12,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Poland,Clock change,English material,Polish,,,,,Meeting ID: 890 0299 8467
Cohort 33(English/Polish) Session 2,Nov 13,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Poland,Clock change,English material,Polish,,,,,Passcode: 622385
Cohort 33(English/Polish) Session 3,Nov 19,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Poland,,English material,Polish,,,,,
Cohort 33(English/Polish) Session 4,Nov 20,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Poland,,English material,Polish,,,,,
Cohort 34(Japanese) KICKOFF,Nov 5,9:00 am-10:00 am JST,8:00 pm-9:00 pm,Japan,,Japanese Material,Japanese,,,,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 34(Japanese) Session 1,Nov 13,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,,Meeting ID: 890 0299 8467
Cohort 34(Japanese) Session 2,Nov 18,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,,Passcode: 622385
Cohort 34(Japanese) Session 3,Nov 20,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,,
Cohort 34(Japanese) Session 4,Nov 25,9:00 am-12:00 pm JST,8:00 pm-11:00 pm,Japan,,Japanese Material,Japanese,,,,,
Cohort 35(Dutch) KICKOFF,Nov 5,1:00 pm-2:00 pm CET,7:00 am-8:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 35(Dutch) Session 1,Nov 13,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,Meeting ID: 890 0299 8467
Cohort 35(Dutch) Session 2,Nov 18,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,Passcode: 622385
Cohort 35(Dutch) Session 3,Nov 20,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 35(Dutch) Session 4,Nov 25,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 36(Spanish) KICKOFF,Nov 12,1:00 pm-2:00 pm CET,7:00 am-8:00 am,Spain,,Spanish Materials,Spanish,Nico Lopez,,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 36(Spanish) Session 1,Nov 17,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Spain,,Spanish Materials,Spanish,Nico Lopez,,Meeting ID: 890 0299 8467
Cohort 36(Spanish) Session 2,Nov 19,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Spain,,Spanish Materials,Spanish,Nico Lopez,,Passcode: 622385
Cohort 36(Spanish) Session 3,Nov 24,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Spain,,Spanish Materials,Spanish,Nico Lopez,,
Cohort 36(Spanish) Session 4,Nov 26,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Spain,,Spanish Materials,Spanish,Nico Lopez,,
Cohort 37(Czech) KICKOFF,Nov 12,1:00 pm-2:00 pm CET,7:00 am-8:00 am,Czech,,Czech Material,Czech,,,,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 37(Czech) Session 1,Nov 19,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Czech,,Czech Material,Czech,,,,,Meeting ID: 890 0299 8467
Cohort 37(Czech) Session 2,Nov 24,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Czech,,Czech Material,Czech,,,,,Passcode: 622385
Cohort 37(Czech) Session 3,Nov 26,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Czech,,Czech Material,Czech,,,,,
Cohort 37(Czech) Session 4,Dec 1,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Czech,,Czech Material,Czech,,,,,
Cohort 38(Slovak/Czech) KICKOFF,Nov 13,1:00 pm-2:00 pm CET,7:00 am-8:00 am,Slovakia,,Slovak Materials,Local/Czech,Martina Kuchtová,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 38(Slovak/Czech) Session 1,Nov 18,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Slovakia,,Slovak Materials,Local/Czech,Martina Kuchtová,,Meeting ID: 890 0299 8467
Cohort 38(Slovak/Czech) Session 2,Nov 20,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Slovakia,,Slovak Materials,Local/Czech,Martina Kuchtová,,Passcode: 622385
Cohort 38(Slovak/Czech) Session 3,Nov 25,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Slovakia,,Slovak Materials,Local/Czech,Martina Kuchtová,,
Cohort 38(Slovak/Czech) Session 4,Nov 26,1:00 pm-4:00 pm CET,7:00 am-10:00 am,Slovakia,,Slovak Materials,Local/Czech,Martina Kuchtová,,
Cohort 39(Dutch) KICKOFF,Nov 13,9:00 am-10:00 am CET,3:00-4:00 am,Netherlands,TC,Dutch Material,Dutch,Michelle Hogeveen,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 39(Dutch) Session 1,Nov 18,9:00 am-12:00 pm CET,3:00 am-6:00 am,Netherlands,TC,Dutch Material,Dutch,Michelle Hogeveen,,Meeting ID: 890 0299 8467
Cohort 39(Dutch) Session 2,Nov 20,9:00 am-12:00 pm CET,3:00 am-6:00 am,Netherlands,TC,Dutch Material,Dutch,Michelle Hogeveen,,Passcode: 622385
Cohort 39(Dutch) Session 3,Nov 25,9:00 am-12:00 pm CET,3:00 am-6:00 am,Netherlands,TC,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 39(Dutch) Session 4,Nov 26,9:00 am-12:00 pm CET,3:00 am-6:00 am,Netherlands,TC,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 40(Dutch) KICKOFF,Jan 5,9:00 am-10:00 am,3:00 am-4:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 40(Dutch) Session 1,Jan 12,9:00 am-12:00 pm,3:00 am-6:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,Meeting ID: 890 0299 8467
Cohort 40(Dutch) Session 2,Jan 14,9:00 am-12:00 pm,3:00 am-6:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,Passcode: 622385
Cohort 40(Dutch) Session 3,Jan 21,9:00 am-12:00 pm,3:00 am-6:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 40(Dutch) Session 4,Jan 26,9:00 am-12:00 pm,3:00 am-6:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 41(Dutch) KICKOFF,Jan 5,1:00 pm-2:00 pm,7:00 am-8:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 41(Dutch) Session 1,Jan 12,1:00 pm-4:00 pm,7:00 am-10:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,Meeting ID: 890 0299 8467
Cohort 41(Dutch) Session 2,Jan 14,1:00 pm-4:00 pm,7:00 am-10:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,Passcode: 622385
Cohort 41(Dutch) Session 3,Jan 21,1:00 pm-4:00 pm,7:00 am-10:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 41(Dutch) Session 4,Jan 26,1:00 pm-4:00 pm,7:00 am-10:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 42(Dutch) KICKOFF,Jan 7,9:00 am-10:00 am,3:00 am-4:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 42(Dutch) Session 1,Jan 13,9:00 am-12:00 pm,3:00 am-6:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,Meeting ID: 890 0299 8467
Cohort 42(Dutch) Session 2,Jan 15,9:00 am-12:00 pm,3:00 am-6:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,Passcode: 622385
Cohort 42(Dutch) Session 3,Jan 20,9:00 am-12:00 pm,3:00 am-6:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 42(Dutch) Session 4,Jan 22,9:00 am-12:00 pm,3:00 am-6:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 43(Dutch) KICKOFF,Jan 7,1:00 pm-2:00 pm,7:00 am-8:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 43(Dutch) Session 1,Jan 13,1:00 pm-4:00 pm,7:00 am-10:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,Meeting ID: 890 0299 8467
Cohort 43(Dutch) Session 2,Jan 15,1:00 pm-4:00 pm,7:00 am-10:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,Passcode: 622385
Cohort 43(Dutch) Session 3,Jan 20,1:00 pm-4:00 pm,7:00 am-10:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 43(Dutch) Session 4,Jan 22,1:00 pm-4:00 pm,7:00 am-10:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 44(Dutch) KICKOFF,Jan 26,9:00 am-10:00 am,3:00 am-4:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 44(Dutch) Session 1,Feb 2,9:00 am-12:00 pm,3:00 am-6:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,Meeting ID: 890 0299 8467
Cohort 44(Dutch) Session 2,Feb 4,9:00 am-12:00 pm,3:00 am-6:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,Passcode: 622385
Cohort 44(Dutch) Session 3,Feb 9,9:00 am-12:00 pm,3:00 am-6:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 44(Dutch) Session 4,Feb 11,9:00 am-12:00 pm,3:00 am-6:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 45(Dutch) KICKOFF,Jan 26,1:00 pm-2:00 pm,7:00 am-8:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 45(Dutch) Session 1,Feb 2,1:00 pm-4:00 pm,7:00 am-10:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,Meeting ID: 890 0299 8467
Cohort 45(Dutch) Session 2,Feb 4,1:00 pm-4:00 pm,7:00 am-10:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,Passcode: 622385
Cohort 45(Dutch) Session 3,Feb 9,1:00 pm-4:00 pm,7:00 am-10:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 45(Dutch) Session 4,Feb 11,1:00 pm-4:00 pm,7:00 am-10:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 46(Dutch) KICKOFF,Jan 27,9:00 am-10:00 am,3:00 am-4:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 46(Dutch) Session 1,Feb 3,9:00 am-12:00 pm,3:00 am-6:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,Meeting ID: 890 0299 8467
Cohort 46(Dutch) Session 2,Feb 5,9:00 am-12:00 pm,3:00 am-6:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,Passcode: 622385
Cohort 46(Dutch) Session 3,Feb 10,9:00 am-12:00 pm,3:00 am-6:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 46(Dutch) Session 4,Feb 12,9:00 am-12:00 pm,3:00 am-6:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 47(Dutch) KICKOFF,Jan 27,1:00 pm-2:00 pm,7:00 am-8:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 47(Dutch) Session 1,Feb 3,1:00 pm-4:00 pm,7:00 am-10:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,Meeting ID: 890 0299 8467
Cohort 47(Dutch) Session 2,Feb 5,1:00 pm-4:00 pm,7:00 am-10:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,Passcode: 622385
Cohort 47(Dutch) Session 3,Feb 10,1:00 pm-4:00 pm,7:00 am-10:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 47(Dutch) Session 4,Feb 12,1:00 pm-4:00 pm,7:00 am-10:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 48(Dutch) KICKOFF,Feb 17,9:00 am-10:00 am,3:00 am-4:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 48(Dutch) Session 1,Feb 23,9:00 am-12:00 pm,3:00 am-6:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,Meeting ID: 890 0299 8467
Cohort 48(Dutch) Session 2,Feb 25,9:00 am-12:00 pm,3:00 am-6:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,Passcode: 622385
Cohort 48(Dutch) Session 3,Mar 2,9:00 am-12:00 pm,3:00 am-6:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 48(Dutch) Session 4,Mar 4,9:00 am-12:00 pm,3:00 am-6:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 49(Dutch) KICKOFF,Feb 17,1:00 pm-2:00 pm,7:00 am-8:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 49(Dutch) Session 1,Feb 23,1:00 pm-4:00 pm,7:00 am-10:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,Meeting ID: 890 0299 8467
Cohort 49(Dutch) Session 2,Feb 25,1:00 pm-4:00 pm,7:00 am-10:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,Passcode: 622385
Cohort 49(Dutch) Session 3,Mar 2,1:00 pm-4:00 pm,7:00 am-10:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 49(Dutch) Session 4,Mar 4,1:00 pm-4:00 pm,7:00 am-10:00 am,Netherlands,,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 50 (English) KICKOFF,Feb 18,1:00 pm-2:00 pm,7:00 am-8:00 am,English,,English material,English,Ryan Ellison,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 50 (English) Session 1,Feb 24,1:00 pm-4:00 pm,7:00 am-10:00 am,English,,English material,English,Ryan Ellison,,Meeting ID: 890 0299 8467
Cohort 50 (English) Session 2,Feb 26,1:00 pm-4:00 pm,7:00 am-10:00 am,English,,English material,English,Ryan Ellison,,Passcode: 622385
Cohort 50 (English) Session 3,Mar 3,1:00 pm-4:00 pm,7:00 am-10:00 am,English,,English material,English,Ryan Ellison,,
Cohort 50 (English) Session 4,Mar 5,1:00 pm-4:00 pm,7:00 am-10:00 am,English,,English material,English,Ryan Ellison,,
Cohort 51 (English) KICKOFF,Mar 2,1:00 pm-2:00 pm,7:00 am-8:00 am,English,,English material,English,Ryan Ellison,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 51 (English) Session 1,Mar 9,1:00 pm-4:00 pm,8:00 am-11:00 am,English,Clock change,English material,English,Ryan Ellison,,Meeting ID: 890 0299 8467
Cohort 51 (English) Session 2,Mar 11,1:00 pm-4:00 pm,8:00 am-11:00 am,English,Clock change,English material,English,Ryan Ellison,,Passcode: 622385
Cohort 51 (English) Session 3,Mar 16,1:00 pm-4:00 pm,8:00 am-11:00 am,English,Clock change,English material,English,Ryan Ellison,,
Cohort 51 (English) Session 4,Mar 18,1:00 pm-4:00 pm,8:00 am-11:00 am,English,Clock change,English material,English,Ryan Ellison,,
Cohort 52(Dutch) KICKOFF,Mar 2,1:00 pm-2:00 pm,7:00 am-8:00 am,Netherlands,Clock change,Dutch Material,Dutch,Michelle Hogeveen,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 52(Dutch) Session 1,Mar 9,1:00 pm-4:00 pm,8:00 am-11:00 am,Netherlands,Clock change,Dutch Material,Dutch,Michelle Hogeveen,,Meeting ID: 890 0299 8467
Cohort 52(Dutch) Session 2,Mar 11,1:00 pm-4:00 pm,8:00 am-11:00 am,Netherlands,Clock change,Dutch Material,Dutch,Michelle Hogeveen,,Passcode: 622385
Cohort 52(Dutch) Session 3,Mar 16,1:00 pm-4:00 pm,8:00 am-11:00 am,Netherlands,Clock change,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 52(Dutch) Session 4,Mar 18,1:00 pm-4:00 pm,8:00 am-11:00 am,Netherlands,Clock change,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 53(English/Polish) KICKOFF,Mar 9,9:00 am-10:00 am,4:00 am-5:00 am,Poland,Clock change,English material,Polish,,,,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 53(English/Polish) Session 1,Mar 16,9:00 am-12:00 pm,4:00 am-6:00 am,Poland,Clock change,English material,Polish,,,,,Meeting ID: 890 0299 8467
Cohort 53(English/Polish) Session 2,Mar 18,9:00 am-12:00 pm,4:00 am-6:00 am,Poland,Clock change,English material,Polish,,,,,Passcode: 622385
Cohort 53(English/Polish) Session 3,Mar 23,9:00 am-12:00 pm,4:00 am-6:00 am,Poland,Clock change,English material,Polish,,,,,
Cohort 53(English/Polish) Session 4,Mar 25,9:00 am-12:00 pm,4:00 am-6:00 am,Poland,Clock change,English material,Polish,,,,,
Cohort 54(Dutch) KICKOFF,Mar 10,9:00 am-10:00 am,4:00 am-5:00 am,Netherlands,Clock change,Dutch Material,Dutch,Michelle Hogeveen,,https://datasociety.zoom.us/j/89002998467?pwd=xNpV3peJ1aXfC6glDrs9ZnYkraLVqQ.1
Cohort 54(Dutch) Session 1,Mar 17,9:00 am-12:00 pm,4:00 am-6:00 am,Netherlands,Clock change,Dutch Material,Dutch,Michelle Hogeveen,,Meeting ID: 890 0299 8467
Cohort 54(Dutch) Session 2,Mar 19,9:00 am-12:00 pm,4:00 am-6:00 am,Netherlands,Clock change,Dutch Material,Dutch,Michelle Hogeveen,,Passcode: 622385
Cohort 54(Dutch) Session 3,Mar 25,9:00 am-12:00 pm,4:00 am-6:00 am,Netherlands,Clock change,Dutch Material,Dutch,Michelle Hogeveen,,
Cohort 54(Dutch) Session 4,Mar 26,9:00 am-12:00 pm,4:00 am-6:00 am,Netherlands,Clock change,Dutch Material,Dutch,Michelle Hogeveen,,`;


// Common tasks and responsible roles
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

// NEW: Dynamic Task Date Logic Template
const taskDateRules = {
  'Kick-off Instructor Reminder Email': { base: 'Kickoff', offset: -5 },
  'PM uploads kickoff chat, attend...': { base: 'Kickoff', offset: 1 },
  'Kick-off instructor debrief message ...': { base: 'Kickoff', offset: 2 },
  'Session 1 & 2 instructor/TA reminde...': { base: 'Session1', offset: 0 },
  'PM uploads Session 1 chat, attenda...': { base: 'Session1', offset: 1 },
  'PM uploads Session 2 chat, atte...': { base: 'Session2', offset: 1 },
  'Sessions 3 & 4 instructor/TA remin...': { base: 'Session3', offset: 0 },
  'PM uploads Session 3 chat, atte...': { base: 'Session3', offset: 1 },
  'PM uploads Session 4 chat, atte...': { base: 'Session4', offset: 1 },
  'Export Zoom Whiteboard and upload...': { base: 'Session4', offset: 12 },
  'Check attendance': { base: 'Session4', offset: 2 },
  'Post-Programme instructor/TA deb...': { base: 'Session4', offset: 5 },
  'Instructor debrief': { base: 'Session4', offset: 9 },
  'Check recordings and move': { base: 'Session4', offset: 12 },
  'Success metrics analysis': { base: 'Session4', offset: 12 },
};


// Specific hex codes for card colors
const ROMANIAN_CARD_COLOR = '#fbbc04';
const GREEK_CARD_COLOR = '#4285f4';
const BELGIUM_CARD_COLOR = '#34a853';
const NETHERLANDS_CARD_COLOR = '#ea4335';
const ENGLISH_CARD_COLOR = '#4285f4';
const JAPANESE_CARD_COLOR = '#fbbc04';
const POLISH_CARD_COLOR = '#34a853';
const SPANISH_CARD_COLOR = '#ea4335';
const CZECH_CARD_COLOR = '#fbbc04';
const SLOVAKIA_CARD_COLOR = '#4285f4';


// Helper to parse date string (e.g., "Sep 2") into a Date object
function parseDateString(dateStr) {
  if (!dateStr) return null;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();

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
  if (monthIndex < currentMonthIndex) {
    year++;
  }

  return new Date(year, monthIndex, day);
}


// Function to parse a single line from the raw cohort session data
function parseLineDetails(line) {
  const details = {};
  const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
  
  const fullCohortSession = (values[0] || '').trim();
  const rawDate = (values[1] || '').trim();
  if (!fullCohortSession || !rawDate) return null;

  details.fullCohortSession = fullCohortSession;
  details.rawDate = rawDate;
  details.localTime = (values[2] || '').trim();
  details.timeET = (values[3] || '').trim();
  details.country = (values[4] || '').trim();
  details.timeNotes = (values[5] || '').trim();
  details.materials = (values[6] || '').trim();
  details.instructionLanguage = (values[7] || '').trim();
  details.instructor = (values[8] || '').trim();
  details.ta = (values[9] || '').trim();
  details.dsSupport = (values[10] || '').trim();
  details.notes = (values[11]