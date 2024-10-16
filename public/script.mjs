document
	.getElementById('uploadForm')
	.addEventListener('submit', async (event) => {
		event.preventDefault();

		const formData = new FormData(event.target);
		const uploadButton = event.target.querySelector('button');

		uploadButton.textContent = 'Uploading...';
		uploadButton.disabled = true;

		try {
			const response = await fetch('/upload', {
				method: 'POST',
				body: formData,
			});

			const result = await response.json();
			if (response.ok) {
				console.log('Upload successful:', result);
				console.log(result.urls);
			} else {
				console.error('Upload failed:', result.message);
			}
		} catch (error) {
			console.error('Error uploading files:', error);
		} finally {
			uploadButton.textContent = 'Upload';
			uploadButton.disabled = false;
		}
	});
