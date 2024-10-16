import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

(async function () {
	cloudinary.config({
		cloud_name: process.env.CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET,
	});
})();

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload', upload.array('files'), async (req, res) => {
	const folderName = req.body.folderName;
	const files = req.files;

	const transformations = [
		{ width: 320, height: 240, crop: 'scale', quality: 'auto' }, // Mobile
		{
			width: 768,
			height: 1024,
			crop: 'scale',
			quality: 'auto',
		}, // Tablet
		{
			width: 1920,
			height: 1080,
			crop: 'scale',
			quality: 'auto',
		}, // Laptop/Desktop
	];

	const uploadPromises = [];

	files.forEach((file) => {
		transformations.forEach((transformation) => {
			uploadPromises.push(
				cloudinary.uploader.upload(file.path, {
					folder: folderName,
					tags: 'startimob.ro',
					unique_filename: true,
          fetch_format: 'webp',
					transformation: transformation,
				})
			);
		});
	});

	try {
		const results = await Promise.all(uploadPromises);

		// Clean up local files
		await Promise.all(files.map((file) => fs.promises.unlink(file.path)));

		res.json({
			message: 'Files uploaded successfully',
			urls: results.map((result) => result.url),
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send({ message: 'Error uploading files' });
	}
});

app.listen(3000, () => {
	console.log('server listening on port 3000');
});
