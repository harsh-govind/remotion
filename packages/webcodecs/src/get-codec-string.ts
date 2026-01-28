import {chooseCorrectAvc1Profile} from './choose-correct-avc1-profile';
import {chooseCorrectHevcProfile} from './choose-correct-hevc-profile';
import type {ConvertMediaVideoCodec} from './get-available-video-codecs';

export const getCodecStringForEncoder = ({
	codec,
	fps,
	height,
	width,
}: {
	codec: ConvertMediaVideoCodec;
	fps: number | null;
	height: number;
	width: number;
}) => {
	return getCodecStringsForEncoder({codec, fps, height, width})[0];
};

export const getCodecStringsForEncoder = ({
	codec,
	fps,
	height,
	width,
}: {
	codec: ConvertMediaVideoCodec;
	fps: number | null;
	height: number;
	width: number;
}) => {
	if (codec === 'h264') {
		return [chooseCorrectAvc1Profile({fps, height, width})];
	}

	if (codec === 'h265') {
		const preferHighTier =
			width * height >= 3840 * 2160 || (fps ?? 60) >= 120;
		const candidates = [
			chooseCorrectHevcProfile({fps, height, width, preferHighTier}),
			chooseCorrectHevcProfile({
				fps,
				height,
				width,
				preferHighTier,
				brand: 'hev1',
			}),
			chooseCorrectHevcProfile({
				fps,
				height,
				width,
				preferHighTier,
				profileId: 2,
			}),
			chooseCorrectHevcProfile({
				fps,
				height,
				width,
				preferHighTier,
				profileId: 2,
				brand: 'hev1',
			}),
		];
		return Array.from(new Set(candidates));
	}

	if (codec === 'vp8') {
		return ['vp8'];
	}

	if (codec === 'vp9') {
		return ['vp09.00.10.08'];
	}

	throw new Error(`Unknown codec: ${codec satisfies never}`);
};
