import { useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useEventStore } from '../stores/eventStore';
import EventCard from '../components/EventCard';
import FilterBar from '../components/FilterBar';
import SkeletonCard from '../components/SkeletonCard';
import Layout from '../components/Layout';

export default function Home() {
  const { events, loading, hasMore, fetchEvents, fetchSavedEvents, savedEvents } = useEventStore();

  useEffect(() => {
    fetchEvents();
    fetchSavedEvents();
  }, []);

  return (
    <Layout>
      <FilterBar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Discover Events Clearly
        </h1>

        <InfiniteScroll
          dataLength={events.length}
          next={() => fetchEvents(true)}
          hasMore={hasMore}
          loader={
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          }
          endMessage={
            <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
              No more events to load.
            </p>
          }
        >
          {events.length === 0 && !loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No events found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} isSaved={savedEvents.some((e) => e.id === event.id)} />
              ))}
            </div>
          )}
        </InfiniteScroll>
      </div>
    </Layout>
  );
}