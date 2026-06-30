export type Segment = "contractor" | "tpa" | "carrier";
export type MappedPage = "homeowners" | "contractors" | "carriers";

/** A discovered target before it's enriched/written to the DB. */
export type Candidate = {
  name: string;
  segment: Segment;
  website?: string;
  domain?: string;
  source_url?: string;
  blurb?: string;
};

/** What Claude returns when enriching one account. */
export type Enrichment = {
  company_name: string;
  blurb: string;
  hq_city?: string;
  hq_state?: string;
  mapped_page: MappedPage;
  fit_reason: string;
  contact_title_guess?: string;
  is_real_target: boolean;
};

/** What Claude returns when writing one opener. */
export type Personalization = {
  subject: string;
  body: string;
};
