import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

const firebaseConfig = { /* Your Config */ };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentExam = null;
let violationCount = 0;

// 1. Randomization Logic
async function initExam() {
    const querySnapshot = await getDocs(collection(db, "exam_bank"));
    const exams = [];
    querySnapshot.forEach((doc) => exams.push({ id: doc.id, ...doc.data() }));
    
    currentExam = exams[Math.floor(Math.random() * exams.length)];
    
    document.getElementById('pdfFrame').src = currentExam.exam_url;
    document.getElementById('audioPlayer').src = currentExam.audio_url;
}

// 2. Violation Tracking
document.addEventListener('visibilitychange', () => {
    if (document.hidden) violationCount++;
});

// 3. Listening Security
const audio = document.getElementById('audioPlayer');
document.getElementById('startAudio').addEventListener('click', (e) => {
    audio.play();
    e.target.disabled = true;
});

audio.onended = () => { alert("Listening section locked."); };

// 4. Writing Logic
const essayBox = document.getElementById('essayBox');
essayBox.addEventListener('input', () => {
    const count = essayBox.value.trim().split(/\s+/).length;
    document.getElementById('wordCount').innerText = essayBox.value.trim() === "" ? 0 : count;
});

// 5. Firebase Submission
async function submitExam(data) {
    try {
        await addDoc(collection(db, "submissions"), data);
        alert("Exam submitted successfully");
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

function handleFinalSubmit() {
    const words = essayBox.value.trim().split(/\s+/).length;
    if (words < 150) {
        alert("Minimum 150 words required.");
        return;
    }
    
    submitExam({
        examId: currentExam.id,
        violationCount,
        writing: essayBox.value,
        timestamp: new Date()
    });
}

initExam();
