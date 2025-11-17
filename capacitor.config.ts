import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.my.library',
  appName: 'My Library',
  webDir: 'dist/my-library-app/browser',

  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      launchAutoHide: false,
      androidScaleType: 'small',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      backgroundColor: '#19191b',
    }
  }
};

export default config;
