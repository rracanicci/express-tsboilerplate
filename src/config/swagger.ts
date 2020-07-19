const swaggerConfig = {
  swaggerDefinition: {
    openapi: '3.0.3',
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
  apis: ['dist/controllers/*.js', 'dist/api-docs/*']
};

export default swaggerConfig;