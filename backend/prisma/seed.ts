import bcrypt from 'bcryptjs';
import prisma from '../src/utils/prisma';
import {
    gradeExerciseSubmission,
    projectQuestionSetToLegacyFields,
    serializeQuestionSet,
    type ExerciseQuestion
} from '../src/features/exercises/exercise-config';

const PASSWORDS = {
    admin: 'Admin12345',
    teacher: 'Guru12345',
    student: 'Siswa12345'
} as const;

const resetDatabase = async () => {
    await prisma.classDiscussionReply.deleteMany();
    await prisma.classDiscussionThread.deleteMany();
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

    await prisma.material.create({
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

    await prisma.material.create({
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

    const graphCanvasState = {
        objects: [],
        measurements: [],
        functions: [
            {
                id: 'fn_parabola',
                expression: 'x^2',
                displayName: 'y = x^2',
                color: '#e11d48',
                visible: true
            }
        ],
        selectedObjectId: null,
        currentTool: 'select',
        zoom: 1,
        pan: { x: 0, y: 0 },
        gridEnabled: true,
        snapToGrid: true
    };

    const constructionCanvasState = {
        objects: [],
        measurements: [],
        functions: [],
        selectedObjectId: null,
        currentTool: 'select',
        zoom: 1,
        pan: { x: 0, y: 0 },
        gridEnabled: true,
        snapToGrid: true
    };

    const createClassExercise = async (config: {
        classId: string;
        title: string;
        description: string;
        instructions: string;
        exerciseType: string;
        difficulty: string;
        hasTimer?: boolean;
        timerMinutes?: number | null;
        isPublished: boolean;
        order: number;
        questions: ExerciseQuestion[];
    }) => {
        const projected = projectQuestionSetToLegacyFields(config.questions);

        return prisma.classExercise.create({
            data: {
                classId: config.classId,
                title: config.title,
                description: config.description,
                instructions: config.instructions,
                exerciseType: config.exerciseType,
                difficulty: config.difficulty,
                hasTimer: Boolean(config.hasTimer),
                timerMinutes: config.hasTimer ? config.timerMinutes ?? null : null,
                isPublished: config.isPublished,
                order: config.order,
                questionSet: serializeQuestionSet(config.questions),
                points: projected.points,
                answerType: projected.answerType,
                correctAnswer: projected.correctAnswer,
                options: projected.options,
                canvasState: projected.canvasState,
                canvasMode: projected.canvasMode
            }
        });
    };

    const exerciseGraphQuestions: ExerciseQuestion[] = [
        {
            id: 'grafik_1',
            title: 'Baca nilai fungsi',
            prompt: 'Grafik parabola telah ditampilkan. Berapa nilai y saat x = 3?',
            type: 'numeric',
            points: 10,
            correctValue: 9,
            tolerance: 0,
            placeholder: 'Contoh: 9',
            manualReview: false,
            visual: {
                enabled: true,
                canvasState: graphCanvasState,
                canvasMode: 'readonly',
                showFunctionPanel: false,
                hideFunctionExpressions: true,
                showCoordinates: false,
                showToolbar: false,
                compactToolbar: true
            }
        },
        {
            id: 'grafik_2',
            title: 'Sumbu simetri',
            prompt: 'Berdasarkan grafik yang sama, sumbu simetri parabola adalah...',
            type: 'multiple_choice',
            points: 8,
            tolerance: 0,
            options: [
                { id: 'axis_a', text: 'x = -1' },
                { id: 'axis_b', text: 'x = 0', isCorrect: true },
                { id: 'axis_c', text: 'y = 0' }
            ],
            correctOptionId: 'axis_b',
            manualReview: false,
            visual: {
                enabled: true,
                canvasState: graphCanvasState,
                canvasMode: 'readonly',
                showFunctionPanel: false,
                hideFunctionExpressions: true,
                showCoordinates: false,
                showToolbar: false,
                compactToolbar: true
            }
        },
        {
            id: 'grafik_3',
            title: 'Luas bangun datar',
            prompt: 'Sebuah persegi panjang memiliki panjang 8 cm dan lebar 3 cm. Berapa luasnya?',
            type: 'shape_area',
            points: 12,
            correctValue: 24,
            tolerance: 0,
            placeholder: 'Masukkan luas tanpa satuan',
            manualReview: false,
            shape: {
                shapeType: 'rectangle',
                measurements: [
                    { label: 'Panjang', value: 8, unit: 'cm' },
                    { label: 'Lebar', value: 3, unit: 'cm' }
                ],
                formulaHint: 'Luas = panjang x lebar'
            }
        }
    ];

    const exercisePlaneShapeQuestions: ExerciseQuestion[] = [
        {
            id: 'bangun_1',
            title: 'Keliling persegi',
            prompt: 'Hitung keliling persegi dengan panjang sisi 7 cm.',
            type: 'shape_perimeter',
            points: 10,
            correctValue: 28,
            tolerance: 0,
            placeholder: 'Jawaban tanpa satuan',
            manualReview: false,
            shape: {
                shapeType: 'square',
                measurements: [
                    { label: 'Sisi', value: 7, unit: 'cm' }
                ],
                formulaHint: 'Keliling = 4 x sisi'
            }
        },
        {
            id: 'bangun_2',
            title: 'Luas segitiga',
            prompt: 'Sebuah segitiga memiliki alas 10 cm dan tinggi 6 cm. Tentukan luasnya.',
            type: 'numeric',
            points: 10,
            correctValue: 30,
            tolerance: 0,
            placeholder: 'Jawaban tanpa satuan',
            manualReview: false
        },
        {
            id: 'bangun_3',
            title: 'Identifikasi bangun',
            prompt: 'Bangun datar yang semua sisinya sama panjang dan semua sudutnya siku-siku disebut...',
            type: 'short_text',
            points: 5,
            tolerance: 0,
            acceptedText: 'persegi',
            manualReview: false,
            placeholder: 'Tulis nama bangun datar'
        }
    ];

    const exerciseConstructionQuestions: ExerciseQuestion[] = [
        {
            id: 'konstruksi_1',
            title: 'Gambar segitiga sama kaki',
            prompt: 'Gunakan canvas untuk menggambar segitiga sama kaki. Tandai dua sisi yang sama panjang.',
            type: 'canvas',
            points: 15,
            tolerance: 0,
            manualReview: true,
            visual: {
                enabled: true,
                canvasState: constructionCanvasState,
                canvasMode: 'interactive',
                showFunctionPanel: false,
                hideFunctionExpressions: true,
                showCoordinates: false,
                showToolbar: true,
                compactToolbar: true
            }
        },
        {
            id: 'konstruksi_2',
            title: 'Jelaskan alasan',
            prompt: 'Tuliskan singkat bagaimana kamu memastikan dua sisinya sama panjang.',
            type: 'short_text',
            points: 5,
            tolerance: 0,
            manualReview: true,
            placeholder: 'Jelaskan cara kamu menggambar'
        }
    ];

    const draftExerciseQuestions: ExerciseQuestion[] = [
        {
            id: 'draft_1',
            title: 'Refleksi titik',
            prompt: 'Bayangan titik (2, 4) terhadap sumbu-Y adalah...',
            type: 'multiple_choice',
            points: 10,
            tolerance: 0,
            options: [
                { id: 'draft_a', text: '(2, -4)' },
                { id: 'draft_b', text: '(-2, 4)', isCorrect: true },
                { id: 'draft_c', text: '(-4, 2)' }
            ],
            correctOptionId: 'draft_b',
            manualReview: false
        },
        {
            id: 'draft_2',
            title: 'Skala dilatasi',
            prompt: 'Jika titik (3, 2) didilatasi terhadap titik asal dengan skala 2, koordinat barunya adalah...',
            type: 'short_text',
            acceptedText: '(6, 4)',
            points: 8,
            tolerance: 0,
            manualReview: false,
            placeholder: 'Contoh: (6, 4)'
        }
    ];

    const exerciseGraph = await createClassExercise({
        classId: geometryClass.id,
        title: 'Paket Grafik Fungsi dan Luas',
        description: 'Latihan grafik fungsi dengan rumus disembunyikan dan satu soal luas bangun datar.',
        instructions: '<p>Kerjakan setiap soal secara berurutan. Beberapa soal memakai visual grafik, tetapi rumus sengaja disembunyikan untuk siswa.</p>',
        exerciseType: 'algebra_visual',
        difficulty: 'medium',
        hasTimer: true,
        timerMinutes: 12,
        isPublished: true,
        order: 1,
        questions: exerciseGraphQuestions
    });

    const exercisePlaneShapes = await createClassExercise({
        classId: geometryClass.id,
        title: 'Bangun Datar Dasar',
        description: 'Fokus pada luas, keliling, dan identifikasi bangun datar.',
        instructions: '<p>Gunakan rumus bangun datar yang paling tepat, lalu tuliskan jawabanmu.</p>',
        exerciseType: 'plane_geometry',
        difficulty: 'easy',
        isPublished: true,
        order: 2,
        questions: exercisePlaneShapeQuestions
    });

    const exerciseConstruction = await createClassExercise({
        classId: geometryClass.id,
        title: 'Konstruksi Segitiga Sama Kaki',
        description: 'Latihan menggambar dan menjelaskan hasil konstruksi.',
        instructions: '<p>Soal ini membutuhkan canvas interaktif dan akan direview langsung oleh guru.</p>',
        exerciseType: 'constructive_geometry',
        difficulty: 'medium',
        isPublished: true,
        order: 3,
        questions: exerciseConstructionQuestions
    });

    await createClassExercise({
        classId: geometryClass.id,
        title: 'Draft Transformasi Koordinat',
        description: 'Draft internal guru untuk materi transformasi dan refleksi.',
        instructions: '<p>Draft ini belum dipublikasikan.</p>',
        exerciseType: 'mixed',
        difficulty: 'hard',
        isPublished: false,
        order: 4,
        questions: draftExerciseQuestions
    });

    const alyaGraphAttempt = gradeExerciseSubmission(exerciseGraphQuestions, [
        { questionId: 'grafik_1', value: 9 },
        { questionId: 'grafik_2', value: 'axis_b' },
        { questionId: 'grafik_3', value: 24 }
    ]);

    const rezaGraphAttempt = gradeExerciseSubmission(exerciseGraphQuestions, [
        { questionId: 'grafik_1', value: 6 },
        { questionId: 'grafik_2', value: 'axis_b' },
        { questionId: 'grafik_3', value: 18 }
    ]);

    const alyaPlaneShapeAttempt = gradeExerciseSubmission(exercisePlaneShapeQuestions, [
        { questionId: 'bangun_1', value: 28 },
        { questionId: 'bangun_2', value: 30 },
        { questionId: 'bangun_3', value: 'persegi' }
    ]);

    const nisaCanvasAttempt = gradeExerciseSubmission(exerciseConstructionQuestions, [
        {
            questionId: 'konstruksi_1',
            canvasState: {
                objects: [
                    {
                        id: 'triangle_student',
                        type: 'triangle',
                        points: [
                            { x: 200, y: 260 },
                            { x: 360, y: 260 },
                            { x: 280, y: 120 }
                        ],
                        color: '#ef4444',
                        strokeWidth: 2
                    }
                ],
                measurements: [],
                functions: [],
                selectedObjectId: null,
                currentTool: 'select',
                zoom: 1,
                pan: { x: 0, y: 0 },
                gridEnabled: true,
                snapToGrid: true
            }
        },
        {
            questionId: 'konstruksi_2',
            value: 'Saya membuat dua sisi miring dengan panjang yang sama lalu memeriksa bentuknya.'
        }
    ]);

    await prisma.exerciseAttempt.createMany({
        data: [
            {
                studentId: alya.id,
                exerciseId: exerciseGraph.id,
                answer: JSON.stringify(alyaGraphAttempt.normalizedAnswers),
                canvasData: alyaGraphAttempt.primaryCanvasData,
                questionResults: JSON.stringify(alyaGraphAttempt.questionResults),
                isCorrect: alyaGraphAttempt.isCorrect,
                score: alyaGraphAttempt.score,
                gradingStatus: alyaGraphAttempt.gradingStatus,
                feedback: 'Kamu membaca grafik dengan teliti dan rumus luas dipakai dengan benar.',
                gradedAt: new Date('2026-03-10T09:00:00.000Z'),
                timeSpent: 210
            },
            {
                studentId: reza.id,
                exerciseId: exerciseGraph.id,
                answer: JSON.stringify(rezaGraphAttempt.normalizedAnswers),
                canvasData: rezaGraphAttempt.primaryCanvasData,
                questionResults: JSON.stringify(rezaGraphAttempt.questionResults),
                isCorrect: rezaGraphAttempt.isCorrect,
                score: rezaGraphAttempt.score,
                gradingStatus: rezaGraphAttempt.gradingStatus,
                feedback: 'Sumbu simetri sudah benar, tetapi baca kembali nilai fungsi saat x = 3.',
                gradedAt: new Date('2026-03-09T10:05:00.000Z'),
                timeSpent: 260
            },
            {
                studentId: alya.id,
                exerciseId: exercisePlaneShapes.id,
                answer: JSON.stringify(alyaPlaneShapeAttempt.normalizedAnswers),
                canvasData: alyaPlaneShapeAttempt.primaryCanvasData,
                questionResults: JSON.stringify(alyaPlaneShapeAttempt.questionResults),
                isCorrect: alyaPlaneShapeAttempt.isCorrect,
                score: alyaPlaneShapeAttempt.score,
                gradingStatus: alyaPlaneShapeAttempt.gradingStatus,
                feedback: 'Bangun datar dasar sudah kamu kuasai dengan sangat baik.',
                gradedAt: new Date('2026-03-10T09:10:00.000Z'),
                timeSpent: 175
            },
            {
                studentId: nisa.id,
                exerciseId: exerciseConstruction.id,
                answer: JSON.stringify(nisaCanvasAttempt.normalizedAnswers),
                canvasData: nisaCanvasAttempt.primaryCanvasData,
                questionResults: JSON.stringify(nisaCanvasAttempt.questionResults),
                isCorrect: nisaCanvasAttempt.isCorrect,
                score: nisaCanvasAttempt.score,
                gradingStatus: nisaCanvasAttempt.gradingStatus,
                gradedAt: null,
                timeSpent: 420
            }
        ]
    });

    const aturanDiskusi = await prisma.classDiscussionThread.create({
        data: {
            classId: geometryClass.id,
            authorId: teacher.id,
            title: 'Aturan forum kelas geometri',
            content: 'Gunakan forum ini untuk bertanya, berbagi strategi, dan membantu teman. Guru akan mem-pin diskusi penting.',
            isPinned: true
        }
    });

    const threadAlya = await prisma.classDiscussionThread.create({
        data: {
            classId: geometryClass.id,
            authorId: alya.id,
            title: 'Cara cepat mengenali sumbu simetri parabola',
            content: 'Aku masih bingung membedakan titik puncak dan sumbu simetri saat rumus tidak ditampilkan.'
        }
    });

    const threadReza = await prisma.classDiscussionThread.create({
        data: {
            classId: geometryClass.id,
            authorId: reza.id,
            title: 'Tips menghitung keliling bangun gabungan',
            content: 'Kalau bangunnya gabungan dua persegi panjang, langkah mana yang paling aman lebih dulu?'
        }
    });

    await prisma.classDiscussionReply.createMany({
        data: [
            {
                threadId: aturanDiskusi.id,
                authorId: teacherAssistant.id,
                content: 'Kalau ada pertanyaan remedial, boleh juga kirim contoh jawabanmu di sini.'
            },
            {
                threadId: threadAlya.id,
                authorId: teacher.id,
                content: 'Mulai dari garis vertikal yang membagi parabola menjadi dua bagian simetris. Pada contoh kita, garisnya ada di x = 0.'
            },
            {
                threadId: threadAlya.id,
                authorId: reza.id,
                content: 'Aku biasanya lihat titik terendah atau tertinggi dulu, lalu tarik garis lurus ke atas.'
            },
            {
                threadId: threadReza.id,
                authorId: alya.id,
                content: 'Aku hitung sisi terluar saja, lalu cek lagi apakah ada sisi yang berhimpit.'
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
