import * as express from 'express';
import * as cors from 'cors';
import * as admin from 'firebase-admin';

const app = express();

app.use(cors({ origin: true }));

app.get('/random', async (req, res) => {
	const collection = await admin.firestore().collection('photos').get();
	const randomDoc = collection.docs[Math.floor(Math.random() * collection.docs.length)];

	// TODO: Return all images (max of 100?) instead of just one
	// Look at performance
	const image = await randomDoc.data();

	const foundFile = await admin.storage().bucket(image.bucket).file(image.file);
	const signedUrls = await foundFile.getSignedUrl({
		action: 'read',
		expires: '31-12-2025',
	});

	res.json({
		urls: signedUrls,
	});
});

export default app;
