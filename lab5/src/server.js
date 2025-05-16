const express = require("express");
const cors = require("cors")
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://healty-life-2.firebaseio.com"
});

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get('/api/trainings-log/:userId', async (req, res) => {
        try {
            const userId = req.params.userId;
            const snapshot = await db
                .collection(`users/${userId}/trainings-log`)
                .orderBy('endTime', 'desc')
                .get();

            const trainings = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    startTime: doc.data().startTime.toDate(),
                    endTime: doc.data().endTime.toDate()
                };
            });

            res.json(trainings);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Server error');
        }
    });


app.post('/api/trainings-log/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { type, startTime, endTime } = req.body;

        if (!type || !startTime || !endTime) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const start = new Date(startTime);
        start.setMinutes(start.getMinutes() - 180);
        const end = new Date(endTime);
        end.setMinutes(end.getMinutes() - 180);

        if (start >= end) {
            return res.status(400).json({ error: 'Start time must be before end time' });
        }

        const docRef = await db
            .collection(`users/${userId}/trainings-log`)
            .add({
                type,
                startTime: admin.firestore.Timestamp.fromDate(start),
                endTime: admin.firestore.Timestamp.fromDate(end),
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

        res.status(201).json({ id: docRef.id });
    } catch (error) {
        console.error('Error adding training:', error);
        res.status(500).send('Server error');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
