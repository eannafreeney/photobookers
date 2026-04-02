import { Context } from "hono";
import { getUser } from "../../../../utils";
import InterviewsPageAdmin from "./pages/InterviewsPageAdmin";

export const getInterviewsPageAdmin = async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);

  return c.html(
    <InterviewsPageAdmin
      user={user}
      currentPath={currentPath}
      currentPage={currentPage}
    />,
  );
};
