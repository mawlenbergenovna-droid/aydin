import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function extractEventData(text: string) {
  const dateRegex = /\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/;
  const timeRegex = /\b(\d{1,2}:\d{2})\b/;
  const locationRegex = /(?:location|venue|lieu|luogo|lugar)[:\s]+([^,.;\n]+)/i;

  const title = text.split('\n')[0].replace(/^[^\w]*/, '').trim();
  const dateMatch = text.match(dateRegex);
  const timeMatch = text.match(timeRegex);
  const locationMatch = text.match(locationRegex);

  let category = 'General';
  const lower = text.toLowerCase();
  if (lower.includes('music') || lower.includes('concert') || lower.includes('konsert') || lower.includes('musiqa') || lower.includes('jazz') || lower.includes('taronalari')) category = 'Music';
  else if (lower.includes('sport') || lower.includes('marafon') || lower.includes('crossfit') || lower.includes('fitness') || lower.includes('championship')) category = 'Sports';
  else if (lower.includes('tech') || lower.includes('ai') || lower.includes('hackathon') || lower.includes('blockchain') || lower.includes('data science') || lower.includes('intellekt') || lower.includes('startup') || lower.includes('startap') || lower.includes('it meetup') || lower.includes('it park')) category = 'Tech';
  else if (lower.includes('food') || lower.includes('wine') || lower.includes('oshpazlik') || lower.includes('food fest')) category = 'Food';
  else if (lower.includes('art') || lower.includes('cinema') || lower.includes('teatr') || lower.includes('theatre') || lower.includes('ballet') || lower.includes('musical') || lower.includes('film') || lower.includes('photography') || lower.includes("ko'rgazma") || lower.includes("san'at") || lower.includes('spektakl') || lower.includes('gaming') || lower.includes('expo')) category = 'Arts';
  else if (lower.includes('workshop') || lower.includes('seminar') || lower.includes('education') || lower.includes('masterclass') || lower.includes("o'rganish") || lower.includes('konferensiya') || lower.includes('forum') || lower.includes('yoga') || lower.includes('wellness')) category = 'Education';
  else if (lower.includes('festival') || lower.includes('party') || lower.includes('bash')) category = 'Music';
  else if (lower.includes('meeting') || lower.includes('networking') || lower.includes('pitch') || lower.includes('women in tech') || lower.includes('tadbirkor')) category = 'Tech';

  return {
    title,
    date: dateMatch ? dateMatch[1] : 'TBD',
    time: timeMatch ? timeMatch[1] : undefined,
    location: locationMatch ? locationMatch[1].trim() : undefined,
    category,
    description: text,
  };
}

async function main() {
  const mockDataPath = path.join(__dirname, '../mock_data.json');
  const mockData: { text: string; channel: string }[] = JSON.parse(
    fs.readFileSync(mockDataPath, 'utf-8'),
  );

  await prisma.savedEvent.deleteMany();
  await prisma.event.deleteMany();
  console.log('Cleared old events.');
  console.log(`Seeding ${mockData.length} events...`);

  for (const post of mockData) {
    const eventData = extractEventData(post.text);

    const existing = await prisma.event.findFirst({
      where: { title: eventData.title, date: eventData.date },
    });

    if (!existing) {
      await prisma.event.create({
        data: {
          ...eventData,
          sourceChannel: post.channel,
        },
      });
      console.log(`  Created: ${eventData.title}`);
    } else {
      console.log(`  Skipped (duplicate): ${eventData.title}`);
    }
  }

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
