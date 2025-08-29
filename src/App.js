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
const NETHERLANDS_CARD_COLOR = '#ea4335'; // Added for Netherlands
const ENGLISH_CARD_COLOR = '#4285f4'; // Reusing for English
const JAPANESE_CARD_COLOR = '#fbbc04'; // Reusing for Japanese
const POLISH_CARD_COLOR = '#34a853'; // Added for Poland
const SPANISH_CARD_COLOR = '#ea4335'; // Added for Spain
const CZECH_CARD_COLOR = '#fbbc04'; // Added for Czech
const SLOVAKIA_CARD_COLOR = '#4285f4'; // Added for Slovakia


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

  // Safely access values, providing empty string as default if column is missing
  // Updated to expect all 13 columns based on the header
  const fullCohortSession = (values[0] || '').trim();
  const rawDate = (values[1] || '').trim();
  const localTime = (values[2] || '').trim(); // Added
  const timeET = (values[3] || '').trim(); // Added
  const country = (values[4] || '').trim();
  const timeNotes = (values[5] || '').trim(); // Added
  const materials = (values[6] || '').trim();
  const instructionLanguage = (values[7] || '').trim();
  const instructor = (values[8] || '').trim();
  const ta = (values[9] || '').trim();
  const dsSupport = (values[10] || '').trim();
  const notes = (values[11] || '').trim();
  const zoomLink = (values[12] || '').trim();


  // It's better to return null if essential fields like fullCohortSession or rawDate are missing
  if (!fullCohortSession || !rawDate) {
    console.warn("Skipping malformed line (missing essential fields):", line);
    return null;
  }

  // Format date to "Mon Day"
  const dateObj = new Date(rawDate);
  details.date = dateObj.toLocaleString('en-US', { month: 'short', day: 'numeric' });

  // Extract full cohort name (e.g., "Cohort 13 (English/Romanian)") and session type (e.g., "KICKOFF")
  const cohortNameMatch = fullCohortSession.match(/^(.*?)\s*(KICKOFF|Session \d+)$/);
  details.fullCohortName = cohortNameMatch ? cohortNameMatch[1].trim() : fullCohortSession.trim();
  details.sessionType = cohortNameMatch ? cohortNameMatch[2].trim() : '';

  details.country = country;
  details.localTime = localTime; // Added
  details.timeET = timeET; // Added
  details.timeNotes = timeNotes; // Added
  details.materials = materials;
  details.instructionLanguage = instructionLanguage;
  details.instructor = instructor;
  details.ta = ta;
  details.dsSupport = dsSupport;
  details.notes = notes;
  details.zoomLink = zoomLink;


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

    const { fullCohortName, sessionType, date, country, instructor, ta, materials, instructionLanguage, dsSupport, notes, zoomLink, localTime, timeET, timeNotes } = parsedDetails;
    const cohortKey = fullCohortName.replace(/[\s().,\/&]/g, '-').toLowerCase();

    if (!cohortsMap.has(cohortKey)) {
      cohortsMap.set(cohortKey, {
        id: `cohort-${cohortsMap.size + 1}`,
        docId: cohortKey,
        name: fullCohortName,
        headerInfo: {
          date: '',
          country: '',
          localTime: '', // Added
          timeET: '', // Added
          timeNotes: '', // Added
          materials: '',
          instructionLanguage: '',
          instructor: '',
          ta: '',
          dsSupport: '',
          notes: '',
          zoomLink: ''
        },
        sessions: [],
      });
    }

    const currentCohort = cohortsMap.get(cohortKey);

    // Set header info for the first session encountered for this cohort
    if (currentCohort.sessions.length === 0) {
      currentCohort.headerInfo.date = date;
      currentCohort.headerInfo.country = country;
      currentCohort.headerInfo.localTime = localTime; // Added
      currentCohort.headerInfo.timeET = timeET; // Added
      currentCohort.headerInfo.timeNotes = timeNotes; // Added
      currentCohort.headerInfo.materials = materials;
      currentCohort.headerInfo.instructionLanguage = instructionLanguage;
      currentCohort.headerInfo.instructor = instructor;
      currentCohort.headerInfo.ta = ta;
      currentCohort.headerInfo.dsSupport = dsSupport;
      currentCohort.headerInfo.notes = notes;
      currentCohort.headerInfo.zoomLink = zoomLink;
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
    const responsibleRole = (task.roles === undefined || task.roles === '') ? 'EH' : task.roles;
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

    // Use the specific cohort's name to check for C13
    const isCohort13 = cohort.name.includes('Cohort 13 (English/Romanian)');

    baseCommonTasks.forEach(baseTask => {
      let taskName = baseTask.name;
      let dueDate = null;

      if (isCohort13) {
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
  }).sort((a, b) => { // Sort cohorts by the date of their first session
    const dateA = new Date(a.sessions[0]?.dueDate || '9999-12-31');
    const dateB = new Date(b.sessions[0]?.dueDate || '9999-12-31');
    return dateA.getTime() - dateB.getTime();
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
  if (cohort.name.includes('Romania')) { 
    cardBgColor = ROMANIAN_CARD_COLOR;
  } else if (cohort.name.includes('Greece')) { 
    cardBgColor = GREEK_CARD_COLOR;
  } else if (cohort.name.includes('Belgium')) { 
    cardBgColor = BELGIUM_CARD_COLOR;
  } else if (cohort.name.includes('Netherlands') || cohort.name.includes('Dutch')) {
    cardBgColor = NETHERLANDS_CARD_COLOR;
  } else if (cohort.name.includes('English')) {
    cardBgColor = ENGLISH_CARD_COLOR;
  } else if (cohort.name.includes('Japan') || cohort.name.includes('Japanese')) {
    cardBgColor = JAPANESE_CARD_COLOR;
  } else if (cohort.name.includes('Poland') || cohort.name.includes('Polish')) {
    cardBgColor = POLISH_CARD_COLOR;
  } else if (cohort.name.includes('Spanish')) {
    cardBgColor = SPANISH_CARD_COLOR;
  } else if (cohort.name.includes('Czech')) {
    cardBgColor = CZECH_CARD_COLOR;
  } else if (cohort.name.includes('Slovak') || cohort.name.includes('Slovakia')) {
    cardBgColor = SLOVAKIA_CARD_COLOR;
  }


  const cardStyle = cardBgColor ? { backgroundColor: cardBgColor } : {};

  return (
    <div id={cohort.docId} className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100`} style={cardBgColor ? { backgroundColor: cardBgColor } : {}}>
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
        {headerInfo.localTime && (
          <p className="flex items-center gap-1 mb-1">
            <Clock className="w-4 h-4 text-black" />
            <span className="font-semibold">Local Time:</span> {headerInfo.localTime}
          </p>
        )}
        {headerInfo.timeET && (
          <p className="flex items-center gap-1 mb-1">
            <Clock className="w-4 h-4 text-black" />
            <span className="font-semibold">Time (ET):</span> {headerInfo.timeET}
          </p>
        )}
        {headerInfo.timeNotes && (
          <p className="flex items-center gap-1 mb-1">
            <MessageSquareText className="w-4 h-4 text-black" />
            <span className="font-semibold">Time Notes:</span> {headerInfo.timeNotes}
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
        {headerInfo.dsSupport && (
          <p className="flex items-center gap-1">
            <User className="w-4 h-4 text-black" />
            <span className="font-semibold">DS Support:</span> {headerInfo.dsSupport}
          </p>
        )}
        {headerInfo.notes && (
          <p className="flex items-center gap-1">
            <MessageSquareText className="w-4 h-4 text-black" />
            <span className="font-semibold">Notes:</span> {headerInfo.notes}
          </p>
        )}
        {headerInfo.zoomLink && (
          <p className="flex items-center gap-1">
            <Globe className="w-4 h-4 text-black" />
            <span className="font-semibold">Zoom Link:</span> <a href={headerInfo.zoomLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a>
          </p>
        )}
        {(!headerInfo.date && !headerInfo.country && !headerInfo.materials && !headerInfo.instructionLanguage && !headerInfo.instructor && !headerInfo.ta && !headerInfo.dsSupport && !headerInfo.notes && !headerInfo.zoomLink) && (
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
  const initialSetupDone = useRef(false); // Ref to track if initial setup is done

  // This effect handles authentication and initial data seeding.
  useEffect(() => {
    if (initialSetupDone.current) return; // Prevent re-running after initial setup

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
        } else {
          console.log("Database already has data. Setting up real-time listener.");
        }
      } catch (error) {
        console.error("Failed to authenticate or initialize data:", error);
      } finally {
        initialSetupDone.current = true; // Mark initial setup as done
      }
    };
    setupAndSeed();
  }, []); // Empty dependency array ensures this runs only once on mount

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
