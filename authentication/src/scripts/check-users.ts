// Script to check users in database
import dotenv from 'dotenv';
import path from 'path';
import { db } from '../db/connection';
import { users, sessions } from '../db/schema';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function checkUsers() {
  try {
    console.log('📊 Fetching all users from database...\n');

    const allUsers = await db.select().from(users);

    console.log(`Found ${allUsers.length} users in database:\n`);

    allUsers.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Skill Level: ${user.skill_level}`);
      console.log(`  Years Coding: ${user.years_coding}`);
      console.log(`  Years Hardware: ${user.years_hardware}`);
      console.log(`  Development Area: ${user.development_area}`);
      console.log(`  Robotics Experience: ${user.robotics_experience}`);
      console.log(`  Software Experience: ${JSON.stringify(user.software_experience)}`);
      console.log(`  Hardware Familiarity: ${JSON.stringify(user.hardware_familiarity)}`);
      console.log(`  Learning Path: ${user.learning_path}`);
      console.log(`  Created At: ${user.created_at}`);
      console.log('---\n');
    });

    console.log('📊 Fetching all sessions from database...\n');

    const allSessions = await db.select().from(sessions);

    console.log(`Found ${allSessions.length} sessions in database:\n`);

    allSessions.forEach((session, index) => {
      console.log(`Session ${index + 1}:`);
      console.log(`  ID: ${session.id}`);
      console.log(`  User ID: ${session.user_id}`);
      console.log(`  IP Address: ${session.ip_address}`);
      console.log(`  Expires At: ${session.expires_at}`);
      console.log(`  Created At: ${session.created_at}`);
      console.log('---\n');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUsers();
