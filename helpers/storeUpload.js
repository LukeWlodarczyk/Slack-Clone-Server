const UPLOAD_ROUTE = `${__dirname}/../files`;

export const storeUpload = ({ stream, filename }) =>
	new Promise((resolve, reject) =>
		stream
			.pipe(createWriteStream(`${UPLOAD_ROUTE}/${filename}`))
			.on('finish', () => resolve())
			.on('error', reject)
	);
