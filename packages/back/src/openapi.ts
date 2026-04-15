import openapi from "@elysiajs/openapi";


export default openapi({
    path: '/docs',
    documentation: {
      info: {
        title: 'MKL IAM API',
        description: 'API pour la gestion des utilisateurs, des rôles et des permissions dans le système de gestion d\'identité de MKL.',
        version: '1.0.0',
        contact: {
          name: 'Cyprien Singez',
          email: 'cypriensgz@gmail.com'
        },
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    }
});
