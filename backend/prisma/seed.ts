import bcrypt from 'bcryptjs';
import prisma from '../src/utils/prisma';

const PASSWORDS = {
    admin: 'Admin12345',
    teacher: 'Guru12345',
    student: 'Siswa12345'
} as const;

const resetDatabase = async () => {
    await prisma.studentClassAchievement.deleteMany();
    await prisma.achievement.deleteMany();
    await prisma.progress.deleteMany();
    await prisma.exerciseAttempt.deleteMany();
    await prisma.classAchievement.deleteMany();
    await prisma.classExercise.deleteMany();
    await prisma.classBook.deleteMany();
    await prisma.classEnrollment.deleteMany();
    await prisma.material.deleteMany();
    await prisma.module.deleteMany();
    await prisma.class.deleteMany();
    await prisma.user.deleteMany();
};

async function main() {
    console.log('Resetting SQLite dev data...');
    await resetDatabase();

    const [adminPassword, teacherPassword, studentPassword] = await Promise.all([
        bcrypt.hash(PASSWORDS.admin, 10),
        bcrypt.hash(PASSWORDS.teacher, 10),
        bcrypt.hash(PASSWORDS.student, 10)
    ]);

    const admin = await prisma.user.create({
        data: {
            email: 'admin@geo.edu',
            password: adminPassword,
            name: 'Super Admin Geo',
            role: 'ADMIN',
            xp: 0,
            level: 1,
            streak: 0
        }
    });

    const teacher = await prisma.user.create({
        data: {
            email: 'guru@geo.edu',
            password: teacherPassword,
            name: 'Pak Budi Santosa',
            role: 'TEACHER',
            xp: 1250,
            level: 4,
            streak: 9
        }
    });

    const teacherAssistant = await prisma.user.create({
        data: {
            email: 'wali@geo.edu',
            password: teacherPassword,
            name: 'Bu Rina Kartika',
            role: 'TEACHER',
            xp: 980,
            level: 3,
            streak: 6
        }
    });

    const [alya, reza, nisa, farhan] = await Promise.all([
        prisma.user.create({
            data: {
                email: 'alya@siswa.edu',
                password: studentPassword,
                name: 'Alya Ramadhani',
                role: 'STUDENT',
                xp: 980,
                level: 5,
                streak: 8
            }
        }),
        prisma.user.create({
            data: {
                email: 'reza@siswa.edu',
                password: studentPassword,
                name: 'Reza Pratama',
                role: 'STUDENT',
                xp: 720,
                level: 4,
                streak: 5
            }
        }),
        prisma.user.create({
            data: {
                email: 'nisa@siswa.edu',
                password: studentPassword,
                name: 'Nisa Maharani',
                role: 'STUDENT',
                xp: 430,
                level: 3,
                streak: 2
            }
        }),
        prisma.user.create({
            data: {
                email: 'farhan@siswa.edu',
                password: studentPassword,
                name: 'Farhan Maulana',
                role: 'STUDENT',
                xp: 260,
                level: 2,
                streak: 1
            }
        })
    ]);

    const geometryClass = await prisma.class.create({
        data: {
            name: 'Geometri Kelas X-A',
            subject: 'Matematika',
            description: 'Kelas utama untuk materi sudut, koordinat, dan bangun datar.',
            code: 'GEOXA1',
            isPublic: true,
            progressionMode: 'sequential',
            teacherId: teacher.id,
            thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80',
            xpMultiplier: 1.2,
            geogebraEnabled: true
        }
    });

    const mapsClass = await prisma.class.create({
        data: {
            name: 'Eksplorasi Peta Nusantara',
            subject: 'Geografi',
            description: 'Belajar membaca peta, simbol, dan data spasial dengan studi kasus Indonesia.',
            code: 'PETA11',
            isPublic: true,
            progressionMode: 'free',
            teacherId: teacher.id,
            thumbnail: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?auto=format&fit=crop&w=1200&q=80',
            xpMultiplier: 1,
            geogebraEnabled: false
        }
    });

    const olympiadClass = await prisma.class.create({
        data: {
            name: 'Kelas Privat Olimpiade',
            subject: 'Matematika',
            description: 'Kelas privat pendalaman soal olimpiade untuk siswa pilihan.',
            code: 'OLIMP1',
            isPublic: false,
            progressionMode: 'sequential',
            teacherId: teacherAssistant.id,
            xpMultiplier: 1.5,
            geogebraEnabled: true
        }
    });

    await prisma.classEnrollment.createMany({
        data: [
            { classId: geometryClass.id, studentId: alya.id },
            { classId: geometryClass.id, studentId: reza.id },
            { classId: geometryClass.id, studentId: nisa.id },
            { classId: mapsClass.id, studentId: alya.id },
            { classId: mapsClass.id, studentId: farhan.id },
            { classId: olympiadClass.id, studentId: reza.id }
        ]
    });

    const geometryBasicsModule = await prisma.module.create({
        data: {
            title: 'Dasar Geometri dan Sudut',
            description: 'Pengenalan titik, garis, sudut, dan hubungan antarsudut.',
            grade: 10,
            semester: 1,
            subject: 'Matematika',
            classId: geometryClass.id,
            order: 0
        }
    });

    const coordinateModule = await prisma.module.create({
        data: {
            title: 'Koordinat dan Bangun Datar',
            description: 'Memahami koordinat kartesius, persegi, persegi panjang, dan segitiga.',
            grade: 10,
            semester: 1,
            subject: 'Matematika',
            classId: geometryClass.id,
            order: 1
        }
    });

    const mapModule = await prisma.module.create({
        data: {
            title: 'Membaca Peta dan Simbol',
            description: 'Belajar skala, legenda, dan interpretasi peta sederhana.',
            grade: 10,
            semester: 1,
            subject: 'Geografi',
            classId: mapsClass.id,
            order: 0
        }
    });

    await prisma.module.create({
        data: {
            title: 'Bank Soal Remedial Geometri',
            description: 'Module cadangan untuk pengayaan dan remedial.',
            grade: 10,
            semester: 1,
            subject: 'Matematika',
            order: 99
        }
    });

    const angleLesson = await prisma.material.create({
        data: {
            title: 'Mengenal Titik, Garis, dan Sudut',
            type: 'article',
            category: 'Matematika',
            level: 'Mudah',
            grade: 10,
            semester: 1,
            content: '<h2>Dasar Geometri</h2><p>Materi pengantar untuk memahami bentuk dasar geometri di sekitar kita.</p>',
            moduleId: geometryBasicsModule.id,
            moduleOrder: 1,
            order: 1,
            createdById: teacher.id
        }
    });

    const angleSummary = await prisma.material.create({
        data: {
            title: 'Ringkasan Hubungan Antar Sudut',
            type: 'book',
            category: 'Matematika',
            level: 'Mudah',
            grade: 10,
            semester: 1,
            content: '<p>Sudut berseberangan, sehadap, dalam berseberangan, dan pelurus.</p>',
            moduleId: geometryBasicsModule.id,
            moduleOrder: 2,
            order: 2,
            createdById: teacher.id
        }
    });

    const angleQuiz = await prisma.material.create({
        data: {
            title: 'Kuis Sudut Istimewa',
            type: 'quiz',
            category: 'Matematika',
            level: 'Menengah',
            grade: 10,
            semester: 1,
            content: JSON.stringify({
                questions: [
                    {
                        question: 'Jika dua garis sejajar dipotong garis lain, sudut sehadap memiliki besar...',
                        options: ['Selalu berbeda', 'Selalu sama', 'Selalu nol', 'Tidak bisa ditentukan'],
                        answer: 1
                    }
                ]
            }),
            moduleId: geometryBasicsModule.id,
            moduleOrder: 3,
            order: 3,
            minPassingScore: 80,
            createdById: teacher.id
        }
    });

    await prisma.material.update({
        where: { id: angleLesson.id },
        data: {
            linkedQuizId: angleQuiz.id
        }
    });

    const coordinateLesson = await prisma.material.create({
        data: {
            title: 'Koordinat Kartesius untuk Pemula',
            type: 'video',
            category: 'Matematika',
            level: 'Menengah',
            grade: 10,
            semester: 1,
            content: JSON.stringify({
                videoUrl: 'https://example.com/videos/koordinat-kartesius',
                durationMinutes: 14
            }),
            moduleId: coordinateModule.id,
            moduleOrder: 1,
            order: 1,
            createdById: teacher.id
        }
    });

    const rectangleLesson = await prisma.material.create({
        data: {
            title: 'Luas Persegi dan Persegi Panjang',
            type: 'article',
            category: 'Matematika',
            level: 'Mudah',
            grade: 10,
            semester: 1,
            content: '<p>Rumus luas persegi adalah sisi x sisi, sedangkan persegi panjang adalah panjang x lebar.</p>',
            moduleId: coordinateModule.id,
            moduleOrder: 2,
            order: 2,
            createdById: teacher.id
        }
    });

    const mapsLesson = await prisma.material.create({
        data: {
            title: 'Simbol Peta dan Legenda',
            type: 'article',
            category: 'Geografi',
            level: 'Mudah',
            grade: 10,
            semester: 1,
            content: '<p>Pahami simbol warna, kontur, dan legenda untuk membaca peta secara efektif.</p>',
            moduleId: mapModule.id,
            moduleOrder: 1,
            order: 1,
            createdById: teacher.id
        }
    });

    const mapsVideo = await prisma.material.create({
        data: {
            title: 'Membaca Skala Peta',
            type: 'video',
            category: 'Geografi',
            level: 'Menengah',
            grade: 10,
            semester: 1,
            content: JSON.stringify({
                videoUrl: 'https://example.com/videos/skala-peta',
                durationMinutes: 11
            }),
            moduleId: mapModule.id,
            moduleOrder: 2,
            order: 2,
            createdById: teacher.id
        }
    });

    await prisma.progress.createMany({
        data: [
            {
                userId: alya.id,
                materialId: angleLesson.id,
                status: 'completed',
                score: 95,
                timeSpent: 720,
                completedAt: new Date('2026-03-10T08:00:00.000Z')
            },
            {
                userId: alya.id,
                materialId: angleSummary.id,
                status: 'completed',
                score: 88,
                timeSpent: 600,
                completedAt: new Date('2026-03-10T08:25:00.000Z')
            },
            {
                userId: alya.id,
                materialId: angleQuiz.id,
                status: 'completed',
                score: 92,
                timeSpent: 420,
                completedAt: new Date('2026-03-10T08:45:00.000Z')
            },
            {
                userId: alya.id,
                materialId: coordinateLesson.id,
                status: 'in_progress',
                score: null,
                timeSpent: 240
            },
            {
                userId: reza.id,
                materialId: angleLesson.id,
                status: 'completed',
                score: 78,
                timeSpent: 850,
                completedAt: new Date('2026-03-09T09:00:00.000Z')
            },
            {
                userId: reza.id,
                materialId: angleSummary.id,
                status: 'completed',
                score: 80,
                timeSpent: 700,
                completedAt: new Date('2026-03-09T09:30:00.000Z')
            },
            {
                userId: reza.id,
                materialId: angleQuiz.id,
                status: 'completed',
                score: 72,
                timeSpent: 510,
                completedAt: new Date('2026-03-09T09:50:00.000Z')
            },
            {
                userId: nisa.id,
                materialId: angleLesson.id,
                status: 'in_progress',
                score: null,
                timeSpent: 180
            },
            {
                userId: farhan.id,
                materialId: mapsLesson.id,
                status: 'completed',
                score: 85,
                timeSpent: 540,
                completedAt: new Date('2026-03-08T10:15:00.000Z')
            }
        ]
    });

    await prisma.achievement.createMany({
        data: [
            {
                title: 'Siswa Aktif Minggu Ini',
                description: 'Menyelesaikan minimal tiga materi dalam satu minggu.',
                icon: 'medal',
                userId: alya.id
            },
            {
                title: 'Progress Stabil',
                description: 'Menyelesaikan dua materi berturut-turut tanpa tertinggal.',
                icon: 'target',
                userId: reza.id
            }
        ]
    });

    const classAchievementMaterials = await prisma.classAchievement.create({
        data: {
            title: 'Navigator Sudut',
            description: 'Selesaikan minimal dua materi pertama di kelas geometri.',
            icon: 'compass',
            xpReward: 40,
            condition: JSON.stringify({ type: 'complete_materials', target: 2 }),
            classId: geometryClass.id
        }
    });

    await prisma.classAchievement.create({
        data: {
            title: 'Skor 90 Plus',
            description: 'Capai nilai kuis 90 atau lebih pada materi sudut.',
            icon: 'star',
            xpReward: 60,
            condition: JSON.stringify({ type: 'quiz_score', target: 90 }),
            classId: geometryClass.id
        }
    });

    await prisma.studentClassAchievement.create({
        data: {
            studentId: alya.id,
            achievementId: classAchievementMaterials.id
        }
    });

    await prisma.classBook.createMany({
        data: [
            {
                classId: geometryClass.id,
                title: 'Geometri Ringkas Semester 1',
                author: 'Pak Budi Santosa',
                description: 'Buku ringkas yang merangkum materi geometri inti.',
                contentType: 'rich_text',
                content: '<h2>Geometri Ringkas</h2><p>Gunakan buku ini untuk belajar cepat sebelum kuis.</p>'
            },
            {
                classId: geometryClass.id,
                title: 'Latihan Tambahan Sudut',
                author: 'Tim Geo Education',
                description: 'Kumpulan latihan penguatan konsep sudut.',
                contentType: 'rich_text',
                content: '<p>Kumpulan soal tambahan untuk latihan mandiri siswa.</p>'
            },
            {
                classId: mapsClass.id,
                title: 'Atlas Mini Nusantara',
                author: 'Bu Rina Kartika',
                description: 'Materi pengenalan atlas dan simbol peta.',
                contentType: 'rich_text',
                content: '<p>Atlas mini untuk mengenal simbol, warna, dan skala peta.</p>'
            }
        ]
    });

    const exerciseMultipleChoice = await prisma.classExercise.create({
        data: {
            classId: geometryClass.id,
            title: 'Menentukan Sudut Sehadap',
            description: 'Pilih besar sudut yang benar dari gambar dua garis sejajar.',
            instructions: '<p>Amati ilustrasi dan pilih jawaban yang sesuai.</p>',
            exerciseType: 'geometry',
            difficulty: 'easy',
            points: 10,
            answerType: 'multiple_choice',
            correctAnswer: JSON.stringify({ id: 'opt_b' }),
            options: JSON.stringify([
                { id: 'opt_a', text: '60 derajat', isCorrect: false },
                { id: 'opt_b', text: '80 derajat', isCorrect: true },
                { id: 'opt_c', text: '100 derajat', isCorrect: false }
            ]),
            isPublished: true,
            order: 1
        }
    });

    const exerciseNumeric = await prisma.classExercise.create({
        data: {
            classId: geometryClass.id,
            title: 'Hitung Luas Persegi',
            description: 'Sebuah persegi memiliki sisi 7 cm. Hitung luasnya.',
            instructions: '<p>Masukkan jawaban numerik tanpa satuan.</p>',
            exerciseType: 'calculation',
            difficulty: 'easy',
            points: 15,
            answerType: 'numeric',
            correctAnswer: JSON.stringify({ value: 49, tolerance: 0 }),
            isPublished: true,
            order: 2
        }
    });

    const exerciseCanvas = await prisma.classExercise.create({
        data: {
            classId: geometryClass.id,
            title: 'Gambar Segitiga Sama Kaki',
            description: 'Buat sketsa segitiga sama kaki dengan penjelasan singkat.',
            instructions: '<p>Gunakan canvas untuk menggambar, lalu kirim hasilnya untuk dinilai guru.</p>',
            exerciseType: 'geometry',
            difficulty: 'medium',
            points: 20,
            canvasState: JSON.stringify({
                elements: [],
                viewport: { zoom: 1, x: 0, y: 0 }
            }),
            canvasMode: 'interactive',
            answerType: 'canvas',
            isPublished: true,
            order: 3
        }
    });

    await prisma.classExercise.create({
        data: {
            classId: geometryClass.id,
            title: 'Draft Soal Transformasi',
            description: 'Draft internal guru untuk materi transformasi geometri.',
            exerciseType: 'mixed',
            difficulty: 'hard',
            points: 25,
            answerType: 'mixed',
            isPublished: false,
            order: 4
        }
    });

    await prisma.exerciseAttempt.createMany({
        data: [
            {
                studentId: alya.id,
                exerciseId: exerciseMultipleChoice.id,
                answer: JSON.stringify('opt_b'),
                isCorrect: true,
                score: 10,
                gradingStatus: 'graded',
                feedback: 'Jawaban sudah tepat dan alasanmu jelas.',
                gradedAt: new Date('2026-03-10T09:00:00.000Z'),
                timeSpent: 90
            },
            {
                studentId: reza.id,
                exerciseId: exerciseMultipleChoice.id,
                answer: JSON.stringify('opt_a'),
                isCorrect: false,
                score: 0,
                gradingStatus: 'graded',
                feedback: 'Perhatikan lagi konsep sudut sehadap pada dua garis sejajar.',
                gradedAt: new Date('2026-03-09T10:05:00.000Z'),
                timeSpent: 140
            },
            {
                studentId: alya.id,
                exerciseId: exerciseNumeric.id,
                answer: JSON.stringify(49),
                isCorrect: true,
                score: 15,
                gradingStatus: 'graded',
                feedback: 'Perhitungan luas persegi sudah benar.',
                gradedAt: new Date('2026-03-10T09:10:00.000Z'),
                timeSpent: 75
            },
            {
                studentId: nisa.id,
                exerciseId: exerciseCanvas.id,
                answer: JSON.stringify(null),
                canvasData: JSON.stringify({
                    elements: [{ type: 'triangle', points: [[0, 0], [60, 0], [30, 50]] }],
                    notes: 'Sisi kiri dan kanan dibuat sama panjang.'
                }),
                isCorrect: false,
                score: 0,
                gradingStatus: 'pending_review',
                gradedAt: null,
                timeSpent: 420
            }
        ]
    });

    console.log('Seed complete.');
    console.log('');
    console.log('Login accounts:');
    console.log(`- Admin   : ${admin.email} / ${PASSWORDS.admin}`);
    console.log(`- Teacher : ${teacher.email} / ${PASSWORDS.teacher}`);
    console.log(`- Teacher : ${teacherAssistant.email} / ${PASSWORDS.teacher}`);
    console.log(`- Student : ${alya.email} / ${PASSWORDS.student}`);
    console.log(`- Student : ${reza.email} / ${PASSWORDS.student}`);
    console.log(`- Student : ${nisa.email} / ${PASSWORDS.student}`);
    console.log(`- Student : ${farhan.email} / ${PASSWORDS.student}`);
    console.log('');
    console.log('Class codes:');
    console.log(`- ${geometryClass.name}: ${geometryClass.code}`);
    console.log(`- ${mapsClass.name}: ${mapsClass.code}`);
    console.log(`- ${olympiadClass.name}: ${olympiadClass.code}`);
}

main()
    .catch((error) => {
        console.error('Seed failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
