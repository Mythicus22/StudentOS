import 'dotenv/config';
import { connectDB } from './database/index.js';
import { Users, Activities, Todos, Notes, ToolUsage } from './database/model.js';
import bcrypt from 'bcrypt';

const seedDemoUser = async () => {
    try {
        await connectDB();
        console.log('Connected to database');

        const username = 'demo';
        const password = 'demo1234';

        const existing = await Users.findOne({ username });
        if (existing) {
            console.log('Demo user already exists');
            process.exit(0);
        }

        const hash = await bcrypt.hash(password, 7);
        const user = await Users.create({ username, password: hash });
        console.log('✓ Created user:', username);

        await Activities.create({ uid: user._id, history: [{ action: 'Account Created', time: new Date() }] });
        await Todos.create({ uid: user._id, todos: [] });
        await Notes.create({ uid: user._id, notes: [] });
        await ToolUsage.create({ uid: user._id, tools: [] });
        
        console.log('✓ Initialized all collections');
        console.log('\n=== Demo User Created ===');
        console.log('Username: demo');
        console.log('Password: demo1234');
        console.log('========================\n');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedDemoUser();
