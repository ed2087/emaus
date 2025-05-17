// utils/structuredDataHelper.js

/**
 * Generate structured data for Article schema (used for Reflections)
 * @param {Object} reflection - The reflection object
 * @param {Object} req - Express request object
 * @returns {String} JSON-LD structured data as string
 */
const generateArticleSchema = (reflection, req) => {
  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": reflection.title,
    "description": reflection.description,
    "image": reflection.images && reflection.images.length > 0 ? reflection.images[0] : `${req.protocol}://${req.get('host')}/img/default-social-image.jpg`,
    "author": {
      "@type": "Person",
      "name": reflection.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Comunidad Emaús",
      "logo": {
        "@type": "ImageObject",
        "url": `${req.protocol}://${req.get('host')}/img/logo.jpg`
      }
    },
    "datePublished": reflection.createdAt,
    "dateModified": reflection.updatedAt || reflection.createdAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${req.protocol}://${req.get('host')}${req.originalUrl}`
    }
  };

  return `<script type="application/ld+json">${JSON.stringify(articleData)}</script>`;
};

/**
 * Generate structured data for Event schema
 * @param {Object} event - The event object
 * @param {Object} req - Express request object
 * @returns {String} JSON-LD structured data as string
 */
const generateEventSchema = (event, req) => {
  const eventData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description,
    "image": event.image || `${req.protocol}://${req.get('host')}/img/default-social-image.jpg`,
    "startDate": event.date,
    "endDate": event.endDate || event.date, // Use endDate if available, otherwise use the same date
    "location": {
      "@type": "Place",
      "name": event.location,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": event.location
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": "Comunidad Emaús",
      "url": `${req.protocol}://${req.get('host')}`
    },
    "url": `${req.protocol}://${req.get('host')}${req.originalUrl}`
  };

  return `<script type="application/ld+json">${JSON.stringify(eventData)}</script>`;
};

/**
 * Generate structured data for Testimonial (Review schema)
 * @param {Object} testimonial - The testimonial object
 * @param {Object} req - Express request object
 * @returns {String} JSON-LD structured data as string
 */
const generateTestimonialSchema = (testimonial, req) => {
  const testimonialData = {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "Organization",
      "name": "Comunidad Emaús"
    },
    "author": {
      "@type": "Person",
      "name": testimonial.authorName
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "5",
      "bestRating": "5"
    },
    "name": testimonial.title,
    "reviewBody": testimonial.description,
    "datePublished": testimonial.createdAt
  };

  return `<script type="application/ld+json">${JSON.stringify(testimonialData)}</script>`;
};

/**
 * Generate structured data for BreadcrumbList schema
 * @param {Array} items - Array of breadcrumb items with name and url properties
 * @param {Object} req - Express request object
 * @returns {String} JSON-LD structured data as string
 */
const generateBreadcrumbSchema = (items, req) => {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `${req.protocol}://${req.get('host')}${item.url}`
    }))
  };

  return `<script type="application/ld+json">${JSON.stringify(breadcrumbData)}</script>`;
};

export default {
  generateArticleSchema,
  generateEventSchema,
  generateTestimonialSchema,
  generateBreadcrumbSchema
};