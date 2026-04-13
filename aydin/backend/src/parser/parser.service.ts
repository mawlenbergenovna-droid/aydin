import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

let openai: any = null;
try {
  const OpenAI = require('openai');
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch {}

@Injectable()
export class ParserService {
  constructor(private prisma: PrismaService) {}

  @Cron('0 */10 * * * *') // every 10 minutes
  async processMockData() {
    const mockData = this.loadMockData();
    for (const post of mockData) {
      if (await this.isEvent(post.text)) {
        const eventData = await this.extractEventData(post.text);
        if (eventData) {
          // Check for duplicates
          const existing = await this.prisma.event.findFirst({
            where: {
              title: eventData.title,
              date: eventData.date,
            },
          });
          if (!existing) {
            await this.prisma.event.create({
              data: {
                title: eventData.title,
                date: eventData.date,
                time: eventData.time,
                location: eventData.location,
                category: eventData.category,
                description: eventData.description,
                sourceChannel: post.channel,
              },
            });
          }
        }
      }
    }
  }

  private loadMockData() {
    const filePath = path.join(__dirname, '../../mock_data.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }

  private async isEvent(text: string): Promise<boolean> {
    // Rule-based detection
    const dateRegex = /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b|\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/;
    const keywords = ['event', 'concert', 'meeting', 'festival', 'show', 'party'];
    const hasDate = dateRegex.test(text);
    const hasKeyword = keywords.some((kw) => text.toLowerCase().includes(kw));

    if (hasDate || hasKeyword) {
      // AI classification
      if (process.env.OPENAI_API_KEY) {
        try {
          const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'Determine if the text describes an event. Respond with yes or no.' },
              { role: 'user', content: text },
            ],
          });
          return response.choices[0].message.content?.toLowerCase().includes('yes') || false;
        } catch (error) {
          console.error('OpenAI error:', error);
        }
      }
      return true; // fallback
    }
    return false;
  }

  private async extractEventData(text: string): Promise<any> {
    // Regex extraction first
    const dateRegex = /\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/;
    const timeRegex = /\b(\d{1,2}:\d{2})\b/;
    const locationRegex = /location[:\s]+([^,\n]+)/i;

    const title = text.split('\n')[0];
    const dateMatch = text.match(dateRegex);
    const timeMatch = text.match(timeRegex);
    const locationMatch = text.match(locationRegex);

    let category = 'General';
    if (text.toLowerCase().includes('music') || text.toLowerCase().includes('concert')) category = 'Music';
    else if (text.toLowerCase().includes('sport')) category = 'Sports';
    else if (text.toLowerCase().includes('tech')) category = 'Tech';

    // AI refinement
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Extract event data from the text. Return JSON with title, date, time, location, category, description.' },
            { role: 'user', content: text },
          ],
        });
        const content = response.choices[0].message.content;
        const aiData = JSON.parse(content || '{}');
        return { ...aiData, title: aiData.title || title };
      } catch (error) {
        console.error('OpenAI error:', error);
      }
    }

    return {
      title,
      date: dateMatch ? dateMatch[1] : '',
      time: timeMatch ? timeMatch[1] : undefined,
      location: locationMatch ? locationMatch[1].trim() : undefined,
      category,
      description: text,
    };
  }
}