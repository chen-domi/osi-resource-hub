-- ── 1. Ensure columns exist & remove member_pin ──────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_osi_admin BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS eboard_pin VARCHAR(4) NOT NULL DEFAULT '0000';

-- Drop member_pin — only eboard_pin is used
ALTER TABLE public.organizations
  DROP COLUMN IF EXISTS member_pin;

-- ── 2. Enable Row Level Security ──────────────────────────────────────────────

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_requests  ENABLE ROW LEVEL SECURITY;

-- ── 3. Drop old policies (avoid conflicts on re-run) ─────────────────────────

DROP POLICY IF EXISTS "profiles_select_own"           ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_bc"            ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"           ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile"    ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile"  ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"  ON public.profiles;

DROP POLICY IF EXISTS "organizations_public_read"                ON public.organizations;
DROP POLICY IF EXISTS "Authenticated can read organizations"      ON public.organizations;
DROP POLICY IF EXISTS "Public read organizations"                 ON public.organizations;
DROP POLICY IF EXISTS "Only OSI admins can update organizations"  ON public.organizations;
DROP POLICY IF EXISTS "Authenticated can update organizations"    ON public.organizations;

DROP POLICY IF EXISTS "inventory_public_read"                ON public.inventory;
DROP POLICY IF EXISTS "inventory_eboard_write"               ON public.inventory;
DROP POLICY IF EXISTS "Public read inventory"                ON public.inventory;
DROP POLICY IF EXISTS "Eboard can create inventory"          ON public.inventory;
DROP POLICY IF EXISTS "Eboard can update inventory"          ON public.inventory;
DROP POLICY IF EXISTS "Eboard can delete inventory"          ON public.inventory;
DROP POLICY IF EXISTS "Authenticated can insert inventory"   ON public.inventory;
DROP POLICY IF EXISTS "Authenticated can update inventory"   ON public.inventory;
DROP POLICY IF EXISTS "Authenticated can delete inventory"   ON public.inventory;

DROP POLICY IF EXISTS "item_requests_public_read"            ON public.item_requests;
DROP POLICY IF EXISTS "item_requests_eboard_write"           ON public.item_requests;
DROP POLICY IF EXISTS "Public read item_requests"            ON public.item_requests;
DROP POLICY IF EXISTS "Anyone can create item_requests"      ON public.item_requests;
DROP POLICY IF EXISTS "Eboard can update item_requests"      ON public.item_requests;
DROP POLICY IF EXISTS "Authenticated can insert item_requests" ON public.item_requests;
DROP POLICY IF EXISTS "Authenticated can update item_requests" ON public.item_requests;
DROP POLICY IF EXISTS "Authenticated can delete item_requests" ON public.item_requests;

-- ── 4. PROFILES policies ──────────────────────────────────────────────────────

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── 5. ORGANIZATIONS policies ─────────────────────────────────────────────────

-- Public read so org list is available before login
CREATE POLICY "Public read organizations"
  ON public.organizations FOR SELECT
  USING (true);

-- Only OSI admins can update org records (including PIN changes)
CREATE POLICY "Only OSI admins can update organizations"
  ON public.organizations FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_osi_admin = true)
  );

-- Eboard members can also update their own org PIN (application-level validation)
CREATE POLICY "Authenticated can update organizations"
  ON public.organizations FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ── 6. INVENTORY policies ─────────────────────────────────────────────────────

CREATE POLICY "Public read inventory"
  ON public.inventory FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can insert inventory"
  ON public.inventory FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update inventory"
  ON public.inventory FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete inventory"
  ON public.inventory FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ── 7. ITEM_REQUESTS policies ─────────────────────────────────────────────────

CREATE POLICY "Public read item_requests"
  ON public.item_requests FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can insert item_requests"
  ON public.item_requests FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update item_requests"
  ON public.item_requests FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete item_requests"
  ON public.item_requests FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ── 8. Seed organizations with unique PINs ────────────────────────────────────
-- ON CONFLICT updates eboard_pin so this is safe to re-run.

INSERT INTO public.organizations (name, eboard_pin)
VALUES
  ('4Boston', '2505'),
  ('Accounting Academy', '0686'),
  ('Acoustics', '5626'),
  ('African Student Organization', '5016'),
  ('Against The Current', '7562'),
  ('AHANA Graduate Student Association', '1877'),
  ('AHANA Management Academy', '5782'),
  ('AHANA Pre-Law Student Association', '6229'),
  ('AIDS Awareness Committee', '4495'),
  ('Al Noor: The Boston College Middle East and Islamic Journal', '8365'),
  ('Allies', '2483'),
  ('Alpha Sigma Nu', '0217'),
  ('Ambassadors', '9404'),
  ('American Chemical Society', '3180'),
  ('American Red Cross of Boston College', '5493'),
  ('Americans for Informed Democracy', '3134'),
  ('Amnesty International', '2838'),
  ('Animal Advocates', '2923'),
  ('Anime of Boston College', '7261'),
  ('Appalachia Volunteers', '2899'),
  ('Arab Students Association', '6976'),
  ('Army ROTC', '0622'),
  ('Arrupe International Immersion', '7642'),
  ('Art Club', '0443'),
  ('Ascend', '7157'),
  ('Asian Baptist Student Koinonia', '1386'),
  ('Asian Christian Fellowship', '8738'),
  ('Asinine Sketch and Improv Comedy', '0019'),
  ('Association of Latino Professionals in Finance and Accounting', '0461'),
  ('Athletes in Action Sports Ministry', '2096'),
  ('Avid Listeners of Boston College', '8691'),
  ('Baking Club of Boston College', '1554'),
  ('Baseball (club)', '0105'),
  ('BC ALIVE', '2963'),
  ('BC bOp! – Jazz Ensemble', '8460'),
  ('BC Television', '8169'),
  ('Bellarmine Law Society of Boston College', '8780'),
  ('Best Buddies', '5348'),
  ('Beta Gamma Sigma', '3430'),
  ('Bike BC', '5545'),
  ('Black Christian Fellowship', '7163'),
  ('Black Experience in America Through Song', '1276'),
  ('Black Law Students Association (BLSA)', '4377'),
  ('Black Student Forum', '4278'),
  ('Board of Student Advisers - Law School', '9998'),
  ('Boston College Symphony Orchestra', '2563'),
  ('Boston Liturgical Dance Ensemble', '6623'),
  ('Bostonians', '9662'),
  ('Buddhism Club', '5440'),
  ('Business and Law Society', '7316'),
  ('Bystander Intervention Education', '5353'),
  ('Campus Activities Board', '3014'),
  ('Campus School Volunteers', '1765'),
  ('Cancer Affects Siblings Too', '9686'),
  ('Cape Verdean Student Association', '5734'),
  ('Caribbean Culture Club', '2962'),
  ('Carroll School of Management Honors Program', '2817'),
  ('Catholic Relief Services Student Ambassadors', '4601'),
  ('Chamber Music Society', '4455'),
  ('Charity: water', '8247'),
  ('Cheerleading', '3436'),
  ('Chemistry Club - American Chemical Society Student Chapter', '8958'),
  ('Chess Club', '6690'),
  ('Chinese Students Association', '0244'),
  ('Christian Legal Society, BC Law School', '0966'),
  ('Circle K International', '9272'),
  ('Class Councils', '6709'),
  ('Climate Justice at Boston College', '5835'),
  ('Club Sports Executive Board', '0657'),
  ('Coaching Corps Boston College', '4931'),
  ('College Bowl', '5268'),
  ('College Democrats', '9097'),
  ('College Republicans', '7899'),
  ('Committee for Creative Enactments', '8099'),
  ('Common Tones of Boston College', '4540'),
  ('Computer Science Society (BCCS Club)', '6997'),
  ('Conspiracy Theory', '4503'),
  ('Consult Your Community', '0352'),
  ('Consulting Club of Boston College', '8444'),
  ('Contemporary Theater', '4064'),
  ('Conversations About Social and Environmental (CASE) Impact', '1435'),
  ('Cooking Club of Boston College', '6592'),
  ('CSOM Honors Program', '4998'),
  ('CSON SENATE', '5757'),
  ('Cuban-American Student Association', '6969'),
  ('Cura Program', '0452'),
  ('Cycling, Coed', '3164'),
  ('Dance Ensemble', '3387'),
  ('Dance Organization', '2741'),
  ('Dialogue - Undergraduate Essay Journal', '6715'),
  ('Dominican Association', '5635'),
  ('Dramatics Society', '0208'),
  ('Dui Hua Chinese Dialogue Club', '8456'),
  ('Dynamics', '6624'),
  ('BC EMS', '2845'),
  ('Eagle Political Society', '9512'),
  ('Eagle Volunteers', '1090'),
  ('Eagles for Israel', '9176'),
  ('Economics Association', '9045'),
  ('EcoPledge', '3397'),
  ('Education For Students By Students', '7313'),
  ('Elections Committee', '1174'),
  ('Electronic State of Mind', '1938'),
  ('Elements: The Undergraduate Research Journal', '7587'),
  ('Emerging Leader Program', '2751'),
  ('English Language Learners', '3556'),
  ('Environmental Law Society - ELS', '3359'),
  ('Episcopal Community at Boston College', '2584'),
  ('Equestrian Team, Coed', '4743'),
  ('Esports Club', '4407'),
  ('Ethos - Student Bioethics Research Journal', '4761'),
  ('EXCEL Coaches', '7038'),
  ('FACES', '9275'),
  ('Fashion Club', '9129'),
  ('Federalist Society', '8720'),
  ('Females Incorporating Sisterhood Through Step', '3217'),
  ('Festival of Friendship', '4885'),
  ('Field Hockey, Coed', '2386'),
  ('Figure Skating, Coed', '6918'),
  ('Finance Academy', '4841'),
  ('First Year Service Program', '7397'),
  ('First-Generation Club of Boston College', '9007'),
  ('French Society', '9091'),
  ('Fuego del Corazón', '1667'),
  ('Full Swing', '9413'),
  ('Fulton Debating Society', '7020'),
  ('Gamma Kappa Alpha (Italian)', '2715'),
  ('Generation Citizen', '2147'),
  ('Geology Association', '4621'),
  ('German Club', '6025'),
  ('Global Medical Brigades of Boston College', '1723'),
  ('Global Zero', '2336'),
  ('GlobeMed', '7783'),
  ('Golden Eagles Dance Team', '9325'),
  ('Golden Key International Honour Society', '1616'),
  ('Golf, Coed', '2137'),
  ('Grad Tech Club', '2555'),
  ('Graduate Consortium in Women\', '1570'),
  ('Graduate Education Association (GEA)', '9202'),
  ('Graduate History Alliance', '0489'),
  ('Graduate Management Association', '2053'),
  ('Graduate Nurses\', '3901'),
  ('Graduate Student Association', '3415'),
  ('Graduate Women in Business', '5134'),
  ('Gratia Plena', '7129'),
  ('Habitat for Humanity', '3292'),
  ('Hawai\', '2535'),
  ('Health Coaches', '9805'),
  ('Heights Boys and Girls Club', '0066'),
  ('Heights, Inc.', '7058'),
  ('Heightsmen', '1366'),
  ('Hellenic Society', '5079'),
  ('Hello... Shovelhead!', '7774'),
  ('Hillel', '9064'),
  ('Hollywood Eagles', '7294'),
  ('Hoops for Hope', '4597'),
  ('I Am That Feminist', '4800'),
  ('Ignatian Family Teach-in for Justice', '5944'),
  ('Ignatian Society', '4860'),
  ('Il Circolo Italiano', '2067'),
  ('Information Systems Academy', '2660'),
  ('Intellectual Property and Technology Forum, Law School', '8001'),
  ('Interfaith Coalition', '2240'),
  ('International Club', '1430'),
  ('InterVarsity Christian Fellowship', '5155'),
  ('Investment Banking, Sales & Trading Club', '5119'),
  ('Investment Club', '9867'),
  ('Iranian Culture Club', '2482'),
  ('Irish Dance', '0288'),
  ('Irish Society', '4430'),
  ('Jamaica Magis', '2917'),
  ('Jammin\', '0221'),
  ('Japan Club', '3740'),
  ('Jemez Pueblo Service Exchange Program', '3504'),
  ('Jenks Leadership Program', '8912'),
  ('Kairos', '9839'),
  ('Kaleidoscope International Journal', '4310'),
  ('Knights of Columbus of Boston College', '2084'),
  ('Korean Students Association', '8520'),
  ('Lamda Law Students Association', '2198'),
  ('Latin American Business Club', '0935'),
  ('Latin American Law Students Association', '7032'),
  ('Laughing Medusa, The', '6527'),
  ('Law Students Association', '2758'),
  ('LeaderShape Institute', '9104'),
  ('Lean In', '9526'),
  ('Let\', '5603'),
  ('LGBC - Lesbian, Gay, and Bisexual Community at BC', '6219'),
  ('Liturgical Arts Group', '8633'),
  ('Loyola Volunteers', '4118'),
  ('LSOE Student Senate', '4553'),
  ('LTS Learning to Serve', '8868'),
  ('Madrigal Singers', '1875'),
  ('Marketing Academy', '3780'),
  ('Mathematics Society', '6259'),
  ('Medical Humanities Journal', '6132'),
  ('Medical Journal Club', '2996'),
  ('Medlife', '5095'),
  ('Mendel Society', '8825'),
  ('Mentoring Through the Arts', '8764'),
  ('Middle Eastern and Islamic Studies', '1730'),
  ('Ministry of Silly Walks', '1245'),
  ('Mock Trial Program', '3713'),
  ('Model United Nations', '4111'),
  ('Mt. Alvernia Make a Difference', '9358'),
  ('Mu Kappa Tau (Marketing)', '8198'),
  ('Music Guild', '7136'),
  ('Musical Theatre Wing', '9001'),
  ('Muslim Student Association', '5278'),
  ('My Mother\', '9977'),
  ('NETwork Against Malaria', '0494'),
  ('Niche: Biology Club', '5997'),
  ('Omicron Delta Epsilon (Economics)', '0942'),
  ('On Tap', '6481'),
  ('Orchestra, Boston College Symphony', '7718'),
  ('Order of the Cross and Crown (Seniors in A & S)', '6147'),
  ('Organization of Latin American Affairs', '4360'),
  ('Orthodox Christian Fellowship', '8431'),
  ('Outdoor Club', '9846'),
  ('Peer Advisers, Career Center', '2211'),
  ('Peer Advisors, Carroll School', '1400'),
  ('Pep Band', '8246'),
  ('Phaymus Dance Entertainment', '0874'),
  ('Phi Beta Kappa (Liberal Arts)', '4215'),
  ('Philippine Society', '6339'),
  ('Philosophical Society', '8597'),
  ('Policy Council of Boston College', '3680'),
  ('Portfolio Challenge', '9017'),
  ('Pre-Dental Society', '4990'),
  ('Pro-Life Club', '5608'),
  ('Productions', '9634'),
  ('Project Sunshine', '7634'),
  ('Project Swim', '9852'),
  ('Psi Chi', '4282'),
  ('Public Health Club', '4093'),
  ('Quality of Student Life Committee', '9588'),
  ('Quiet Waters', '6262'),
  ('Rallying Efforts Against Contemporary Trafficking', '7926'),
  ('Random Acts of Kindness Club', '0216'),
  ('REACT to FILM Boston College', '0230'),
  ('Reading Group, The', '4200'),
  ('Ready, Set, PUNCHLINE!', '7486'),
  ('Real Estate Club', '5394'),
  ('Real Food', '8032'),
  ('Relay for Life', '1081'),
  ('Residence Hall Association', '3264'),
  ('Retro Gaming Club', '4441'),
  ('Sailing Team, BC', '7030'),
  ('Science Club for Girls', '1921'),
  ('Screaming Eagles Marching Band', '4865'),
  ('Senior Week Committee', '8401'),
  ('Sexual Chocolate', '2270'),
  ('Sharps', '5162'),
  ('Shaw Leadership Program', '2581'),
  ('Sigma Pi Sigma (Physics)', '3521'),
  ('Sigma Theta Tau (Nursing)', '7312'),
  ('Slavic Club', '8439'),
  ('Smart Woman Securities', '8163'),
  ('Society of Physics Students', '3351'),
  ('Sons of St. Patrick', '0060'),
  ('Soul, Love, And Meaning! (SLAM!)', '3720'),
  ('South Asian Student Association', '2634'),
  ('Southeast Asian Student Association', '4286'),
  ('Special Olympics', '6863'),
  ('Sports Business Society', '1645'),
  ('St. Thomas More Society', '7049'),
  ('Start @ Shea', '5683'),
  ('Student Admission Program', '7138'),
  ('Student Association', '7873'),
  ('Student Business Consortium', '7880'),
  ('Student Conduct Board', '7837'),
  ('Student Martial Arts Club', '9316'),
  ('Student Nurses Association', '0718'),
  ('Student Organization Funding Committee', '6851'),
  ('Students for a Sensible Drug Policy', '7124'),
  ('Students for Education Reform', '2297'),
  ('Students for Justice in Palestine', '9021'),
  ('Students Taking Initiative to Creative Heights (STITCH)', '3905'),
  ('Stylus', '9194'),
  ('Sub Turri Yearbook', '3798'),
  ('Symphonic Band', '7996'),
  ('Symphony Orchestra', '1953'),
  ('Synergy Hip Hop Dance Company', '8423'),
  ('Table Tennis', '2516'),
  ('Taiwanese Cultural Organization', '9018'),
  ('The Gavel', '8498'),
  ('Theater Department Workshop', '7639'),
  ('Timmy Global Health', '5311'),
  ('To Write Love On Her Arms', '8928'),
  ('Torch, The', '7325'),
  ('Transfer Ambassador Program', '1915'),
  ('UGBC Leadership Academy', '0118'),
  ('UGBC, AHANA Leadership Council', '4419'),
  ('UGBC, Council for Students with Disabilities', '3112'),
  ('UGBC, GLBTQ Leadership Council', '2883'),
  ('UGBC, Student Assembly', '6383'),
  ('Undergraduate Government of Boston College', '3060'),
  ('United Front', '7702'),
  ('University Chorale', '8300'),
  ('University Wind Ensemble', '5158'),
  ('UPrising Dance Crew', '2603'),
  ('Venture Competition', '8695'),
  ('Vietnamese Students Association', '7700'),
  ('Voices of Imani', '9733'),
  ('Welles Remy Crowther Red Bandana 5k', '5232'),
  ('WeRunBC', '6184'),
  ('Wishmakers On Campus', '5923'),
  ('Women In Business', '4544'),
  ('Word of Mouth', '8041'),
  ('WZBC 90.3 FM', '7471'),
  ('WZBC SPORTS', '5280'),
  ('WZBC Sports Radio', '5848'),
  ('Basketball, Men''s & Women''s (club)', '1310'),
  ('Crew, Men''s (club)', '7668'),
  ('Ice Hockey, Men''s & Women''s', '8350'),
  ('L''Association Haitienne', '4517'),
  ('Lacrosse, Men''s and Women''s', '4037'),
  ('Rugby, Men''s & Women''s', '0043'),
  ('Soccer, Men''s & Women''s', '1676'),
  ('Squash, Men''s & Women''s', '6928'),
  ('Ultimate Frisbee, Men''s & Women''s', '9450'),
  ('Volleyball, Men''s & Women''s', '3883'),
  ('Water Polo, Men''s & Women''s', '0854'),
  ('Women''s Law Center', '3745'),
  ('Women''s Summit', '3624'),
  ('Writers'' Circle', '8085')
ON CONFLICT (name) DO UPDATE
  SET eboard_pin = EXCLUDED.eboard_pin;

