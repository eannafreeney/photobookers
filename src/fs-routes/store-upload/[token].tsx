import { createRoute } from "hono-fsr";
import { verifyStoreUploadToken } from "../../domain/stores/storeUploadToken";
import {
  getStoreForUpload,
  replaceStoreGalleryImages,
  updateStoreBannerUrl,
} from "../../domain/stores/storeImageServices";
import { uploadImage, removeInvalidImages } from "../../services/storage";
import { validateImageFile } from "../../lib/validator";
import Alert from "../../components/app/Alert";
import HeadlessLayout from "../../components/layouts/HeadlessLayout";
import InfoPage from "../../pages/InfoPage";
import StoreUploadForm from "../../features/store-upload/components/StoreUploadForm";
import { MAX_STORE_GALLERY_IMAGES } from "../../constants/images";
export const GET = createRoute(async (c) => {
  const token = c.req.param("token") ?? "";
  const [tokenError, payload] = verifyStoreUploadToken(token);
  if (tokenError) {
    return c.html(<InfoPage errorMessage={tokenError.reason} />);
  }

  const [storeError, store] = await getStoreForUpload(payload.storeId);
  if (storeError) {
    return c.html(<InfoPage errorMessage={storeError.reason} />);
  }

  return c.html(
    <HeadlessLayout title={`Upload photos — ${store.name}`}>
      <div class="mx-auto max-w-lg p-6">
        <h1 class="mb-2 text-xl font-semibold text-on-surface-strong">
          Upload photos for {store.name}
        </h1>
        <p class="mb-2 text-sm text-on-surface/80">
          {store.city}, {store.country}
        </p>
        <p class="mb-6 text-sm text-on-surface/80">
          Add 1–{MAX_STORE_GALLERY_IMAGES} photos of the shop. A wide banner for
          the top of your page is optional.{" "}
          <a
            href={`/stores/${store.slug}`}
            class="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            View your listing
          </a>
        </p>
        <StoreUploadForm token={token} storeName={store.name} />
      </div>
    </HeadlessLayout>,
  );
});

export const POST = createRoute(async (c) => {
  const token = c.req.param("token") ?? "";
  const [tokenError, payload] = verifyStoreUploadToken(token);
  if (tokenError) {
    return c.html(<Alert type="danger" message={tokenError.reason} />, 400);
  }

  const [storeError, store] = await getStoreForUpload(payload.storeId);
  if (storeError) {
    return c.html(<Alert type="danger" message={storeError.reason} />, 404);
  }

  const body = await c.req.parseBody({ all: true });

  const galleryRaw = body.images
    ? Array.isArray(body.images)
      ? body.images
      : [body.images]
    : [];
  const galleryFiles = galleryRaw.filter(removeInvalidImages);

  if (
    galleryFiles.length < 1 ||
    galleryFiles.length > MAX_STORE_GALLERY_IMAGES
  ) {
    return c.html(
      <Alert
        type="danger"
        message={`Please upload between 1 and ${MAX_STORE_GALLERY_IMAGES} shop photos`}
      />,
      400,
    );
  }

  const bannerValidated =
    body.banner != null && body.banner !== ""
      ? validateImageFile(body.banner)
      : null;
  if (bannerValidated && !bannerValidated.success) {
    return c.html(<Alert type="danger" message={bannerValidated.error} />, 400);
  }

  try {
    if (bannerValidated?.success) {
      const uploadedBanner = await uploadImage(
        bannerValidated.file,
        `stores/banners/${store.id}`,
        "cover",
      );
      const [bannerErr] = await updateStoreBannerUrl(
        store.id,
        uploadedBanner.url,
      );
      if (bannerErr) {
        return c.html(<Alert type="danger" message={bannerErr.reason} />, 500);
      }
    }

    const uploadedUrls: string[] = [];
    for (const file of galleryFiles) {
      const uploaded = await uploadImage(
        file,
        `stores/${store.id}/gallery`,
        "gallery",
      );
      uploadedUrls.push(uploaded.url);
    }

    const [galleryErr] = await replaceStoreGalleryImages(
      store.id,
      uploadedUrls,
    );
    if (galleryErr) {
      return c.html(<Alert type="danger" message={galleryErr.reason} />, 500);
    }

    return c.html(
      <Alert
        type="success"
        message="Photos uploaded — thank you! You can upload again with this link to replace them."
      />,
    );
  } catch (error) {
    console.error("store upload", error);
    return c.html(
      <Alert type="danger" message="Upload failed — please try again" />,
      500,
    );
  }
});
