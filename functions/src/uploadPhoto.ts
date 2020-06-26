import * as functions from 'firebase-functions';
import * as sharp from 'sharp';
import * as fs from 'fs-extra';
import { tmpdir } from 'os';
import { join, dirname, basename, extname } from 'path';
import { v4 as uuid } from 'uuid';
import { ObjectMetadata } from 'firebase-functions/lib/providers/storage';
import * as admin from 'firebase-admin';

const { logger } = functions;

const downloadFileToLocal = async (bucket: any, workingDir: string, filePath: string): Promise<string> => {
	const timestamp = Math.floor(Date.now() / 1000);
	const fileExtension = extname(filePath);
	const fileName = basename(filePath, fileExtension);
	const tmpFilePath = join(workingDir, `${fileName}_${timestamp}${fileExtension}`);

	logger.info('Downloading the file from the bucket to the local machine for processing.', {
		filePath,
		tmpFilePath,
		workingDir,
	});

	try {
		await fs.ensureDir(workingDir);
		await bucket.file(filePath).download({
			destination: tmpFilePath,
		});
	} catch (error) {
		logger.error('Something went wrong trying to download the uploaded file to machine.', { error });
		throw error;
	}

	return tmpFilePath;
};

const resizePhoto = async (filePath: string): Promise<string> => {
	const processedImageDir = dirname(filePath);
	const fileExtension = extname(filePath);
	const processedImageDestination = join(processedImageDir, `${uuid()}${fileExtension}`);

	logger.info('Resizing the image to be max 1920 x 1080', { filePath, processedImageDestination });

	try {
		await sharp(filePath)
			.resize({
				width: 1920,
				height: 1080,
				fit: sharp.fit.inside,
			})
			.toFile(processedImageDestination);
	} catch (error) {
		logger.error('Something went wrong trying to resize the image.', error);
		throw error;
	}

	return processedImageDestination;
};

const uploadProcessedPhoto = async (bucket: any, filePath: string): Promise<any> => {
	const fileName = basename(filePath);
	const destination = join('dest', fileName);

	logger.info('Uploading processed file back to the original bucket.', { filePath, bucket, destination });

	let uploadedFile = null;
	try {
		[uploadedFile] = await bucket.upload(filePath, { destination });
	} catch (error) {
		logger.error('Something went wrong trying to upload the processed image', error);
		throw error;
	}

	return uploadedFile;
};

export default async (object: ObjectMetadata) => {
	logger.info('Received an object', { object });

	if (!object.name) {
		logger.info('Object had no name, bailing early');
		return;
	}

	const fileDirectory = dirname(object.name);

	if (fileDirectory !== 'src') return;

	logger.info('Received new upload', { object });

	const workingDir = join(tmpdir(), 'tmp');
	const bucket = admin.storage().bucket(object.bucket);
	const localFilePath = await downloadFileToLocal(bucket, workingDir, object.name);
	const processedFilePath = await resizePhoto(localFilePath);
	const uploadedFile = await uploadProcessedPhoto(bucket, processedFilePath);

	admin.firestore().collection('photos').add({
		file: uploadedFile.name,
		bucket: uploadedFile.bucket.name,
	});

	logger.info('File processed successfuly', { object });

	return fs.remove(workingDir);
};
