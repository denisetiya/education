const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding geometry learning data...\n');

    // ========================================
    // 1. CREATE USERS
    // ========================================
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    const teacher = await prisma.user.upsert({
        where: { email: 'guru@geo.edu' },
        update: {},
        create: {
            email: 'guru@geo.edu',
            password: teacherPassword,
            name: 'Pak Geometri',
            role: 'TEACHER'
        }
    });
    console.log('✅ Teacher:', teacher.name);

    const studentPassword = await bcrypt.hash('siswa123', 10);
    const student = await prisma.user.upsert({
        where: { email: 'budi@siswa.edu' },
        update: {},
        create: {
            email: 'budi@siswa.edu',
            password: studentPassword,
            name: 'Budi Santoso',
            role: 'STUDENT',
            xp: 150,
            level: 2
        }
    });
    console.log('✅ Student:', student.name);

    // ========================================
    // 2. CREATE GEOMETRY CLASS
    // ========================================
    const geometryClass = await prisma.class.upsert({
        where: { code: 'GEO2024' },
        update: {},
        create: {
            name: 'Geometri Dasar Kelas 8',
            subject: 'Matematika',
            description: 'Pelajari konsep-konsep dasar geometri: titik, garis, sudut, segitiga, segiempat, dan lingkaran. Dilengkapi visualisasi interaktif!',
            code: 'GEO2024',
            isPublic: true,
            progressionMode: 'sequential',
            xpMultiplier: 1.5,
            geogebraEnabled: true,
            teacherId: teacher.id
        }
    });
    console.log('✅ Class:', geometryClass.name);

    // Clean up existing class exercises to prevent stale/broken data
    console.log('🧹 Cleaning up old exercises...');
    await prisma.classExercise.deleteMany({ where: { classId: geometryClass.id } });

    // Enroll student to class
    await prisma.classEnrollment.upsert({
        where: { 
            studentId_classId: { 
                studentId: student.id, 
                classId: geometryClass.id 
            } 
        },
        update: {},
        create: {
            studentId: student.id,
            classId: geometryClass.id
        }
    });
    console.log('✅ Student enrolled to class');

    // ========================================
    // 3. CREATE MODULES
    // ========================================
    const modules = [
        {
            title: 'Pengenalan Geometri',
            description: 'Konsep dasar: titik, garis, bidang, dan sudut',
            order: 1
        },
        {
            title: 'Segitiga',
            description: 'Jenis-jenis segitiga, sifat, dan rumus luas',
            order: 2
        },
        {
            title: 'Segiempat',
            description: 'Persegi, persegi panjang, jajar genjang, trapesium',
            order: 3
        },
        {
            title: 'Lingkaran',
            description: 'Unsur-unsur lingkaran, keliling, dan luas',
            order: 4
        }
    ];

    const createdModules = [];
    for (const mod of modules) {
        const module = await prisma.module.create({
            data: {
                ...mod,
                classId: geometryClass.id,
                grade: 8,
                semester: 1,
                subject: 'Matematika'
            }
        });
        createdModules.push(module);
        console.log('✅ Module:', module.title);
    }

    // ========================================
    // 4. CREATE MATERIALS
    // ========================================
    const materials = [
        // Module 1: Pengenalan Geometri
        {
            moduleId: createdModules[0].id,
            title: 'Apa itu Geometri?',
            type: 'lesson',
            content: `
# Pengenalan Geometri

**Geometri** adalah cabang matematika yang mempelajari bentuk, ukuran, posisi, dan sifat-sifat ruang.

## Konsep Dasar

### 1. Titik
Titik adalah lokasi dalam ruang yang tidak memiliki ukuran (tidak ada panjang, lebar, atau tinggi). Titik biasanya dilambangkan dengan huruf kapital seperti A, B, C.

### 2. Garis
Garis adalah kumpulan titik-titik yang memanjang tanpa batas ke dua arah. Garis memiliki panjang tak terbatas tetapi tidak memiliki lebar.

### 3. Bidang
Bidang adalah permukaan datar yang meluas tanpa batas ke segala arah.

## Mengapa Belajar Geometri?
- Membantu memahami bentuk di sekitar kita
- Dasar untuk arsitektur dan desain
- Penting dalam sains dan teknologi
            `,
            xpReward: 20,
            order: 1
        },
        {
            moduleId: createdModules[0].id,
            title: 'Sudut dan Jenisnya',
            type: 'lesson',
            content: `
# Sudut dan Jenisnya

**Sudut** adalah daerah yang dibentuk oleh dua sinar garis yang bertemu di satu titik (titik sudut).

## Jenis-Jenis Sudut

| Jenis Sudut | Besar Sudut |
|-------------|-------------|
| Sudut Lancip | 0° < x < 90° |
| Sudut Siku-siku | x = 90° |
| Sudut Tumpul | 90° < x < 180° |
| Sudut Lurus | x = 180° |
| Sudut Refleks | 180° < x < 360° |

## Cara Mengukur Sudut
Gunakan busur derajat untuk mengukur besar sudut dengan tepat.

## Tips Mengingat
- **Lancip** = seperti ujung pensil yang tajam
- **Tumpul** = seperti ujung pensil yang sudah tumpul
- **Siku-siku** = seperti sudut meja atau buku
            `,
            xpReward: 25,
            order: 2
        },
        // Module 2: Segitiga
        {
            moduleId: createdModules[1].id,
            title: 'Mengenal Segitiga',
            type: 'lesson',
            content: `
# Mengenal Segitiga

**Segitiga** adalah bangun datar yang memiliki tiga sisi dan tiga sudut.

## Jenis Segitiga Berdasarkan Sisi

### 1. Segitiga Sama Sisi
- Ketiga sisinya sama panjang
- Ketiga sudutnya sama besar (60°)

### 2. Segitiga Sama Kaki
- Dua sisi sama panjang
- Dua sudut alas sama besar

### 3. Segitiga Sembarang
- Ketiga sisinya berbeda panjang
- Ketiga sudutnya berbeda besar

## Jenis Segitiga Berdasarkan Sudut

- **Segitiga Lancip**: Semua sudut < 90°
- **Segitiga Siku-Siku**: Ada sudut = 90°
- **Segitiga Tumpul**: Ada sudut > 90°

## Sifat Penting
Jumlah ketiga sudut dalam segitiga = **180°**
            `,
            xpReward: 30,
            order: 1
        },
        {
            moduleId: createdModules[1].id,
            title: 'Luas dan Keliling Segitiga',
            type: 'lesson',
            content: `
# Luas dan Keliling Segitiga

## Rumus Keliling Segitiga

\`\`\`
Keliling = sisi a + sisi b + sisi c
K = a + b + c
\`\`\`

## Rumus Luas Segitiga

### Rumus Dasar
\`\`\`
Luas = ½ × alas × tinggi
L = ½ × a × t
\`\`\`

### Contoh Soal
Sebuah segitiga memiliki alas 10 cm dan tinggi 8 cm. Hitunglah luasnya!

**Penyelesaian:**
L = ½ × a × t
L = ½ × 10 × 8
L = 40 cm²

## Rumus Heron
Untuk segitiga dengan sisi a, b, c:
\`\`\`
s = (a + b + c) / 2
L = √(s(s-a)(s-b)(s-c))
\`\`\`
            `,
            xpReward: 35,
            order: 2
        },
        // Module 3: Segiempat
        {
            moduleId: createdModules[2].id,
            title: 'Jenis-Jenis Segiempat',
            type: 'lesson',
            content: `
# Jenis-Jenis Segiempat

**Segiempat** adalah bangun datar yang memiliki empat sisi dan empat sudut.

## 1. Persegi
- 4 sisi sama panjang
- 4 sudut siku-siku (90°)
- Diagonal sama panjang dan saling tegak lurus

## 2. Persegi Panjang
- Sisi berhadapan sama panjang
- 4 sudut siku-siku
- Diagonal sama panjang

## 3. Jajar Genjang
- Sisi berhadapan sejajar dan sama panjang
- Sudut berhadapan sama besar

## 4. Belah Ketupat
- 4 sisi sama panjang
- Diagonal saling tegak lurus

## 5. Trapesium
- Memiliki sepasang sisi sejajar
- Sudut total = 360°

## 6. Layang-Layang
- 2 pasang sisi berdekatan sama panjang
- Salah satu diagonal membagi diagonal lain sama besar
            `,
            xpReward: 30,
            order: 1
        },
        // Module 4: Lingkaran
        {
            moduleId: createdModules[3].id,
            title: 'Unsur-Unsur Lingkaran',
            type: 'lesson',
            content: `
# Unsur-Unsur Lingkaran

**Lingkaran** adalah kurva tertutup di mana semua titik berjarak sama dari titik pusat.

## Unsur-Unsur Penting

### 1. Titik Pusat (O)
Titik yang menjadi pusat lingkaran

### 2. Jari-Jari (r)
Jarak dari titik pusat ke tepi lingkaran

### 3. Diameter (d)
Garis lurus yang melewati pusat, menghubungkan dua titik di tepi
\`d = 2r\`

### 4. Busur
Bagian dari keliling lingkaran

### 5. Tali Busur
Garis lurus yang menghubungkan dua titik di tepi lingkaran

### 6. Juring
Daerah yang dibatasi oleh dua jari-jari dan satu busur

### 7. Tembereng
Daerah yang dibatasi oleh tali busur dan busur

## Rumus
- **Keliling** = 2πr = πd
- **Luas** = πr²

Di mana π ≈ 3,14 atau 22/7
            `,
            xpReward: 35,
            order: 1
        }
    ];

    for (const mat of materials) {
        const { xpReward, ...materialData } = mat;
        await prisma.material.create({ 
            data: {
                ...materialData,
                category: 'Matematika',
                createdById: teacher.id
            } 
        });
    }
    console.log('✅ Materials created:', materials.length);

    // ========================================
    // 5. CREATE EXERCISES
    // ========================================
    const exercises = [
        {
            title: 'Menghitung Luas Segitiga',
            description: 'Hitung luas segitiga berdasarkan visualisasi',
            instructions: 'Perhatikan segitiga pada canvas. Hitunglah luas segitiga tersebut menggunakan rumus L = ½ × alas × tinggi.',
            exerciseType: 'geometry',
            difficulty: 'easy',
            points: 15,
            hasTimer: false,
            answerType: 'numeric',
            correctAnswer: JSON.stringify({ value: 24, tolerance: 0.1 }),
            canvasState: JSON.stringify({
                objects: [
                    {
                        id: 'base',
                        type: 'segment',
                        points: [{ x: 100, y: 300 }, { x: 300, y: 300 }],
                        color: '#6366f1',
                        strokeWidth: 2,
                        label: 'alas = 8 cm'
                    },
                    {
                        id: 's2',
                        type: 'segment',
                        points: [{ x: 300, y: 300 }, { x: 200, y: 180 }],
                        color: '#6366f1',
                        strokeWidth: 2
                    },
                    {
                        id: 's3',
                        type: 'segment',
                        points: [{ x: 200, y: 180 }, { x: 100, y: 300 }],
                        color: '#6366f1',
                        strokeWidth: 2
                    },
                    {
                        id: 'height',
                        type: 'segment',
                        points: [{ x: 200, y: 180 }, { x: 200, y: 300 }],
                        color: '#94a3b8',
                        strokeWidth: 1,
                        label: 't = 6 cm'
                    }
                ]
            }),
            canvasMode: 'readonly',
            isPublished: true,
            order: 1,
            classId: geometryClass.id
        },
        {
            title: 'Menentukan Jenis Sudut',
            description: 'Identifikasi jenis sudut pada gambar',
            instructions: 'Perhatikan sudut yang ditampilkan pada canvas. Tentukan jenis sudut tersebut!',
            exerciseType: 'geometry',
            difficulty: 'easy',
            points: 10,
            hasTimer: true,
            timerMinutes: 2,
            answerType: 'multiple_choice',
            correctAnswer: JSON.stringify({ id: '2' }),
            options: JSON.stringify([
                { id: '1', text: 'Sudut Lancip', isCorrect: false },
                { id: '2', text: 'Sudut Siku-Siku', isCorrect: true },
                { id: '3', text: 'Sudut Tumpul', isCorrect: false },
                { id: '4', text: 'Sudut Lurus', isCorrect: false }
            ]),
            canvasState: JSON.stringify({
                objects: [
                    {
                        id: 'angle1',
                        type: 'segment',
                        points: [{ x: 100, y: 200 }, { x: 250, y: 200 }],
                        color: '#22c55e',
                        strokeWidth: 3
                    },
                    {
                        id: 'angle2',
                        type: 'segment',
                        points: [{ x: 100, y: 200 }, { x: 100, y: 50 }],
                        color: '#22c55e',
                        strokeWidth: 3,
                        label: '90°'
                    }
                ]
            }),
            canvasMode: 'readonly',
            isPublished: true,
            order: 2,
            classId: geometryClass.id
        },
        {
            title: 'Keliling Persegi Panjang',
            description: 'Hitung keliling persegi panjang',
            instructions: 'Sebuah persegi panjang memiliki panjang 12 cm dan lebar 5 cm. Hitunglah kelilingnya!',
            exerciseType: 'geometry',
            difficulty: 'easy',
            points: 10,
            hasTimer: false,
            answerType: 'numeric',
            correctAnswer: JSON.stringify({ value: 34, tolerance: 0 }),
            canvasState: JSON.stringify({
                objects: [
                    {
                        id: 'rect1',
                        type: 'rectangle',
                        points: [{ x: 100, y: 100 }, { x: 340, y: 200 }],
                        color: '#f59e0b',
                        strokeWidth: 2,
                        label: '12 cm x 5 cm'
                    }
                ]
            }),
            canvasMode: 'readonly',
            isPublished: true,
            order: 3,
            classId: geometryClass.id
        },
        {
            title: 'Luas Lingkaran',
            description: 'Hitung luas lingkaran dengan jari-jari tertentu',
            instructions: 'Sebuah lingkaran memiliki jari-jari 7 cm. Hitunglah luasnya! (gunakan π = 22/7)',
            exerciseType: 'geometry',
            difficulty: 'medium',
            points: 20,
            hasTimer: true,
            timerMinutes: 3,
            answerType: 'numeric',
            correctAnswer: JSON.stringify({ value: 154, tolerance: 0.5 }),
            canvasState: JSON.stringify({
                objects: [
                    {
                        id: 'circle1',
                        type: 'circle',
                        points: [{ x: 200, y: 200 }, { x: 300, y: 200 }],
                        color: '#ec4899',
                        strokeWidth: 2,
                        label: 'r = 7 cm'
                    }
                ]
            }),
            canvasMode: 'readonly',
            isPublished: true,
            order: 4,
            classId: geometryClass.id
        },
        {
            title: 'Teorema Pythagoras',
            description: 'Terapkan teorema Pythagoras pada segitiga siku-siku',
            instructions: 'Segitiga siku-siku memiliki sisi alas 3 cm dan sisi tegak 4 cm. Berapakah panjang sisi miring (hipotenusa)?',
            exerciseType: 'geometry',
            difficulty: 'medium',
            points: 25,
            hasTimer: true,
            timerMinutes: 5,
            answerType: 'numeric',
            correctAnswer: JSON.stringify({ value: 5, tolerance: 0 }),
            canvasState: JSON.stringify({
                objects: [
                    {
                        id: 'side_a',
                        type: 'segment',
                        points: [{ x: 100, y: 300 }, { x: 220, y: 300 }],
                        color: '#8b5cf6',
                        strokeWidth: 2,
                        label: '3 cm'
                    },
                    {
                        id: 'side_b',
                        type: 'segment',
                        points: [{ x: 100, y: 300 }, { x: 100, y: 140 }],
                        color: '#8b5cf6',
                        strokeWidth: 2,
                        label: '4 cm'
                    },
                    {
                        id: 'side_c',
                        type: 'segment',
                        points: [{ x: 100, y: 140 }, { x: 220, y: 300 }],
                        color: '#8b5cf6',
                        strokeWidth: 2,
                        label: '?'
                    }
                ]
            }),
            canvasMode: 'readonly',
            isPublished: true,
            order: 5,
            classId: geometryClass.id
        },
        {
            title: 'Gambar Segitiga Sama Sisi',
            description: 'Gambar segitiga sama sisi pada canvas',
            instructions: 'Gunakan tools pada canvas untuk menggambar segitiga sama sisi. Pastikan ketiga sisinya terlihat sama panjang!',
            exerciseType: 'geometry',
            difficulty: 'hard',
            points: 30,
            hasTimer: false,
            answerType: 'canvas',
            canvasMode: 'interactive',
            isPublished: true,
            order: 6,
            classId: geometryClass.id
        }
    ];

    for (const ex of exercises) {
        await prisma.classExercise.create({ data: ex });
    }
    console.log('✅ Exercises created:', exercises.length);

    // ========================================
    // 6. CREATE BOOKS
    // ========================================
    const books = [
        {
            title: 'Panduan Lengkap Geometri Dasar',
            author: 'Tim Penulis Matematika',
            description: 'Buku panduan komprehensif untuk mempelajari geometri dari dasar hingga mahir',
            contentType: 'rich_text',
            content: `
<h1>Panduan Lengkap Geometri Dasar</h1>

<h2>Bab 1: Pengenalan Geometri</h2>
<p>Geometri adalah cabang matematika tertua yang dipelajari manusia. Kata "geometri" berasal dari bahasa Yunani: <strong>geo</strong> (bumi) dan <strong>metron</strong> (ukuran).</p>

<h3>1.1 Titik, Garis, dan Bidang</h3>
<ul>
<li><strong>Titik</strong> - tidak memiliki dimensi, hanya menunjukkan lokasi</li>
<li><strong>Garis</strong> - memiliki 1 dimensi (panjang)</li>
<li><strong>Bidang</strong> - memiliki 2 dimensi (panjang dan lebar)</li>
</ul>

<h3>1.2 Sudut</h3>
<p>Sudut terbentuk dari dua sinar yang berasal dari titik yang sama. Jenis-jenis sudut:</p>
<ol>
<li>Sudut lancip (0° - 90°)</li>
<li>Sudut siku-siku (90°)</li>
<li>Sudut tumpul (90° - 180°)</li>
<li>Sudut lurus (180°)</li>
</ol>

<h2>Bab 2: Bangun Datar</h2>
<p>Bangun datar adalah bangun geometri yang terletak pada satu bidang datar.</p>

<h3>2.1 Segitiga</h3>
<p>Rumus Luas: <code>L = ½ × alas × tinggi</code></p>
<p>Rumus Keliling: <code>K = sisi₁ + sisi₂ + sisi₃</code></p>

<h3>2.2 Segiempat</h3>
<p><strong>Persegi:</strong> L = s² dan K = 4s</p>
<p><strong>Persegi Panjang:</strong> L = p × l dan K = 2(p + l)</p>

<h3>2.3 Lingkaran</h3>
<p>Rumus Luas: <code>L = πr²</code></p>
<p>Rumus Keliling: <code>K = 2πr</code></p>

<h2>Bab 3: Tips Sukses Belajar Geometri</h2>
<ol>
<li>Visualisasikan setiap konsep</li>
<li>Praktikkan dengan menggambar</li>
<li>Hafal rumus-rumus dasar</li>
<li>Kerjakan banyak soal latihan</li>
<li>Hubungkan dengan kehidupan sehari-hari</li>
</ol>
            `,
            classId: geometryClass.id
        },
        {
            title: 'Kumpulan Rumus Geometri',
            author: 'Pak Geometri',
            description: 'Referensi cepat untuk semua rumus geometri yang sering digunakan',
            contentType: 'rich_text',
            content: `
<h1>🔢 Kumpulan Rumus Geometri</h1>

<h2>Bangun Datar</h2>

<h3>📐 Segitiga</h3>
<table border="1" cellpadding="10">
<tr><td><strong>Luas</strong></td><td>L = ½ × a × t</td></tr>
<tr><td><strong>Keliling</strong></td><td>K = a + b + c</td></tr>
<tr><td><strong>Pythagoras</strong></td><td>c² = a² + b²</td></tr>
</table>

<h3>⬛ Persegi</h3>
<table border="1" cellpadding="10">
<tr><td><strong>Luas</strong></td><td>L = s²</td></tr>
<tr><td><strong>Keliling</strong></td><td>K = 4s</td></tr>
<tr><td><strong>Diagonal</strong></td><td>d = s√2</td></tr>
</table>

<h3>▭ Persegi Panjang</h3>
<table border="1" cellpadding="10">
<tr><td><strong>Luas</strong></td><td>L = p × l</td></tr>
<tr><td><strong>Keliling</strong></td><td>K = 2(p + l)</td></tr>
<tr><td><strong>Diagonal</strong></td><td>d = √(p² + l²)</td></tr>
</table>

<h3>⚪ Lingkaran</h3>
<table border="1" cellpadding="10">
<tr><td><strong>Luas</strong></td><td>L = πr²</td></tr>
<tr><td><strong>Keliling</strong></td><td>K = 2πr = πd</td></tr>
<tr><td><strong>π</strong></td><td>≈ 3,14 atau 22/7</td></tr>
</table>

<h3>◇ Belah Ketupat</h3>
<table border="1" cellpadding="10">
<tr><td><strong>Luas</strong></td><td>L = ½ × d₁ × d₂</td></tr>
<tr><td><strong>Keliling</strong></td><td>K = 4s</td></tr>
</table>

<h3>⏢ Trapesium</h3>
<table border="1" cellpadding="10">
<tr><td><strong>Luas</strong></td><td>L = ½ × (a + b) × t</td></tr>
</table>

<hr>
<p><em>💡 Tip: Hafal rumus dasar, pahami konsepnya!</em></p>
            `,
            classId: geometryClass.id
        }
    ];

    for (const book of books) {
        await prisma.classBook.create({ data: book });
    }
    console.log('✅ Books created:', books.length);

    // ========================================
    // 7. CREATE ACHIEVEMENTS
    // ========================================
    const achievements = [
        {
            title: 'Pemula Geometri',
            description: 'Selesaikan materi pertama',
            icon: '📐',
            xpReward: 25,
            condition: JSON.stringify({ type: 'complete_materials', target: 1 }),
            classId: geometryClass.id
        },
        {
            title: 'Pengukur Sudut',
            description: 'Selesaikan semua materi tentang sudut',
            icon: '📏',
            xpReward: 50,
            condition: JSON.stringify({ type: 'complete_materials', target: 2 }),
            classId: geometryClass.id
        },
        {
            title: 'Master Segitiga',
            description: 'Jawab benar 3 soal latihan segitiga',
            icon: '📐',
            xpReward: 75,
            condition: JSON.stringify({ type: 'correct_exercises', target: 3 }),
            classId: geometryClass.id
        },
        {
            title: 'Raja Geometri',
            description: 'Selesaikan semua modul dan latihan',
            icon: '👑',
            xpReward: 150,
            condition: JSON.stringify({ type: 'complete_all', target: 1 }),
            classId: geometryClass.id
        },
        {
            title: 'Speedster',
            description: 'Selesaikan latihan dengan timer dalam waktu kurang dari setengah waktu',
            icon: '⚡',
            xpReward: 100,
            condition: JSON.stringify({ type: 'fast_completion', target: 50 }),
            classId: geometryClass.id
        }
    ];

    for (const ach of achievements) {
        await prisma.classAchievement.create({ data: ach });
    }
    console.log('✅ Achievements created:', achievements.length);

    // ========================================
    // SUMMARY
    // ========================================
    console.log('\n========================================');
    console.log('🎉 SEEDING COMPLETED!');
    console.log('========================================');
    console.log('\n📚 Data yang dibuat:');
    console.log(`   - 1 Kelas: ${geometryClass.name}`);
    console.log(`   - ${modules.length} Modul pembelajaran`);
    console.log(`   - ${materials.length} Materi pelajaran`);
    console.log(`   - ${exercises.length} Latihan interaktif`);
    console.log(`   - ${books.length} Buku perpustakaan`);
    console.log(`   - ${achievements.length} Achievement`);
    console.log('\n🔑 Login Credentials:');
    console.log('   Teacher: guru@geo.edu / teacher123');
    console.log('   Student: budi@siswa.edu / siswa123');
    console.log('\n📝 Kode Kelas: GEO2024');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
