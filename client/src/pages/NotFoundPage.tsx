import React from 'react';
import { Compass } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { StatusMessage } from '../components/common/StatusMessage';

export const NotFoundPage: React.FC = () => (
  <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:py-24">
    <SEO title="Page Not Found" description="The page you are looking for does not exist on Animora." />
    <StatusMessage
      icon={<Compass className="h-6 w-6" />}
      title="We couldn't find that page"
      description="The link may be broken or the page may have moved. Head back home or explore the catalog."
      link={{ to: '/browse', label: 'Browse anime' }}
    />
  </div>
);

