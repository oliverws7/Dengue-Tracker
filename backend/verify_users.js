const { User } = require('./src/models');
const { connectDB, sequelize } = require('./src/config/database');

const verifyAllUsers = async () => {
    try {
        await connectDB();

        console.log('Connecting to database...');

        // Update all users to verified: true
        const [updatedRows] = await User.update(
            { verified: true },
            { where: {} } // Applied to all rows
        );

        console.log(`Successfully updated ${updatedRows} users to verified status.`);

    } catch (error) {
        console.error('Error updating users:', error);
    } finally {
        await sequelize.close();
    }
};

verifyAllUsers();
