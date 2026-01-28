import type {MediaParserInternalTypes} from '@remotion/media-parser';

export const createContent: MediaParserInternalTypes['CreateContent'] = ({
	filename,
	mimeType,
}) => {
	const maxByteLength = 2_000_000_000;
	const buf = new ArrayBuffer(0, {maxByteLength});
	if (!buf.resize) {
		throw new Error('Could not create buffer writer');
	}

	const write = (newData: Uint8Array) => {
		const oldLength = buf.byteLength;
		const newLength = oldLength + newData.byteLength;
		if (newLength > maxByteLength) {
			throw new Error(
				`Output exceeds buffer limit of ${maxByteLength} bytes. Use the WebFS writer or provide a custom writer.`,
			);
		}
		try {
			buf.resize(newLength);
		} catch (err) {
			throw new Error(
				`Failed to resize buffer to ${newLength} bytes: ${String(err)}`,
			);
		}
		const newArray = new Uint8Array(buf);
		newArray.set(newData, oldLength);
	};

	const updateDataAt = (position: number, newData: Uint8Array) => {
		if (position + newData.byteLength > buf.byteLength) {
			throw new Error(
				`Cannot update data beyond current buffer size (${buf.byteLength} bytes)`,
			);
		}
		const newArray = new Uint8Array(buf);
		newArray.set(newData, position);
	};

	let writPromise = Promise.resolve();

	let removed = false;

	const writer: MediaParserInternalTypes['Writer'] = {
		write: (arr: Uint8Array) => {
			writPromise = writPromise.then(() => write(arr));
			return writPromise;
		},
		finish: async () => {
			await writPromise;

			if (removed) {
				return Promise.reject(
					new Error('Already called .remove() on the result'),
				);
			}

			return Promise.resolve();
		},
		getBlob() {
			const arr = new Uint8Array(buf);
			return Promise.resolve(
				new File([arr.slice()], filename, {type: mimeType}),
			);
		},
		remove() {
			removed = true;
			return Promise.resolve();
		},
		getWrittenByteCount: () => buf.byteLength,
		updateDataAt: (position: number, newData: Uint8Array) => {
			writPromise = writPromise.then(() => updateDataAt(position, newData));
			return writPromise;
		},
	};
	return Promise.resolve(writer);
};
