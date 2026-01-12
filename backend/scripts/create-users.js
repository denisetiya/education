const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // Create Teacher
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    const teacher = await prisma.user.upsert({
        where: { email: 'guru@geo.edu' },
        update: {},
        create: {
            email: 'guru@geo.edu',
            password: teacherPassword,
            name: 'Pak Guru Geo',
            role: 'TEACHER'
        }
    });
    console.log('✅ Teacher created:', teacher.email);

    // Create Student
    const studentPassword = await bcrypt.hash('siswa123', 10);
    const student = await prisma.user.upsert({
        where: { email: 'budi@siswa.edu' },
        update: {},
        create: {
            email: 'budi@siswa.edu',
            password: studentPassword,
            name: 'Budi Siswa',
            role: 'STUDENT'
        }
    });
    console.log('✅ Student created:', student.email);

    console.log('\n🎉 Users created successfully!');
    console.log('\nCredentials:');
    console.log('Teacher: guru@geo.edu / teacher123');
    console.log('Student: budi@siswa.edu / siswa123');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
