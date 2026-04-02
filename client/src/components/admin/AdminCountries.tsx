import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { countriesService } from "../../services/countriesService";
import type { Country } from "../../types";
import styles from "./AdminTable.module.scss";
import formStyles from "./CountryForm.module.scss";

const COUNTRIES: { name: string; iso: string }[] = [
  { name: "Afghanistan", iso: "AF" },
  { name: "Albania", iso: "AL" },
  { name: "Algeria", iso: "DZ" },
  { name: "Andorra", iso: "AD" },
  { name: "Angola", iso: "AO" },
  { name: "Argentina", iso: "AR" },
  { name: "Armenia", iso: "AM" },
  { name: "Australia", iso: "AU" },
  { name: "Austria", iso: "AT" },
  { name: "Azerbaijan", iso: "AZ" },
  { name: "Bahrain", iso: "BH" },
  { name: "Bangladesh", iso: "BD" },
  { name: "Belarus", iso: "BY" },
  { name: "Belgium", iso: "BE" },
  { name: "Belize", iso: "BZ" },
  { name: "Benin", iso: "BJ" },
  { name: "Bhutan", iso: "BT" },
  { name: "Bolivia", iso: "BO" },
  { name: "Bosnia and Herzegovina", iso: "BA" },
  { name: "Botswana", iso: "BW" },
  { name: "Brazil", iso: "BR" },
  { name: "Brunei", iso: "BN" },
  { name: "Bulgaria", iso: "BG" },
  { name: "Burkina Faso", iso: "BF" },
  { name: "Burundi", iso: "BI" },
  { name: "Cambodia", iso: "KH" },
  { name: "Cameroon", iso: "CM" },
  { name: "Canada", iso: "CA" },
  { name: "Cape Verde", iso: "CV" },
  { name: "Central African Republic", iso: "CF" },
  { name: "Chad", iso: "TD" },
  { name: "Chile", iso: "CL" },
  { name: "China", iso: "CN" },
  { name: "Colombia", iso: "CO" },
  { name: "Comoros", iso: "KM" },
  { name: "Congo", iso: "CG" },
  { name: "Costa Rica", iso: "CR" },
  { name: "Croatia", iso: "HR" },
  { name: "Cuba", iso: "CU" },
  { name: "Cyprus", iso: "CY" },
  { name: "Czech Republic", iso: "CZ" },
  { name: "Denmark", iso: "DK" },
  { name: "Djibouti", iso: "DJ" },
  { name: "Dominican Republic", iso: "DO" },
  { name: "Ecuador", iso: "EC" },
  { name: "Egypt", iso: "EG" },
  { name: "El Salvador", iso: "SV" },
  { name: "Equatorial Guinea", iso: "GQ" },
  { name: "Eritrea", iso: "ER" },
  { name: "Estonia", iso: "EE" },
  { name: "Eswatini", iso: "SZ" },
  { name: "Ethiopia", iso: "ET" },
  { name: "Fiji", iso: "FJ" },
  { name: "Finland", iso: "FI" },
  { name: "France", iso: "FR" },
  { name: "Gabon", iso: "GA" },
  { name: "Gambia", iso: "GM" },
  { name: "Georgia", iso: "GE" },
  { name: "Germany", iso: "DE" },
  { name: "Ghana", iso: "GH" },
  { name: "Greece", iso: "GR" },
  { name: "Guatemala", iso: "GT" },
  { name: "Guinea", iso: "GN" },
  { name: "Guinea-Bissau", iso: "GW" },
  { name: "Guyana", iso: "GY" },
  { name: "Haiti", iso: "HT" },
  { name: "Honduras", iso: "HN" },
  { name: "Hungary", iso: "HU" },
  { name: "Iceland", iso: "IS" },
  { name: "India", iso: "IN" },
  { name: "Indonesia", iso: "ID" },
  { name: "Iran", iso: "IR" },
  { name: "Iraq", iso: "IQ" },
  { name: "Ireland", iso: "IE" },
  { name: "Italy", iso: "IT" },
  { name: "Jamaica", iso: "JM" },
  { name: "Japan", iso: "JP" },
  { name: "Jordan", iso: "JO" },
  { name: "Kazakhstan", iso: "KZ" },
  { name: "Kenya", iso: "KE" },
  { name: "Kosovo", iso: "XK" },
  { name: "Kuwait", iso: "KW" },
  { name: "Kyrgyzstan", iso: "KG" },
  { name: "Laos", iso: "LA" },
  { name: "Latvia", iso: "LV" },
  { name: "Lebanon", iso: "LB" },
  { name: "Lesotho", iso: "LS" },
  { name: "Liberia", iso: "LR" },
  { name: "Libya", iso: "LY" },
  { name: "Liechtenstein", iso: "LI" },
  { name: "Lithuania", iso: "LT" },
  { name: "Luxembourg", iso: "LU" },
  { name: "Madagascar", iso: "MG" },
  { name: "Malawi", iso: "MW" },
  { name: "Malaysia", iso: "MY" },
  { name: "Maldives", iso: "MV" },
  { name: "Mali", iso: "ML" },
  { name: "Malta", iso: "MT" },
  { name: "Mauritania", iso: "MR" },
  { name: "Mauritius", iso: "MU" },
  { name: "Mexico", iso: "MX" },
  { name: "Moldova", iso: "MD" },
  { name: "Monaco", iso: "MC" },
  { name: "Mongolia", iso: "MN" },
  { name: "Montenegro", iso: "ME" },
  { name: "Morocco", iso: "MA" },
  { name: "Mozambique", iso: "MZ" },
  { name: "Myanmar", iso: "MM" },
  { name: "Namibia", iso: "NA" },
  { name: "Nepal", iso: "NP" },
  { name: "Netherlands", iso: "NL" },
  { name: "New Zealand", iso: "NZ" },
  { name: "Nicaragua", iso: "NI" },
  { name: "Niger", iso: "NE" },
  { name: "Nigeria", iso: "NG" },
  { name: "North Korea", iso: "KP" },
  { name: "North Macedonia", iso: "MK" },
  { name: "Norway", iso: "NO" },
  { name: "Oman", iso: "OM" },
  { name: "Pakistan", iso: "PK" },
  { name: "Palestine", iso: "PS" },
  { name: "Panama", iso: "PA" },
  { name: "Papua New Guinea", iso: "PG" },
  { name: "Paraguay", iso: "PY" },
  { name: "Peru", iso: "PE" },
  { name: "Philippines", iso: "PH" },
  { name: "Poland", iso: "PL" },
  { name: "Portugal", iso: "PT" },
  { name: "Qatar", iso: "QA" },
  { name: "Romania", iso: "RO" },
  { name: "Russia", iso: "RU" },
  { name: "Rwanda", iso: "RW" },
  { name: "Saudi Arabia", iso: "SA" },
  { name: "Senegal", iso: "SN" },
  { name: "Serbia", iso: "RS" },
  { name: "Sierra Leone", iso: "SL" },
  { name: "Singapore", iso: "SG" },
  { name: "Slovakia", iso: "SK" },
  { name: "Slovenia", iso: "SI" },
  { name: "Somalia", iso: "SO" },
  { name: "South Africa", iso: "ZA" },
  { name: "South Korea", iso: "KR" },
  { name: "South Sudan", iso: "SS" },
  { name: "Spain", iso: "ES" },
  { name: "Sri Lanka", iso: "LK" },
  { name: "Sudan", iso: "SD" },
  { name: "Suriname", iso: "SR" },
  { name: "Sweden", iso: "SE" },
  { name: "Switzerland", iso: "CH" },
  { name: "Syria", iso: "SY" },
  { name: "Taiwan", iso: "TW" },
  { name: "Tajikistan", iso: "TJ" },
  { name: "Tanzania", iso: "TZ" },
  { name: "Thailand", iso: "TH" },
  { name: "Timor-Leste", iso: "TL" },
  { name: "Togo", iso: "TG" },
  { name: "Trinidad and Tobago", iso: "TT" },
  { name: "Tunisia", iso: "TN" },
  { name: "Turkey", iso: "TR" },
  { name: "Turkmenistan", iso: "TM" },
  { name: "Uganda", iso: "UG" },
  { name: "Ukraine", iso: "UA" },
  { name: "United Arab Emirates", iso: "AE" },
  { name: "United Kingdom", iso: "GB" },
  { name: "United States", iso: "US" },
  { name: "Uruguay", iso: "UY" },
  { name: "Uzbekistan", iso: "UZ" },
  { name: "Venezuela", iso: "VE" },
  { name: "Vietnam", iso: "VN" },
  { name: "Yemen", iso: "YE" },
  { name: "Zambia", iso: "ZM" },
  { name: "Zimbabwe", iso: "ZW" },
].sort((a, b) => a.name.localeCompare(b.name));

function isoToFlag(iso: string): string {
  return [...iso.toUpperCase()]
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
    .join("");
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const schema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  isoCode: z.string().length(2),
  flagEmoji: z.string().min(1),
  visitedAt: z.string().optional(),
  featured: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

function CountryForm({
  country,
  onClose,
}: {
  country: Country | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: country?.name ?? "",
      slug: country?.slug ?? "",
      isoCode: country?.isoCode ?? "",
      flagEmoji: country?.flagEmoji ?? "",
      visitedAt: country?.visitedAt?.slice(0, 10) ?? "",
      featured: country?.featured ?? false,
    },
  });

  const selectedIso = watch("isoCode");

  function handleCountrySelect(iso: string) {
    const found = COUNTRIES.find((c) => c.iso === iso);
    if (!found) return;
    const flag = isoToFlag(iso);
    setValue("name", found.name);
    setValue("isoCode", iso);
    setValue("flagEmoji", flag);
    setValue("slug", toSlug(found.name));
  }

  const save = useMutation({
    mutationFn: async (data: FormData) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined) fd.append(k, String(v));
      });
      if (coverFile) fd.append("coverImage", coverFile);
      if (country) return countriesService.update(country.id, fd);
      return countriesService.create(fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["countries"] });
      onClose();
    },
  });

  return (
    <div className={formStyles.form}>
      <div className={formStyles.header}>
        <h3>{country ? "Edit Country" : "Add Country"}</h3>
        <button onClick={onClose} className={formStyles.close}>
          ✕
        </button>
      </div>
      <form onSubmit={handleSubmit((d) => save.mutate(d))}>
        <div className={formStyles.grid}>
          <select
            className={formStyles.input}
            value={selectedIso}
            onChange={(e) => handleCountrySelect(e.target.value)}
          >
            <option value="">Select a country...</option>
            {COUNTRIES.map((c) => (
              <option key={c.iso} value={c.iso}>
                {isoToFlag(c.iso)} {c.name}
              </option>
            ))}
          </select>
          <input
            {...register("slug")}
            placeholder="slug (auto-filled)"
            className={formStyles.input}
          />
          <input
            {...register("visitedAt")}
            type="date"
            className={formStyles.input}
          />
          <label className={formStyles.check}>
            <input type="checkbox" {...register("featured")} /> Featured
          </label>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
          className={formStyles.file}
        />
        <div className={formStyles.actions}>
          <button type="button" onClick={onClose} className={formStyles.cancel}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={formStyles.save}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminCountries() {
  const qc = useQueryClient();
  const [editCountry, setEditCountry] = useState<Country | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: countries } = useQuery({
    queryKey: ["countries"],
    queryFn: () => countriesService.getAll().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => countriesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["countries"] }),
  });

  return (
    <div>
      <div className={styles.toolbar}>
        <h2 className={styles.heading}>Countries</h2>
        <button
          className={styles.createBtn}
          onClick={() => {
            setEditCountry(null);
            setShowForm(true);
          }}
        >
          + Add Country
        </button>
      </div>

      {showForm ? (
        <CountryForm
          country={editCountry}
          onClose={() => {
            setShowForm(false);
            setEditCountry(null);
          }}
        />
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Country</th>
              <th>ISO</th>
              <th>Visited</th>
              <th>Posts</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {countries?.map((c) => (
              <tr key={c.id}>
                <td>
                  {c.flagEmoji} {c.name}
                </td>
                <td>{c.isoCode}</td>
                <td>{c.visitedAt ? c.visitedAt.slice(0, 10) : "–"}</td>
                <td>{c._count?.posts ?? 0}</td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => {
                        setEditCountry(c);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() =>
                        window.confirm("Delete?") && deleteMutation.mutate(c.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
