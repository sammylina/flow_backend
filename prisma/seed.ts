import { PrismaClient, StudyItemType } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // --- Create Users ---
  const user1 = await prisma.user.create({
    data: {
      email: 'sammy@gmail.com',
      passwordHash: 'sammy', // replace with actual bcrypt hash
      language: 'en',
      coins: 100,
      isPaid: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'nati@gmail.com',
      passwordHash: 'nati', // replace with actual bcrypt hash
      language: 'am',
      coins: 50,
      isPaid: false,
    },
  });

  // Helper function to create lessons with 4 study items
  const createLessonWithStudyItems = (title: string, audioUrl: string, order: number) => ({
    title,
    audioUrl,
    order,
    StudyItem: {
      create: [
        {
          type: StudyItemType.pronounciation,
          prompt: `${title}`,
          targetText: 'Bonjour',
          audioUrl: 'http://languageinstall.myddns.me/audio/lines/lesson_6/008_en_9172e8eec99f.wav'
        },
        {
          type: StudyItemType.pronounciation,
          prompt: `${title}`,
          targetText: 'Vous',
          audioUrl: 'http://languageinstall.myddns.me/audio/lines/lesson_6/015_en_aa2f27e353bb.wav',
        },
        {
          type: StudyItemType.writing,
          prompt: `How would you spell "YOU" in respect form?`,
          targetText: 'Vous',
          audioUrl: 'http://languageinstall.myddns.me/audio/lines/lesson_6/015_en_aa2f27e353bb.wav',
        },
        {
          type: StudyItemType.writing,
          prompt: `How would you spell "HOW"?`,
          targetText: 'Comment',
          audioUrl: 'http://languageinstall.myddns.me/audio/lines/lesson_6/030_en_c44bb2fd5169.wav',
        },
      ],
    },
  });

  // --- Create Playlist 1 with 2 lessons ---
  const playlist1 = await prisma.playlist.create({
    data: {
      name: 'Beginner French',
      description: 'Basic phrases',
      level: 'beginner',
      userId: user1.id,
      lessons: {
        create: [
          createLessonWithStudyItems('You are, I\'m ', 'http://languageinstall.myddns.me/audio/songs/lesson_6.mp3', 1),
          createLessonWithStudyItems('I understand, do you?', 'http://languageinstall.myddns.me/audio/songs/lesson_3.mp3', 2),
        ],
      },
    },
    include: { lessons: true },
  });

  // --- Create Playlist 2 with 2 lessons ---
  const playlist2 = await prisma.playlist.create({
    data: {
      name: 'Intermediate French',
      description: 'Conversational practice',
      level: 'intermediate',
      userId: user1.id,
      lessons: {
        create: [
          createLessonWithStudyItems('Ordering Food', 'https://example.com/audio/food.mp3', 1),
          createLessonWithStudyItems('Asking Directions', 'https://example.com/audio/directions.mp3', 2),
        ],
      },
    },
    include: { lessons: true },
  });

  // --- Create Playlist 3 with no lessons ---
  await prisma.playlist.create({
    data: {
      name: 'Advanced French',
      description: 'Complex grammar and idioms',
      level: 'advanced',
      userId: user1.id,
    },
  });

  // --- Add Lesson Progress for Users ---
  await prisma.lessonProgress.createMany({
    data: [
      {
        userId: user1.id,
        lessonId: playlist1.lessons[0].id,
        completed: true,
        flowCompleted: true,
        studyCompleted: true,
        score: 95,
      },
      {
        userId: user1.id,
        lessonId: playlist1.lessons[1].id,
        completed: false,
        flowCompleted: false,
        studyCompleted: false,
      },
      {
        userId: user2.id,
        lessonId: playlist2.lessons[0].id,
        completed: false,
        flowCompleted: false,
        studyCompleted: false,
      },
    ],
  });

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

