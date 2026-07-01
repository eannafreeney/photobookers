import { registerEditCreatorForm } from "../features/dashboard/creators/client/editCreatorForm";
import { registerBookForm } from "../features/dashboard/books/client/bookForm";
import { registerBookCoverForm } from "../features/dashboard/books/client/bookCoverForm";
import { registerCreatorCoverForm } from "../features/dashboard/creators/client/creatorCoverForm";
import { registerBookGalleryForm } from "../features/dashboard/books/client/bookGalleryForm";
import { registerBulkCoverUpload } from "./components/bulkCoverUpload";
import { registerUserProfileImageForm } from "../features/app/client/userProfileImageForm";
import { registerInterviewForm } from "../features/interviews/client/interviewForm";
import { registerMessageForm } from "../features/dashboard/messages/client/messageForm";
import { registerCreatorBannerForm } from "../features/dashboard/images/client/creatorBannerForm";
import { registerStoresMap } from "../features/app/stores/client/storesMap";

registerEditCreatorForm();
registerBookForm();
registerBookCoverForm();
registerCreatorCoverForm();
registerBookGalleryForm();
registerBulkCoverUpload();
registerUserProfileImageForm();
registerInterviewForm();
registerMessageForm();
registerCreatorBannerForm();
registerStoresMap();

(window as unknown as { Alpine: { start: () => void } }).Alpine.start();
