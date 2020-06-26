import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import uploadPhoto from './uploadPhoto';
import app from './app';

admin.initializeApp();

export const handlePhotoUpload = functions.region('europe-west3').storage.object().onFinalize(uploadPhoto);
export const restApi = functions.region('europe-west3').https.onRequest(app);
