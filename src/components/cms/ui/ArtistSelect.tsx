import { fadeTransition } from "../../../lib/transitions";
import CountrySelect from "./CountrySelect";
import FileUpload from "./FileUpload";
import Input from "./Input";
import InputLabel from "./InputLabel";

const ArtistSelect = () => {
  const attrs = {
    "x-on:input.debounce.500ms": "searchArtists()",
  };

  return (
    <fieldset class="fieldset">
      <InputLabel label="Artist" name="form.artist_id" />
      <select
        class="select w-full"
        name="form.artist_id"
        x-model="form.artist_id"
        x-on:change="is_new_artist = (artist_id === 'new')"
        x-bind:disabled="artist_id && artist_id !== 'new'"
      >
        <option value="" disabled x-bind:selected="!artist_id">
          Select an artist...
        </option>
        <template x-for="artist in artistOptions" x-bind:key="artist.id">
          <option
            x-bind:value="artist.id"
            x-text="artist.label"
            x-bind:selected="form.artist_id === artist.id"
          ></option>
        </template>
        <option value="new">New artist + </option>
      </select>
      <div class="text-error text-sm min-h-[20px] mt-1 block">
        {/* <span
          x-show={`errors.${name}`}
          x-text={`errors.${name}`}
          {...fadeTransition}
        ></span> */}
      </div>

      {/* New artist inputs */}
      <div
        x-show="is_new_artist"
        x-cloak
        class="mt-2 space-y-2 border p-2 rounded-md"
      >
        <Input
          label="Artist Name"
          name="form.new_option_name"
          placeholder="Artist name"
          {...attrs}
        />
        <Input
          label="City"
          name="form.city"
          placeholder="City"
          maxLength={50}
        />
        <CountrySelect errorKey="country" />
        <FileUpload label="Artist Cover" name="form.artist_cover_url" />
      </div>
      {/* Search results */}
      <div id="artist-search-results" x-html="artistSearchResults"></div>
    </fieldset>
  );
};

export default ArtistSelect;
