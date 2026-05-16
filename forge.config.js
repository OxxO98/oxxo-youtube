const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    icon : './public/favicon.ico',
    ignore: [
      /node_modules[\\/]nodejs-whisper[\\/]cpp[\\/]whisper\.cpp[\\/]models([\\/].*)?$/,
      /server[\\/]Asset[\\/]Logs([\\/].*)?$/,
      /server[\\/]Asset[\\/]transcript([\\/].*)?$/,
      /server[\\/]Asset[\\/]db[\\/]backup([\\/].*)?$/,
      /node_modules[\\/].cache([\\/].*)?$/,
      /node_modules[\\/].bin([\\/].*)?$/,
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32']
    },
    {
      name: '@electron-forge/maker-wix',
      config: {
        language: 1033,
        manufacturer: 'OxxO',
        exe: 'oxxo_youtube.exe',
        icon : './public/favicon.ico',
        ui: true
      },
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};