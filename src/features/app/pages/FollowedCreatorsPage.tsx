import { AuthUser } from "../../../../types";
import PageTitle from "../../../components/app/PageTitle";
import SectionTitle from "../../../components/app/SectionTitle";
import Divider from "../../../components/Divider";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import { CreatorCardResult } from "../../../constants/queries";
import InfoPage from "../../../pages/InfoPage";
import CreatorCardSquare from "../components/CreatorCardSquare";
import { getFollowedCreators } from "../services";

const FollowedCreatorsPage = async ({ user }: { user: AuthUser }) => {
  const [err, result] = await getFollowedCreators(user.id);
  if (err) return <InfoPage errorMessage={err.reason} />;

  const { artists, publishers } = result;
  const title = "Creators I Follow";

  const alpineAttrs = {
    "x-init": "true",
    "@followed-creators:updated.window":
      "$ajax('/followed-creators', { target: 'followed-creators-grid' })",
  };

  return (
    <AppLayout title={title} user={user}>
      <Page>
        <div id="followed-creators-grid" {...alpineAttrs}>
          <PageTitle title={title} />
          <FollowedCreatorsGrid creators={artists} title="Artists" />
          <Divider />
          <FollowedCreatorsGrid creators={publishers} title="Publishers" />
        </div>
      </Page>
    </AppLayout>
  );
};

export default FollowedCreatorsPage;

type Props = {
  creators: CreatorCardResult[];
  title: string;
};

const FollowedCreatorsGrid = ({ creators, title }: Props) => {
  if (creators.length === 0) return <></>;

  return (
    <section>
      <SectionTitle className="mb-4">{title}</SectionTitle>
      <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
        {creators.map((creator) => (
          <CreatorCardSquare creator={creator} />
        ))}
      </div>
    </section>
  );
};
