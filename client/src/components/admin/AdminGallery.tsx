import { useRef, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncCreatableSelect from "react-select/async-creatable";
import { City } from "country-state-city";
import exifr from "exifr";
import { galleryService } from "../../services/galleryService";
import { countriesService } from "../../services/countriesService";
import type { GalleryItem } from "../../types";
import styles from "./AdminGallery.module.scss";
import tableStyles from "./AdminTable.module.scss";
import { MdOutlineUploadFile } from "react-icons/md";

const SELECT_STYLES = {
  control: (base: object) => ({
    ...base,
    background: "var(--color-surface-2, #1e293b)",
    borderColor: "var(--color-border, #334155)",
    minHeight: "38px",
    fontSize: "0.875rem",
  }),
  menu: (base: object) => ({
    ...base,
    background: "var(--color-surface-2, #1e293b)",
    zIndex: 50,
  }),
  option: (base: object, { isFocused }: { isFocused: boolean }) => ({
    ...base,
    background: isFocused ? "var(--color-surface-3, #334155)" : "transparent",
    color: "var(--color-text, #f1f5f9)",
    fontSize: "0.875rem",
  }),
  singleValue: (base: object) => ({
    ...base,
    color: "var(--color-text, #f1f5f9)",
  }),
  input: (base: object) => ({ ...base, color: "var(--color-text, #f1f5f9)" }),
  placeholder: (base: object) => ({
    ...base,
    color: "var(--color-text-muted, #94a3b8)",
  }),
  clearIndicator: (base: object) => ({
    ...base,
    color: "var(--color-text-muted, #94a3b8)",
  }),
  dropdownIndicator: (base: object) => ({
    ...base,
    color: "var(--color-text-muted, #94a3b8)",
  }),
  menuPortal: (base: object) => ({ ...base, zIndex: 9999 }),
};

// Used inside the edit modal — no portal, but menu z-index overrides modal stacking context
const MODAL_SELECT_STYLES = {
  ...SELECT_STYLES,
  menu: (base: object) => ({
    ...base,
    background: "var(--color-surface-2, #1e293b)",
    zIndex: 9999,
  }),
};

function makeCityLoader(isoCode: string) {
  const allCities = isoCode
    ? (City.getCitiesOfCountry(isoCode) ?? []).map((c) => ({
        value: c.name,
        label: c.name,
      }))
    : [];
  return (inputValue: string) =>
    Promise.resolve(
      inputValue.length === 0
        ? []
        : allCities
            .filter((c) =>
              c.label.toLowerCase().startsWith(inputValue.toLowerCase()),
            )
            .slice(0, 50),
    );
}

interface EditModalProps {
  item: GalleryItem;
  countries: { id: string; name: string; isoCode: string; flagEmoji: string }[];
  onClose: () => void;
  onSave: (
    id: string,
    data: Partial<{
      takenAt: string;
      location: string;
      caption: string;
      countryId: string;
    }>,
  ) => Promise<void>;
}

function EditModal({ item, countries, onClose, onSave }: EditModalProps) {
  const [takenAt, setTakenAt] = useState(
    item.takenAt ? item.takenAt.slice(0, 10) : "",
  );
  const [location, setLocation] = useState(item.location ?? "");
  const [caption, setCaption] = useState(item.caption ?? "");
  const [countryId, setCountryId] = useState(item.countryId ?? "");
  const [saving, setSaving] = useState(false);

  const isoCode =
    countries.find((c) => c.id === countryId)?.isoCode ??
    item.country?.isoCode ??
    "";

  const loadCityOptions = useMemo(() => makeCityLoader(isoCode), [isoCode]);

  async function handleSave() {
    setSaving(true);
    await onSave(item.id, {
      takenAt: takenAt || undefined,
      location: location || undefined,
      caption: caption || undefined,
      countryId: countryId || undefined,
    });
    setSaving(false);
  }

  return (
    <div
      className={styles.editModal}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.editForm}>
        <div className={styles.editHeader}>
          <h3 className={styles.editTitle}>Edit Photo</h3>
          <button className={styles.editClose} onClick={onClose}>
            ✕
          </button>
        </div>

        <label className={styles.editLabel}>Date taken</label>
        <input
          type="date"
          value={takenAt}
          onChange={(e) => setTakenAt(e.target.value)}
          className={styles.dateInput}
        />

        <label className={styles.editLabel}>Country</label>
        <select
          value={countryId}
          onChange={(e) => setCountryId(e.target.value)}
          className={styles.editSelect}
        >
          <option value="">No country</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.flagEmoji} {c.name}
            </option>
          ))}
        </select>

        <label className={styles.editLabel}>Location (city)</label>
        <AsyncCreatableSelect
          isClearable
          loadOptions={loadCityOptions}
          value={location ? { value: location, label: location } : null}
          onChange={(opt) =>
            setLocation((opt as { value: string } | null)?.value ?? "")
          }
          placeholder="Type to search cities..."
          noOptionsMessage={({ inputValue }) =>
            inputValue ? "No cities found" : "Start typing..."
          }
          classNamePrefix="citySelect"
          styles={MODAL_SELECT_STYLES}
        />

        <label className={styles.editLabel}>Caption</label>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className={styles.dateInput}
          placeholder="Optional caption"
        />

        <div className={styles.editActions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminGallery() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [countryId, setCountryId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [takenAt, setTakenAt] = useState("");
  const [location, setLocation] = useState("");
  const [caption, setCaption] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);

  const { data } = useQuery({
    queryKey: ["gallery", {}],
    queryFn: () => galleryService.getAll({ limit: 100 }).then((r) => r.data),
  });

  const { data: countries } = useQuery({
    queryKey: ["countries"],
    queryFn: () => countriesService.getAll().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => galleryService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gallery"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) =>
      galleryService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gallery"] });
      setEditItem(null);
    },
  });

  const selectedCountryIso =
    countries?.find((c) => c.id === countryId)?.isoCode ?? "";
  const loadCityOptions = useMemo(
    () => makeCityLoader(selectedCountryIso),
    [selectedCountryIso],
  );

  async function readExif(file: File) {
    try {
      const exif = await exifr.parse(file, {
        pick: ["DateTimeOriginal", "latitude", "longitude", "City"],
      });
      if (exif?.DateTimeOriginal) {
        setTakenAt(new Date(exif.DateTimeOriginal).toISOString().slice(0, 10));
      }
      if (exif?.latitude != null) setLatitude(exif.latitude);
      if (exif?.longitude != null) setLongitude(exif.longitude);
      if (exif?.City) setLocation(exif.City);
    } catch {
      // EXIF read failure is non-fatal
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList?.length) return;
    const arr = Array.from(fileList);
    setSelectedFiles(arr);
    readExif(arr[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const fileList = e.dataTransfer.files;
    if (!fileList?.length) return;
    const arr = Array.from(fileList).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
    );
    if (!arr.length) return;
    setSelectedFiles(arr);
    readExif(arr[0]);
  }

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      selectedFiles.forEach((f) => fd.append("files", f));
      if (countryId) fd.append("countryId", countryId);
      if (takenAt) fd.append("takenAt", takenAt);
      if (location) fd.append("location", location);
      if (caption) fd.append("caption", caption);
      if (latitude != null) fd.append("latitude", String(latitude));
      if (longitude != null) fd.append("longitude", String(longitude));
      await galleryService.upload(fd);
      qc.invalidateQueries({ queryKey: ["gallery"] });
      if (fileRef.current) fileRef.current.value = "";
      setSelectedFiles([]);
      setTakenAt("");
      setLocation("");
      setCaption("");
      setLatitude(null);
      setLongitude(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className={tableStyles.toolbar}>
        <h2 className={tableStyles.heading}>Gallery</h2>
      </div>

      <div className={styles.uploadPanel}>
        <h3 className={styles.uploadTitle}>Upload Media</h3>
        <div className={styles.uploadRow}>
          <div
            className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input
              type="file"
              ref={fileRef}
              multiple
              accept="image/*,video/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <span className={styles.dropZoneText}>
              {selectedFiles.length > 0 ? (
                `${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""} selected`
              ) : (
                <>
                  Drop files or click to browse
                  <MdOutlineUploadFile size={20} />
                </>
              )}
            </span>
          </div>
          <select
            value={countryId}
            onChange={(e) => setCountryId(e.target.value)}
            className={styles.select}
          >
            <option value="">No country</option>
            {countries?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.flagEmoji} {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={styles.uploadBtn}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
        <div className={styles.metaRow}>
          <input
            type="date"
            value={takenAt}
            onChange={(e) => setTakenAt(e.target.value)}
            className={styles.dateInput}
          />
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption (optional)"
            className={styles.captionInput}
          />
          <AsyncCreatableSelect
            isClearable
            loadOptions={loadCityOptions}
            value={location ? { value: location, label: location } : null}
            onChange={(opt) =>
              setLocation((opt as { value: string } | null)?.value ?? "")
            }
            placeholder="Location (city)..."
            noOptionsMessage={({ inputValue }) =>
              inputValue ? "No cities found" : "Start typing..."
            }
            classNamePrefix="citySelect"
            styles={SELECT_STYLES}
            className={styles.locationSelect}
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </div>
      </div>

      <div className={styles.grid}>
        {data?.items?.map((item) => (
          <div
            key={item.id}
            className={styles.item}
            onClick={() => setEditItem(item)}
          >
            <img src={item.thumbnailUrl} alt="" className={styles.thumb} />
            {item.resourceType === "video" && (
              <div className={styles.videoTag}>VIDEO</div>
            )}
            <button
              className={styles.deleteItem}
              onClick={(e) => {
                e.stopPropagation();
                window.confirm("Delete?") && deleteMutation.mutate(item.id);
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {editItem && countries && (
        <EditModal
          item={editItem}
          countries={countries}
          onClose={() => setEditItem(null)}
          onSave={(id, data) => updateMutation.mutateAsync({ id, data }).then(() => {})}
        />
      )}
    </div>
  );
}
