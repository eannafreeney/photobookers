import { AuthUser } from "../../../../types";
import { AppLayout } from "../../../fs-routes/hyperview/+layout";

type Props = {
  user?: AuthUser;
  baseUrl: string;
  message: string;
};

const ErrorScreen = ({ user, baseUrl, message }: Props) => {
  return (
    <view xmlns="https://hyperview.org/hyperview">
      <AppLayout title="Error" user={user} baseUrl={baseUrl}>
        <text>{message}</text>
      </AppLayout>
    </view>
  );
};

export default ErrorScreen;
