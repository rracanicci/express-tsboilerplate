const swaggerConfig = {
  swaggerDefinition: {
    info: {
      title: 'Express Typescript Boilerplate',
      version: '0.0.1',
      descripion: 'API Documentation',
      contact: {
        name: 'Rodrigo Martins Racanicci',
        email: 'rodrigoracanicci@gmail.com'
      }
    },
    basePath: '/'
  },
  apis: ['dist/controllers/*.js']
};

export default swaggerConfig;