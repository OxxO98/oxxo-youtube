const DEFAULT_SETTINGS = Object.freeze({
  general: Object.freeze({
    language: 'ko',
  }),
  audioDucking: Object.freeze({
    enabled: true,
    duckLevel: 0.25,
  }),
});

async function loadInitialSettings() {
  const { default: Store } = await import('electron-store');

  const store = new Store({
    name: 'settings',
    clearInvalidConfig: true,
    schema: {
      general: {
        type: 'object',
        additionalProperties: false,
        properties: {
          language: {
            type: 'string',
            enum: ['ko', 'ja'],
          },
        },
        required: ['language'],
      },
      audioDucking: {
        type: 'object',
        additionalProperties: false,
        properties: {
          enabled: {
            type: 'boolean',
          },
          duckLevel: {
            type: 'number',
            minimum: 0.01,
            maximum: 1,
          },
        },
        required: ['enabled', 'duckLevel'],
      },
    },
    defaults: DEFAULT_SETTINGS,
  });

  const general = store.get('general');
  const audioDucking = store.get('audioDucking');

  return Object.freeze({
    general: Object.freeze({ ...general }),
    audioDucking: Object.freeze({ ...audioDucking }),
  });
}

module.exports = {
  DEFAULT_SETTINGS,
  loadInitialSettings,
};
