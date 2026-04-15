import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Heart } from 'lucide-react';
import { Event } from '../types';
import { eventsAPI } from '../utils/api';
import { useEventStore } from '../stores/eventStore';
import Layout from '../components/Layout';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const { saveEvent, unsaveEvent, savedEvents } = useEventStore();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventsAPI.getEvent(id!);
        setEvent(response.data);
      } catch (error) {
        console.error('Failed to fetch event');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Event not found.</p>
        </div>
      </Layout>
    );
  }

  const isSaved = savedEvents.some((e) => e.id === event.id);

  const handleSave = () => {
    if (isSaved) {
      unsaveEvent(event.id);
    } else {
      saveEvent(event.id);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to events
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {event.title}
              </h1>
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                <span className="font-medium text-primary">{event.date}</span>
                {event.time && <span>• {event.time}</span>}
              </div>
            </div>
            <button
              onClick={handleSave}
              className={`p-3 rounded-full transition-colors ${
                isSaved
                  ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
            >
              <Heart className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {event.location && (
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              📍 {event.location}
            </p>
          )}

          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-6">
            {event.category}
          </span>

          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            {event.description}
          </p>

          {event.sourceUrl && (
            <div className="flex gap-4">
              <a
                href={event.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Open in Telegram
              </a>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}