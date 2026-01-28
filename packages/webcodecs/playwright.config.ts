import {defineConfig, devices, Project} from '@playwright/test';

export default defineConfig({
	projects: [
		{
			name: process.env.CI ? 'chromium' : 'chrome',
			use: {
				...devices['Desktop Chrome'],
				channel: process.env.CI ? undefined : 'chrome',
			},
		},
		{
			name: 'firefox',
			use: {...devices['Desktop Firefox']},
		},
		{
			name: 'webkit',
			use: {...devices['Desktop Safari']},
		},
	].filter(Boolean) as Project[],
});
