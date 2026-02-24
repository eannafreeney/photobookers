import SectionTitle from "../components/app/SectionTitle";
import AppLayout from "../components/layouts/AppLayout";
import Page from "../components/layouts/Page";

const AboutPage = () => {
  return (
    <AppLayout title="About">
      <Page>
        <SectionTitle>About</SectionTitle>
        <p>
          Photobookers is a place to discover and explore photobooks. We list
          books, artists, and publishers in one place so you can find what
          you’re looking for and see where to get it.
        </p>
        <SectionTitle>Photobookers for fans</SectionTitle>
        <p>
          Browse books by artist and publisher, see covers and details, and
          follow links to buy or pre-order. Whether you collect photobooks or
          are just getting started, we help you find titles and keep track of
          who made them and who published them.
        </p>
        <SectionTitle>Photobookers for artists</SectionTitle>
        <p>
          Get a profile that ties your name to your books and makes your work
          easier to find. List your titles, add a short bio and links, and point
          people to your shop or publisher—so your books show up when people
          search.
        </p>
        <SectionTitle>Photobookers for publishers</SectionTitle>
        <p>
          Show your catalogue in one place: books, covers, and links to your
          store. We help fans and collectors discover your titles and see your
          list grow as you release new work.
        </p>
      </Page>
    </AppLayout>
  );
};
export default AboutPage;
