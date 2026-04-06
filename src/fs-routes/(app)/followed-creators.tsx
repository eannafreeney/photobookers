import { createRoute } from "hono-fsr";
import { getUser } from "../../utils";
import SectionTitle from "../../components/app/SectionTitle";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import PageTitle from "../../components/app/PageTitle";
import Divider from "../../components/Divider";
import InfoPage from "../../pages/InfoPage";
import { getFollowedCreators } from "../../features/app/services";
import { CreatorCardResult } from "../../constants/queries";
import CreatorsCircle from "../../features/app/components/CreatorsCircle";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);

  const [err, result] = await getFollowedCreators(user.id);
  if (err) return c.html(<InfoPage errorMessage={err.reason} />);

  const { artists, publishers } = result;
  const title = "Creators I Follow";

  const alpineAttrs = {
    "x-init": "true",
    "@followed-creators:updated.window":
      "$ajax('/followed-creators', { target: 'followed-creators-grid' })",
  };

  return c.html(
    <AppLayout title={title} user={user}>
      <Page>
        <div id="followed-creators-grid" {...alpineAttrs}>
          <PageTitle title={title} />
          <FollowedCreatorsGrid creators={artists} title="Artists" />
          <Divider />
          <FollowedCreatorsGrid creators={publishers} title="Publishers" />
        </div>
      </Page>
    </AppLayout>,
  );
});

type Props = {
  creators: CreatorCardResult[];
  title: string;
};

const FollowedCreatorsGrid = ({ creators, title }: Props) => {
  if (creators.length === 0) return <></>;

  return (
    <section>
      <SectionTitle className="mb-4">{title}</SectionTitle>
      <div class="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-6">
        {creators.map((creator) => (
          <CreatorsCircle creator={creator} />
        ))}
      </div>
    </section>
  );
};
