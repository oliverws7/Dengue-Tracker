const { User } = require('./src/models');
const { connectDB, sequelize } = require('./src/config/database');

const checkUsers = async () => {
    try {
        await connectDB();
        const users = await User.findAll();
        console.log('--- USERS ---');
        if (users.length === 0) {
            console.log('No users found.');
        } else {
            users.forEach(u => {
                console.log(`ID: ${u.id}, Email: ${u.email}, Verified: ${u.verified}`);
            });
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
};

checkUsers();
