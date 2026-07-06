const SITE_NAME = "photobookers";
const DEFAULT_DESCRIPTION = "Discover and explore photobooks. Browse books, artists, and publishers in one place.";
function pageTitle(title) {
  if (title.toLowerCase().includes(SITE_NAME)) return title;
  return `${title} | ${SITE_NAME}`;
}
function canonicalUrl(requestUrl, path) {
  return new URL(path, requestUrl).href;
}
function truncateDescription(text, max = 160) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trimEnd()}\u2026`;
}
function bookPageTitle(title, artistName) {
  if (artistName) return pageTitle(`${title} by ${artistName}`);
  return pageTitle(title);
}
function bookDescription(book) {
  if (book.description) return truncateDescription(book.description);
  const artist = book.artist?.displayName;
  if (artist) {
    return truncateDescription(
      `${book.title} by ${artist}. Discover this photobook on photobookers.`
    );
  }
  return truncateDescription(`Discover ${book.title} on photobookers.`);
}
function creatorDescription(creator) {
  const source = creator.tagline || creator.bio;
  if (source) return truncateDescription(`${creator.displayName} \u2014 ${source}`);
  const label = creator.type === "publisher" ? "publisher" : "artist";
  return truncateDescription(
    `Explore photobooks by ${creator.displayName}, a ${label} on photobookers.`
  );
}
function tagDescription(tagLabel) {
  return truncateDescription(
    `Browse ${tagLabel.toLowerCase()} photobooks on Photobookers \u2014 discover titles, artists, and publishers in one place.`
  );
}
function buildBookJsonLd(book, canonicalUrl2) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    url: canonicalUrl2
  };
  if (book.description) {
    jsonLd.description = truncateDescription(book.description, 500);
  }
  if (book.coverUrl) {
    jsonLd.image = book.coverUrl;
  }
  if (book.artist?.displayName) {
    jsonLd.author = {
      "@type": "Person",
      name: book.artist.displayName
    };
  }
  if (book.publisher?.displayName) {
    jsonLd.publisher = {
      "@type": "Organization",
      name: book.publisher.displayName
    };
  }
  return jsonLd;
}
function buildFairJsonLd(fair) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: fair.name,
    url: fair.canonicalUrl,
    startDate: fair.startDate.toISOString(),
    endDate: fair.endDate.toISOString()
  };
  if (fair.description) {
    jsonLd.description = truncateDescription(fair.description, 500);
  }
  if (fair.coverUrl || fair.bannerUrl) {
    jsonLd.image = fair.bannerUrl || fair.coverUrl;
  }
  const hasLocation = fair.venue || fair.city || fair.country;
  if (hasLocation) {
    const location = {
      "@type": "Place"
    };
    if (fair.venue) {
      location.name = fair.venue;
    }
    const hasAddress = fair.city || fair.country;
    if (hasAddress) {
      const address = {
        "@type": "PostalAddress"
      };
      if (fair.city) {
        address.addressLocality = fair.city;
      }
      if (fair.country) {
        address.addressCountry = fair.country;
      }
      location.address = address;
    }
    jsonLd.location = location;
  }
  if (fair.website) {
    jsonLd.sameAs = fair.website;
  }
  jsonLd.eventStatus = "https://schema.org/EventScheduled";
  jsonLd.eventAttendanceMode = "https://schema.org/OfflineEventAttendanceMode";
  return jsonLd;
}
function buildStoreJsonLd(store) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BookStore",
    name: store.name,
    url: store.canonicalUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: store.address,
      addressLocality: store.city,
      addressCountry: store.country
    }
  };
  if (store.description) {
    jsonLd.description = truncateDescription(store.description, 500);
  }
  if (store.imageUrl) {
    jsonLd.image = store.imageUrl;
  }
  if (store.website) {
    jsonLd.sameAs = store.website;
  }
  return jsonLd;
}
export {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  bookDescription,
  bookPageTitle,
  buildBookJsonLd,
  buildFairJsonLd,
  buildStoreJsonLd,
  canonicalUrl,
  creatorDescription,
  pageTitle,
  tagDescription,
  truncateDescription
};
