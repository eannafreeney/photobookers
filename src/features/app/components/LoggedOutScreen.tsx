import { AuthUser, Flash } from "../../../../types";
import BooksGrid from "../components/BooksGrid";
import ErrorPage from "../../../pages/error/errorPage";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import NavTabs from "../../../components/layouts/NavTabs";
import Button from "../../../components/app/Button";
import { PropsWithChildren } from "hono/jsx";

type Props = PropsWithChildren<{
  title: string;
  user: AuthUser | null;
  flash: Flash;
  currentPath: string;
  description: string;
}>;

const LoggedOutScreen = ({
  title,
  description,
  user,
  flash,
  currentPath,
  children,
}: Props) => {
  return (
    <AppLayout title={title} user={user} flash={flash}>
      <Page>
        <NavTabs currentPath={currentPath} />
        <div class="flex flex-col gap-4 justify-center items-center mt-8">
          <span>Login or register to {description}.</span>
          {children}
          <div class="flex gap-2 justify-center items-center">
            <a href="/auth/login">
              <Button variant="solid" color="inverse">
                Login
              </Button>
            </a>
            <a href="/auth/accounts">
              <Button variant="solid" color="primary">
                Register
              </Button>
            </a>
          </div>
        </div>
      </Page>
    </AppLayout>
  );
};

export default LoggedOutScreen;
