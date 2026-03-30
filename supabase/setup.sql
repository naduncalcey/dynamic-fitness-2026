-- ============================================================
-- Dynamic Fitness CMS - Supabase Setup Script
-- Run this in the Supabase SQL Editor to set up the database.
-- ============================================================

-- 1. Create the site_content table
CREATE TABLE IF NOT EXISTS site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page, section)
);

-- 2. Enable Row Level Security
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- 3. Public read access (anyone can read content for the website)
CREATE POLICY "Public read access" ON site_content
  FOR SELECT
  USING (true);

-- 4. Authenticated write access (only logged-in admin can update)
CREATE POLICY "Authenticated insert" ON site_content
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated update" ON site_content
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated delete" ON site_content
  FOR DELETE
  TO authenticated
  USING (true);

-- 5. Seed data (current website content)
-- This inserts all the default content so the CMS has data to edit immediately.

INSERT INTO site_content (page, section, content) VALUES
('home', 'hero', '{
  "headline": "Unleash Your Potential at",
  "highlightText": "Dynamic Fitness",
  "ctaText": "Book a Free Consultation",
  "ctaLink": "https://calendly.com/nadun-n-dynamicfitness/30min"
}'::jsonb),

('home', 'about', '{
  "sectionNumber": "01",
  "sectionLabel": "State of the Art Fitness Center",
  "headline": "Built for",
  "headlineFaded": "Transformations",
  "description": "Transform your workouts and redefine your limits at Dynamic Fitness, where innovation meets inspiration. Elevate your fitness game today and discover the dynamic difference",
  "ctaText": "Set Route",
  "ctaLink": "https://www.google.com/maps/dir//Dynamic+Fitness+(Pvt)+Ltd,+14+Sri+Devananda+Rd,+Maharagama+10280/@6.8523328,79.912721,16z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3ae25b00267d1985:0xc9c0845e8629e66b!2m2!1d79.9138617!2d6.8553051?entry=ttu",
  "imageTooltips": ["Our Facility", "Strength Zone", "Strength Zone", "Cardio Area"]
}'::jsonb),

('home', 'pricing', '{
  "sectionNumber": "02",
  "sectionLabel": "Select Plan",
  "headline": "Choose your",
  "headlineFaded": "membership",
  "coupleDiscountLabel": "Save 15%",
  "ctaLink": "https://fitconnect.me/download?o=DFG&b=MAH",
  "individualPlans": [
    {"name": "Monthly", "description": "Best for beginners", "price": "රු 6,000", "priceSuffix": "/mo", "features": [{"text": "Full gym access"}, {"text": "Locker room & showers"}, {"text": "1 Free HIIT class per week"}, {"text": "Access to Fitconnect"}], "cta": "Get Started"},
    {"name": "3 Months", "description": "For serious athletes", "price": "රු 15,000", "priceSuffix": "", "features": [{"text": "Everything in monthly", "accent": true}, {"text": "Unlimited HIIT classes"}, {"text": "Nutrition guidance"}], "cta": "Get Started"},
    {"name": "6 Months", "description": "Maximum results, zero limits", "price": "රු 28,000", "priceSuffix": "", "popular": true, "features": [{"text": "Everything in 3 months", "accent": true}, {"text": "Custom meal plans"}], "cta": "Get Started"},
    {"name": "12 Months", "description": "For gym junkies", "price": "රු 42,000", "priceSuffix": "", "features": [{"text": "Everything in 6 months", "accent": true}], "cta": "Get Started"}
  ],
  "couplePlans": [
    {"name": "6 Months - Couple", "description": "Best value for couples", "price": "රු 38,000", "priceSuffix": "", "popular": true, "features": [{"text": "Full gym access"}, {"text": "Locker room & showers"}, {"text": "1 Free HIIT class per week"}, {"text": "Access to Fitconnect"}], "cta": "Get Started"},
    {"name": "12 Months - Couple", "description": "Ultimate duo commitment", "price": "රු 58,000", "priceSuffix": "", "features": [{"text": "Everything in 6 months", "accent": true}], "cta": "Get Started"}
  ]
}'::jsonb),

('home', 'testimonials', '{
  "testimonials": [
    {"name": "Imasha Sashini", "photo": "https://lh3.googleusercontent.com/a/ACg8ocK17GUmhJvH_pMQyFD7WGe2Fx9pFYHEBW1wc6iChYhCBJ-HKA=s128-c0x00000000-cc-rp-mo", "rating": 5, "text": "Dynamic Fitness is a great place to workout. The trainers are experienced, supportive, and really focus on proper technique and motivation. The training sessions are well-structured and effective. Plus, the membership charges are very reasonable for the quality of service provided.", "time": "7 months ago"},
    {"name": "Rajitha Abeysinghe", "photo": "https://lh3.googleusercontent.com/a/ACg8ocJnaZaZeLRAlsK0HeGvQfkWxof5PmLxQiBpGupJzCQ0DyvQUw=s128-c0x00000000-cc-rp-mo", "rating": 5, "text": "Best gym around Nawinna. Modern equipments, clean facility + friendly and knowledgeable trainers. Highly recommended if you are looking for a gym around Nawinna area.", "time": "a year ago"},
    {"name": "Sasindu Mendis", "photo": "https://lh3.googleusercontent.com/a-/ALV-UjXq-dAGCepkvDUd6O3VMlRLdLD8Nl92UMTS2nQ32YGSBx__EywfEQ=s128-c0x00000000-cc-rp-mo-ba4", "rating": 5, "text": "Easily accessible location right by the high-level road, friendly, welcoming and supportive people regardless you are a pro or beginner, good range of equipment, loves the place and vibe!", "time": "a year ago"}
  ]
}'::jsonb),

('home', 'faq', '{
  "sectionNumber": "03",
  "sectionLabel": "FAQs",
  "headline": "Frequently Asked Questions",
  "description": "Still have questions? We are here to help. Get in touch and our team will guide you through everything you need to know.",
  "contactCtaText": "Contact Us",
  "faqs": [
    {"question": "What are your gym operating hours?", "answer": "We are open on weekdays from 5:30 AM to 11:00 PM. Public holidays may have adjusted hours follow our socials for updates."},
    {"question": "Do I need prior experience to join?", "answer": "All experience levels are welcomed at Dynamic Fitness from complete beginners to advanced athletes. Our trainers will guide you through proper form, technique, and a personalised routine from day one."},
    {"question": "Are personal training sessions included?", "answer": "All memberships include an initial assessment and orientation session. Dedicated personal training packages can be added to any plan at a discounted member rate."},
    {"question": "What is the FitConnect app?", "answer": "FitConnect is our member companion app where you can track workouts, book HIIT classes, view your nutrition plan, and monitor your progress all in one place."},
    {"question": "Can I freeze or cancel my membership?", "answer": "You can cancel your membership anytime. However, please note that we have a no refund policy for any membership plan."},
    {"question": "Do you offer couple or group discounts?", "answer": "We offer couple plans that save you up to 15%. For corporate or group enquiries of 5+, contact us directly for a custom package."}
  ]
}'::jsonb),

('home', 'cta', '{
  "headline": "Ready to start your",
  "highlightWord": "transformation",
  "description": "Join hundreds of fitness enthusiasts currently training at Dynamic Fitness to achieve their goals and unlock their full potential.",
  "ctaText": "Book a Free Consultation",
  "ctaLink": "https://calendly.com/nadun-n-dynamicfitness/30min"
}'::jsonb),

('careers', 'header', '{
  "headline": "Careers",
  "description": "We are always looking for passionate people to join our team. Check back soon for open positions."
}'::jsonb),

('global', 'header', '{
  "navLinks": [
    {"label": "About", "href": "/#about"},
    {"label": "Pricing", "href": "/#pricing"},
    {"label": "Careers", "href": "/careers"}
  ]
}'::jsonb),

('global', 'footer', '{
  "description": "Nawinna''s premier fitness destination. State-of-the-art equipment and expert trainers for your transformation.",
  "linkGroups": [
    {"title": "Services", "links": [{"label": "Personal Training", "href": "#"}, {"label": "HIIT Classes", "href": "#"}, {"label": "Nutrition Plans", "href": "#"}, {"label": "Pricing", "href": "#"}]},
    {"title": "Resources", "links": [{"label": "FitConnect App", "href": "#"}, {"label": "Class Schedule", "href": "#"}, {"label": "Member Portal", "href": "#"}, {"label": "FAQs", "href": "#"}]},
    {"title": "Company", "links": [{"label": "About Us", "href": "#"}, {"label": "Careers", "href": "#"}, {"label": "Blog", "href": "#"}, {"label": "Contact", "href": "#"}]}
  ],
  "ctaPrefix": "START NOW //",
  "ctaText": "Book a Free Consultation",
  "ctaLink": "https://calendly.com/nadun-n-dynamicfitness/30min",
  "brandText": "DYNAMIC",
  "hours": "Open 6 AM – 10 PM"
}'::jsonb)

ON CONFLICT (page, section) DO NOTHING;

-- ============================================================
-- ADMIN USER SETUP
-- After running this SQL, create an admin user in Supabase:
-- 1. Go to Authentication > Users in Supabase Dashboard
-- 2. Click "Add User" > "Create New User"
-- 3. Enter your admin email and password
-- 4. The admin can then log in at /cms
-- ============================================================
