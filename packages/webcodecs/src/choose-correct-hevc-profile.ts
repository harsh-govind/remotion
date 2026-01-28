import {hevcLevels} from './hevc-levels';

export const chooseCorrectHevcProfile = ({
	width,
	height,
	fps,
	profileId = 1,
	brand = 'hvc1',
	preferHighTier = false,
}: {
	width: number;
	height: number;
	fps: number | null;
	profileId?: 1 | 2;
	brand?: 'hvc1' | 'hev1';
	preferHighTier?: boolean;
}) => {
	const level = hevcLevels.find((p) => {
		return p.maxResolutionsAndFrameRates.some((max) => {
			if (width > max.width) {
				return false;
			}

			if (height > max.height) {
				return false;
			}

			// if has no fps, use 60 as a conservative fallback
			const fallbackFps = fps ?? 60;
			return fallbackFps <= max.fps;
		});
	});

	if (!level) {
		throw new Error(
			`No suitable HEVC profile found for ${width}x${height}@${fps}fps`,
		);
	}

	const tier = preferHighTier && level.maxBitrateHighTier ? 'H' : 'L';

	// HEVC codec string format: hev1.2.${level_hex} or hvc1.2.${level_hex}
	// We'll use hvc1 as it's more widely supported
	return `${brand}.${
		// Profile
		// 1 = Main
		// 2 = Main 10
		// Chrome seems to support only Main
		profileId
	}.${
		// Profile space
		// Unclear which value to set, but 0 works
		0
	}.${
		// L = Main tier
		// H = High tier
		tier
	}${
		// Level
		Math.round(Number(level.level) * 30)
	}.${
		// Bit depth
		'b0'
	}`;
};
