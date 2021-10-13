const { MONGODB_URI, PORT } = process.env;

const config = {
    env: process.env.NODE_ENV || 'development',
    port: PORT || 3200,
    jwtSecret: process.env.JWT_SECRET || "YOUR_secret_key",
    mongoUri: MONGODB_URI
};


/*const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || "YOUR_secret_key",
    mongoUri: process.env.MONGODB_URI ||
        process.env.MONGO_HOST ||
        'mongodb://' + (process.env.IP || 'localhost') + ':' +
        (process.env.MONGO_PORT || '27017') +
        '/mernproject'
};*/

export default config
