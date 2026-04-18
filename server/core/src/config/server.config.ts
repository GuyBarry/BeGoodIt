import 'dotenv/config';

export const serverConfig = {
  port: process.env.PORT || 3000,
  servers: [
    {
      url: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`,
      description: 'Development server',
    },
  ],
};
