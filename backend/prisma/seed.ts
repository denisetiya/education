import prisma from '../src/utils/prisma';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('🌱 Seeding database...');

    // Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@geo.edu' },
        update: { password: adminPassword },
        create: {
            email: 'admin@geo.edu',
            password: adminPassword,
            name: 'Super Admin',
            role: 'ADMIN',
            xp: 0,
            level: 1
        }
    });
    console.log('✅ Created admin:', admin.email);

    // Create Teacher
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    const teacher = await prisma.user.upsert({
        where: { email: 'guru@geo.edu' },
        update: { password: teacherPassword },
        create: {
            email: 'guru@geo.edu',
            password: teacherPassword,
            name: 'Pak Guru Budi',
            role: 'TEACHER',
            xp: 0,
            level: 1
        }
    });
    console.log('✅ Created teacher:', teacher.email);

    // Create Students
    const studentPassword = await bcrypt.hash('siswa123', 10);
    const students = [];
    const studentData = [
        { name: 'Budi Santoso', email: 'budi@siswa.edu', xp: 4500, level: 8, streak: 12 },
        { name: 'Siti Aminah', email: 'siti@siswa.edu', xp: 4200, level: 7, streak: 8 },
        { name: 'Ahmad Dani', email: 'ahmad@siswa.edu', xp: 3800, level: 6, streak: 5 },
        { name: 'Dewi Lestari', email: 'dewi@siswa.edu', xp: 2450, level: 4, streak: 3 },
        { name: 'Rudi Hermawan', email: 'rudi@siswa.edu', xp: 1800, level: 3, streak: 1 },
    ];

    for (const data of studentData) {
        const student = await prisma.user.upsert({
            where: { email: data.email },
            update: {},
            create: {
                email: data.email,
                password: studentPassword,
                name: data.name,
                role: 'STUDENT',
                xp: data.xp,
                level: data.level,
                streak: data.streak
            }
        });
        students.push(student);
        console.log('✅ Created student:', student.email);
    }

    // Create Materials
    const materials = [
        { title: 'Aljabar Dasar: Pengenalan', type: 'video', category: 'Matematika', level: 'Mudah', grade: 10, semester: 1 },
        { title: 'Persamaan Linear', type: 'book', category: 'Matematika', level: 'Mudah', grade: 10, semester: 1 },
        { title: 'Hukum Newton I, II, III', type: 'video', category: 'Fisika', level: 'Menengah', grade: 10, semester: 1 },
        { title: 'Struktur Sel Hewan', type: 'video', category: 'Biologi', level: 'Sulit', grade: 11, semester: 1 },
        { title: 'Sejarah Kemerdekaan', type: 'book', category: 'Sejarah', level: 'Mudah', grade: 12, semester: 1 },
        { title: 'Trigonometri Lanjut', type: 'video', category: 'Matematika', level: 'Sulit', grade: 11, semester: 2 },
    ];

    for (const mat of materials) {
        await prisma.material.create({
            data: {
                ...mat,
                createdById: teacher.id
            }
        });
    }
    console.log('✅ Created', materials.length, 'materials');

    // Create achievements for top students
    await prisma.achievement.create({
        data: {
            title: 'Pembelajar Rajin',
            description: 'Login 7 hari berturut-turut',
            icon: '🏆',
            userId: students[0].id
        }
    });
    await prisma.achievement.create({
        data: {
            title: 'Jago Aljabar',
            description: 'Selesaikan Bab Aljabar 100%',
            icon: '🏅',
            userId: students[0].id
        }
    });
    console.log('✅ Created achievements');

    console.log('🎉 Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
