import mongoose from 'mongoose';

// mongoose.set('useNewUrlParser', true);
// mongoose.set('useUnifiedTopology', true);
// mongoose.set('useFindAndModify', false);

class Database {
    constructor() {
        Database.connect();
    }

    static async connect() {
        const { DB_USER, DB_PASSWORD, DB_NAME } = process.env;
        try {
            await mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@mockingbirdcluster.jnn3r.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`);
            console.info('Successfully connected to database');
        } catch (e) {
            console.error(e);
        }
    }
}

const db = new Database();

// export default db;
